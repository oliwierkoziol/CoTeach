import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import { randomUUID } from "crypto";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { toFile } from "openai/uploads";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const app = express();
const upload = multer();
const port = Number(process.env.PORT || 3001);

const OPENROUTER_TEXT_MODEL = process.env.OPENROUTER_TEXT_MODEL || "google/gemma-2-9b-it:free";
const OPENROUTER_VISION_MODEL = process.env.OPENROUTER_VISION_MODEL || "google/gemini-2.5-flash";
const OPENROUTER_MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS || "2000");
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || "http://localhost:5173";
const SESSION_LIMIT_PLN = Number(process.env.COST_LIMIT_PLN || "3.5");
const WHISPER_PRICE_PER_MIN_USD = Number(process.env.WHISPER_PRICE_PER_MIN_USD || "0.006");
const USD_TO_PLN = Number(process.env.USD_TO_PLN || "4.0");

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const NOTE_PROMPT_TEMPLATE = fs.readFileSync(
  path.resolve(process.cwd(), "prompty_do_ai", "prompt_generacja_notatki_przedmiotowej.txt"),
  "utf8"
);
const PLAN_PROMPT_TEMPLATE = fs.readFileSync(
  path.resolve(process.cwd(), "prompty_do_ai", "prompt_generacja_planu_lekcji_json.txt"),
  "utf8"
);

app.use(cors());
app.use(express.json({ limit: "15mb" }));

async function getUserFromBearerToken(req) {
  const authHeader = String(req.headers.authorization || "");
  const [, token] = authHeader.match(/^Bearer\s+(.*)$/i) || [];
  if (!token || !supabase) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

const db = {
  schools: new Map(),
  users: new Map(),
  licenses: new Map(),
  lessons: new Map(),
  costs: new Map(),
  notes: new Map()
};

const defaultSchoolId = "school-default";
const defaultLicenseId = "license-default";
const defaultTeacherId = "teacher-default";
const defaultAdminId = "admin-default";

function seedMemoryDb() {
  db.schools.set(defaultSchoolId, { id: defaultSchoolId, name: "Demo School", licenseId: defaultLicenseId });
  db.licenses.set(defaultLicenseId, {
    id: defaultLicenseId,
    schoolId: defaultSchoolId,
    key: process.env.DEMO_LICENSE_KEY || "DEMO-LESSON-001",
    maxActiveUsers: 30,
    expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
    demoMode: true
  });
  db.users.set(defaultTeacherId, {
    id: defaultTeacherId,
    schoolId: defaultSchoolId,
    role: "teacher",
    email: "teacher@example.com",
    name: "Demo Teacher"
  });
  db.users.set(defaultAdminId, {
    id: defaultAdminId,
    schoolId: defaultSchoolId,
    role: "school_admin",
    email: "admin@example.com",
    name: "School Admin"
  });
}

seedMemoryDb();

function getTodayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseJsonArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizePlanPoint(point, index = 0) {
  const normalizedStatus = ["pending", "skipped", "discussed"].includes(point?.status)
    ? point.status
    : "pending";
  return {
    id: point?.id || `p-${index + 1}`,
    title: String(point?.title || "Punkt").trim() || "Punkt",
    description: String(point?.description || "").trim(),
    keywords: Array.isArray(point?.keywords) ? point.keywords.map((keyword) => String(keyword || "").trim()).filter(Boolean) : [],
    status: normalizedStatus,
    manualApproved: Boolean(point?.manualApproved) || normalizedStatus === "discussed-manual"
  };
}

function normalizePlanArray(plan) {
  return (Array.isArray(plan) ? plan : []).map((point, index) => normalizePlanPoint(point, index));
}

function normalizeLessonDate(dateInput) {
  const raw = String(dateInput || "").trim();
  if (!raw) return getTodayIsoDate();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return getTodayIsoDate();
  return parsed.toISOString().split("T")[0];
}

function resolveLessonMonth(monthInput, isoDate) {
  const rawMonth = String(monthInput || "").trim();
  if (rawMonth) return rawMonth;
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return new Date().toLocaleString("pl-PL", { month: "long" });
  return parsed.toLocaleString("pl-PL", { month: "long" });
}

function extractBearerToken(req) {
  const authHeader = String(req.headers.authorization || "").trim();
  if (!authHeader) return "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return "";
  return token;
}

async function getRequestUser(req) {
  if (!supabase) return null;
  const token = extractBearerToken(req);
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) return null;
  return data.user;
}

async function isRequestAdmin(req) {
  if (!supabase) return true;
  const user = await getRequestUser(req);
  if (!user) return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("admin")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return false;
  return data?.admin === true;
}

async function requireAdmin(req, res) {
  const admin = await isRequestAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Brak uprawnień administratora." });
    return false;
  }
  return true;
}

async function resolveTeacherContext(req, res) {
  if (!supabase) {
    return { teacherId: defaultTeacherId };
  }
  const user = await getRequestUser(req);
  if (!user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("teacher_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    res.status(500).json({ error: `Nie udało się odczytać profilu: ${profileError.message}` });
    return null;
  }

  let teacherId = String(profile?.teacher_id || "").trim();
  if (!teacherId) {
    teacherId = `teacher-${randomUUID()}`;
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email || null,
        teacher_id: teacherId,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );
    if (upsertError) {
      res.status(500).json({ error: `Nie udało się zapisać teacher_id: ${upsertError.message}` });
      return null;
    }
  }

  return { teacherId };
}

function getOwnedLessonOrRespond(req, res, teacherId) {
  const lesson = db.lessons.get(req.params.lessonId);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return null;
  }
  if (String(lesson.teacherId) !== String(teacherId)) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return lesson;
}

function rowToLesson(row) {
  return {
    id: row.id,
    schoolId: row.school_id,
    teacherId: row.teacher_id,
    title: row.title,
    subject: row.subject,
    month: row.month,
    date: row.date,
    status: row.status,
    sourceFiles: parseJsonArray(row.source_files),
    plan: parseJsonArray(row.plan),
    transcripts: parseJsonArray(row.transcripts),
    finalNote: row.final_note || null,
    startedAt: row.started_at || null,
    finishedAt: row.finished_at || null,
    updatedAt: row.updated_at || null
  };
}

function rowToFinalNote(row) {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    title: row.title || "",
    subject: row.subject || "",
    date: row.date || null,
    html: row.html || "",
    publicPath: row.public_path || "",
    shareUrl: row.share_url || "",
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null
  };
}

function rowToSavedNote(row) {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    title: row.title || "",
    subject: row.subject || "",
    classLevel: row.class_level || "",
    content: row.content || "",
    source: row.source || "manual",
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null
  };
}

function lessonToRow(lesson) {
  return {
    id: lesson.id,
    school_id: lesson.schoolId,
    teacher_id: lesson.teacherId,
    title: lesson.title,
    subject: lesson.subject,
    month: lesson.month,
    date: lesson.date,
    status: lesson.status,
    source_files: lesson.sourceFiles || [],
    plan: lesson.plan || [],
    transcripts: lesson.transcripts || [],
    final_note: lesson.finalNote || null,
    started_at: lesson.startedAt || null,
    finished_at: lesson.finishedAt || null,
    updated_at: new Date().toISOString()
  };
}

function finalNoteToRow(finalNote, teacherId) {
  return {
    id: finalNote.id,
    lesson_id: finalNote.lessonId,
    teacher_id: String(teacherId || defaultTeacherId),
    title: String(finalNote.title || ""),
    subject: String(finalNote.subject || ""),
    date: finalNote.date || null,
    html: String(finalNote.html || ""),
    public_path: String(finalNote.publicPath || ""),
    share_url: String(finalNote.shareUrl || ""),
    created_at: finalNote.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function savedNoteToRow(note, teacherId) {
  return {
    id: note.id,
    teacher_id: String(teacherId || defaultTeacherId),
    title: String(note.title || ""),
    subject: String(note.subject || ""),
    class_level: String(note.classLevel || ""),
    content: String(note.content || ""),
    source: String(note.source || "manual"),
    created_at: note.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function persistLesson(lesson) {
  if (!supabase) return;
  const { error } = await supabase.from("lessons").upsert(lessonToRow(lesson), { onConflict: "id" });
  if (error) throw new Error(`Supabase lesson upsert failed: ${error.message}`);
}

async function persistLessonSafe(lesson) {
  try {
    await persistLesson(lesson);
  } catch (error) {
    console.error(error.message);
  }
}

async function persistFinalNote(finalNote, teacherId) {
  if (!supabase || !finalNote) return;
  const { error } = await supabase
    .from("final_notes")
    .upsert(finalNoteToRow(finalNote, teacherId), { onConflict: "lesson_id" });
  if (error) throw new Error(`Supabase final note upsert failed: ${error.message}`);
}

async function persistFinalNoteSafe(finalNote, teacherId) {
  try {
    await persistFinalNote(finalNote, teacherId);
  } catch (error) {
    console.error(error.message);
  }
}

async function persistSavedNote(note, teacherId) {
  if (!supabase || !note) return;
  const { error } = await supabase
    .from("saved_notes")
    .upsert(savedNoteToRow(note, teacherId), { onConflict: "id" });
  if (error) throw new Error(`Supabase saved note upsert failed: ${error.message}`);
}

async function persistSavedNoteSafe(note, teacherId) {
  try {
    await persistSavedNote(note, teacherId);
  } catch (error) {
    console.error(error.message);
  }
}

async function removeSavedNote(noteId) {
  if (!supabase) return;
  const { error } = await supabase.from("saved_notes").delete().eq("id", noteId);
  if (error) throw new Error(`Supabase saved note delete failed: ${error.message}`);
}

async function removeSavedNoteSafe(noteId) {
  try {
    await removeSavedNote(noteId);
  } catch (error) {
    console.error(error.message);
  }
}

async function removeFinalNote(lessonId) {
  if (!supabase) return;
  const { error } = await supabase.from("final_notes").delete().eq("lesson_id", lessonId);
  if (error) throw new Error(`Supabase final note delete failed: ${error.message}`);
}

async function removeFinalNoteSafe(lessonId) {
  try {
    await removeFinalNote(lessonId);
  } catch (error) {
    console.error(error.message);
  }
}

async function loadLessonsFromSupabase() {
  if (!supabase) return;
  const { data, error } = await supabase.from("lessons").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error(`Supabase lessons load failed: ${error.message}`);
  for (const row of data || []) {
    const lesson = rowToLesson(row);
    db.lessons.set(lesson.id, lesson);
  }
}

async function loadFinalNotesFromSupabase() {
  if (!supabase) return;
  const { data, error } = await supabase.from("final_notes").select("*");
  if (error) throw new Error(`Supabase final notes load failed: ${error.message}`);
  for (const row of data || []) {
    const lesson = db.lessons.get(row.lesson_id);
    if (!lesson) continue;
    lesson.finalNote = rowToFinalNote(row);
    db.lessons.set(lesson.id, lesson);
  }
}

async function loadSavedNotesFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from("saved_notes").select("*").order("updated_at", { ascending: false });
    if (error) throw new Error(`Supabase saved notes load failed: ${error.message}`);
    for (const row of data || []) {
      const note = rowToSavedNote(row);
      db.notes.set(note.id, note);
    }
  } catch (error) {
    console.error(error.message);
  }
}

function fallbackGeneratePlan(rawText) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\-\*\d\.\)\s]+/, "").trim())
    .filter(Boolean);
  const blocks = [];
  let current = "";
  for (const line of lines) {
    const breakPoint = line.length < 40 || /^[A-ZĄĆĘŁŃÓŚŹŻ]/.test(line) || /^temat\s*[:\-]/i.test(line);
    if (breakPoint && current) {
      blocks.push(current.trim());
      current = line;
    } else {
      current = `${current} ${line}`.trim();
    }
  }
  if (current) blocks.push(current.trim());
  return blocks.slice(0, 12).map((block, index) => ({
    id: randomUUID(),
    title: (block.split(/[.:;-]/)[0] || `Temat ${index + 1}`).slice(0, 80),
    keywords: normalize(block).split(" ").filter((word) => word.length > 3).slice(0, 5),
    description: block.slice(0, 400),
    status: "pending",
    priority: index + 1
  }));
}

function partToOpenRouterContent(part) {
  if (part.text) return { type: "text", text: part.text };
  if (part.inlineData?.data && part.inlineData?.mimeType) {
    return {
      type: "image_url",
      image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` }
    };
  }
  return { type: "text", text: "" };
}

async function callOpenRouter({ model = OPENROUTER_TEXT_MODEL, parts }) {
  const apiKey = String(process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing.");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_tokens: Number.isFinite(OPENROUTER_MAX_TOKENS) ? Math.max(256, Math.min(OPENROUTER_MAX_TOKENS, 8192)) : 2000,
      messages: [{ role: "user", content: parts.map(partToOpenRouterContent) }]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content || "").trim();
}

function parseJsonFromModel(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

function parsePlanFromJsonText(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return null;

  let parsed;
  try {
    parsed = parseJsonFromModel(text);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || !parsed.length) return [];

  const normalized = parsed
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;

      const title = String(item.tytul_sekcji || item.title || "").trim();
      const description = String(item.streszczenie_sekcji || item.description || "").trim();
      const rawKeywords = Array.isArray(item.keywords)
        ? item.keywords
        : typeof item.keywords === "string"
          ? item.keywords.split(",")
          : [];
      const keywords = rawKeywords
        .map((keyword) => String(keyword || "").trim())
        .filter(Boolean)
        .slice(0, 8);

      if (!title && !description) return null;

      return {
        id: randomUUID(),
        title: (title || `Temat ${index + 1}`).slice(0, 80),
        keywords,
        description: description.slice(0, 400),
        status: "pending",
        priority: Number(item.priority || index + 1)
      };
    })
    .filter(Boolean)
    .slice(0, 12);

  return normalized;
}

function mapPlanItem(item, index) {
  const title = String(item?.tytul_sekcji || item?.title || "").trim();
  const description = String(item?.streszczenie_sekcji || item?.description || "").trim();
  const rawKeywords = Array.isArray(item?.keywords)
    ? item.keywords
    : typeof item?.keywords === "string"
      ? item.keywords.split(",")
      : [];
  const keywords = rawKeywords
    .map((keyword) => String(keyword || "").trim())
    .filter(Boolean)
    .slice(0, 8);

  return {
    id: randomUUID(),
    title: (title || `Temat ${index + 1}`).slice(0, 80),
    keywords,
    description: description.slice(0, 400),
    status: "pending",
    priority: Number(item?.priority || index + 1)
  };
}

async function generatePlanWithLLM(rawText) {
  if (!rawText?.trim()) return [];

  const parsedFromJson = parsePlanFromJsonText(rawText);
  if (parsedFromJson && parsedFromJson.length) {
    return parsedFromJson;
  }

  try {
    const prompt = PLAN_PROMPT_TEMPLATE.replace("[podaj tekst]", rawText.slice(0, 20000)).trim();
    const out = await callOpenRouter({
      model: OPENROUTER_TEXT_MODEL,
      parts: [{ text: prompt }]
    });
    const parsed = parseJsonFromModel(out);
    if (!Array.isArray(parsed)) throw new Error("Invalid plan JSON");
    return parsed.slice(0, 12).map((item, index) => mapPlanItem(item, index));
  } catch {
    return fallbackGeneratePlan(rawText);
  }
}

async function calculateCoverageWithLLM(plan, transcripts) {
  const transcript = (transcripts || []).map((item) => item.text).join(" ").slice(0, 25000);
  if (!plan?.length || !transcript.trim()) return plan || [];
  try {
    const prompt = `
Masz plan lekcji i transkrypcję. Oznacz dla każdego punktu status:
- discussed (omówione),
- skipped (częściowo wspomniane),
- pending (nieomówione).
Zwróć WYŁĄCZNIE JSON array: [{ "id": string, "status": "pending"|"skipped"|"discussed" }].
Plan:
${JSON.stringify(plan.map((item) => ({ id: item.id, title: item.title, keywords: item.keywords, description: item.description })))}
Transkrypcja:
${transcript}
`.trim();
    const out = await callOpenRouter({ model: OPENROUTER_TEXT_MODEL, parts: [{ text: `${prompt}\nZwróć wyłącznie JSON.` }] });
    const statuses = parseJsonFromModel(out);
    const statusById = new Map((Array.isArray(statuses) ? statuses : []).map((item) => [item.id, item.status]));
    return plan.map((rawItem, index) => {
      const item = normalizePlanPoint(rawItem, index);
      if (item.manualApproved) {
        return { ...item, status: "discussed" };
      }
      const nextStatus = ["pending", "skipped", "discussed"].includes(statusById.get(item.id))
        ? statusById.get(item.id)
        : item.status;
      return { ...item, status: nextStatus };
    });
  } catch {
    const normalized = normalize(transcript);
    return plan.map((rawItem, index) => {
      const item = normalizePlanPoint(rawItem, index);
      if (item.manualApproved) {
        return { ...item, status: "discussed" };
      }
      const hits = (item.keywords || []).filter((keyword) => normalized.includes(normalize(keyword))).length;
      const threshold = Math.max(1, Math.ceil((item.keywords || []).length / 2));
      const status = hits >= threshold ? "discussed" : hits > 0 ? "skipped" : "pending";
      return { ...item, status };
    });
  }
}

async function generateFinalNoteWithLLM(lesson) {
  const transcript = (lesson.transcripts || []).map((item) => item.text).join(" ").slice(0, 20000);
  const prompt = `
Utwórz kompletną "Złotą Notatkę" po lekcji.
Sekcje:
1) Tytuł i przedmiot
2) Co zostało omówione
3) Czego nie omówiono (z planu)
4) Krótkie podsumowanie dla ucznia
Format: HTML (bez <html>, bez <body>, tylko treść artykułu).
Dane:
Tytuł: ${lesson.title}
Przedmiot: ${lesson.subject}
Plan: ${JSON.stringify(lesson.plan || [])}
Transkrypcja: ${transcript}
`.trim();
  try {
    return await callOpenRouter({ model: OPENROUTER_TEXT_MODEL, parts: [{ text: prompt }] });
  } catch {
    const missing = (lesson.plan || []).filter((item) => item.status !== "discussed");
    return `
      <article>
        <h1>Zlota Notatka: ${lesson.title}</h1>
        <h2>Plan i pokrycie</h2>
        <ul>${(lesson.plan || []).map((item) => `<li><b>${item.title}</b> - status: ${item.status}</li>`).join("")}</ul>
        <h2>Nieomowione punkty</h2>
        <ul>${missing.map((item) => `<li><b>${item.title}</b>: ${item.description}</li>`).join("") || "<li>Brak</li>"}</ul>
      </article>
    `;
  }
}

async function generateTeacherNoteWithLLM({ subject, topic, classLevel }) {
  const cleanSubject = String(subject || "").trim();
  const cleanTopic = String(topic || "").trim();
  const cleanClass = String(classLevel || "").trim();
  if (!cleanSubject || !cleanTopic) {
    throw new Error("subject and topic are required");
  }

  const prompt = NOTE_PROMPT_TEMPLATE
    .replace("[TUTAJ WPISZ TEMAT]", cleanTopic)
    .replace("[TUTAJ WPISZ PRZEDMIOT]", cleanSubject)
    .replace("[podaj klase]", cleanClass || "nie podano")
    .trim();

  const note = await callOpenRouter({
    model: OPENROUTER_TEXT_MODEL,
    parts: [{ text: prompt }]
  });

  if (!note) {
    throw new Error("AI returned an empty note.");
  }

  return note;
}

function addCost(lessonId, provider, amountPLN) {
  const events = db.costs.get(lessonId) || [];
  const event = { id: randomUUID(), lessonId, provider, amountPLN, at: new Date().toISOString() };
  events.push(event);
  db.costs.set(lessonId, events);
}

function getCostSummary(lessonId) {
  const limit = SESSION_LIMIT_PLN;
  const events = db.costs.get(lessonId) || [];
  const total = events.reduce((acc, item) => acc + item.amountPLN, 0);
  return { total, limit, safeMode: total >= limit, exceeded: total >= limit };
}

function checkLicenseForSchool(schoolId) {
  const school = db.schools.get(schoolId);
  if (!school) return { allowed: false, reason: "School not found" };
  const license = db.licenses.get(school.licenseId);
  if (!license) return { allowed: false, reason: "License not found" };
  if (new Date(license.expiresAt).getTime() < Date.now()) return { allowed: false, reason: "License expired" };
  return { allowed: true, reason: "ok", license };
}

async function extractTextFromFile(file) {
  if (file.mimetype === "text/plain") return file.buffer.toString("utf8").trim();
  if (file.mimetype === "application/pdf") {
    const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const parsed = await pdfParse(file.buffer);
    return (parsed.text || "").trim();
  }
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    const out = await callOpenRouter({
      model: OPENROUTER_VISION_MODEL,
      parts: [
        { text: "Wyciagnij caly czytelny tekst z obrazu. Zwróć wyłącznie czysty tekst." },
        { inlineData: { mimeType: file.mimetype, data: file.buffer.toString("base64") } }
      ]
    });
    return out.trim();
  }
  throw new Error("Unsupported file type");
}

app.delete("/api/account", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Supabase is not configured." });

  const user = await getUserFromBearerToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {
    await supabase.from("profiles").delete().eq("id", user.id);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to delete account." });
  }
});

app.put("/api/account/email", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Supabase is not configured." });

  const user = await getUserFromBearerToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, { email });
    if (error) return res.status(500).json({ error: error.message });
    await supabase.from("profiles").upsert({ id: user.id, email, updated_at: new Date().toISOString() }, { onConflict: "id" });
    return res.json({ email: data.user?.email || email });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update email." });
  }
});

app.post("/api/lessons", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;

  const { title, subject, month, date, rawText = "" } = req.body || {};
  if (!title || !subject) return res.status(400).json({ error: "Missing fields" });

  const normalizedDate = normalizeLessonDate(date);
  const normalizedMonth = resolveLessonMonth(month, normalizedDate);
  const lesson = {
    id: randomUUID(),
    schoolId: defaultSchoolId,
    teacherId: teacher.teacherId,
    title,
    subject,
    month: normalizedMonth,
    date: normalizedDate,
    status: "draft",
    sourceFiles: [],
    plan: rawText ? await generatePlanWithLLM(rawText) : [],
    transcripts: [],
    finalNote: null,
    startedAt: null,
    finishedAt: null
  };

  if (lesson.plan.length) lesson.status = "ready";
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  return res.status(201).json({ lesson });
});

app.get("/api/lessons", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;

  const lessons = [...db.lessons.values()].filter((lesson) => String(lesson.teacherId) === teacher.teacherId);
  res.json({ lessons });
});

app.post("/api/lessons/:lessonId/upload", upload.single("file"), async (req, res) => {
  try {
    const teacher = await resolveTeacherContext(req, res);
    if (!teacher) return;
    const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId);
    if (!lesson) return;

    let extractedText = String(req.body.rawText || "").trim();
    if (!extractedText && req.file) {
      extractedText = await extractTextFromFile(req.file);
      lesson.sourceFiles.push({
        id: randomUUID(),
        lessonId: lesson.id,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        extractedText,
        createdAt: new Date().toISOString()
      });
    }
    if (extractedText && !req.file) {
      lesson.sourceFiles.push({
        id: randomUUID(),
        lessonId: lesson.id,
        fileName: "material-note.txt",
        mimeType: "text/plain",
        extractedText,
        createdAt: new Date().toISOString()
      });
    }
    if (!extractedText) return res.status(400).json({ error: "No file or rawText provided" });

    lesson.plan = await generatePlanWithLLM(extractedText);
    if (!lesson.plan.length) return res.status(400).json({ error: "Could not derive topics from material." });
    lesson.status = "ready";
    addCost(lesson.id, "gemini", 0.2);
    db.lessons.set(lesson.id, lesson);
    await persistLessonSafe(lesson);
    return res.json({ lesson });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/api/notes/generate", async (req, res) => {
  try {
    const teacher = await resolveTeacherContext(req, res);
    if (!teacher) return;
    const subject = String(req.body?.subject || "").trim();
    const topic = String(req.body?.topic || "").trim();
    const classLevel = String(req.body?.classLevel || "").trim();
    if (!subject || !topic) {
      return res.status(400).json({ error: "Subject and topic are required." });
    }

    const note = await generateTeacherNoteWithLLM({ subject, topic, classLevel });
    return res.json({ note });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to generate note." });
  }
});

app.get("/api/notes", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const notes = [...db.notes.values()]
    .filter((note) => String(note.teacherId) === String(teacher.teacherId))
    .sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));
  return res.json({ notes });
});

app.post("/api/notes", async (req, res) => {
  try {
    const teacher = await resolveTeacherContext(req, res);
    if (!teacher) return;
    const title = String(req.body?.title || "").trim();
    const subject = String(req.body?.subject || "").trim();
    const classLevel = String(req.body?.classLevel || "").trim();
    const content = String(req.body?.content || "").trim();
    const source = String(req.body?.source || "manual").trim() || "manual";

    if (!title || !subject || !content) {
      return res.status(400).json({ error: "Title, subject and content are required." });
    }

    const now = new Date().toISOString();
    const note = {
      id: randomUUID(),
      teacherId: teacher.teacherId,
      title,
      subject,
      classLevel,
      content,
      source,
      createdAt: now,
      updatedAt: now
    };

    db.notes.set(note.id, note);
    await persistSavedNoteSafe(note, teacher.teacherId);
    return res.status(201).json({ note });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to save note." });
  }
});

app.delete("/api/notes/:noteId", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;

  const note = db.notes.get(req.params.noteId);
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }
  if (String(note.teacherId) !== String(teacher.teacherId)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  db.notes.delete(req.params.noteId);
  await removeSavedNoteSafe(req.params.noteId);
  return res.json({ ok: true, noteId: req.params.noteId });
});

app.put("/api/lessons/:lessonId/plan", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId);
  if (!lesson) return;
  lesson.plan = normalizePlanArray(req.body.plan || []);
  lesson.status = "ready";
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  return res.json({ lesson });
});

app.put("/api/lessons/:lessonId/plan/:pointId/manual", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId);
  if (!lesson) return;

  const pointId = String(req.params.pointId || "").trim();
  if (!pointId) return res.status(400).json({ error: "Invalid point id" });

  const approved = req.body?.approved !== false;
  const normalizedPlan = normalizePlanArray(lesson.plan || []);
  const nextPlan = normalizedPlan.map((point) => {
    if (String(point.id) !== pointId) return point;
    return {
      ...point,
      manualApproved: approved,
      status: approved ? "discussed" : "pending"
    };
  });

  const found = nextPlan.some((point) => String(point.id) === pointId);
  if (!found) return res.status(404).json({ error: "Plan point not found" });

  lesson.plan = nextPlan;
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  const missing = lesson.plan.filter((item) => item.status !== "discussed");
  return res.json({ lesson, missing });
});

app.post("/api/lessons/:lessonId/live/start", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId);
  if (!lesson) return;
  const check = checkLicenseForSchool(lesson.schoolId);
  if (!check.allowed) return res.status(403).json({ error: check.reason });
  lesson.status = "live";
  lesson.startedAt = new Date().toISOString();
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  return res.json({ lesson });
});

app.post("/api/lessons/:lessonId/transcript", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId);
  if (!lesson) return;
  const { text, startedAtMs = 0, language = "pl" } = req.body || {};
  if (!text || !String(text).trim()) return res.status(400).json({ error: "Transcript text required" });

  lesson.transcripts.push({
    id: randomUUID(),
    lessonId: lesson.id,
    text: String(text),
    language,
    startedAtMs,
    createdAt: new Date().toISOString()
  });
  addCost(lesson.id, "deepgram", 0.03);
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  return res.json({ ok: true });
});

app.get("/api/lessons/:lessonId/coverage", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId);
  if (!lesson) return;
  lesson.plan = await calculateCoverageWithLLM(lesson.plan, lesson.transcripts);
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  const missing = lesson.plan.filter((item) => item.status !== "discussed");
  return res.json({ plan: lesson.plan, missing });
});

app.post("/api/lessons/:lessonId/finalize", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId);
  if (!lesson) return;
  const html = await generateFinalNoteWithLLM(lesson);
  const noteId = randomUUID();
  const baseUrl = req.body.baseUrl || PUBLIC_APP_URL;
  lesson.finalNote = {
    id: noteId,
    lessonId: lesson.id,
    title: lesson.title || "Notatka",
    subject: lesson.subject || "Przedmiot",
    date: lesson.date || getTodayIsoDate(),
    html,
    publicPath: `/share/${noteId}`,
    shareUrl: `${baseUrl}/share/${noteId}`,
    createdAt: new Date().toISOString()
  };
  lesson.status = "finished";
  lesson.finishedAt = new Date().toISOString();
  db.lessons.set(lesson.id, lesson);
  addCost(lesson.id, "gemini", 0.12);
  await persistLessonSafe(lesson);
  await persistFinalNoteSafe(lesson.finalNote, lesson.teacherId);
  return res.json({ finalNote: lesson.finalNote });
});

app.put("/api/lessons/:lessonId/final-note", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId);
  if (!lesson) return;
  if (!lesson.finalNote) return res.status(404).json({ error: "Final note not found" });

  const title = String(req.body?.title || "").trim();
  const subject = String(req.body?.subject || "").trim();
  const date = String(req.body?.date || "").trim();
  if (!title || !subject || !date) {
    return res.status(400).json({ error: "Title, subject, and date are required" });
  }

  lesson.finalNote = {
    ...lesson.finalNote,
    title,
    subject,
    date,
    updatedAt: new Date().toISOString()
  };
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  await persistFinalNoteSafe(lesson.finalNote, lesson.teacherId);
  return res.json({ lesson, finalNote: lesson.finalNote });
});

app.delete("/api/lessons/:lessonId/final-note", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId);
  if (!lesson) return;
  if (!lesson.finalNote) return res.status(404).json({ error: "Final note not found" });

  lesson.finalNote = null;
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  await removeFinalNoteSafe(lesson.id);
  return res.json({ lesson });
});

app.get("/api/lessons/:lessonId/costs", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId);
  if (!lesson) return;
  return res.json(getCostSummary(lesson.id));
});

app.get("/api/share/:noteId", (req, res) => {
  const lesson = [...db.lessons.values()].find((item) => item.finalNote?.id === req.params.noteId);
  if (!lesson?.finalNote) return res.status(404).json({ error: "Not found" });
  return res.json({ finalNote: lesson.finalNote });
});

app.get("/api/admin", (_req, res) => {
  return res.json({
    schools: [...db.schools.values()],
    users: [...db.users.values()],
    licenses: [...db.licenses.values()]
  });
});

app.get("/api/admin/users", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  if (!supabase) return res.json({ users: [] });

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, admin, blocked, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: `Nie udało się pobrać użytkowników: ${error.message}` });
  }

  return res.json({ users: data || [] });
});

app.patch("/api/admin/users/:userId/block", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  if (!supabase) return res.status(500).json({ error: "Supabase nie jest skonfigurowany." });

  const blocked = req.body?.blocked === true;
  const { data, error } = await supabase
    .from("profiles")
    .update({ blocked, updated_at: new Date().toISOString() })
    .eq("id", req.params.userId)
    .select("id, blocked")
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: `Nie udało się zmienić statusu konta: ${error.message}` });
  }

  if (!data) return res.status(404).json({ error: "Użytkownik nie istnieje." });
  return res.json({ user: data });
});

app.delete("/api/admin/users/:userId", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  if (!supabase) return res.status(500).json({ error: "Supabase nie jest skonfigurowany." });

  const userId = req.params.userId;

  const { data: targetProfile, error: targetProfileError } = await supabase
    .from("profiles")
    .select("teacher_id")
    .eq("id", userId)
    .maybeSingle();

  if (targetProfileError) {
    return res.status(500).json({ error: `Nie udało się pobrać teacher_id użytkownika: ${targetProfileError.message}` });
  }

  const targetTeacherId = String(targetProfile?.teacher_id || userId);

  const lessonsToDelete = [...db.lessons.values()].filter((lesson) => String(lesson.teacherId) === targetTeacherId);
  for (const lesson of lessonsToDelete) {
    db.lessons.delete(lesson.id);
    db.costs.delete(lesson.id);
  }

  const { error: profileDeleteError } = await supabase.from("profiles").delete().eq("id", userId);
  if (profileDeleteError) {
    return res.status(500).json({ error: `Nie udało się usunąć profilu: ${profileDeleteError.message}` });
  }

  const { error: lessonsDeleteError } = await supabase.from("lessons").delete().eq("teacher_id", targetTeacherId);
  if (lessonsDeleteError) {
    return res.status(500).json({ error: `Nie udało się usunąć lekcji użytkownika: ${lessonsDeleteError.message}` });
  }

  const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
  if (authDeleteError) {
    return res.status(500).json({ error: `Nie udało się usunąć konta auth: ${authDeleteError.message}` });
  }

  return res.json({ ok: true });
});

app.get("/api/license/check", (req, res) => {
  const schoolId = String(req.query.schoolId || defaultSchoolId);
  const result = checkLicenseForSchool(schoolId);
  return res.status(result.allowed ? 200 : 403).json(result);
});

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  try {
    const teacher = await resolveTeacherContext(req, res);
    if (!teacher) return;
    const lessonId = String(req.body.lessonId || "");
    const lesson = db.lessons.get(lessonId);
    if (!lessonId || !lesson) {
      return res.status(400).json({ error: "Valid lessonId is required." });
    }
    if (String(lesson.teacherId) !== teacher.teacherId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ error: "Audio file is required." });
    }

    const summary = getCostSummary(lessonId);
    if (summary.total >= SESSION_LIMIT_PLN) {
      return res.status(402).json({ error: "Budget exceeded", message: "Limit kosztu sesji został osiągnięty." });
    }

    if (!openai) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing for Whisper STT." });
    }

    const file = await toFile(req.file.buffer, req.file.originalname || "audio.webm", {
      type: req.file.mimetype || "audio/webm"
    });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "pl",
      response_format: "verbose_json"
    });

    const durationSec = Number(transcription.duration || 0);
    const pricePerSecPLN = (WHISPER_PRICE_PER_MIN_USD / 60) * USD_TO_PLN;
    const fragmentCost = durationSec > 0 ? durationSec * pricePerSecPLN : 0.02;
    addCost(lessonId, "openai", fragmentCost);

    const text = String(transcription.text || "").trim();
    return res.json({
      text,
      durationSec,
      cost: getCostSummary(lessonId).total,
      limitReached: getCostSummary(lessonId).exceeded
    });
  } catch (error) {
    return res.status(500).json({ error: `Whisper transcription failed: ${error.message}` });
  }
});

app.get("/api/health", (_req, res) => {
  return res.json({
    ok: true,
    service: "lesson-planning-api",
    aiProvider: "openrouter+openai-whisper",
    textModel: OPENROUTER_TEXT_MODEL,
    visionModel: OPENROUTER_VISION_MODEL,
    sttModel: "whisper-1",
    whisperEnabled: Boolean(openai),
    openRouterEnabled: Boolean(String(process.env.OPENROUTER_API_KEY || "").trim()),
    supabaseEnabled: Boolean(supabase)
  });
});

loadLessonsFromSupabase()
  .then(() => loadFinalNotesFromSupabase())
  .then(() => loadSavedNotesFromSupabase())
  .catch((error) => {
    console.error(`Persistence bootstrap failed: ${error.message}`);
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`API listening at http://localhost:${port}`);
    });
  });
