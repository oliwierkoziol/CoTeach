import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "crypto";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { toFile } from "openai/uploads";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const app = express();

const MB = 1024 * 1024;
const UPLOAD_LIMITS = {
  licensed: { maxUploads: 30, maxFileSizeBytes: 50 * MB },
  demo: { maxUploads: 8, maxFileSizeBytes: 10 * MB },
  unlicensed: { maxUploads: 3, maxFileSizeBytes: 5 * MB }
};
const DEMO_POLICY = {
  maxLiveMinutes: 10,
  watermarkText: "[TRYB DEMO] Material wygenerowany w wersji demonstracyjnej CoTeach."
};

// Hard cap for multipart parsing in memory. Per-user limits are checked in route handlers.
const upload = multer({ limits: { fileSize: UPLOAD_LIMITS.licensed.maxFileSizeBytes } });
const port = Number(process.env.PORT || 3001);

const OPENROUTER_TEXT_MODEL = process.env.OPENROUTER_TEXT_MODEL || "google/gemma-4-31b";
const OPENROUTER_TEXT_FALLBACK_MODEL = process.env.OPENROUTER_TEXT_FALLBACK_MODEL || "google/gemma-4-31b";
const OPENROUTER_VISION_MODEL = process.env.OPENROUTER_VISION_MODEL || "google/gemini-2.5-flash";
const OPENROUTER_PRESENTATION_MODEL = process.env.OPENROUTER_PRESENTATION_MODEL || "google/gemma-4-31b";
const OPENROUTER_MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS || "2000");
const AI_MARKUP_RATE = Number(process.env.AI_MARKUP_RATE || "0.30");
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || "http://localhost:5173";
const SESSION_LIMIT_PLN = Number(process.env.COST_LIMIT_PLN || "3.5");
const WHISPER_PRICE_PER_MIN_USD = Number(process.env.WHISPER_PRICE_PER_MIN_USD || "0.006");
const USD_TO_PLN = Number(process.env.USD_TO_PLN || "4.0");
const OPENAI_BASE_URL = String(process.env.OPENAI_BASE_URL || "").trim();
const OPENAI_WHISPER_MODEL = String(process.env.OPENAI_WHISPER_MODEL || "whisper-1").trim() || "whisper-1";
const OPENAI_PROVIDER_NAME = String(process.env.OPENAI_PROVIDER_NAME || "openai").trim() || "openai";
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_BUSINESS_EMAIL_DOMAIN = String(process.env.BUSINESS_EMAIL_DOMAIN || "sluzbowe.coteach.local")
  .trim()
  .toLowerCase();

const OPENROUTER_MODEL_PRICING_USD_PER_1M = {
  default: { prompt: 0.35, completion: 2.5 },
  "google/gemma-2-9b-it:free": { prompt: 0, completion: 0 },
  "google/gemini-2.5-flash": { prompt: 0.35, completion: 2.5 }
};
const AI_MIN_MARGIN_PLN = Number(process.env.AI_MIN_MARGIN_PLN || "0.05");

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

const openaiClientConfig = process.env.OPENAI_API_KEY
  ? {
      apiKey: process.env.OPENAI_API_KEY,
      ...(OPENAI_BASE_URL ? { baseURL: OPENAI_BASE_URL } : {})
    }
  : null;
const openai = openaiClientConfig ? new OpenAI(openaiClientConfig) : null;

const NOTE_PROMPT_TEMPLATE = fs.readFileSync(
  path.resolve(process.cwd(), "prompty_do_ai", "prompt_generacja_notatki_przedmiotowej.txt"),
  "utf8"
);
const PLAN_PROMPT_TEMPLATE = fs.readFileSync(
  path.resolve(process.cwd(), "prompty_do_ai", "prompt_generacja_planu_lekcji_json.txt"),
  "utf8"
);
const PRESENTATION_PROMPT_TEMPLATE = fs.readFileSync(
  path.resolve(process.cwd(), "prompty_do_ai", "prompt_generacja_prezentacji_json.txt"),
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
  costEvents: [],
  notes: new Map()
};

const defaultSchoolId = "school-default";
const defaultLicenseId = "license-default";
const defaultTeacherId = "teacher-default";
const defaultAdminId = "admin-default";

function seedMemoryDb() {
  db.schools.set(defaultSchoolId, {
    id: defaultSchoolId,
    name: "Demo School",
    licenseId: defaultLicenseId,
    businessEmailDomain: DEFAULT_BUSINESS_EMAIL_DOMAIN
  });
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
let latestBusinessSchoolId = defaultSchoolId;

function normalizeBusinessDomain(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^@+/, "");
}

function getSchoolSettings(schoolId) {
  const school = db.schools.get(String(schoolId || defaultSchoolId)) || {};
  const schoolName = String(school.name || "Twoja szkoła").trim() || "Twoja szkoła";
  const businessEmailDomain =
    normalizeBusinessDomain(school.businessEmailDomain) || DEFAULT_BUSINESS_EMAIL_DOMAIN;
  return { schoolName, businessEmailDomain };
}

function getPublicBusinessSchoolId() {
  if (latestBusinessSchoolId && db.schools.has(latestBusinessSchoolId)) return latestBusinessSchoolId;
  const ids = [...db.schools.keys()];
  return ids[0] || defaultSchoolId;
}

function buildSchoolIdFromName(name, fallbackId = defaultSchoolId) {
  const base = String(name || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || String(fallbackId || defaultSchoolId);
}

async function migrateSchoolIdEverywhere(oldSchoolId, newSchoolId) {
  if (!supabase) return;
  if (!oldSchoolId || !newSchoolId || oldSchoolId === newSchoolId) return;

  const tablesWithSchoolId = [
    "profiles",
    "user_licenses",
    "lessons",
    "saved_notes",
    "final_notes",
    "openrouter_usage_events"
  ];

  for (const tableName of tablesWithSchoolId) {
    const { error } = await supabase
      .from(tableName)
      .update({ school_id: newSchoolId, updated_at: new Date().toISOString() })
      .eq("school_id", oldSchoolId);
    if (error && !String(error.message || "").toLowerCase().includes("updated_at")) {
      throw new Error(`Nie udało się zmigrować school_id w ${tableName}: ${error.message}`);
    }
    if (error && String(error.message || "").toLowerCase().includes("updated_at")) {
      const fallback = await supabase.from(tableName).update({ school_id: newSchoolId }).eq("school_id", oldSchoolId);
      if (fallback.error) {
        throw new Error(`Nie udało się zmigrować school_id w ${tableName}: ${fallback.error.message}`);
      }
    }
  }
}

async function ensureSupabaseSchoolRow({ schoolId, schoolName, businessEmailDomain, oldSchoolId = null }) {
  if (!supabase || !schoolId) return;
  const slug = String(schoolId || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || "school";

  const candidatePayloads = [
    {
      id: schoolId,
      name: schoolName,
      slug,
      business_email_domain: businessEmailDomain,
      updated_at: new Date().toISOString()
    },
    {
      id: schoolId,
      name: schoolName,
      slug,
      business_email_domain: businessEmailDomain
    },
    {
      id: schoolId,
      name: schoolName,
      slug,
      updated_at: new Date().toISOString()
    },
    {
      id: schoolId,
      name: schoolName,
      slug
    },
    {
      id: schoolId,
      slug
    }
  ];

  let lastError = null;
  for (const payload of candidatePayloads) {
    const { error } = await supabase.from("schools").upsert(payload, { onConflict: "id" });
    if (!error) {
      lastError = null;
      break;
    }
    lastError = error;
  }
  if (lastError) {
    throw new Error(`Nie udało się utworzyć szkoły docelowej: ${lastError.message}`);
  }

  if (oldSchoolId && oldSchoolId !== schoolId) {
    // Best effort cleanup of old id row after successful migration.
    await supabase.from("schools").delete().eq("id", oldSchoolId);
  }
}

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

async function resolveAdminSchoolContext(req, res) {
  if (!supabase) {
    return { schoolId: defaultSchoolId, userId: defaultAdminId };
  }

  const user = await getRequestUser(req);
  if (!user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("school_id, admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    res.status(500).json({ error: `Nie udało się odczytać profilu admina: ${profileError.message}` });
    return null;
  }

  if (profile?.admin !== true) {
    res.status(403).json({ error: "Brak uprawnień administratora." });
    return null;
  }

  return { schoolId: String(profile?.school_id || defaultSchoolId), userId: user.id };
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
    return { teacherId: defaultTeacherId, userId: defaultTeacherId, schoolId: defaultSchoolId };
  }
  const user = await getRequestUser(req);
  if (!user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("teacher_id, school_id, license, license_lenght")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    res.status(500).json({ error: `Nie udało się odczytać profilu: ${profileError.message}` });
    return null;
  }

  let teacherId = String(profile?.teacher_id || "").trim();
  const schoolId = String(profile?.school_id || defaultSchoolId).trim() || defaultSchoolId;
  if (!teacherId) {
    teacherId = `teacher-${randomUUID()}`;
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email || null,
        school_id: schoolId,
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

  await syncProfileLicenseStateSafe({ userId: user.id, activeLicense: getActiveUserLicense(user.id), profileSnapshot: profile });
  return { teacherId, userId: user.id, schoolId };
}

function getActiveUserLicense(userId) {
  if (!userId) return null;
  const now = Date.now();
  const assignedLicense = [...db.licenses.values()].find((license) => license.assignedUserId === userId);
  if (!assignedLicense) return null;
  const expiresAtMs = new Date(assignedLicense.expiresAt).getTime();
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < now) return null;
  return assignedLicense;
}

function getRemainingLicenseDays(expiresAt) {
  const expiresAtMs = new Date(expiresAt || "").getTime();
  if (!Number.isFinite(expiresAtMs)) return 0;
  const remainingMs = expiresAtMs - Date.now();
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / DAY_MS);
}

function getErrorMessage(error, fallbackMessage) {
  if (!error) return fallbackMessage;
  if (typeof error === "string") return error;
  if (typeof error.message === "string" && error.message.trim()) return error.message;
  return fallbackMessage;
}

async function syncProfileLicenseState({ userId, activeLicense = null, profileSnapshot = null }) {
  if (!supabase || !userId) return;

  const nextLicense = Boolean(activeLicense);
  const nextLength = nextLicense ? getRemainingLicenseDays(activeLicense.expiresAt) : 0;
  const currentLicense = profileSnapshot?.license === true;
  const currentLength = Number(profileSnapshot?.license_lenght || 0);

  if (currentLicense === nextLicense && currentLength === nextLength) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      license: nextLicense,
      license_lenght: nextLength,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);
  if (error) throw new Error(`Nie udało się zsynchronizować licencji w profilu: ${error.message}`);
}

async function syncProfileLicenseStateSafe(params) {
  try {
    await syncProfileLicenseState(params);
  } catch (error) {
    console.error(error.message);
  }
}

function getUserUploadPolicy(userId) {
  const activeLicense = getActiveUserLicense(userId);
  if (!activeLicense) return UPLOAD_LIMITS.unlicensed;
  return activeLicense.demoMode ? UPLOAD_LIMITS.demo : UPLOAD_LIMITS.licensed;
}

function enforceDemoLiveLimit(license, lesson, res) {
  if (!license?.demoMode) return true;
  const startedAtMs = new Date(lesson?.startedAt || 0).getTime();
  if (!Number.isFinite(startedAtMs) || startedAtMs <= 0) return true;

  const limitMs = DEMO_POLICY.maxLiveMinutes * 60 * 1000;
  const elapsedMs = Math.max(0, Date.now() - startedAtMs);
  if (elapsedMs <= limitMs) return true;

  return res.status(402).json({
    code: "DEMO_LIVE_LIMIT_REACHED",
    error: `Tryb demo pozwala na maksymalnie ${DEMO_POLICY.maxLiveMinutes} minut lekcji live.`,
    demo: {
      isDemo: true,
      maxLiveMinutes: DEMO_POLICY.maxLiveMinutes
    }
  });
}

function applyDemoTextWatermark(text, isDemoLicense) {
  if (!isDemoLicense) return String(text || "").trim();
  const clean = String(text || "").trim();
  return `${DEMO_POLICY.watermarkText}\n\n${clean}`.trim();
}

function applyDemoHtmlWatermark(html, isDemoLicense) {
  if (!isDemoLicense) return String(html || "");
  const banner = `<div style="margin-bottom:12px;padding:10px 12px;border:1px solid #f59e0b;background:#fef3c7;color:#92400e;border-radius:8px;font-size:13px;font-weight:600;">${DEMO_POLICY.watermarkText}</div>`;
  return `${banner}${String(html || "")}`;
}

function requireActiveLicenseForTeacher(teacher, res, featureName = "Funkcja AI") {
  const activeLicense = getActiveUserLicense(teacher?.userId);
  if (activeLicense) return activeLicense;
  res.status(403).json({
    code: "LICENSE_REQUIRED",
    error: `${featureName} wymaga aktywnej licencji.`
  });
  return null;
}

function countUserFileUploads(teacherId, schoolId = null) {
  const teacherLessons = [...db.lessons.values()].filter((lesson) => {
    if (String(lesson.teacherId) !== String(teacherId)) return false;
    if (schoolId !== null && schoolId !== undefined && String(lesson.schoolId || "") !== String(schoolId)) return false;
    return true;
  });
  return teacherLessons.reduce((count, lesson) => {
    const files = Array.isArray(lesson.sourceFiles) ? lesson.sourceFiles : [];
    const lessonCount = files.filter((file) => {
      if (file?.uploadType === "file") return true;
      // Legacy fallback for older records that do not have uploadType.
      if (!file?.uploadType && file?.fileName && file.fileName !== "material-note.txt") return true;
      return false;
    }).length;
    return count + lessonCount;
  }, 0);
}

function getOwnedLessonOrRespond(req, res, teacherId, schoolId = null) {
  const lesson = db.lessons.get(req.params.lessonId);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return null;
  }
  if (String(lesson.teacherId) !== String(teacherId)) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  if (schoolId !== null && schoolId !== undefined && String(lesson.schoolId || "") !== String(schoolId)) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return lesson;
}

function rowToLesson(row) {
  const parsedLength = Number(row.length);
  const normalizedLength = Number.isFinite(parsedLength) && parsedLength > 0 ? Math.round(parsedLength) : 45;
  return {
    id: row.id,
    schoolId: row.school_id,
    teacherId: row.teacher_id,
    title: row.title,
    subject: row.subject,
    month: row.month,
    date: row.date,
    status: row.status,
    length: normalizedLength,
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
    schoolId: row.school_id || null,
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
    schoolId: row.school_id || null,
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
  const parsedLength = Number(lesson.length);
  const normalizedLength = Number.isFinite(parsedLength) && parsedLength > 0 ? Math.round(parsedLength) : 45;
  return {
    id: lesson.id,
    school_id: lesson.schoolId,
    teacher_id: lesson.teacherId,
    title: lesson.title,
    subject: lesson.subject,
    month: lesson.month,
    date: lesson.date,
    status: lesson.status,
    length: normalizedLength,
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
    school_id: finalNote.schoolId || null,
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
    school_id: note.schoolId || null,
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

function licenseToRow(license) {
  return {
    id: String(license.id || ""),
    key: String(license.key || ""),
    assigned_user_id: license.assignedUserId ? String(license.assignedUserId) : null,
    max_active_users: Number(license.maxActiveUsers || 1),
    expires_at: license.expiresAt || null,
    demo_mode: Boolean(license.demoMode),
    school_id: license.schoolId ? String(license.schoolId) : null,
    created_at: license.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function rowToLicense(row) {
  return {
    id: row.id,
    key: row.key,
    assignedUserId: row.assigned_user_id || undefined,
    maxActiveUsers: Number(row.max_active_users || 1),
    expiresAt: row.expires_at,
    demoMode: row.demo_mode === true,
    schoolId: row.school_id || undefined,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null
  };
}

function roundMoney(value) {
  return Number(Number(value || 0).toFixed(4));
}

function getOpenRouterPricing(model) {
  return OPENROUTER_MODEL_PRICING_USD_PER_1M[model] || OPENROUTER_MODEL_PRICING_USD_PER_1M.default;
}

function estimateOpenRouterBaseUsdCost({ model, promptTokens = 0, completionTokens = 0 }) {
  const pricing = getOpenRouterPricing(model);
  return ((Number(promptTokens || 0) * pricing.prompt) + (Number(completionTokens || 0) * pricing.completion)) / 1_000_000;
}

function buildBilledCost(basePLN, options = {}) {
  const enforceMinMargin = options?.enforceMinMargin !== false;
  const base = roundMoney(basePLN);
  const marginFromRate = roundMoney(base * AI_MARKUP_RATE);
  const margin = roundMoney(enforceMinMargin ? Math.max(marginFromRate, AI_MIN_MARGIN_PLN) : marginFromRate);
  return {
    basePLN: base,
    marginPLN: margin,
    totalPLN: roundMoney(base + margin)
  };
}

function recordCostFromBase({ lessonId = null, schoolId = null, teacherId = null, provider, model = null, feature = null, category, baseAmountPLN, providerCostUsd = null, costUsd = null, promptTokens = 0, completionTokens = 0, totalTokens = 0, requestId = null, latencyMs = null, status = "ok", errorMessage = null, enforceMinMargin = true }) {
  const cost = buildBilledCost(baseAmountPLN, { enforceMinMargin });
  addCost({
    lessonId,
    schoolId,
    teacherId,
    provider,
    model: model || provider,
    feature: feature || category,
    category,
    baseAmountPLN: cost.basePLN,
    marginAmountPLN: cost.marginPLN,
    amountPLN: cost.totalPLN,
    providerCostUsd,
    costUsd,
    promptTokens,
    completionTokens,
    totalTokens,
    requestId,
    latencyMs,
    status,
    errorMessage
  });
}

function estimateLiveTranscriptionBasePln(text) {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const estimatedMinutes = words > 0 ? words / 150 : 0;
  const estimatedUsd = estimatedMinutes * WHISPER_PRICE_PER_MIN_USD;
  return roundMoney(estimatedUsd * USD_TO_PLN);
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

function resolveLessonLengthMinutes(lesson) {
  const parsedLength = Number(lesson?.length);
  if (!Number.isFinite(parsedLength) || parsedLength <= 0) return 45;
  return Math.round(parsedLength);
}

function shouldAutoFinishLesson(lesson, nowMs = Date.now()) {
  if (!lesson || lesson.status !== "live") return false;
  const startedAtMs = new Date(lesson.startedAt || 0).getTime();
  if (!Number.isFinite(startedAtMs) || startedAtMs <= 0) return false;
  const targetMs = startedAtMs + resolveLessonLengthMinutes(lesson) * 60 * 1000;
  return nowMs >= targetMs;
}

function markLessonFinished(lesson, nowIso = new Date().toISOString()) {
  lesson.status = "finished";
  lesson.finishedAt = lesson.finishedAt || nowIso;
}

async function autoFinishDueLessons() {
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const dueLessons = [...db.lessons.values()].filter((lesson) => shouldAutoFinishLesson(lesson, nowMs));
  if (!dueLessons.length) return;
  await Promise.all(
    dueLessons.map(async (lesson) => {
      markLessonFinished(lesson, nowIso);
      db.lessons.set(lesson.id, lesson);
      await persistLessonSafe(lesson);
    })
  );
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

async function persistLicense(license) {
  if (!supabase || !license) return;
  const { error } = await supabase
    .from("user_licenses")
    .upsert(licenseToRow(license), { onConflict: "id" });
  if (error) throw new Error(`Supabase license upsert failed: ${error.message}`);
}

async function removeLicense(licenseId) {
  if (!supabase || !licenseId) return;
  const { error } = await supabase.from("user_licenses").delete().eq("id", licenseId);
  if (error) throw new Error(`Supabase license delete failed: ${error.message}`);
}

async function loadLicensesFromSupabase() {
  if (!supabase) return;
  const { data, error } = await supabase.from("user_licenses").select("*");
  if (error) throw new Error(`Supabase licenses load failed: ${error.message}`);
  for (const row of data || []) {
    const license = rowToLicense(row);
    db.licenses.set(license.id, license);
  }
}

async function loadSchoolsFromSupabase() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Supabase schools load failed: ${error.message}`);

  for (const row of data || []) {
    const id = String(row.id || "").trim();
    if (!id) continue;
    const school = {
      id,
      name: String(row.name || "").trim() || "Twoja szkoła",
      businessEmailDomain: normalizeBusinessDomain(row.business_email_domain || row.domain || ""),
      updatedAt: row.updated_at || null
    };
    db.schools.set(id, school);
  }

  if (data?.length) {
    latestBusinessSchoolId = String(data[0].id || defaultSchoolId);
  }
}

async function loadLessonsFromSupabase() {
  if (!supabase) return;
  const { data, error } = await supabase.from("lessons").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error(`Supabase lessons load failed: ${error.message}`);

  const lessons = new Map();
  for (const row of data || []) {
    const lesson = rowToLesson(row);
    lessons.set(lesson.id, lesson);
  }
  db.lessons = lessons;
}

async function refreshLessonsCacheFromSupabaseSafe() {
  if (!supabase) return;
  try {
    await loadLessonsFromSupabase();
    await loadFinalNotesFromSupabase();
  } catch (error) {
    console.error(`Supabase lessons refresh failed: ${error.message}`);
  }
}

async function refreshTeacherLessonsFromSupabaseSafe(teacherId, schoolId) {
  if (!supabase) return;
  try {
    const teacherIdValue = String(teacherId || "");
    const schoolIdValue = String(schoolId || "");
    const { data: lessonRows, error: lessonsError } = await supabase
      .from("lessons")
      .select("*")
      .eq("teacher_id", teacherIdValue)
      .eq("school_id", schoolIdValue)
      .order("updated_at", { ascending: false });
    if (lessonsError) {
      throw new Error(`Supabase scoped lessons load failed: ${lessonsError.message}`);
    }

    const nextTeacherLessons = new Map();
    for (const row of lessonRows || []) {
      const lesson = rowToLesson(row);
      nextTeacherLessons.set(lesson.id, lesson);
    }

    for (const [lessonId, lesson] of db.lessons.entries()) {
      if (String(lesson?.teacherId || "") === teacherIdValue && String(lesson?.schoolId || "") === schoolIdValue) {
        db.lessons.delete(lessonId);
      }
    }
    for (const [lessonId, lesson] of nextTeacherLessons.entries()) {
      db.lessons.set(lessonId, lesson);
    }

    const lessonIds = [...nextTeacherLessons.keys()];
    if (!lessonIds.length) return;
    const { data: finalNoteRows, error: finalNotesError } = await supabase
      .from("final_notes")
      .select("*")
      .in("lesson_id", lessonIds);
    if (finalNotesError) {
      throw new Error(`Supabase scoped final notes load failed: ${finalNotesError.message}`);
    }
    for (const row of finalNoteRows || []) {
      const lesson = db.lessons.get(row.lesson_id);
      if (!lesson) continue;
      lesson.finalNote = rowToFinalNote(row);
      db.lessons.set(lesson.id, lesson);
    }
  } catch (error) {
    console.error(`Supabase teacher lessons refresh failed: ${error.message}`);
  }
}

async function refreshSingleLessonFromSupabaseSafe(lessonId, teacherId, schoolId) {
  if (!supabase) return null;
  try {
    const lessonIdValue = String(lessonId || "");
    const teacherIdValue = String(teacherId || "");
    const schoolIdValue = String(schoolId || "");
    if (!lessonIdValue || !teacherIdValue || !schoolIdValue) return null;

    const { data: lessonRow, error: lessonError } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonIdValue)
      .eq("teacher_id", teacherIdValue)
      .eq("school_id", schoolIdValue)
      .maybeSingle();
    if (lessonError) {
      throw new Error(`Supabase single lesson load failed: ${lessonError.message}`);
    }

    if (!lessonRow) {
      db.lessons.delete(lessonIdValue);
      return null;
    }

    const lesson = rowToLesson(lessonRow);
    const { data: finalNoteRow, error: finalNoteError } = await supabase
      .from("final_notes")
      .select("*")
      .eq("lesson_id", lessonIdValue)
      .maybeSingle();
    if (finalNoteError) {
      throw new Error(`Supabase single final note load failed: ${finalNoteError.message}`);
    }
    if (finalNoteRow) {
      lesson.finalNote = rowToFinalNote(finalNoteRow);
    }

    db.lessons.set(lesson.id, lesson);
    return lesson;
  } catch (error) {
    console.error(`Supabase single lesson refresh failed: ${error.message}`);
    return null;
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

function rowToCostEvent(row) {
  return {
    id: row.id,
    lessonId: row.lesson_id || null,
    schoolId: row.school_id || null,
    teacherId: row.teacher_id || null,
    provider: row.provider || "unknown",
    category: row.feature || row.category || "other",
    amountPLN: Number(row.cost_pln || 0),
    baseAmountPLN: row.provider_cost_pln !== null && row.provider_cost_pln !== undefined ? Number(row.provider_cost_pln) : null,
    marginAmountPLN: row.margin_pln !== null && row.margin_pln !== undefined ? Number(row.margin_pln) : null,
    at: row.created_at || new Date().toISOString(),
    model: row.model || null,
    feature: row.feature || null,
    promptTokens: Number(row.prompt_tokens || 0),
    completionTokens: Number(row.completion_tokens || 0),
    totalTokens: Number(row.total_tokens || 0),
    costUsd: row.cost_usd !== null && row.cost_usd !== undefined ? Number(row.cost_usd) : null,
    requestId: row.request_id || null,
    latencyMs: row.latency_ms !== null && row.latency_ms !== undefined ? Number(row.latency_ms) : null,
    status: row.status || "ok",
    errorMessage: row.error_message || null
  };
}

async function persistCostEvent(event) {
  if (!supabase || !event) return;
  const { error } = await supabase.from("openrouter_usage_events").insert({
    id: event.id,
    user_id: event.userId || null,
    school_id: event.schoolId || null,
    teacher_id: event.teacherId || null,
    lesson_id: event.lessonId || null,
    feature: event.category || event.feature || "other",
    model: event.model || event.provider || "unknown",
    prompt_tokens: Number(event.promptTokens || 0),
    completion_tokens: Number(event.completionTokens || 0),
    total_tokens: Number(event.totalTokens || 0),
    cost_usd: event.costUsd ?? null,
    cost_pln: event.amountPLN ?? null,
    provider_cost_usd: event.providerCostUsd ?? null,
    provider_cost_pln: event.baseAmountPLN ?? null,
    margin_pln: event.marginAmountPLN ?? null,
    status: event.status || "ok",
    request_id: event.requestId || null,
    latency_ms: event.latencyMs ?? null,
    error_message: event.errorMessage || null,
    created_at: event.at || new Date().toISOString()
  });
  if (error) throw new Error(`Supabase cost event insert failed: ${error.message}`);
}

async function persistCostEventSafe(event) {
  try {
    await persistCostEvent(event);
  } catch (error) {
    console.error(error.message);
  }
}

async function loadCostEventsFromSupabase() {
  if (!supabase) return;
  const { data, error } = await supabase.from("openrouter_usage_events").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(`Supabase cost events load failed: ${error.message}`);

  db.costEvents = [];
  db.costs = new Map();

  for (const row of data || []) {
    const event = rowToCostEvent(row);
    db.costEvents.push(event);
    if (!event.lessonId) continue;
    const events = db.costs.get(event.lessonId) || [];
    events.push(event);
    db.costs.set(event.lessonId, events);
  }
}

async function removeCostEventsForLesson(lessonId) {
  if (!supabase) return;
  const { error } = await supabase.from("openrouter_usage_events").delete().eq("lesson_id", lessonId);
  if (error) throw new Error(`Supabase cost events delete failed: ${error.message}`);
}

async function removeCostEventsForLessonSafe(lessonId) {
  try { await removeCostEventsForLesson(lessonId); } catch (error) { console.error(error.message); }
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

function approximateTokensFromText(text) {
  return Math.max(1, Math.ceil(String(text || "").length / 4));
}

async function callOpenRouter({ model = OPENROUTER_TEXT_MODEL, parts, maxTokens, temperature }) {
  const apiKey = String(process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing.");

  const fallbackMaxTokens = Number.isFinite(OPENROUTER_MAX_TOKENS) ? Math.max(256, Math.min(OPENROUTER_MAX_TOKENS, 8192)) : 2000;
  const requestedMaxTokens = Number.isFinite(Number(maxTokens)) ? Number(maxTokens) : fallbackMaxTokens;
  const finalMaxTokens = Math.max(256, Math.min(requestedMaxTokens, 8192));
  const startedAt = Date.now();

  const requestOpenRouter = async (targetModel) =>
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: targetModel,
        max_tokens: finalMaxTokens,
        messages: [{ role: "user", content: parts.map(partToOpenRouterContent) }]
      })
    });

  let effectiveModel = String(model || "").trim() || OPENROUTER_TEXT_MODEL;
  let response = await requestOpenRouter(effectiveModel);
  if (!response.ok) {
    const errorText = await response.text();
    const shouldRetryWithFallback =
      response.status === 404 &&
      /No endpoints found/i.test(errorText) &&
      effectiveModel !== OPENROUTER_TEXT_FALLBACK_MODEL;

    if (shouldRetryWithFallback) {
      effectiveModel = OPENROUTER_TEXT_FALLBACK_MODEL;
      response = await requestOpenRouter(effectiveModel);
      if (!response.ok) {
        const fallbackErrorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${fallbackErrorText}`);
      }
    } else {
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }
  }

  const data = await response.json();
  const text = String(data?.choices?.[0]?.message?.content || "").trim();
  const usage = data?.usage || {};
  const estimatedPromptTokens = approximateTokensFromText(
    parts
      .map((part) => (part.text ? part.text : part.inlineData?.mimeType ? "[image]" : ""))
      .join("\n")
  );
  const estimatedCompletionTokens = approximateTokensFromText(text);
  const promptTokens = Number(usage.prompt_tokens || estimatedPromptTokens);
  const completionTokens = Number(usage.completion_tokens || estimatedCompletionTokens);
  const totalTokens = Number(usage.total_tokens || promptTokens + completionTokens);
  const baseUsd = estimateOpenRouterBaseUsdCost({
    model: effectiveModel,
    promptTokens,
    completionTokens
  });

  return {
    text,
    model: effectiveModel,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens
    },
    requestId: String(response.headers.get("x-request-id") || data?.id || ""),
    latencyMs: Date.now() - startedAt,
    baseUsd
  };
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

function normalizePresentationSlide(rawSlide, index) {
  const allowedTypes = new Set(["title", "agenda", "concept", "example", "comparison", "practice", "summary", "next_steps"]);
  const normalizedType = String(rawSlide?.type || "").trim().toLowerCase();
  const title = String(rawSlide?.title || rawSlide?.tytul || "").trim() || `Slajd ${index + 1}`;
  const subtitle = String(rawSlide?.subtitle || rawSlide?.podtytul || "").trim();
  const summary = String(rawSlide?.summary || rawSlide?.streszczenie || "").trim();
  const detailsRaw = Array.isArray(rawSlide?.details)
    ? rawSlide.details
    : Array.isArray(rawSlide?.punkty)
      ? rawSlide.punkty
      : [];
  const details = detailsRaw
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 6);
  const visualHint = String(rawSlide?.visualHint || rawSlide?.wskazowkaWizualna || "").trim();

  return {
    id: rawSlide?.id || randomUUID(),
    type: allowedTypes.has(normalizedType) ? normalizedType : "concept",
    title: title.slice(0, 120),
    subtitle: subtitle.slice(0, 180),
    summary: summary.slice(0, 500),
    details,
    visualHint: visualHint.slice(0, 220)
  };
}

function fallbackPresentationSlides({ lessonTitle, scope, plan, noteContent, maxSlides = 12 }) {
  const safePlan = Array.isArray(plan) ? plan : [];
  const fallbackTypes = ["title", "agenda", "concept", "example", "practice", "summary"];
  if (safePlan.length) {
    return safePlan.slice(0, maxSlides).map((point, index) => ({
      id: randomUUID(),
      type: fallbackTypes[Math.min(index, fallbackTypes.length - 1)] || "concept",
      title: String(point?.title || `Slajd ${index + 1}`).slice(0, 120),
      subtitle: index === 0 ? `${lessonTitle || "Prezentacja"} • ${scope === "full" ? "cała lekcja" : "nieomówione punkty"}` : "",
      summary: String(point?.description || "").slice(0, 450),
      details: Array.isArray(point?.keywords) ? point.keywords.slice(0, 5) : [],
      visualHint: index % 2 === 0 ? "diagram procesu" : "lista punktów"
    }));
  }

  const chunks = String(noteContent || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxSlides);

  return chunks.map((line, index) => ({
    id: randomUUID(),
    type: fallbackTypes[Math.min(index, fallbackTypes.length - 1)] || "concept",
    title: `Slajd ${index + 1}`,
    subtitle: "",
    summary: line.slice(0, 450),
    details: [],
    visualHint: "lista punktów"
  }));
}

async function generatePresentationWithLLM({
  noteContent,
  lessonTitle,
  lessonSubject,
  classLevel,
  scope,
  plan,
  maxSlides = 12,
  context = {}
}) {
  const safeMaxSlides = Math.max(4, Math.min(Number(maxSlides || 12), 20));
  const safeScope = scope === "full" ? "full" : "pending";
  const safeNote = String(noteContent || "").trim();
  const safePlan = Array.isArray(plan) ? plan : [];
  if (!safeNote && !safePlan.length) return [];

  const prompt = PRESENTATION_PROMPT_TEMPLATE
    .replace("[TEMAT_LEKCJI]", String(lessonTitle || "Bez tytułu"))
    .replace("[PRZEDMIOT]", String(lessonSubject || "Brak"))
    .replace("[KLASA]", String(classLevel || "Nie podano"))
    .replace("[ZAKRES_PREZENTACJI]", safeScope === "full" ? "cała lekcja" : "tylko nieomówione punkty")
    .replace("[MAX_SLAJDOW]", String(safeMaxSlides))
    .replace("[PLAN_LEKCJI_JSON]", JSON.stringify(safePlan))
    .replace("[TRESC_NOTATKI]", safeNote.slice(0, 35000));

  try {
    const out = await callOpenRouter({
      model: OPENROUTER_PRESENTATION_MODEL,
      parts: [{ text: prompt }],
      maxTokens: Math.max(2500, Math.min(5000, OPENROUTER_MAX_TOKENS + 1000)),
      temperature: 0.2
    });
    const parsed = parseJsonFromModel(out.text);
    const slidesRaw = Array.isArray(parsed?.slides) ? parsed.slides : Array.isArray(parsed) ? parsed : [];
    const slides = slidesRaw.slice(0, safeMaxSlides).map((slide, index) => normalizePresentationSlide(slide, index));
    if (!slides.length) {
      throw new Error("Empty slides");
    }

    recordCostFromBase({
      lessonId: context.lessonId || null,
      schoolId: context.schoolId || null,
      teacherId: context.teacherId || null,
      provider: "openrouter",
      model: out.model,
      feature: "presentation_generation",
      category: "presentation",
      baseAmountPLN: out.baseUsd * USD_TO_PLN,
      providerCostUsd: out.baseUsd,
      costUsd: out.baseUsd,
      promptTokens: out.usage.promptTokens,
      completionTokens: out.usage.completionTokens,
      totalTokens: out.usage.totalTokens,
      requestId: out.requestId,
      latencyMs: out.latencyMs
    });

    return slides;
  } catch {
    return fallbackPresentationSlides({
      lessonTitle,
      scope: safeScope,
      plan: safePlan,
      noteContent: safeNote,
      maxSlides: safeMaxSlides
    });
  }
}

async function generatePlanWithLLM(rawText, context = {}) {
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
    recordCostFromBase({
      lessonId: context.lessonId || null,
      schoolId: context.schoolId || null,
      teacherId: context.teacherId || null,
      provider: "openrouter",
      model: out.model,
      feature: "lesson_plan",
      category: "lesson_plan",
      baseAmountPLN: out.baseUsd * USD_TO_PLN,
      providerCostUsd: out.baseUsd,
      costUsd: out.baseUsd,
      promptTokens: out.usage.promptTokens,
      completionTokens: out.usage.completionTokens,
      totalTokens: out.usage.totalTokens,
      requestId: out.requestId,
      latencyMs: out.latencyMs
    });
    const parsed = parseJsonFromModel(out.text);
    if (!Array.isArray(parsed)) throw new Error("Invalid plan JSON");
    return parsed.slice(0, 12).map((item, index) => mapPlanItem(item, index));
  } catch {
    return fallbackGeneratePlan(rawText);
  }
}

// Fuzzy matching function for Polish language variations
function polishFuzzyMatch(spoken, keyword) {
  const normalizeFuzzy = (text) => {
    let normalized = text.toLowerCase()
      // Remove common Polish grammatical endings
      .replace(/(ski|ska|skie|scy|skiej|skim|ską|skimi|skim)$/g, '')  // przymiotniki -ski
      .replace(/(czny|czna|czne|czni|cznej|cznym|czną|cznymi|cznym)$/g, '')  // -czny
      .replace(/(owy|owa|owe|owi|owej|owym|ową|owymi|owym)$/g, '')  // -owy
      .replace(/(ny|na|ne|nym|ną|nym|nymi|nym)$/g, '')  // -ny
      .replace(/(ty|ta|te|tym|tą|tymi|tym|to|temu|tę|tą)$/g, '')  // -ty (przymiotniki męskie)
      .replace(/(y|a|e|ym|ą|ymi|ym|o|om|ę|ą)$/g, '')  // podstawowe końcówki
      .replace(/(iz|izm|izm|izma|izmy|izmów|izmie)$/g, '')  // -izm
      .replace(/(ika|iki|iki|ikę|iką|ikami|ik)$/g, '')  // -ika
      .replace(/(cia|cie|cia|cje|cji|cją|cjami|cję)$/g, '')  // -cja
      .replace(/(stwo|stwa|stwie|stwu|stwem|stwami)$/g, '')  // -stwo
      .replace(/(ot|ota|ocie|ocie|otę|otą|otami|ot)$/g, '')  // -ota
      .replace(/(ość|ości|ością|ościom|ościach)$/g, '')  // -ość
      .replace(/(nik|nika|niku|niku|nikiem|nikami|nik)$/g, '')  // -nik
      .replace(/(ca|cy|cem|cami|cę|cą|cą)$/g, '')  // -ca
      .replace(/(ar|ara|arem|arami|arzy|arze)$/g, '')  // -ar
      .replace(/(er|era|erem|erami|erzy|erze)$/g, '')  // -er
      .replace(/(or|ora|orem|orami|orzy|orze)$/g, '')  // -or
      // Math and science specific endings
      .replace(/(ia|ie|ii|ię|ią|ium)$/g, '')  // -ia, -ie (geometria, równania)
      .replace(/(cja|cje|cji|cją|cjami|cję|cjach|cje)$/g, '')  // -cja (reakcja, pochodna)
      .replace(/(ka|ki|kie|ki|kę|ką|kami|ką)$/g, '')  // -ka (matematyka)
      .replace(/(ta|te|ty|tę|tą|tami|tom)$/g, '')  // -ta (jednostka)
      .replace(/(na|ne|ni|nę|ną|nami|nom)$/g, '')  // -na (funkcja)
      .replace(/(ga|ge|gi|gę|gą|gami|gom)$/g, '')  // -ga (jednostka)
      .replace(/(ra|re|ri|rę|rą|rami|rom)$/g, '')  // -ra (jednostka)
      .replace(/(da|de|di|dę|dą|dam|dom)$/g, '')  // -da (jednostka)
      // Physics and chemistry specific
      .replace(/(ma|me|mi|mę|mą|mami|mom)$/g, '')  // -ma (jednostka)
      .replace(/(la|le|li|lę|lą|lami|lom)$/g, '')  // -la (jednostka)
      .replace(/(wa|we|wi|wę|wą|wami|wom)$/g, '')  // -wa (jednostka)
      // History and geography specific
      .replace(/(ża|że|żi|żę|żą|żami|żom)$/g, '')  // -ża (jednostka)
      .replace(/(za|ze|zi|zę|zą|zami|zom)$/g, '')  // -za (jednostka)
      // Remove double letters and normalize common patterns
      .replace(/([a-z])\1{2,}/g, '$1')  // Reduce triple+ letters to single
      .replace(/([^aeiouyąęó])ie([a-z])/g, '$1e$2')  // Polish ie → e
      // Normalize common spelling variations
      .replace(/rz/g, 'ż')  // Standardize rz/ż
      .replace(/ch/g, 'h')  // Standardize ch/h
      .trim();
    return normalized;
  };

  const spokenNormalized = normalizeFuzzy(spoken);
  const keywordNormalized = normalizeFuzzy(keyword);

  return spokenNormalized === keywordNormalized;
}

async function calculateCoverageWithLLM(plan, transcripts, context = {}) {
  const transcript = (transcripts || []).map((item) => item.text).join(" ").slice(0, 25000);
  if (!plan?.length || !transcript.trim()) return plan || [];

  // Use simple keyword matching with fuzzy matching
  const normalizedTranscript = normalize(transcript);

  return plan.map((rawItem, index) => {
    const item = normalizePlanPoint(rawItem, index);

    // Manual approval always takes precedence
    if (item.manualApproved) {
      return { ...item, status: "discussed" };
    }

    // PRESERVE: If already discussed, keep it discussed
    if (item.status === "discussed") {
      console.log(`[Coverage] Point "${item.title}" already discussed - keeping status`);
      return { ...item, status: "discussed" };
    }

    // Check each keyword individually with fuzzy matching
    const keywords = item.keywords || [];
    if (keywords.length === 0) {
      return item; // No keywords, can't determine coverage
    }

    // Split transcript into words for better matching
    const words = normalizedTranscript.split(/\s+/);

    const foundKeywords = keywords.filter(keyword => {
      // First try exact match
      if (normalizedTranscript.includes(normalize(keyword))) {
        return true;
      }

      // Then try fuzzy matching with each word
      return words.some(word => polishFuzzyMatch(word, keyword));
    });

    // REQUIREMENT: Minimum 3 keywords must be found to mark as discussed
    const MIN_KEYWORDS_REQUIRED = 3;
    if (foundKeywords.length >= MIN_KEYWORDS_REQUIRED) {
      console.log(`[Coverage] Point "${item.title}" marked as discussed. Found ${foundKeywords.length}/${keywords.length} keywords:`, foundKeywords);
      return {
        ...item,
        status: "discussed",
        foundKeywords: foundKeywords,
        coverage: foundKeywords.length / keywords.length
      };
    } else if (foundKeywords.length > 0) {
      // Partial coverage if some keywords found but not enough
      console.log(`[Coverage] Point "${item.title}" partially discussed. Found ${foundKeywords.length}/${keywords.length} keywords (min: ${MIN_KEYWORDS_REQUIRED}):`, foundKeywords);
      return {
        ...item,
        status: "skipped",
        foundKeywords: foundKeywords,
        coverage: foundKeywords.length / keywords.length
      };
    }

    // No keywords found - keep current status if not pending
    if (item.status === "skipped") {
      console.log(`[Coverage] Point "${item.title}" keeping skipped status`);
      return { ...item, status: "skipped" };
    }

    // No keywords found - only set to pending if current status is also pending
    console.log(`[Coverage] Point "${item.title}" remains ${item.status} (no new keywords found)`);
    return {
      ...item,
      status: item.status === "pending" ? "pending" : item.status,
      foundKeywords: [],
      coverage: 0
    };
  });
}

function getFinalNoteCoverageBuckets(plan) {
  const normalizedPlan = (Array.isArray(plan) ? plan : []).map((item, index) => normalizePlanPoint(item, index));
  const discussed = normalizedPlan.filter((item) => item.status === "discussed");
  const partiallyDiscussed = normalizedPlan.filter((item) => item.status === "skipped");
  const notDiscussed = normalizedPlan.filter((item) => item.status !== "discussed" && item.status !== "skipped");
  return {
    total: normalizedPlan.length,
    discussed,
    partiallyDiscussed,
    notDiscussed
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderCoverageListItems(items) {
  if (!items.length) return "<li>Brak</li>";
  return items
    .map((item) => `<li><b>${escapeHtml(item.title)}</b>${item.description ? `: ${escapeHtml(item.description)}` : ""}</li>`)
    .join("");
}

function buildFinalNoteHtml({ lesson, coveredText, summaryText }) {
  const buckets = getFinalNoteCoverageBuckets(lesson.plan || []);
  const notCovered = [...buckets.partiallyDiscussed, ...buckets.notDiscussed];

  return `
    <article>
      <h1>Złota Notatka po Lekcji</h1>

      <h2>Tytuł i przedmiot</h2>
      <p><b>Temat lekcji:</b> ${escapeHtml(lesson.title || "Notatka")}</p>
      <p><b>Przedmiot:</b> ${escapeHtml(lesson.subject || "Przedmiot")}</p>

      <h2>Co zostało omówione</h2>
      <p>${escapeHtml(coveredText || "Brak dodatkowego opisu.")}</p>

      <h2>Czego nie omówiono (z planu)</h2>
      <ul>${renderCoverageListItems(notCovered)}</ul>

      <h2>Krótkie podsumowanie dla ucznia</h2>
      <p>${escapeHtml(summaryText || "Brak podsumowania.")}</p>

      <h3>Weryfikacja pokrycia planu</h3>
      <p>Omówione: <b>${buckets.discussed.length}</b> / ${buckets.total}, częściowo: <b>${buckets.partiallyDiscussed.length}</b>, nieomówione: <b>${buckets.notDiscussed.length}</b>.</p>
    </article>
  `;
}

async function generateFinalNoteWithLLM(lesson, context = {}) {
  const transcript = (lesson.transcripts || []).map((item) => item.text).join(" ").slice(0, 20000);
  const coverageBuckets = getFinalNoteCoverageBuckets(lesson.plan || []);
  const coverageFacts = {
    total: coverageBuckets.total,
    discussed: coverageBuckets.discussed.map((item) => ({ title: item.title, status: item.status })),
    partiallyDiscussed: coverageBuckets.partiallyDiscussed.map((item) => ({ title: item.title, status: item.status })),
    notDiscussed: coverageBuckets.notDiscussed.map((item) => ({ title: item.title, status: item.status }))
  };

  const prompt = `
Przygotuj dwa krótkie opisy po lekcji na podstawie danych.
Zwróć WYŁĄCZNIE JSON o strukturze:
{
  "covered": "1-3 akapity o tym, co faktycznie omówiono",
  "studentSummary": "krótkie podsumowanie dla ucznia"
}
WYMAGANIA KRYTYCZNE:
- Traktuj dane "RZECZYWISTE POKRYCIE PLANU" jako prawdę nadrzędną.
- Jeżeli "notDiscussed" lub "partiallyDiscussed" nie są puste, NIE WOLNO pisać, że wszystkie tematy zostały omówione.
- Nie używaj HTML ani markdown, sam czysty tekst.
Dane:
Tytuł: ${lesson.title}
Przedmiot: ${lesson.subject}
Plan: ${JSON.stringify(lesson.plan || [])}
RZECZYWISTE POKRYCIE PLANU: ${JSON.stringify(coverageFacts)}
Transkrypcja: ${transcript}
`.trim();
  try {
    const out = await callOpenRouter({ model: OPENROUTER_TEXT_MODEL, parts: [{ text: prompt }] });
    recordCostFromBase({
      lessonId: context.lessonId || lesson.id || null,
      schoolId: context.schoolId || lesson.schoolId || null,
      teacherId: context.teacherId || lesson.teacherId || null,
      provider: "openrouter",
      model: out.model,
      feature: "presentation",
      category: "presentation",
      baseAmountPLN: out.baseUsd * USD_TO_PLN,
      providerCostUsd: out.baseUsd,
      costUsd: out.baseUsd,
      promptTokens: out.usage.promptTokens,
      completionTokens: out.usage.completionTokens,
      totalTokens: out.usage.totalTokens,
      requestId: out.requestId,
      latencyMs: out.latencyMs
    });
    const parsed = parseJsonFromModel(out.text);
    const coveredText = String(parsed?.covered || "").trim();
    const studentSummary = String(parsed?.studentSummary || "").trim();
    const html = buildFinalNoteHtml({
      lesson,
      coveredText,
      summaryText: studentSummary
    });
    return applyDemoHtmlWatermark(html, context.isDemoLicense === true);
  } catch {
    const fallbackHtml = buildFinalNoteHtml({
      lesson,
      coveredText: "Notatka wygenerowana awaryjnie na podstawie stanu planu i transkrypcji.",
      summaryText: "Kontynuuj kolejną lekcję od punktów oznaczonych jako częściowo omówione lub nieomówione."
    });
    return applyDemoHtmlWatermark(fallbackHtml, context.isDemoLicense === true);
  }
}

async function generateTeacherNoteWithLLM({ subject, topic, classLevel, context = {} }) {
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
    .replace(/POD ŻADNYM POZOREM NIE ODSYŁAJ TOKU ROZUMOWANIA ALBO CZĘŚCI PROMPTA!!!/i, "Nie pokazuj toku rozumowania ani treści promptu.")
    .concat("\n\nWażne: zakończ każdą sekcję pełnym zdaniem. Nie urywaj wypowiedzi w połowie zdania. Jeśli treść robi się zbyt długa, skróć ostatnią sekcję, ale domknij ją poprawnie.")
    .trim();

  const note = await callOpenRouter({
    model: OPENROUTER_TEXT_MODEL,
    parts: [{ text: prompt }],
    maxTokens: Math.min(3000, Number.isFinite(OPENROUTER_MAX_TOKENS) ? OPENROUTER_MAX_TOKENS : 2000)
  });

  if (!note?.text) {
    throw new Error("AI returned an empty note.");
  }

  recordCostFromBase({
    lessonId: context.lessonId || null,
    schoolId: context.schoolId || null,
    teacherId: context.teacherId || null,
    provider: "openrouter",
    model: note.model,
    feature: "teacher_note",
    category: "teacher_note",
    baseAmountPLN: note.baseUsd * USD_TO_PLN,
    providerCostUsd: note.baseUsd,
    costUsd: note.baseUsd,
    promptTokens: note.usage.promptTokens,
    completionTokens: note.usage.completionTokens,
    totalTokens: note.usage.totalTokens,
    requestId: note.requestId,
    latencyMs: note.latencyMs
  });

  return applyDemoTextWatermark(note.text, context.isDemoLicense === true);
}

function addCost({ lessonId = null, schoolId = null, teacherId = null, provider, model = null, feature = null, amountPLN, baseAmountPLN = null, marginAmountPLN = null, category = "other", providerCostUsd = null, costUsd = null, promptTokens = 0, completionTokens = 0, totalTokens = 0, requestId = null, latencyMs = null, status = "ok", errorMessage = null }) {
  const event = {
    id: randomUUID(),
    lessonId: lessonId || null,
    schoolId: schoolId || null,
    teacherId: teacherId || null,
    provider,
    model: model || provider,
    feature: feature || category,
    category,
    amountPLN: roundMoney(amountPLN),
    baseAmountPLN: baseAmountPLN === null ? null : roundMoney(baseAmountPLN),
    marginAmountPLN: marginAmountPLN === null ? null : roundMoney(marginAmountPLN),
    providerCostUsd: providerCostUsd === null ? null : roundMoney(providerCostUsd),
    costUsd: costUsd === null ? null : roundMoney(costUsd),
    promptTokens: Number(promptTokens || 0),
    completionTokens: Number(completionTokens || 0),
    totalTokens: Number(totalTokens || 0),
    requestId,
    latencyMs,
    status,
    errorMessage,
    at: new Date().toISOString()
  };

  if (lessonId) {
    const events = db.costs.get(lessonId) || [];
    events.push(event);
    db.costs.set(lessonId, events);
  }

  db.costEvents.push(event);
  void persistCostEventSafe(event);
}

function getCostSummary(lessonId) {
  const limit = SESSION_LIMIT_PLN;
  const events = db.costs.get(lessonId) || [];
  const total = events.reduce((acc, item) => acc + item.amountPLN, 0);
  return { total, limit, safeMode: total >= limit, exceeded: total >= limit };
}

function getDashboardCostStats(lessons) {
  const variableCostTotal = lessons.reduce((sum, lesson) => {
    const costEvents = db.costs.get(lesson.id) || [];
    return sum + costEvents.reduce((lessonSum, event) => lessonSum + Number(event.amountPLN || 0), 0);
  }, 0);

  const lessonsCount = lessons.length;
  const averageModelApiCostPerLesson = lessonsCount > 0 ? variableCostTotal / lessonsCount : 0;
  const lessonBaseFee = 0.5;

  return {
    variableCostTotal,
    lessonsCount,
    averageModelApiCostPerLesson,
    lessonBaseFee,
    averageLessonCost: averageModelApiCostPerLesson + lessonBaseFee
  };
}

function checkLicenseForSchool(schoolId) {
  const school = db.schools.get(schoolId);
  if (!school) return { allowed: false, reason: "School not found" };
  const license = db.licenses.get(school.licenseId);
  if (!license) return { allowed: false, reason: "License not found" };
  if (new Date(license.expiresAt).getTime() < Date.now()) return { allowed: false, reason: "License expired" };
  return { allowed: true, reason: "ok", license };
}

async function extractTextFromFile(file, context = {}) {
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
    recordCostFromBase({
      lessonId: context.lessonId || null,
      teacherId: context.teacherId || null,
      provider: "openrouter",
      model: out.model,
      feature: "lesson_plan",
      category: "lesson_plan",
      baseAmountPLN: out.baseUsd * USD_TO_PLN,
      providerCostUsd: out.baseUsd,
      costUsd: out.baseUsd,
      promptTokens: out.usage.promptTokens,
      completionTokens: out.usage.completionTokens,
      totalTokens: out.usage.totalTokens,
      requestId: out.requestId,
      latencyMs: out.latencyMs
    });
    return out.text.trim();
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

app.patch("/api/account/block", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Supabase is not configured." });

  const user = await getUserFromBearerToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const blocked = req.body?.blocked === true;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ blocked, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select("id, blocked")
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "User profile not found." });
    return res.json({ user: data });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update block status." });
  }
});

app.post("/api/lessons", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;

  const { title, subject, month, date, rawText = "", length } = req.body || {};
  if (!title || !subject) return res.status(400).json({ error: "Missing fields" });

  const activeLicense = getActiveUserLicense(teacher.userId);

  const normalizedDate = normalizeLessonDate(date);
  const normalizedMonth = resolveLessonMonth(month, normalizedDate);
  const lessonId = randomUUID();
  const lesson = {
    id: lessonId,
    schoolId: teacher.schoolId,
    teacherId: teacher.teacherId,
    title,
    subject,
    month: normalizedMonth,
    date: normalizedDate,
    status: "draft",
    length: resolveLessonLengthMinutes({ length }),
    sourceFiles: [],
    plan: [],
    transcripts: [],
    finalNote: null,
    startedAt: null,
    finishedAt: null
  };

  if (rawText && activeLicense) {
    lesson.plan = await generatePlanWithLLM(rawText, { lessonId: lesson.id, schoolId: teacher.schoolId, teacherId: teacher.teacherId });
  }

  if (rawText && !activeLicense) {
    lesson.sourceFiles.push({
      id: randomUUID(),
      lessonId: lesson.id,
      fileName: "material-note.txt",
      mimeType: "text/plain",
      uploadType: "text",
      extractedText: String(rawText || "").trim(),
      createdAt: new Date().toISOString()
    });
  }

  if (lesson.plan.length) lesson.status = "ready";
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  return res.status(201).json({ lesson });
});

app.get("/api/lessons", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  await refreshTeacherLessonsFromSupabaseSafe(teacher.teacherId, teacher.schoolId);
  await autoFinishDueLessons();

  const lessons = [...db.lessons.values()].filter((lesson) => {
    return String(lesson.teacherId) === teacher.teacherId && String(lesson.schoolId || "") === String(teacher.schoolId || "");
  });
  res.json({ lessons });
});

app.get("/api/lessons/:lessonId", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;

  await refreshSingleLessonFromSupabaseSafe(req.params.lessonId, teacher.teacherId, teacher.schoolId);

  const lesson = db.lessons.get(req.params.lessonId);
  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }
  if (String(lesson.teacherId) !== String(teacher.teacherId)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (String(lesson.schoolId || "") !== String(teacher.schoolId || "")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  return res.json({ lesson });
});

app.post("/api/lessons/:lessonId/upload", upload.single("file"), async (req, res) => {
  try {
    const teacher = await resolveTeacherContext(req, res);
    if (!teacher) return;
    const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
    if (!lesson) return;

    const uploadPolicy = getUserUploadPolicy(teacher.userId);

    let extractedText = String(req.body.rawText || "").trim();
    if (!extractedText && req.file) {
      if (req.file.size > uploadPolicy.maxFileSizeBytes) {
        const limitMb = Math.round(uploadPolicy.maxFileSizeBytes / MB);
        return res.status(413).json({ error: `Plik jest zbyt duży. Maksymalny rozmiar to ${limitMb} MB.` });
      }

      const uploadsUsed = countUserFileUploads(teacher.teacherId, teacher.schoolId);
      if (uploadsUsed >= uploadPolicy.maxUploads) {
        return res.status(403).json({
          error: `Osiągnięto limit uploadów (${uploadPolicy.maxUploads}).`
        });
      }

      extractedText = await extractTextFromFile(req.file, { lessonId: lesson.id, teacherId: teacher.teacherId });
      lesson.sourceFiles.push({
        id: randomUUID(),
        lessonId: lesson.id,
        fileName: req.file.originalname,
        sizeBytes: req.file.size,
        mimeType: req.file.mimetype,
        uploadType: "file",
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
        uploadType: "text",
        extractedText,
        createdAt: new Date().toISOString()
      });
    }
    if (!extractedText) return res.status(400).json({ error: "No file or rawText provided" });

    if (!getActiveUserLicense(teacher.userId)) {
      db.lessons.set(lesson.id, lesson);
      await persistLessonSafe(lesson);
      return res.json({
        lesson,
        aiDisabled: true,
        message: "Na koncie bez aktywnej licencji AI jest wyłączone. Materiał został zapisany bez generowania planu."
      });
    }

    lesson.plan = await generatePlanWithLLM(extractedText, { lessonId: lesson.id, teacherId: teacher.teacherId });
    if (!lesson.plan.length) {
      const safeText = String(extractedText || "").trim();
      lesson.plan = [
        {
          id: randomUUID(),
          title: "Temat z przesłanego materiału",
          keywords: [],
          description: safeText.slice(0, 400) || "Dodaj więcej treści, aby wygenerować szczegółowy plan lekcji.",
          status: "pending",
          priority: 1
        }
      ];
    }
    lesson.status = "ready";
    db.lessons.set(lesson.id, lesson);
    await persistLessonSafe(lesson);
    return res.json({ lesson });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Plik jest zbyt duży. Maksymalny rozmiar to 50 MB." });
  }
  return next(error);
});

app.post("/api/notes/generate", async (req, res) => {
  try {
    const teacher = await resolveTeacherContext(req, res);
    if (!teacher) return;
    if (!requireActiveLicenseForTeacher(teacher, res, "Generowanie notatki AI")) return;
    const subject = String(req.body?.subject || "").trim();
    const topic = String(req.body?.topic || "").trim();
    const classLevel = String(req.body?.classLevel || "").trim();
    if (!subject || !topic) {
      return res.status(400).json({ error: "Subject and topic are required." });
    }

    const activeLicense = getActiveUserLicense(teacher.userId);
    const note = await generateTeacherNoteWithLLM({
      subject,
      topic,
      classLevel,
      context: {
        teacherId: teacher.teacherId,
        schoolId: teacher.schoolId,
        isDemoLicense: activeLicense?.demoMode === true
      }
    });
    return res.json({ note });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to generate note." });
  }
});

app.post("/api/presentations/generate", async (req, res) => {
  try {
    const teacher = await resolveTeacherContext(req, res);
    if (!teacher) return;
    if (!requireActiveLicenseForTeacher(teacher, res, "Generowanie prezentacji AI")) return;

    const lessonId = String(req.body?.lessonId || "").trim();
    const noteId = String(req.body?.noteId || "").trim();
    const classLevel = String(req.body?.classLevel || "").trim();
    const scope = String(req.body?.scope || "pending").trim() === "full" ? "full" : "pending";
    const maxSlides = Number(req.body?.maxSlides || 12);

    let lesson = null;
    if (lessonId) {
      lesson = getOwnedLessonOrRespond({ params: { lessonId } }, res, teacher.teacherId, teacher.schoolId);
      if (!lesson) return;
    } else if (!String(noteId || "").trim()) {
      return res.status(400).json({ error: "Podaj lessonId albo noteId do wygenerowania prezentacji." });
    }

    let note = null;
    if (noteId) {
      const candidate = db.notes.get(noteId);
      if (!candidate) return res.status(404).json({ error: "Note not found" });
      if (String(candidate.teacherId) !== String(teacher.teacherId) || String(candidate.schoolId || "") !== String(teacher.schoolId || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }
      note = candidate;
    }

    const lessonPlan = Array.isArray(lesson?.plan) ? lesson.plan : [];
    const scopedPlan = scope === "full" ? lessonPlan : lessonPlan.filter((point) => point?.status !== "discussed");
    const noteContent = String(
      note?.content ||
      lesson?.sourceFiles?.[lesson.sourceFiles.length - 1]?.extractedText ||
      ""
    ).trim();

    if (!scopedPlan.length && !noteContent) {
      return res.status(400).json({ error: "Brak danych do wygenerowania prezentacji (plan i notatka są puste)." });
    }

    const slides = await generatePresentationWithLLM({
      noteContent,
      lessonTitle: lesson?.title || note?.title || "Prezentacja",
      lessonSubject: lesson?.subject || note?.subject || "",
      classLevel: classLevel || note?.classLevel || "",
      scope,
      plan: scopedPlan,
      maxSlides,
      context: {
        lessonId: lesson?.id || null,
        schoolId: teacher.schoolId,
        teacherId: teacher.teacherId
      }
    });

    const presentation = {
      id: randomUUID(),
      lessonId: lesson?.id || null,
      noteId: note?.id || null,
      scope,
      classLevel: classLevel || note?.classLevel || "",
      title: `${lesson?.title || note?.title || "Prezentacja"} (${new Date().toLocaleDateString("pl-PL")})`,
      subject: lesson?.subject || note?.subject || "",
      slideCount: slides.length,
      slides,
      createdAt: new Date().toISOString()
    };

    return res.json({ presentation });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Nie udało się wygenerować prezentacji." });
  }
});

app.post("/api/insights/live-lesson-summary", async (req, res) => {
  try {
    const teacher = await resolveTeacherContext(req, res);
    if (!teacher) return;
    if (!requireActiveLicenseForTeacher(teacher, res, "Podsumowanie AI lekcji")) return;

    const lessonId = String(req.body?.lessonId || "").trim();
    if (!lessonId) {
      return res.status(400).json({ error: "Brak lessonId." });
    }

    const lesson = getOwnedLessonOrRespond({ params: { lessonId } }, res, teacher.teacherId, teacher.schoolId);
    if (!lesson) return;

    const planLines = (Array.isArray(lesson.plan) ? lesson.plan : []).map((point, index) => {
      const label = String(point?.title || point?.label || `Punkt ${index + 1}`).trim();
      const status = String(point?.status || "unknown").trim();
      return `- ${label} (${status})`;
    });
    const transcriptText = (Array.isArray(lesson.transcripts) ? lesson.transcripts : [])
      .map((item) => String(item?.text || "").trim())
      .filter(Boolean)
      .join("\n")
      .slice(0, 12000);
    const finalNoteSnippet = String(lesson.finalNote?.html || lesson.finalNote?.content || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    const prompt = `Jesteś asystentem edukacyjnym. Na podstawie danych z lekcji na żywo napisz po polsku zwięzłe podsumowanie (ok. 400–900 słów), w kilku akapitach z nagłówkami markdown (##). Uwzględnij: co udało się omówić, postęp względem planu, luki, co warto powtórzyć przed kolejną lekcją. Pisz konkretnie, bez wymyślania faktów spoza danych.

Tytuł lekcji: ${String(lesson.title || "Bez tytułu")}
Przedmiot: ${String(lesson.subject || "Brak")}

Plan (statusy):
${planLines.length ? planLines.join("\n") : "(brak planu)"}

Transkrypcja (fragment):
${transcriptText || "(brak transkrypcji)"}

Notatka końcowa (fragment tekstu):
${finalNoteSnippet || "(brak notatki końcowej)"}`;

    const out = await callOpenRouter({
      model: OPENROUTER_TEXT_MODEL,
      parts: [{ text: prompt }],
      maxTokens: Math.min(3000, Number.isFinite(OPENROUTER_MAX_TOKENS) ? OPENROUTER_MAX_TOKENS + 500 : 2500),
      temperature: 0.25
    });

    recordCostFromBase({
      lessonId: lesson.id,
      schoolId: teacher.schoolId,
      teacherId: teacher.teacherId,
      provider: "openrouter",
      model: out.model,
      feature: "live_lesson_summary",
      category: "other",
      baseAmountPLN: out.baseUsd * USD_TO_PLN,
      providerCostUsd: out.baseUsd,
      costUsd: out.baseUsd,
      promptTokens: out.usage.promptTokens,
      completionTokens: out.usage.completionTokens,
      totalTokens: out.usage.totalTokens,
      requestId: out.requestId,
      latencyMs: out.latencyMs
    });

    return res.json({ summary: out.text || "Brak treści podsumowania." });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Nie udało się wygenerować podsumowania." });
  }
});

app.get("/api/notes", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const notes = [...db.notes.values()]
    .filter((note) => String(note.teacherId) === String(teacher.teacherId) && String(note.schoolId || "") === String(teacher.schoolId || ""))
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
      schoolId: teacher.schoolId,
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
  if (String(note.teacherId) !== String(teacher.teacherId) || String(note.schoolId || "") !== String(teacher.schoolId || "")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  db.notes.delete(req.params.noteId);
  await removeSavedNoteSafe(req.params.noteId);
  return res.json({ ok: true, noteId: req.params.noteId });
});

app.put("/api/lessons/:lessonId/plan", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
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
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
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
  const activeLicense = requireActiveLicenseForTeacher(teacher, res, "Rozpoczęcie lekcji");
  if (!activeLicense) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
  if (!lesson) return;
  lesson.status = "live";
  lesson.finishedAt = null;
  lesson.startedAt = new Date().toISOString();
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  return res.json({
    lesson,
    demo: {
      isDemo: activeLicense.demoMode === true,
      maxLiveMinutes: activeLicense.demoMode ? DEMO_POLICY.maxLiveMinutes : null
    }
  });
});

app.put("/api/lessons/:lessonId/cancel", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const activeLicense = requireActiveLicenseForTeacher(teacher, res, "Anulowanie lekcji");
  if (!activeLicense) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
  if (!lesson) return;

  lesson.status = "draft";
  lesson.startedAt = null;
  lesson.finishedAt = null;
  lesson.transcripts = [];
  lesson.finalNote = null;

  db.lessons.set(lesson.id, lesson);
  db.costs.delete(lesson.id); // Clear in-memory costs
  await persistLessonSafe(lesson);
  await removeFinalNoteSafe(lesson.id); // Remove final note from DB
  await removeCostEventsForLessonSafe(lesson.id); // Remove cost events from DB

  return res.json({
    lesson,
    demo: {
      isDemo: activeLicense.demoMode === true,
      maxLiveMinutes: activeLicense.demoMode ? DEMO_POLICY.maxLiveMinutes : null
    }
  });
});

app.post("/api/lessons/:lessonId/transcript", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const activeLicense = requireActiveLicenseForTeacher(teacher, res, "Transkrypcja lekcji live");
  if (!activeLicense) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
  if (!lesson) return;
  if (shouldAutoFinishLesson(lesson)) {
    markLessonFinished(lesson);
    db.lessons.set(lesson.id, lesson);
    await persistLessonSafe(lesson);
    return res.status(409).json({ error: "Lekcja została automatycznie zakończona po upływie ustawionego czasu." });
  }
  if (!enforceDemoLiveLimit(activeLicense, lesson, res)) return;
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
  recordCostFromBase({
    lessonId: lesson.id,
    schoolId: teacher.schoolId,
    teacherId: teacher.teacherId,
    provider: "deepgram",
    category: "live_transcription",
    baseAmountPLN: estimateLiveTranscriptionBasePln(text),
    enforceMinMargin: false
  });
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  return res.json({ ok: true });
});

app.get("/api/lessons/:lessonId/coverage", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  if (!requireActiveLicenseForTeacher(teacher, res, "Analiza pokrycia")) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
  if (!lesson) return;
  lesson.plan = await calculateCoverageWithLLM(lesson.plan, lesson.transcripts, { lessonId: lesson.id, schoolId: teacher.schoolId, teacherId: teacher.teacherId });
  db.lessons.set(lesson.id, lesson);
  await persistLessonSafe(lesson);
  const missing = lesson.plan.filter((item) => item.status !== "discussed");
  return res.json({ plan: lesson.plan, missing });
});

app.post("/api/lessons/:lessonId/finalize", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const activeLicense = requireActiveLicenseForTeacher(teacher, res, "Generowanie prezentacji i notatki końcowej");
  if (!activeLicense) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
  if (!lesson) return;
  const html = await generateFinalNoteWithLLM(lesson, {
    lessonId: lesson.id,
    schoolId: teacher.schoolId,
    teacherId: teacher.teacherId,
    isDemoLicense: activeLicense.demoMode === true
  });
  const noteId = randomUUID();
  const baseUrl = req.body.baseUrl || PUBLIC_APP_URL;
  lesson.finalNote = {
    id: noteId,
    lessonId: lesson.id,
    schoolId: lesson.schoolId,
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
  await persistLessonSafe(lesson);
  await persistFinalNoteSafe(lesson.finalNote, lesson.teacherId);
  return res.json({ finalNote: lesson.finalNote });
});

app.put("/api/lessons/:lessonId/final-note", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
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
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
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
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
  if (!lesson) return;
  return res.json(getCostSummary(lesson.id));
});

app.delete("/api/lessons/:lessonId/costs", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;
  const lesson = getOwnedLessonOrRespond(req, res, teacher.teacherId, teacher.schoolId);
  if (!lesson) return;

  // Reset costs for this lesson
  db.costs.delete(lesson.id);
  console.log(`[Costs] Reset costs for lesson ${lesson.id}`);

  return res.json({ success: true, message: "Koszty zostały zresetowane." });
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
    .select("id, email, full_name, admin, blocked, school_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: `Nie udało się pobrać użytkowników: ${error.message}` });
  }

  const users = (data || []).map((user) => {
    const assignedLicense = [...db.licenses.values()].find((license) => license.assignedUserId === user.id) || null;
    return {
      ...user,
      license: assignedLicense
        ? {
            id: assignedLicense.id,
            key: assignedLicense.key,
            expiresAt: assignedLicense.expiresAt,
            maxActiveUsers: assignedLicense.maxActiveUsers,
            demoMode: assignedLicense.demoMode === true
          }
        : null
    };
  });

  return res.json({ users });
});

app.get("/api/admin/dashboard", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const adminSchool = await resolveAdminSchoolContext(req, res);
  if (!adminSchool) return;

  let lessons = [...db.lessons.values()].filter((lesson) => String(lesson.schoolId || "") === adminSchool.schoolId);
  if (supabase) {
    const { data: lessonRows, error: lessonError } = await supabase
      .from("lessons")
      .select("*")
      .eq("school_id", adminSchool.schoolId)
      .order("updated_at", { ascending: false });

    if (lessonError) {
      return res.status(500).json({ error: `Nie udało się pobrać lekcji: ${lessonError.message}` });
    }

    lessons = (lessonRows || []).map(rowToLesson);
  }

  const finishedLessons = lessons.filter((lesson) => lesson.status === "finished");
  const costStats = getDashboardCostStats(lessons);

  const coverageMap = new Map();
  for (const lesson of lessons) {
    const subject = String(lesson.subject || "Nieznany przedmiot").trim() || "Nieznany przedmiot";
    const stats = coverageMap.get(subject) || { subject, lessons: 0, totalPoints: 0, discussedPoints: 0 };
    stats.lessons += 1;
    const plan = Array.isArray(lesson.plan) ? lesson.plan : [];
    stats.totalPoints += plan.length;
    stats.discussedPoints += plan.filter((point) => point?.status === "discussed").length;
    coverageMap.set(subject, stats);
  }

  const coverageBySubject = [...coverageMap.values()]
    .map((item) => ({
      ...item,
      coveragePercent: item.totalPoints > 0 ? Math.round((item.discussedPoints / item.totalPoints) * 100) : 0
    }))
    .sort((a, b) => b.lessons - a.lessons);

  let users = [];
  if (supabase) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, admin, blocked, school_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: `Nie udało się pobrać użytkowników: ${error.message}` });
    }

    users = (data || []).map((user) => {
      const assignedLicense = [...db.licenses.values()].find((license) => license.assignedUserId === user.id) || null;
      return {
        ...user,
        license: assignedLicense
          ? {
              id: assignedLicense.id,
              key: assignedLicense.key,
              expiresAt: assignedLicense.expiresAt,
              maxActiveUsers: assignedLicense.maxActiveUsers,
              demoMode: assignedLicense.demoMode === true
            }
          : null
      };
    });
  }

  return res.json({
    stats: {
      totalLessons: lessons.length,
      finishedLessons: finishedLessons.length,
      usersCount: users.length
    },
    costStats,
    coverageBySubject,
    users,
    schoolSettings: getSchoolSettings(adminSchool.schoolId)
  });
});

app.patch("/api/admin/school-settings", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const adminSchool = await resolveAdminSchoolContext(req, res);
  if (!adminSchool) return;

  const schoolName = String(req.body?.schoolName || "").trim();
  const businessEmailDomain = normalizeBusinessDomain(req.body?.businessEmailDomain);

  if (!schoolName) {
    return res.status(400).json({ error: "Podaj nazwę szkoły." });
  }
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(businessEmailDomain)) {
    return res.status(400).json({ error: "Podaj poprawną końcówkę maili służbowych (np. szkola.edu.pl)." });
  }

  const oldSchoolId = String(adminSchool.schoolId);
  const existing = db.schools.get(oldSchoolId) || { id: oldSchoolId };

  let nextSchoolId = buildSchoolIdFromName(schoolName, oldSchoolId);
  if (nextSchoolId !== oldSchoolId && db.schools.has(nextSchoolId)) {
    let suffix = 2;
    while (db.schools.has(`${nextSchoolId}-${suffix}`)) suffix += 1;
    nextSchoolId = `${nextSchoolId}-${suffix}`;
  }

  db.schools.set(nextSchoolId, {
    ...existing,
    id: nextSchoolId,
    name: schoolName,
    businessEmailDomain
  });
  latestBusinessSchoolId = nextSchoolId;

  try {
    await ensureSupabaseSchoolRow({
      schoolId: nextSchoolId,
      schoolName,
      businessEmailDomain,
      oldSchoolId
    });

    // Scope school change only to the admin who saved it.
    const { error: adminProfileError } = await supabase
      .from("profiles")
      .update({
        school_id: nextSchoolId,
        updated_at: new Date().toISOString()
      })
      .eq("id", adminSchool.userId);
    if (adminProfileError) {
      throw new Error(`Nie udało się zapisać szkoły dla administratora: ${adminProfileError.message}`);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || "Nie udało się zapisać ustawień szkoły." });
  }

  return res.json({
    schoolId: nextSchoolId,
    schoolSettings: getSchoolSettings(nextSchoolId)
  });
});

app.get("/api/public/business-login-config", (_req, res) => {
  const settings = getSchoolSettings(getPublicBusinessSchoolId());
  return res.json({
    businessEmailDomain: settings.businessEmailDomain
  });
});

app.get("/api/public/organizations", (_req, res) => {
  const organizations = [...db.schools.values()]
    .map((school) => ({
      id: String(school.id || "").trim(),
      name: String(school.name || "").trim() || "Twoja szkoła"
    }))
    .filter((school) => Boolean(school.id))
    .sort((a, b) => a.name.localeCompare(b.name, "pl"));

  return res.json({ organizations });
});

app.get("/api/admin/teacher-costs", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const adminSchool = await resolveAdminSchoolContext(req, res);
  if (!adminSchool) return;

  const sortByRaw = String(req.query.sortBy || "total").trim();
  const directionRaw = String(req.query.direction || "desc").trim().toLowerCase();
  const direction = directionRaw === "asc" ? "asc" : "desc";
  const allowedSort = new Set(["teacher", "notes", "live", "presentation", "other", "total"]);
  const sortBy = allowedSort.has(sortByRaw) ? sortByRaw : "total";

  const teacherMeta = new Map();
  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("id, teacher_id, full_name, email, school_id")
      .eq("school_id", adminSchool.schoolId);
    for (const profile of data || []) {
      const teacherId = String(profile.teacher_id || "").trim();
      if (!teacherId) continue;
      teacherMeta.set(teacherId, {
        userId: profile.id,
        teacherId,
        fullName: profile.full_name || "",
        email: profile.email || ""
      });
    }
  }

  let costEvents = db.costEvents;
  if (supabase) {
    const { data: costRows, error } = await supabase
      .from("openrouter_usage_events")
      .select("*")
      .eq("school_id", adminSchool.schoolId)
      .order("created_at", { ascending: true });
    if (error) {
      return res.status(500).json({ error: `Nie udało się pobrać kosztów: ${error.message}` });
    }
    costEvents = (costRows || []).map(rowToCostEvent);
  }

  const grouped = new Map();
  for (const event of costEvents) {
    const teacherId = String(event.teacherId || "").trim();
    if (!teacherId) continue;

    const row = grouped.get(teacherId) || {
      teacherId,
      userId: teacherMeta.get(teacherId)?.userId || null,
      fullName: teacherMeta.get(teacherId)?.fullName || "",
      email: teacherMeta.get(teacherId)?.email || "",
      base: 0,
      margin: 0,
      total: 0,
      notes: 0,
      live: 0,
      presentation: 0,
      other: 0,
      billed: 0
    };

    const amount = Number(event.amountPLN || 0);
    const baseAmount = Number(event.baseAmountPLN ?? amount);
    const marginAmount = Number(event.marginAmountPLN ?? Math.max(0, amount - baseAmount));
    const category = String(event.category || "other");

    row.base += baseAmount;
    row.margin += marginAmount;
    row.total += amount;

    if (category === "teacher_note") {
      row.notes += amount;
    } else if (category === "live_transcription" || category === "live_coverage") {
      row.live += amount;
    } else if (category === "presentation") {
      row.presentation += amount;
    } else {
      row.other += amount;
    }

    row.billed += amount;
    grouped.set(teacherId, row);
  }

  const rows = [...grouped.values()].map((row) => ({
    platform: Number(row.margin.toFixed(4)),
    provider: Number(row.base.toFixed(4)),
    ...row,
    base: Number(row.base.toFixed(4)),
    margin: Number(row.margin.toFixed(4)),
    total: Number(row.total.toFixed(4)),
    notes: Number(row.notes.toFixed(4)),
    live: Number(row.live.toFixed(4)),
    presentation: Number(row.presentation.toFixed(4)),
    other: Number(row.other.toFixed(4)),
    billed: Number(row.billed.toFixed(4))
  }));

  rows.sort((a, b) => {
    if (sortBy === "teacher") {
      const nameA = String(a.fullName || a.email || a.teacherId).toLowerCase();
      const nameB = String(b.fullName || b.email || b.teacherId).toLowerCase();
      return direction === "asc" ? nameA.localeCompare(nameB, "pl") : nameB.localeCompare(nameA, "pl");
    }

    const aValue = Number(a[sortBy] || 0);
    const bValue = Number(b[sortBy] || 0);
    return direction === "asc" ? aValue - bValue : bValue - aValue;
  });

  return res.json({
    sortBy,
    direction,
    rows
  });
});

app.patch("/api/admin/users/:userId/block", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  if (!supabase) return res.status(500).json({ error: "Supabase nie jest skonfigurowany." });

  const adminSchool = await resolveAdminSchoolContext(req, res);
  if (!adminSchool) return;

  const blocked = req.body?.blocked === true;
  const { data, error } = await supabase
    .from("profiles")
    .update({ blocked, updated_at: new Date().toISOString() })
    .eq("id", req.params.userId)
    .eq("school_id", adminSchool.schoolId)
    .select("id, blocked")
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: `Nie udało się zmienić statusu konta: ${error.message}` });
  }

  if (!data) return res.status(404).json({ error: "Użytkownik nie istnieje." });
  return res.json({ user: data });
});

app.patch("/api/admin/users/:userId", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  if (!supabase) return res.status(500).json({ error: "Supabase nie jest skonfigurowany." });

  const adminSchool = await resolveAdminSchoolContext(req, res);
  if (!adminSchool) return;

  const userId = req.params.userId;
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "").trim();

  const authPayload = {};
  if (email) authPayload.email = email;
  if (password) authPayload.password = password;

  if (!Object.keys(authPayload).length) {
    return res.status(400).json({ error: "Podaj email lub hasło do aktualizacji." });
  }

  const { data, error } = await supabase.auth.admin.updateUserById(userId, authPayload);
  if (error) {
    return res.status(500).json({ error: `Nie udało się zaktualizować konta: ${error.message}` });
  }

  if (email) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (profileError) {
      return res.status(500).json({ error: `Nie udało się zaktualizować profilu: ${profileError.message}` });
    }
  }

  return res.json({ user: { id: userId, email: data?.user?.email || email || null } });
});

app.post("/api/admin/users/special-account", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  if (!supabase) return res.status(500).json({ error: "Supabase nie jest skonfigurowany." });

  const adminSchool = await resolveAdminSchoolContext(req, res);
  if (!adminSchool) return;

  const login = String(req.body?.login || "").trim().toLowerCase();
  const password = String(req.body?.password || "").trim();
  const fullName = String(req.body?.fullName || "").trim();

  if (!/^[a-z0-9._-]{3,64}$/.test(login)) {
    return res.status(400).json({ error: "Login służbowy musi mieć 3-64 znaki: litery, cyfry, kropka, myślnik lub podkreślenie." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Hasło musi mieć co najmniej 8 znaków." });
  }

  const { businessEmailDomain } = getSchoolSettings(adminSchool.schoolId);
  const email = `${login}@${businessEmailDomain}`;
  const teacherId = `teacher-${randomUUID()}`;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName || null,
      account_type: "business",
      business_login: login
    }
  });

  if (createError || !created?.user?.id) {
    return res.status(500).json({ error: createError?.message || "Nie udało się utworzyć konta służbowego." });
  }

  const userId = created.user.id;
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: fullName || null,
      teacher_id: teacherId,
      school_id: adminSchool.schoolId,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    return res.status(500).json({ error: `Nie udało się zapisać profilu konta służbowego: ${profileError.message}` });
  }

  return res.status(201).json({
    user: {
      id: userId,
      full_name: fullName || null,
      email,
      businessLogin: login
    }
  });
});

app.patch("/api/admin/users/:userId/license", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const adminSchool = await resolveAdminSchoolContext(req, res);
  if (!adminSchool) return;

  const userId = req.params.userId;
  const days = Number(req.body?.days ?? 30);
  const maxActiveUsers = Number(req.body?.maxActiveUsers || 1);
  const hasDemoModeInput = typeof req.body?.demoMode === "boolean";
  let licenseSchoolId = null;

  if (supabase) {
    const { data: targetProfile, error: targetProfileError } = await supabase
      .from("profiles")
      .select("id, school_id")
      .eq("id", userId)
      .maybeSingle();

    if (targetProfileError) {
      return res.status(500).json({ error: `Nie udało się pobrać profilu użytkownika: ${targetProfileError.message}` });
    }
    if (!targetProfile) {
      return res.status(404).json({ error: "Użytkownik nie istnieje." });
    }

    const targetSchoolId = String(targetProfile.school_id || "").trim();
    if (targetSchoolId && targetSchoolId !== adminSchool.schoolId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (targetSchoolId) {
      licenseSchoolId = targetSchoolId;
    }

    if (licenseSchoolId) {
      const { data: schoolRow, error: schoolError } = await supabase
        .from("schools")
        .select("id")
        .eq("id", licenseSchoolId)
        .maybeSingle();

      if (schoolError) {
        return res.status(500).json({ error: `Nie udało się zweryfikować szkoły użytkownika: ${schoolError.message}` });
      }
      if (!schoolRow) {
        // Nie blokuj zwykłych użytkowników bez poprawnego school_id.
        // Gdy wskazanie szkoły jest nieprawidłowe, zapisujemy licencję bez school_id.
        licenseSchoolId = null;
      }
    }
  }

  if (!Number.isFinite(days) || days < 0) {
    return res.status(400).json({ error: "Nieprawidłowa liczba dni licencji. Użyj wartości od 0 wzwyż." });
  }

  if (!Number.isFinite(maxActiveUsers) || maxActiveUsers < 1) {
    return res.status(400).json({ error: "Nieprawidłowy limit aktywnych użytkowników." });
  }

  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const fallbackLicenseId = randomUUID();
  const assignedLicense = [...db.licenses.values()].find((license) => license.assignedUserId === userId) || null;
  const licenseId = assignedLicense?.id || fallbackLicenseId;

  const existing = db.licenses.get(licenseId) || assignedLicense;
  const previousLicense = existing ? { ...existing } : null;

  if (days === 0) {
    try {
      if (existing?.id) {
        await removeLicense(existing.id);
        db.licenses.delete(existing.id);
      } else {
        await removeLicense(licenseId);
        db.licenses.delete(licenseId);
      }
      await syncProfileLicenseStateSafe({ userId, activeLicense: null });
      return res.json({ license: null, removed: true });
    } catch (error) {
      console.error("[license-remove]", {
        userId,
        licenseId,
        error
      });
      if (previousLicense) {
        db.licenses.set(licenseId, previousLicense);
      }
      return res.status(500).json({ error: getErrorMessage(error, "Nie udało się usunąć licencji.") });
    }
  }

  const license = {
    id: licenseId,
    key: existing?.key || `USER-${userId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    maxActiveUsers,
    expiresAt,
    demoMode: hasDemoModeInput ? req.body.demoMode === true : Boolean(existing?.demoMode),
    schoolId: licenseSchoolId,
    assignedUserId: userId
  };

  try {
    await persistLicense(license);
    db.licenses.set(licenseId, license);
    await syncProfileLicenseStateSafe({ userId, activeLicense: license });
  } catch (error) {
    console.error("[license-upsert]", {
      userId,
      licenseId,
      payload: {
        maxActiveUsers,
        expiresAt,
        demoMode: hasDemoModeInput ? req.body.demoMode === true : Boolean(existing?.demoMode),
        schoolId: licenseSchoolId
      },
      error
    });
    if (previousLicense) {
      db.licenses.set(licenseId, previousLicense);
    } else {
      db.licenses.delete(licenseId);
    }
    return res.status(500).json({ error: getErrorMessage(error, "Nie udało się zapisać licencji.") });
  }

  return res.json({
    license: {
      id: license.id,
      key: license.key,
      expiresAt: license.expiresAt,
      maxActiveUsers: license.maxActiveUsers,
    demoMode: license.demoMode === true,
    daysLeft: getRemainingLicenseDays(license.expiresAt)
    }
  });
});

app.delete("/api/admin/users/:userId", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  if (!supabase) return res.status(500).json({ error: "Supabase nie jest skonfigurowany." });

  const adminSchool = await resolveAdminSchoolContext(req, res);
  if (!adminSchool) return;

  const userId = req.params.userId;

  const { data: targetProfile, error: targetProfileError } = await supabase
    .from("profiles")
    .select("teacher_id, school_id")
    .eq("id", userId)
    .maybeSingle();

  if (targetProfileError) {
    return res.status(500).json({ error: `Nie udało się pobrać teacher_id użytkownika: ${targetProfileError.message}` });
  }

  if (String(targetProfile?.school_id || defaultSchoolId) !== adminSchool.schoolId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const targetTeacherId = String(targetProfile?.teacher_id || userId);

  const lessonsToDelete = [...db.lessons.values()].filter((lesson) => {
    return String(lesson.teacherId) === targetTeacherId && String(lesson.schoolId || defaultSchoolId) === adminSchool.schoolId;
  });
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

app.get("/api/account/license-status", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;

  const activeLicense = getActiveUserLicense(teacher.userId);
  await syncProfileLicenseStateSafe({ userId: teacher.userId, activeLicense });
  const uploadPolicy = getUserUploadPolicy(teacher.userId);
  const uploadsUsed = countUserFileUploads(teacher.teacherId, teacher.schoolId);

  return res.json({
    hasActiveLicense: Boolean(activeLicense),
    isDemoLicense: activeLicense?.demoMode === true,
    license: activeLicense
      ? {
          id: activeLicense.id,
          key: activeLicense.key,
          expiresAt: activeLicense.expiresAt,
          maxActiveUsers: activeLicense.maxActiveUsers,
          demoMode: activeLicense.demoMode === true,
          daysLeft: getRemainingLicenseDays(activeLicense.expiresAt)
        }
      : null,
    demoLimits: activeLicense?.demoMode
      ? {
          maxLiveMinutes: DEMO_POLICY.maxLiveMinutes
        }
      : null,
    uploadPolicy,
    uploadsUsed
  });
});

app.get("/api/account/billing-summary", async (req, res) => {
  const teacher = await resolveTeacherContext(req, res);
  if (!teacher) return;

  const userEvents = (db.costEvents || []).filter((event) => {
    return String(event.teacherId || "") === String(teacher.teacherId || "")
      && String(event.schoolId || "") === String(teacher.schoolId || "");
  });

  const totalSpentPLN = userEvents.reduce((sum, event) => sum + Number(event.amountPLN || 0), 0);
  const providerCostPLN = userEvents.reduce((sum, event) => sum + Number(event.baseAmountPLN || 0), 0);
  const marginPLN = userEvents.reduce((sum, event) => sum + Number(event.marginAmountPLN || 0), 0);

  return res.json({
    paymentMethod: null,
    totalSpentPLN: roundMoney(totalSpentPLN),
    providerCostPLN: roundMoney(providerCostPLN),
    marginPLN: roundMoney(marginPLN)
  });
});

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  try {
    const teacher = await resolveTeacherContext(req, res);
    if (!teacher) return;
    const activeLicense = requireActiveLicenseForTeacher(teacher, res, "Transkrypcja AI");
    if (!activeLicense) return;
    const lessonId = String(req.body.lessonId || "");
    const lesson = db.lessons.get(lessonId);
    if (!lessonId || !lesson) {
      return res.status(400).json({ error: "Valid lessonId is required." });
    }
    if (String(lesson.teacherId) !== teacher.teacherId || String(lesson.schoolId || "") !== String(teacher.schoolId || "")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!enforceDemoLiveLimit(activeLicense, lesson, res)) return;
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

    console.log('[transcribe] Processing audio file:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.buffer.length,
      lessonId
    });

    const file = await toFile(req.file.buffer, req.file.originalname || "audio.webm", {
      type: req.file.mimetype || "audio/webm"
    });

    console.log('[transcribe] Calling Whisper API with model:', OPENAI_WHISPER_MODEL);

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: OPENAI_WHISPER_MODEL,
      language: "pl",
      response_format: "verbose_json",
      temperature: 0.0, // Lower temperature for more deterministic results
      prompt: "To jest nagranie z lekcji online." // Context prompt
    }).catch(err => {
      console.error('[transcribe] Whisper API error:', err);
      throw err;
    });

    console.log(`[🎤] Transcription: "${transcription.text?.substring(0, 40)}..." (${transcription.text?.length} chars, ${transcription.duration}s)`);

    const durationSec = Number(transcription.duration || 0);
    const pricePerSecPLN = (WHISPER_PRICE_PER_MIN_USD / 60) * USD_TO_PLN;
    const fragmentCost = durationSec > 0 ? durationSec * pricePerSecPLN : 0.02;

    const rawText = String(transcription.text || "").trim();
    console.log(`[📝] Raw text: "${rawText.substring(0, 40)}..." (${rawText.length} chars)`);

    // Simplified server-side filtering - only filter obvious single-word hallucinations
    const obviousHallucinations = /^(dziękuję|dzięki|dzień dobry|dobry wieczór|proszę|cześć|hej|hi|hello|thanks|please)$/i;
    const isValidTranscription = rawText &&
                              rawText.length > 5 &&
                              !obviousHallucinations.test(rawText);

    // Only record cost if transcription is valid
    if (isValidTranscription) {
      recordCostFromBase({
        lessonId,
        schoolId: teacher.schoolId,
        teacherId: teacher.teacherId,
        provider: OPENAI_PROVIDER_NAME,
        category: "live_transcription",
        baseAmountPLN: fragmentCost
      });
    } else {
      console.log(`[❌] Skipping cost - transcription filtered`);
    }

    const text = isValidTranscription ? rawText : "";
    return res.json({
      text,
      durationSec,
      cost: getCostSummary(lessonId).total,
      limitReached: getCostSummary(lessonId).exceeded
    });
  } catch (error) {
    console.error(`[❌] Transcription failed:`, error.message);

    // Handle specific error cases
    if (error.response) {
      console.error('[transcribe] API response error:', {
        status: error.response.status,
        data: error.response.data
      });
      return res.status(500).json({
        error: `Whisper API error: ${error.response.data?.error?.message || error.message}`,
        details: error.response.data
      });
    }

    return res.status(500).json({ error: `Whisper transcription failed: ${error.message}` });
  }
});

app.post("/api/ask-me", async (req, res) => {
  try {
    const teacher = await resolveTeacherContext(req, res);
    if (!teacher) return;
    if (!requireActiveLicenseForTeacher(teacher, res, "Zapytaj mnie - AI")) return;

    const question = String(req.body?.question || "").trim();
    const lessonId = String(req.body?.lessonId || "").trim();
    const providedClassLevel = String(req.body?.classLevel || "").trim();

    if (!question) {
      return res.status(400).json({ error: "Pytanie jest wymagane." });
    }

    // Get lesson context if provided
    let lessonContext = "";
    let classLevelInfo = "";
    if (lessonId) {
      const lesson = getOwnedLessonOrRespond({ params: { lessonId } }, res, teacher.teacherId, teacher.schoolId);
      if (!lesson) return;

      // Build lesson context
      const lessonTitle = lesson.title || "";
      const lessonSubject = lesson.subject || "";
      const lessonPlan = Array.isArray(lesson.plan)
        ? lesson.plan.map(p => `• ${p.title || ""}`).join("\n")
        : "";

      if (lessonTitle || lessonSubject || lessonPlan) {
        lessonContext = `
Kontekst lekcji:
- Tytuł: ${lessonTitle}
- Przedmiot: ${lessonSubject}
- Plan lekcji:
${lessonPlan}
`;
      }
    }

    // Use provided class level from UI first, then fall back to lesson class level
    const effectiveClassLevel = providedClassLevel || (lessonId ? getOwnedLessonOrRespond({ params: { lessonId } }, res, teacher.teacherId, teacher.schoolId)?.classLevel : "");
    if (effectiveClassLevel) {
      const classLevel = String(effectiveClassLevel).toLowerCase();
      const classNum = parseInt(classLevel.match(/\d+/)?.[0] || "0");
      if (classNum >= 1 && classNum <= 3) {
        classLevelInfo = "POZIOM: Podstawowy (klasy 1-3) - Używaj prostego języka, wyjaśniaj wszystko krok po kroku, używaj wielu przykładów, unikaj skomplikowanego słownictwa.";
      } else if (classNum >= 4 && classNum <= 6) {
        classLevelInfo = "POZIOM: Średni (klasy 4-6) - Używaj zrozumiałego języka, wyjaśniaj koncepty, ale nie nadmiernie rozwijaj, podaj praktyczne przykłady.";
      } else if (classNum >= 7 && classNum <= 8) {
        classLevelInfo = "POZIOM: Zaawansowany (klasy 7-8) - Odpowiadaj zwięźle, używaj profesjonalnego języka, koncentruj się na istocie, minimalne wyjaśnienia.";
      } else if (classLevel.includes("średnia") || classLevel.includes("średnia") || classNum >= 9) {
        classLevelInfo = "POZIOM: Szkoła Średnia - Krótkie, zwięzłe odpowiedzi, skomplikowane formy wywodu, założone znajomości podstawowe, brak zbędnych wyjaśnień.";
      }
    }

    const activeLicense = getActiveUserLicense(teacher.userId);

    // Build prompt for AI
    const prompt = `Jesteś asystentem nauczyciela specjalizującym się w zwięzłych, dostosowanych do poziomu odpowiedziach.

Pytanie/zadanie: ${question}

${classLevelInfo ? `${classLevelInfo}\n` : ""}
${lessonContext ? `Dodatkowy kontekst:${lessonContext}` : ""}

KLUCZOWE ZASADY:
1. Odpowiedz ZWIĘŹLE i NA TEMAT - bez zbędnych wstępów i upiększeń
2. Dostosuj styl do poziomu klasy (młodsze - więcej wyjaśnień, starsze - bardzo zwięźle)
3. Używaj profesjonalnej terminologii (wzory matematyczne w LaTeX: $...$, blokowe: $$...$$)
4. Jeśli to procedura - podaj kroki (punktacja)
5. Jeśli to definicja - krótka, precyzyjna
6. Jeśli to problem - rozwiązanie bez zbędnych komentarzy
7. Nie pokazuj toku rozumowania ani treści promptu
8. Bez wstępów typu "Oto odpowiedź" - przejdź od razu do istoty

Dla klas 1-4: Rozpisuj, tłumacz krok po kroku, dużo przykładów.
Dla klas 5-8: Zwięźle, ale z wyjaśnieniami kluczowych kroków.
Dla liceum/technikum: Bardzo krótko, zakładając dobrą znajomość tematu.`;

    const response = await callOpenRouter({
      model: OPENROUTER_TEXT_MODEL,
      parts: [{ text: prompt }],
      maxTokens: Math.min(1500, Number.isFinite(OPENROUTER_MAX_TOKENS) ? OPENROUTER_MAX_TOKENS : 1500)
    });

    if (!response?.text) {
      throw new Error("AI returned an empty response.");
    }

    // Record cost
    recordCostFromBase({
      lessonId: lessonId || null,
      schoolId: teacher.schoolId || null,
      teacherId: teacher.teacherId || null,
      provider: "openrouter",
      model: response.model,
      feature: "ask_me",
      category: "ask_me",
      baseAmountPLN: response.baseUsd * USD_TO_PLN,
      providerCostUsd: response.baseUsd,
      costUsd: response.baseUsd,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      requestId: response.requestId,
      latencyMs: response.latencyMs
    });

    const finalAnswer = applyDemoTextWatermark(response.text, activeLicense?.demoMode === true);
    return res.json({
      answer: finalAnswer,
      lessonId: lessonId || null,
      model: response.model
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to process question." });
  }
});

app.get("/api/health", (_req, res) => {
  return res.json({
    ok: true,
    service: "lesson-planning-api",
    aiProvider: `openrouter+${OPENAI_PROVIDER_NAME}-whisper`,
    textModel: OPENROUTER_TEXT_MODEL,
    presentationModel: OPENROUTER_PRESENTATION_MODEL,
    visionModel: OPENROUTER_VISION_MODEL,
    sttModel: OPENAI_WHISPER_MODEL,
    sttBaseUrlConfigured: Boolean(OPENAI_BASE_URL),
    whisperEnabled: Boolean(openai),
    openRouterEnabled: Boolean(String(process.env.OPENROUTER_API_KEY || "").trim()),
    supabaseEnabled: Boolean(supabase)
  });
});

loadSchoolsFromSupabase()
  .then(() => loadLessonsFromSupabase())
  .then(() => loadLicensesFromSupabase())
  .then(() => loadFinalNotesFromSupabase())
  .then(() => loadSavedNotesFromSupabase())
  .then(() => loadCostEventsFromSupabase())
  .catch((error) => {
    console.error(`Persistence bootstrap failed: ${error.message}`);
  })
  .finally(() => {
    setInterval(() => {
      autoFinishDueLessons().catch((error) => {
        console.error("Auto-finish due lessons failed:", error.message || error);
      });
    }, 10_000);
    app.listen(port, () => {
      console.log(`API listening at http://localhost:${port}`);
    });
  });
