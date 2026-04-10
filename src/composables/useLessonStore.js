import { reactive } from "vue";
import { supabase } from "../supabase";

function normalizeBaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "http://localhost:3001";

const state = reactive({
  lesson: null,
  lessons: [],
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
    throw new Error(data.error || "API error");
  }
  return data;
}

export function clearLessonStoreAuthCache() {
  cachedAccessToken = null;
}

export function useLessonStore() {
  async function createLesson(payload) {
    state.error = "";
    const data = await api("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    state.lesson = data.lesson;
    return data.lesson;
  }

  async function uploadLessonMaterial(lessonId, { rawText, file }) {
    state.error = "";
    state.info = "Analizuje material...";
    const form = new FormData();
    if (rawText?.trim()) form.set("rawText", rawText.trim());
    if (file) form.set("file", file);
    const data = await api(`/api/lessons/${lessonId}/upload`, { method: "POST", body: form });
    state.lesson = data.lesson;
    state.info = `Analiza zakonczona. Wykryto ${data.lesson.plan.length} tematow.`;
    return data.lesson;
  }

  async function savePlan(lessonId, plan) {
    const data = await api(`/api/lessons/${lessonId}/plan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    state.lesson = data.lesson;
    return data.lesson;
  }

  async function startLive(lessonId) {
    const data = await api(`/api/lessons/${lessonId}/live/start`, { method: "POST" });
    state.lesson = data.lesson;
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
      state.lesson = { ...state.lesson, plan: coverage.plan };
    }
    state.costInfo = await api(`/api/lessons/${lessonId}/costs`);
    return coverage;
  }

  async function finalizeLesson(lessonId, baseUrl) {
    const data = await api(`/api/lessons/${lessonId}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseUrl })
    });
    state.shareUrl = data.finalNote.shareUrl;
    return data.finalNote;
  }

  async function fetchLessons() {
    const data = await api("/api/lessons");
    state.lessons = data.lessons || [];
    return state.lessons;
  }

  async function fetchAdmin() {
    return api("/api/admin");
  }

  async function fetchSharedNote(noteId) {
    return api(`/api/share/${noteId}`);
  }

  return {
    state,
    createLesson,
    uploadLessonMaterial,
    savePlan,
    startLive,
    sendTranscript,
    refreshCoverage,
    finalizeLesson,
    fetchLessons,
    fetchAdmin,
    fetchSharedNote
  };
}
