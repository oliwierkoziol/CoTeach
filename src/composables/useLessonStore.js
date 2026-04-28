import { reactive } from "vue";
import { supabase } from "../supabase";

function normalizeBaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "";
const CURRENT_LESSON_CACHE_KEY = "coteach_current_lesson_v1";
const LESSON_CACHE_PREFIX = "coteach_lesson_cache_v1:";

function readCurrentLessonCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_LESSON_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.id) return null;
    if (parsed?.status === "finished") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCurrentLessonCache(lesson) {
  if (typeof window === "undefined") return;
  try {
    if (!lesson?.id || lesson?.status === "finished") {
      window.localStorage.removeItem(CURRENT_LESSON_CACHE_KEY);
      return;
    }
    window.localStorage.setItem(CURRENT_LESSON_CACHE_KEY, JSON.stringify(lesson));
  } catch {
    // Ignore storage errors (private mode/quota).
  }
}

function lessonCacheKey(lessonId) {
  return `${LESSON_CACHE_PREFIX}${String(lessonId || "").trim()}`;
}

function readLessonCache(lessonId) {
  if (typeof window === "undefined") return null;
  const id = String(lessonId || "").trim();
  if (!id) return null;
  try {
    const raw = window.localStorage.getItem(lessonCacheKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.id) return null;
    if (parsed?.status === "finished") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLessonCache(lesson) {
  if (typeof window === "undefined") return;
  try {
    const id = String(lesson?.id || "").trim();
    if (!id || lesson?.status === "finished") {
      if (id) window.localStorage.removeItem(lessonCacheKey(id));
      return;
    }
    window.localStorage.setItem(lessonCacheKey(id), JSON.stringify(lesson));
  } catch {
    // Ignore storage errors (private mode/quota).
  }
}

function upsertLessonInState(lesson) {
  if (!lesson?.id) return;
  const existingLessons = Array.isArray(state.lessons) ? state.lessons : [];
  const exists = existingLessons.some((item) => item?.id === lesson.id);
  state.lessons = exists
    ? existingLessons.map((item) => (item?.id === lesson.id ? lesson : item))
    : [lesson, ...existingLessons];
}

function setCurrentLessonInState(lesson) {
  state.lesson = lesson || null;
  writeCurrentLessonCache(state.lesson);
  writeLessonCache(state.lesson);
}

const state = reactive({
  lesson: readCurrentLessonCache(),
  lessons: [],
  notes: [],
  error: "",
  info: "",
  missing: [],
  costInfo: null,
  shareUrl: ""
});

let cachedAccessToken = null;
const SESSION_WAIT_MS = 4000;

async function resolveAccessToken() {
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), SESSION_WAIT_MS))
    ]);
    const token = result?.data?.session?.access_token || null;
    if (token) {
      cachedAccessToken = token;
    } else {
      cachedAccessToken = null;
    }
    return token || cachedAccessToken;
  } catch {
    return cachedAccessToken;
  }
}

async function api(path, options = {}) {
  const token = await resolveAccessToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) cachedAccessToken = null;
    if (response.status === 403 && data?.code === "ACCOUNT_BLOCKED") {
      cachedAccessToken = null;
      await supabase.auth.signOut({ scope: "local" });
      if (window.location.pathname !== "/login") {
        window.location.assign("/login?blocked=1");
      }
    }
    throw new Error(data.error || "API error");
  }
  return data;
}

export function clearLessonStoreAuthCache() {
  cachedAccessToken = null;
}

export function useLessonStore() {
  function hydrateLessonFromCache(lessonId) {
    const cachedLesson = readLessonCache(lessonId);
    if (!cachedLesson) return null;
    setCurrentLessonInState(cachedLesson);
    upsertLessonInState(cachedLesson);
    return cachedLesson;
  }

  async function createLesson(payload) {
    state.error = "";
    const data = await api("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setCurrentLessonInState(data.lesson);
    upsertLessonInState(data.lesson);
    return data.lesson;
  }

  async function uploadLessonMaterial(lessonId, { rawText, file }) {
    state.error = "";
    state.info = "Analizuje material...";
    const form = new FormData();
    if (rawText?.trim()) form.set("rawText", rawText.trim());
    if (file) form.set("file", file);
    const data = await api(`/api/lessons/${lessonId}/upload`, { method: "POST", body: form });
    setCurrentLessonInState(data.lesson);
    upsertLessonInState(data.lesson);
    state.info = `Analiza zakonczona. Wykryto ${data.lesson.plan.length} tematow.`;
    return data.lesson;
  }

  async function extractTextFromUpload(file) {
    const form = new FormData();
    form.set("file", file);
    const data = await api("/api/files/extract-text", {
      method: "POST",
      body: form
    });
    return data.text;
  }

  async function savePlan(lessonId, plan) {
    const data = await api(`/api/lessons/${lessonId}/plan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    setCurrentLessonInState(data.lesson);
    upsertLessonInState(data.lesson);
    return data.lesson;
  }

  async function startLive(lessonId) {
    const data = await api(`/api/lessons/${lessonId}/live/start`, { method: "POST" });
    setCurrentLessonInState(data.lesson);
    upsertLessonInState(data.lesson);
    return data.lesson;
  }

  async function cancelLesson(lessonId) {
    const data = await api(`/api/lessons/${lessonId}/cancel`, { method: "PUT" });
    if (state.lesson?.id === lessonId) {
      const cancelledLesson = { ...state.lesson, status: "draft", startedAt: null, finishedAt: null, transcripts: [], finalNote: null };
      setCurrentLessonInState(cancelledLesson);
      upsertLessonInState(cancelledLesson);
    } else {
      // If not the current lesson, just update it in the lessons array
      state.lessons = state.lessons.map((lesson) => (lesson.id === lessonId ? data.lesson : lesson));
    }
    return data.lesson;
  }

  async function sendTranscript(lessonId, text) {
    await api(`/api/lessons/${lessonId}/transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, startedAtMs: Date.now(), language: "pl" })
    });
  }

  async function refreshCoverage(lessonId) {
    const coverage = await api(`/api/lessons/${lessonId}/coverage`);
    state.missing = coverage.missing || [];
    if (state.lesson) {
      setCurrentLessonInState({ ...state.lesson, plan: coverage.plan });
    }
    state.costInfo = await api(`/api/lessons/${lessonId}/costs`);
    return coverage;
  }

  async function setManualPointApproval(lessonId, pointId, approved) {
    const data = await api(`/api/lessons/${lessonId}/plan/${pointId}/manual`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved })
    });
    if (state.lesson) {
      setCurrentLessonInState({ ...state.lesson, plan: data.lesson?.plan || state.lesson.plan });
    }
    state.missing = data.missing || [];
    return data.lesson;
  }

  async function finalizeLesson(lessonId, baseUrl) {
    const data = await api(`/api/lessons/${lessonId}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseUrl })
    });
    if (state.lesson?.id === lessonId) {
      const nowIso = new Date().toISOString();
      const finishedLesson = { ...state.lesson, status: "finished", finishedAt: nowIso };
      setCurrentLessonInState(finishedLesson);
      upsertLessonInState(finishedLesson);
    }
    state.shareUrl = data.finalNote.shareUrl;
    return data.finalNote;
  }

  async function updateFinalNote(lessonId, payload) {
    const data = await api(`/api/lessons/${lessonId}/final-note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setCurrentLessonInState(data.lesson);
    state.lessons = state.lessons.map((lesson) => (lesson.id === data.lesson.id ? data.lesson : lesson));
    return data.lesson;
  }

  async function deleteFinalNote(lessonId) {
    const data = await api(`/api/lessons/${lessonId}/final-note`, { method: "DELETE" });
    setCurrentLessonInState(data.lesson);
    state.lessons = state.lessons.map((lesson) => (lesson.id === data.lesson.id ? data.lesson : lesson));
    return data.lesson;
  }

  async function fetchLessons() {
    try {
      const data = await api("/api/lessons");
      state.lessons = data.lessons || [];
      if (state.lesson?.id) {
        const refreshedCurrent = state.lessons.find((lesson) => lesson?.id === state.lesson?.id);
        if (refreshedCurrent) {
          setCurrentLessonInState(refreshedCurrent);
        } else if (state.lesson?.status === "live") {
          setCurrentLessonInState(null);
        }
      }
      return state.lessons;
    } catch (error) {
      state.lessons = [];
      state.error = error.message || "Nie udało się pobrać lekcji";
      return [];
    }
  }

  async function fetchLesson(lessonId) {
    if (!lessonId) return null;
    const cachedLesson = readLessonCache(lessonId);
    if (cachedLesson) {
      setCurrentLessonInState(cachedLesson);
      upsertLessonInState(cachedLesson);
    }
    const data = await api(`/api/lessons/${lessonId}`);
    if (data?.lesson) {
      setCurrentLessonInState(data.lesson);
      upsertLessonInState(data.lesson);
      return data.lesson;
    }
    return null;
  }

  async function fetchAdmin() {
    return api("/api/admin");
  }

  async function fetchSharedNote(noteId) {
    return api(`/api/share/${noteId}`);
  }

  async function generateTeacherNote(payload) {
    const data = await api("/api/notes/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return String(data.note || "");
  }

  async function generatePresentation(payload) {
    const data = await api("/api/presentations/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return data.presentation;
  }

  async function generateLiveLessonSummary(payload) {
    const data = await api("/api/insights/live-lesson-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return String(data.summary || "");
  }

  async function askMeAI(question, lessonId = null, classLevel  = null) {
    const data = await api("/api/ask-me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, lessonId, classLevel })
    });
    return String(data.answer || "");
  }

  async function saveTeacherNote(payload) {
    const data = await api("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (data?.note) {
      state.notes = [data.note, ...state.notes.filter((note) => note.id !== data.note.id)];
    }
    return data.note;
  }

  async function deleteTeacherNote(noteId) {
    await api(`/api/notes/${noteId}`, { method: "DELETE" });
    state.notes = state.notes.filter((note) => note.id !== noteId);
  }

  async function updateTeacherNote(noteId, payload) {
    const data = await api(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (data?.note) {
      state.notes = state.notes.map((n) => (n.id === noteId ? data.note : n));
    }
    return data.note;
  }

  async function fetchTeacherNotes() {
    const data = await api("/api/notes");
    state.notes = data.notes || [];
    return state.notes;
  }

  return {
    state,
    createLesson,
    uploadLessonMaterial,
    extractTextFromUpload,
    savePlan,
    startLive,
    cancelLesson,
    sendTranscript,
    refreshCoverage,
    setManualPointApproval,
    finalizeLesson,
    updateFinalNote,
    deleteFinalNote,
    fetchLessons,
    fetchLesson,
    hydrateLessonFromCache,
    fetchAdmin,
    fetchSharedNote,
    generateTeacherNote,
    generatePresentation,
    generateLiveLessonSummary,
    askMeAI,
    saveTeacherNote,
    updateTeacherNote,
    deleteTeacherNote,
    fetchTeacherNotes
  };
}
