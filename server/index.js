import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import { randomUUID } from "crypto";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const upload = multer();
const port = 3001;

const OPENROUTER_TEXT_MODEL = process.env.OPENROUTER_TEXT_MODEL || "openai/gpt-4o-mini";
const OPENROUTER_VISION_MODEL =
  process.env.OPENROUTER_VISION_MODEL || "google/gemini-2.5-flash";
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || "http://localhost:5173";
const SESSION_LIMIT_PLN = Number(process.env.COST_LIMIT_PLN || "3.5");
const WHISPER_PRICE_PER_MIN_USD = Number(process.env.WHISPER_PRICE_PER_MIN_USD || "0.006");
const USD_TO_PLN = Number(process.env.USD_TO_PLN || "4.0");
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const supabase = SUPABASE_ENABLED
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    })
  : null;
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

app.use(cors());
app.use(express.json({ limit: "15mb" }));

const db = {
  schools: new Map(),
  users: new Map(),
  licenses: new Map(),
  lessons: new Map(),
  costs: new Map()
};

const defaultSchoolId = "school-default";
const defaultLicenseId = "license-default";
const defaultTeacherId = "teacher-default";
const defaultAdminId = "admin-default";

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

function parseJsonArray(value) {
  if (!Array.isArray(value)) return [];
  return value;
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
    finishedAt: row.finished_at || null
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

function rowToFinalNote(row) {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    teacherId: row.teacher_id,
    title: row.title || "",
    description: row.description || "",
    html: row.html || "",
    publicPath: row.public_path || "",
    shareUrl: row.share_url || "",
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null
  };
}

function finalNoteToRow(finalNote, teacherId) {
  return {
    id: finalNote.id,
    lesson_id: finalNote.lessonId,
    teacher_id: teacherId,
    title: String(finalNote.title || ""),
    description: String(finalNote.description || ""),
    html: String(finalNote.html || ""),
    public_path: String(finalNote.publicPath || ""),
    share_url: String(finalNote.shareUrl || ""),
    created_at: finalNote.createdAt || new Date().toISOString(),
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
  if (!supabase) return;
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

async function persistCostEvent(event) {
  if (!supabase) return;
  const { error } = await supabase.from("lesson_cost_events").insert(event);
  if (error) throw new Error(`Supabase cost insert failed: ${error.message}`);
}

async function loadLessonsFromSupabase() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Supabase lessons load failed: ${error.message}`);
  for (const row of data || []) {
    const lesson = rowToLesson(row);
    db.lessons.set(lesson.id, lesson);
  }
}

async function loadCostEventsFromSupabase() {
  if (!supabase) return;
  const { data, error } = await supabase.from("lesson_cost_events").select("*");
  if (error) throw new Error(`Supabase costs load failed: ${error.message}`);
  for (const row of data || []) {
    const current = db.costs.get(row.lesson_id) || [];
    current.push({
      id: row.id,
      lessonId: row.lesson_id,
      provider: row.provider,
      amountPLN: Number(row.amount_pln || 0),
      at: row.created_at || new Date().toISOString()
    });
    db.costs.set(row.lesson_id, current);
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

async function bootstrapPersistence() {
  if (!supabase) {
    console.log("Supabase disabled: in-memory only.");
    return;
  }
  await loadLessonsFromSupabase();
  await loadCostEventsFromSupabase();
  await loadFinalNotesFromSupabase();
  console.log(`Supabase: loaded ${db.lessons.size} lessons.`);
}

function getTodayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function normalizeLessonDate(dateInput) {
  const raw = String(dateInput || "").trim();
  if (!raw) return getTodayIsoDate();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return getTodayIsoDate();
  return parsed.toISOString().split("T")[0];
}

async function resolveRequestUser(req, res) {
  if (!SUPABASE_ENABLED) {
    return defaultTeacherId;
  }
  const authHeader = String(req.headers.authorization || "").trim();
  if (!authHeader) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    res.status(401).json({ error: "Invalid authorization header." });
    return null;
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) {
    res.status(401).json({ error: "Invalid or expired auth token." });
    return null;
  }
  return data.user.id;
}

function getOwnedLesson(lessonId, teacherId) {
  const lesson = db.lessons.get(lessonId);
  if (!lesson) return null;
  return lesson.teacherId === teacherId ? lesson : null;
}

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackGeneratePlan(rawText) {
  const lines = (rawText || "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\-\*\d\.\)\s]+/, "").trim())
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
  return blocks.slice(0, 12).map((block, idx) => ({
    id: randomUUID(),
    title: (block.split(/[.:;-]/)[0] || `Temat ${idx + 1}`).slice(0, 80),
    keywords: normalize(block).split(" ").filter((w) => w.length > 3).slice(0, 5),
    description: block.slice(0, 400),
    status: "pending",
    priority: idx + 1
  }));
}

function partToOpenRouterContent(part) {
  if (part.text) {
    return { type: "text", text: part.text };
  }
  if (part.inlineData?.data && part.inlineData?.mimeType) {
    return {
      type: "image_url",
      image_url: {
        url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
      }
    };
  }
  return { type: "text", text: "" };
}

async function callOpenRouter({ model = OPENROUTER_TEXT_MODEL, parts }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OpenRouter API key is missing.");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: parts.map(partToOpenRouterContent)
        }
      ]
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${text}`);
  }
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return text.trim();
}

function parseJsonFromModel(text) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function generatePlanWithLLM(rawText) {
  if (!rawText?.trim()) return [];
  try {
    const prompt = `
Zamien material lekcyjny na plan lekcji.
Zwróć WYŁĄCZNIE JSON array (max 12 elementów), każdy element:
{ "title": string, "keywords": string[], "description": string, "priority": number }
Zasady:
- język polski
- title krótki i konkretny
- keywords 3-6 haseł
- description max 350 znaków
Material:
${rawText.slice(0, 20000)}
`.trim();
    const out = await callOpenRouter({
      model: OPENROUTER_TEXT_MODEL,
      parts: [{ text: `${prompt}\nZwróć wyłącznie JSON.` }]
    });
    const parsed = parseJsonFromModel(out);
    if (!Array.isArray(parsed)) throw new Error("Invalid plan JSON");
    return parsed.slice(0, 12).map((item, idx) => ({
      id: randomUUID(),
      title: String(item.title || `Temat ${idx + 1}`).slice(0, 80),
      keywords: Array.isArray(item.keywords) ? item.keywords.map(String).slice(0, 8) : [],
      description: String(item.description || "").slice(0, 400),
      status: "pending",
      priority: Number(item.priority || idx + 1)
    }));
  } catch {
    return fallbackGeneratePlan(rawText);
  }
}

async function calculateCoverageWithLLM(plan, transcripts) {
  const transcript = (transcripts || []).map((t) => t.text).join(" ").slice(0, 25000);
  if (!plan?.length || !transcript.trim()) return plan || [];
  try {
    const prompt = `
Masz plan lekcji i transkrypcję. Oznacz dla każdego punktu status:
- discussed (omówione),
- skipped (częściowo wspomniane),
- pending (nieomówione).
Zwróć WYŁĄCZNIE JSON array: [{ "id": string, "status": "pending"|"skipped"|"discussed" }].
Plan:
${JSON.stringify(plan.map((p) => ({ id: p.id, title: p.title, keywords: p.keywords, description: p.description })))}
Transkrypcja:
${transcript}
`.trim();
    const out = await callOpenRouter({
      model: OPENROUTER_TEXT_MODEL,
      parts: [{ text: `${prompt}\nZwróć wyłącznie JSON.` }]
    });
    const statuses = parseJsonFromModel(out);
    const statusById = new Map((Array.isArray(statuses) ? statuses : []).map((x) => [x.id, x.status]));
    return plan.map((item) => ({
      ...item,
      status: ["pending", "skipped", "discussed"].includes(statusById.get(item.id))
        ? statusById.get(item.id)
        : item.status
    }));
  } catch {
    const normalized = normalize(transcript);
    return plan.map((item) => {
      const hits = (item.keywords || []).filter((keyword) => normalized.includes(normalize(keyword))).length;
      const threshold = Math.max(1, Math.ceil((item.keywords || []).length / 2));
      const status = hits >= threshold ? "discussed" : hits > 0 ? "skipped" : "pending";
      return { ...item, status };
    });
  }
}

async function generateFinalNoteWithLLM(lesson) {
  const transcript = (lesson.transcripts || []).map((x) => x.text).join(" ").slice(0, 20000);
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
    const missing = (lesson.plan || []).filter((p) => p.status !== "discussed");
    return `
      <article>
        <h1>Zlota Notatka: ${lesson.title}</h1>
        <h2>Plan i pokrycie</h2>
        <ul>${(lesson.plan || []).map((p) => `<li><b>${p.title}</b> - status: ${p.status}</li>`).join("")}</ul>
        <h2>Nieomowione punkty</h2>
        <ul>${missing.map((p) => `<li><b>${p.title}</b>: ${p.description}</li>`).join("") || "<li>Brak</li>"}</ul>
      </article>
    `;
  }
}

function addCost(lessonId, provider, amountPLN) {
  const events = db.costs.get(lessonId) || [];
  const event = { id: randomUUID(), lessonId, provider, amountPLN, at: new Date().toISOString() };
  events.push(event);
  db.costs.set(lessonId, events);
  void persistCostEvent({
    id: event.id,
    lesson_id: event.lessonId,
    provider: event.provider,
    amount_pln: event.amountPLN,
    created_at: event.at
  }).catch((err) => console.error(err.message));
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
    // Dynamic import avoids the broken ESM entry path in some pdf-parse setups.
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
        {
          inlineData: {
            mimeType: file.mimetype,
            data: file.buffer.toString("base64")
          }
        }
      ]
    });
    return out.trim();
  }
  throw new Error("Unsupported file type");
}

app.post("/api/lessons", async (req, res) => {
  const teacherId = await resolveRequestUser(req, res);
  if (!teacherId) return;
  const { title, subject, month, date, rawText = "" } = req.body || {};
  if (!title || !subject || !month) return res.status(400).json({ error: "Missing fields" });
  const normalizedDate = normalizeLessonDate(date);
  const lessonMonth =
    String(month).trim() ||
    new Date(`${normalizedDate}T00:00:00`).toLocaleString("pl-PL", { month: "long" });
  const lesson = {
    id: randomUUID(),
    schoolId: defaultSchoolId,
    teacherId,
    title,
    subject,
    month: lessonMonth,
    date: normalizedDate,
    status: "draft",
    sourceFiles: [],
    plan: rawText ? await generatePlanWithLLM(rawText) : [],
    transcripts: []
  };
  if (lesson.plan.length) lesson.status = "ready";
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  return res.status(201).json({ lesson });
});

app.get("/api/lessons", async (req, res) => {
  const teacherId = await resolveRequestUser(req, res);
  if (!teacherId) return;
  const lessons = [...db.lessons.values()].filter((lesson) => lesson.teacherId === teacherId);
  res.json({ lessons });
});

app.post("/api/lessons/:lessonId/upload", upload.single("file"), async (req, res) => {
  try {
    const teacherId = await resolveRequestUser(req, res);
    if (!teacherId) return;
    const lesson = getOwnedLesson(req.params.lessonId, teacherId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    let extractedText = (req.body.rawText || "").trim();
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

app.put("/api/lessons/:lessonId/plan", async (req, res) => {
  const teacherId = await resolveRequestUser(req, res);
  if (!teacherId) return;
  const lesson = getOwnedLesson(req.params.lessonId, teacherId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  lesson.plan = req.body.plan || [];
  lesson.status = "ready";
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  return res.json({ lesson });
});

app.post("/api/lessons/:lessonId/live/start", async (req, res) => {
  const teacherId = await resolveRequestUser(req, res);
  if (!teacherId) return;
  const lesson = getOwnedLesson(req.params.lessonId, teacherId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  const check = checkLicenseForSchool(lesson.schoolId);
  if (!check.allowed) return res.status(403).json({ error: check.reason });
  lesson.status = "live";
  lesson.startedAt = new Date().toISOString();
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  return res.json({ lesson });
});

app.post("/api/lessons/:lessonId/transcript", async (req, res) => {
  const teacherId = await resolveRequestUser(req, res);
  if (!teacherId) return;
  const lesson = getOwnedLesson(req.params.lessonId, teacherId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
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
  const teacherId = await resolveRequestUser(req, res);
  if (!teacherId) return;
  const lesson = getOwnedLesson(req.params.lessonId, teacherId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  lesson.plan = await calculateCoverageWithLLM(lesson.plan, lesson.transcripts);
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  const missing = lesson.plan.filter((item) => item.status !== "discussed");
  return res.json({ plan: lesson.plan, missing });
});

app.post("/api/lessons/:lessonId/finalize", async (req, res) => {
  const teacherId = await resolveRequestUser(req, res);
  if (!teacherId) return;
  const lesson = getOwnedLesson(req.params.lessonId, teacherId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  const html = await generateFinalNoteWithLLM(lesson);
  const noteId = randomUUID();
  const baseUrl = req.body.baseUrl || PUBLIC_APP_URL;
  lesson.finalNote = {
    id: noteId,
    lessonId: lesson.id,
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
  const teacherId = await resolveRequestUser(req, res);
  if (!teacherId) return;
  const lesson = getOwnedLesson(req.params.lessonId, teacherId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  if (!lesson.finalNote) return res.status(404).json({ error: "Final note not found" });

  const title = String(req.body?.title || "").trim();
  const description = String(req.body?.description || "").trim();
  const html = String(req.body?.html || "").trim();

  if (!html) {
    return res.status(400).json({ error: "Final note HTML is required" });
  }

  lesson.finalNote = {
    ...lesson.finalNote,
    title,
    description,
    html,
    updatedAt: new Date().toISOString()
  };

  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  await persistFinalNoteSafe(lesson.finalNote, lesson.teacherId);
  return res.json({ lesson, finalNote: lesson.finalNote });
});

app.delete("/api/lessons/:lessonId/final-note", async (req, res) => {
  const teacherId = await resolveRequestUser(req, res);
  if (!teacherId) return;
  const lesson = getOwnedLesson(req.params.lessonId, teacherId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  if (!lesson.finalNote) return res.status(404).json({ error: "Final note not found" });

  lesson.finalNote = null;
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  await removeFinalNoteSafe(lesson.id);
  return res.json({ lesson });
});

app.get("/api/lessons/:lessonId/costs", async (req, res) => {
  const teacherId = await resolveRequestUser(req, res);
  if (!teacherId) return;
  const lesson = getOwnedLesson(req.params.lessonId, teacherId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  return res.json(getCostSummary(lesson.id));
});

app.get("/api/share/:noteId", (req, res) => {
  const lesson = [...db.lessons.values()].find((x) => x.finalNote?.id === req.params.noteId);
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

app.get("/api/license/check", (req, res) => {
  const schoolId = String(req.query.schoolId || defaultSchoolId);
  const result = checkLicenseForSchool(schoolId);
  return res.status(result.allowed ? 200 : 403).json(result);
});

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  try {
    const teacherId = await resolveRequestUser(req, res);
    if (!teacherId) return;
    const lessonId = String(req.body.lessonId || "");
    const lesson = getOwnedLesson(lessonId, teacherId);
    if (!lessonId || !lesson) {
      return res.status(400).json({ error: "Valid lessonId is required." });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ error: "Audio file is required." });
    }

    const summary = getCostSummary(lessonId);
    if (summary.total >= SESSION_LIMIT_PLN) {
      return res.status(402).json({
        error: "Budget exceeded",
        message: "Limit kosztu sesji został osiągnięty."
      });
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
  const apiKey = process.env.OPENROUTER_API_KEY;
  return res.json({
    ok: true,
    service: "lesson-planning-api",
    aiProvider: "openrouter+openai-whisper",
    textModel: OPENROUTER_TEXT_MODEL,
    visionModel: OPENROUTER_VISION_MODEL,
    sttModel: "whisper-1",
    whisperEnabled: Boolean(openai),
    openRouterEnabled: Boolean(apiKey),
    supabaseEnabled: SUPABASE_ENABLED
  });
});

bootstrapPersistence()
  .catch((error) => {
    console.error(`Persistence bootstrap failed: ${error.message}`);
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`API listening at http://localhost:${port}`);
    });
  });
