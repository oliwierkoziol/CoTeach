import path from "path";
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

const OPENROUTER_TEXT_MODEL = process.env.OPENROUTER_TEXT_MODEL || "openai/gpt-4o-mini";
const OPENROUTER_VISION_MODEL = process.env.OPENROUTER_VISION_MODEL || "google/gemini-2.5-flash";
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

function normalizeLessonDate(dateInput) {
  const raw = String(dateInput || "").trim();
  if (!raw) return getTodayIsoDate();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return getTodayIsoDate();
  return parsed.toISOString().split("T")[0];
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
    return parsed.slice(0, 12).map((item, index) => ({
      id: randomUUID(),
      title: String(item.title || `Temat ${index + 1}`).slice(0, 80),
      keywords: Array.isArray(item.keywords) ? item.keywords.map(String).slice(0, 8) : [],
      description: String(item.description || "").slice(0, 400),
      status: "pending",
      priority: Number(item.priority || index + 1)
    }));
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

app.post("/api/lessons", async (req, res) => {
  const { title, subject, month, date, rawText = "" } = req.body || {};
  if (!title || !subject || !month) return res.status(400).json({ error: "Missing fields" });

  const normalizedDate = normalizeLessonDate(date);
  const lesson = {
    id: randomUUID(),
    schoolId: defaultSchoolId,
    teacherId: defaultTeacherId,
    title,
    subject,
    month,
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

app.get("/api/lessons", (_req, res) => {
  res.json({ lessons: [...db.lessons.values()] });
});

app.post("/api/lessons/:lessonId/upload", upload.single("file"), async (req, res) => {
  try {
    const lesson = db.lessons.get(req.params.lessonId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

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
  const lesson = db.lessons.get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  lesson.plan = req.body.plan || [];
  lesson.status = "ready";
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  return res.json({ lesson });
});

app.post("/api/lessons/:lessonId/live/start", async (req, res) => {
  const lesson = db.lessons.get(req.params.lessonId);
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
  const lesson = db.lessons.get(req.params.lessonId);
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
  const lesson = db.lessons.get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  lesson.plan = await calculateCoverageWithLLM(lesson.plan, lesson.transcripts);
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  const missing = lesson.plan.filter((item) => item.status !== "discussed");
  return res.json({ plan: lesson.plan, missing });
});

app.post("/api/lessons/:lessonId/finalize", async (req, res) => {
  const lesson = db.lessons.get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
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
  const lesson = db.lessons.get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
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
  const lesson = db.lessons.get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  if (!lesson.finalNote) return res.status(404).json({ error: "Final note not found" });

  lesson.finalNote = null;
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  await removeFinalNoteSafe(lesson.id);
  return res.json({ lesson });
});

app.get("/api/lessons/:lessonId/costs", (req, res) => {
  const lesson = db.lessons.get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
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

app.get("/api/license/check", (req, res) => {
  const schoolId = String(req.query.schoolId || defaultSchoolId);
  const result = checkLicenseForSchool(schoolId);
  return res.status(result.allowed ? 200 : 403).json(result);
});

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  try {
    const lessonId = String(req.body.lessonId || "");
    const lesson = db.lessons.get(lessonId);
    if (!lessonId || !lesson) {
      return res.status(400).json({ error: "Valid lessonId is required." });
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
    supabaseEnabled: Boolean(supabase)
  });
});

loadLessonsFromSupabase()
  .then(() => loadFinalNotesFromSupabase())
  .catch((error) => {
    console.error(`Persistence bootstrap failed: ${error.message}`);
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`API listening at http://localhost:${port}`);
    });
  });
