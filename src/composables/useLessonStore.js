import { reactive } from "vue";

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/$/, "");
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const RESOLVED_API_BASE = API_BASE || "http://localhost:3001";

const state = reactive({
  lesson: null,
  lessons: [],
  error: "",
  info: "",
  missing: [],
  costInfo: null,
  shareUrl: ""
});

async function api(path, options = {}) {
  const response = await fetch(`${RESOLVED_API_BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "API error");
  }
  return data;
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

  async function updateLessonMeta(lessonId, payload) {
    const data = await api(`/api/lessons/${lessonId}/meta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (state.lesson?.id === lessonId) {
      state.lesson = data.lesson;
    }
    state.lessons = state.lessons.map((item) => (item.id === lessonId ? data.lesson : item));
    return data.lesson;
  }

  async function deleteLesson(lessonId) {
    await api(`/api/lessons/${lessonId}`, { method: "DELETE" });
    if (state.lesson?.id === lessonId) {
      state.lesson = null;
    }
    state.lessons = state.lessons.filter((item) => item.id !== lessonId);
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
    updateLessonMeta,
    deleteLesson,
    fetchAdmin,
    fetchSharedNote
  };
}
