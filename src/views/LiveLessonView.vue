<template>
  <div class="min-h-full px-4 py-8 sm:px-6 lg:px-10">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header>
          <p class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Moduł</p>
          <h1 class="text-3xl font-bold text-foreground">Lekcja na żywo</h1>
          <p class="mt-1 text-sm text-muted-foreground">Monitoring i analiza postępu</p>
        </header>
        <div class="flex shrink-0 gap-2">
          <div class="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <span class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Długość lekcji</span>
            <select
              v-model.number="selectedLessonDurationMinutes"
              class="rounded-lg border border-border bg-input-background px-2 py-1.5 text-sm text-foreground outline-none"
              :disabled="isRecording"
            >
              <option v-for="option in availableLessonDurationOptions" :key="option.minutes" :value="option.minutes">
                {{ option.label }}
              </option>
            </select>
          </div>
          <button
            v-if="!isRecording"
            type="button"
            class="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            @click="startSession"
          >
            Rozpocznij lekcję
          </button>
          <button
            v-else
            type="button"
            class="rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition hover:opacity-90"
            @click="stopSession"
          >
            Zatrzymaj
          </button>
        </div>
      </div>

      <div v-if="error" class="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{{ error }}</div>
      <div v-if="info" class="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">{{ info }}</div>

      <div class="mb-6 rounded-2xl border border-border bg-card p-6">
        <div class="mb-2 flex justify-between text-sm text-muted-foreground">
          <span>{{ discussedCount }} z {{ points.length }} punktów omówionych</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div class="h-2 rounded-full bg-emerald-500 transition-all" :style="{ width: `${progress}%` }" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <div
            class="rounded-2xl border border-border bg-card p-6"
            :class="isRecording ? 'border-emerald-500/50 bg-emerald-500/5' : ''"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="font-semibold text-foreground">{{ isRecording ? "Nagrywanie aktywne" : "Oczekiwanie..." }}</div>
              <div class="text-sm text-muted-foreground">{{ elapsedLabel }} / {{ durationLabel }} | {{ costLabel }}</div>
            </div>
          </div>

          <div class="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 class="text-lg font-semibold text-foreground">Napisy na żywo</h2>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="rounded-xl border border-border bg-muted/30 p-3">
                <div class="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Napisy live (w trakcie)</div>
                <p class="min-h-[48px] text-sm text-foreground">{{ interimCaption || "..." }}</p>
              </div>
              <div class="rounded-xl border border-border bg-muted/30 p-3">
                <div class="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Ostatnia pełna wypowiedź</div>
                <p class="min-h-[48px] text-sm text-foreground">{{ lastFinalCaption || "..." }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-3 rounded-2xl border border-border bg-card p-6">
            <h2 class="text-lg font-semibold text-foreground">Plan lekcji</h2>
            <div
              v-for="(point, index) in points"
              :key="point.id"
              class="rounded-xl border-2 p-4"
              :class="point.status === 'discussed' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-border bg-card'"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="font-medium text-foreground">{{ index + 1 }}. {{ point.title }}</div>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <span v-for="k in point.keywords" :key="k" class="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{{ k }}</span>
                  </div>
                </div>
                <span v-if="point.status === 'discussed'" class="text-emerald-400">✓</span>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
                  :class="point.manualApproved ? 'border-amber-600 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-400/50 dark:bg-amber-500/20 dark:text-amber-100 dark:hover:bg-amber-500/30' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 hover:bg-emerald-500/20 dark:text-emerald-100 dark:hover:bg-emerald-500/30'"
                  :disabled="manualUpdateLoadingId === point.id"
                  @click="toggleManualApproval(point)"
                >
                  {{ manualUpdateLoadingId === point.id ? "Aktualizuję..." : point.manualApproved ? "Cofnij ręczne zatwierdzenie" : "Zatwierdź ręcznie" }}
                </button>
                <span v-if="point.manualApproved" class="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">Ręcznie zatwierdzone</span>
              </div>
            </div>
          </div>

          <div v-if="transcription.length" class="rounded-2xl border border-border bg-card p-6">
            <h2 class="mb-3 text-lg font-semibold text-foreground">Transkrypcja na żywo</h2>
            <div class="max-h-[300px] space-y-2 overflow-y-auto rounded-xl bg-muted/30 p-4 text-sm text-foreground">
              <div v-for="(text, idx) in transcription.slice(-10)" :key="idx">{{ text }}</div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="rounded-2xl border border-border bg-card p-6">
            <h2 class="text-lg font-semibold text-foreground">Czas lekcji</h2>
            <p class="mt-1 text-sm text-muted-foreground">
              Wybrany limit: <span class="font-semibold text-foreground">{{ durationLabel }}</span>
            </p>
            <p class="mt-2 text-sm text-muted-foreground">
              Lekcja zatrzyma się automatycznie po upływie tego czasu.
            </p>
            <p v-if="isDemoLicense" class="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
              Tryb demo: maksymalny czas lekcji live to {{ demoMaxLiveMinutes }} min.
            </p>
          </div>

          <div class="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 class="text-lg font-semibold text-foreground">Ustawienia mikrofonu</h2>
            <div
              class="rounded-xl border p-3 text-sm"
              :class="
                sttStatus === 'listening'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  : sttStatus === 'error'
                    ? 'border-destructive/40 bg-destructive/10 text-destructive'
                    : 'border-border bg-muted/30 text-foreground'
              "
            >
              STT status: <strong>{{ sttStatusLabel }}</strong>
            </div>
            <div
              class="rounded-xl border p-3 text-sm"
              :class="
                apiStatus === 'online'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  : apiStatus === 'offline'
                    ? 'border-destructive/40 bg-destructive/10 text-destructive'
                    : 'border-border bg-muted/30 text-foreground'
              "
            >
              API status: <strong>{{ apiStatusLabel }}</strong>
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm text-muted-foreground">Urządzenie mikrofonu</label>
                <select
                  v-model="selectedMicId"
                  class="w-full rounded-xl border border-border bg-input-background px-3 py-2 text-foreground"
                  :disabled="isRecording"
                >
                  <option value="">Domyślny mikrofon systemowy</option>
                  <option v-for="d in micDevices" :key="d.deviceId" :value="d.deviceId">
                    {{ d.label || `Mikrofon ${d.deviceId.slice(0, 6)}` }}
                  </option>
                </select>
                <p class="mt-1 text-xs text-muted-foreground">
                  Uwaga: rozpoznawanie mowy przeglądarki zwykle używa domyślnego mikrofonu systemu.
                </p>
              </div>
              <div>
                <label class="mb-1 block text-sm text-muted-foreground">Silnik STT</label>
                <select
                  v-model="sttEngine"
                  class="w-full rounded-xl border border-border bg-input-background px-3 py-2 text-foreground"
                  :disabled="isRecording || micTestActive"
                >
                  <option value="browser">Przeglądarka (Web Speech)</option>
                  <option value="whisper">Whisper (OpenAI API)</option>
                </select>
                <p class="mt-1 text-xs text-muted-foreground">Whisper wysyła audio do backendu i transkrybuje przez OpenAI.</p>
              </div>
              <div>
                <label class="mb-1 block text-sm text-muted-foreground">Poziom mikrofonu</label>
                <div class="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div class="h-3 rounded-full bg-primary transition-all duration-100" :style="{ width: `${micLevel}%` }" />
                </div>
                <p class="mt-1 text-xs text-muted-foreground">Sygnał wejściowy: {{ Math.round(micLevel) }}%</p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm text-muted-foreground">Wzmocnienie mikrofonu (podgląd)</label>
                <input v-model.number="micGain" type="range" min="0.5" max="2" step="0.1" class="w-full" />
                <p class="mt-1 text-xs text-muted-foreground">x{{ micGain.toFixed(1) }}</p>
              </div>
              <div>
                <label class="mb-1 block text-sm text-muted-foreground">Czułość napisów live</label>
                <input v-model.number="captionSensitivity" type="range" min="1" max="12" step="1" class="w-full" />
                <p class="mt-1 text-xs text-muted-foreground">Minimum długości fragmentu: {{ captionSensitivity }}</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground transition hover:bg-muted/50 disabled:opacity-50"
                :disabled="isRecording || micTestActive"
                @click="startMicTest"
              >
                Test mikrofonu (bez lekcji)
              </button>
              <button
                type="button"
                class="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground transition hover:bg-muted/50 disabled:opacity-50"
                :disabled="!micTestActive"
                @click="stopMicTest"
              >
                Stop testu mikrofonu
              </button>
            </div>
          </div>
          <div
            v-if="pendingPoints.length > 0 && elapsedSec > 120"
            class="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground"
          >
            Uwaga! Pozostało {{ pendingPoints.length }} nieomówionych punktów.
            <button
              type="button"
              class="mt-2 w-full rounded-xl border border-border bg-card py-2 text-sm font-medium transition hover:bg-muted/50"
              @click="goPresentation"
            >
              Generuj koło ratunkowe
            </button>
          </div>

          <div class="space-y-2 rounded-2xl border border-border bg-card p-4">
            <button
              type="button"
              class="w-full rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition hover:bg-muted/50 disabled:opacity-50"
              :disabled="pendingPoints.length === 0"
              @click="goPresentation"
            >
              Koło ratunkowe ({{ pendingPoints.length }})
            </button>
            <button
              type="button"
              class="w-full rounded-xl border border-primary/40 bg-primary/15 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/25"
              @click="finalizeNow"
            >
              Zakończ i archiwizuj
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import { supabase } from "../supabase";

function normalizeBaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "http://localhost:3001";
const COVERAGE_REFRESH_MIN_INTERVAL_MS = 90_000;

const lessonDurationOptions = [
  { label: "45 min", minutes: 45 },
  { label: "1h 30 min", minutes: 90 },
  { label: "2h", minutes: 120 },
  { label: "2h 15 min", minutes: 135 },
  { label: "3h", minutes: 180 }
];

const route = useRoute();
const router = useRouter();
const { state, startLive, sendTranscript, refreshCoverage, setManualPointApproval, finalizeLesson, fetchLessons } = useLessonStore();

const isRecording = ref(false);
const recognition = ref(null);
const micDevices = ref([]);
const selectedMicId = ref("");
const micLevel = ref(0);
const micGain = ref(1);
const captionSensitivity = ref(2);
const sttEngine = ref("whisper");
const interimCaption = ref("");
const lastFinalCaption = ref("");
const micTestActive = ref(false);
const sttStatus = ref("idle");
const apiStatus = ref("checking");
const micStream = ref(null);
const audioContext = ref(null);
const analyserNode = ref(null);
const analyserTimer = ref(null);
const mediaRecorder = ref(null);
const startAt = ref(0);
const elapsedSec = ref(0);
const timer = ref(null);
const transcription = ref([]);
const error = ref("");
const info = ref("");
const shouldKeepListening = ref(false);
const manualUpdateLoadingId = ref("");
const selectedLessonDurationMinutes = ref(45);
const activeSessionDurationMinutes = ref(45);
const lastCoverageRefreshMs = ref(0);
const coverageRefreshTimer = ref(null);
const demoMaxLiveMinutes = ref(null);
let apiPingTimer = null;

const points = computed(() => state.lesson?.plan || []);
const discussedCount = computed(() => points.value.filter((p) => p.status === "discussed").length);
const progress = computed(() => (points.value.length ? Math.round((discussedCount.value / points.value.length) * 100) : 0));
const pendingPoints = computed(() => points.value.filter((p) => p.status !== "discussed"));
const isDemoLicense = computed(() => Number.isFinite(Number(demoMaxLiveMinutes.value)) && Number(demoMaxLiveMinutes.value) > 0);
const availableLessonDurationOptions = computed(() => {
  if (!isDemoLicense.value) return lessonDurationOptions;
  const maxMinutes = Number(demoMaxLiveMinutes.value);
  const filtered = lessonDurationOptions.filter((option) => option.minutes <= maxMinutes);
  return filtered.length ? filtered : [{ label: `${maxMinutes} min`, minutes: maxMinutes }];
});
const elapsedLabel = computed(() => `${Math.floor(elapsedSec.value / 60)}:${String(elapsedSec.value % 60).padStart(2, "0")}`);
const durationLabel = computed(() => {
  const minutes = activeSessionDurationMinutes.value || selectedLessonDurationMinutes.value || 45;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder} min`;
});
const costLabel = computed(() =>
  state.costInfo ? `${Number(state.costInfo.total).toFixed(2)} PLN` : "0.00 PLN"
);
const sttStatusLabel = computed(() => {
  if (sttStatus.value === "listening") return "nasłuchiwanie";
  if (sttStatus.value === "starting") return "uruchamianie";
  if (sttStatus.value === "error") return "błąd";
  return "bezczynny";
});
const apiStatusLabel = computed(() => {
  if (apiStatus.value === "online") return "online";
  if (apiStatus.value === "offline") return "offline";
  return "sprawdzanie";
});

onMounted(async () => {
  await loadMicDevices();
  await checkApiHealth();
  await fetchLicenseStatus();
  apiPingTimer = setInterval(checkApiHealth, 10000);
  if (!state.lesson) {
    const lessons = await fetchLessons();
    const target = lessons.find((l) => l.id === route.params.lessonId) || lessons[0];
    if (target) state.lesson = target;
  }
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
  if (analyserTimer.value) clearInterval(analyserTimer.value);
  if (coverageRefreshTimer.value) clearTimeout(coverageRefreshTimer.value);
  if (apiPingTimer) clearInterval(apiPingTimer);
  stopMicMeter();
  recognition.value?.stop();
});

async function refreshCoverageThrottled(force = false) {
  if (!state.lesson?.id) return;
  const now = Date.now();
  if (!force && now - lastCoverageRefreshMs.value < COVERAGE_REFRESH_MIN_INTERVAL_MS) return;

  lastCoverageRefreshMs.value = now;
  try {
    await refreshCoverage(state.lesson.id);
  } catch (e) {
    info.value = `Błąd odświeżania pokrycia: ${e.message || "nieznany"}`;
  }
}

async function fetchLicenseStatus() {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) {
      demoMaxLiveMinutes.value = null;
      return;
    }

    const response = await fetch(`${API_BASE}/api/account/license-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return;

    const maxMinutes = Number(payload?.demoLimits?.maxLiveMinutes || 0);
    demoMaxLiveMinutes.value = maxMinutes > 0 ? maxMinutes : null;

    if (maxMinutes > 0 && selectedLessonDurationMinutes.value > maxMinutes) {
      selectedLessonDurationMinutes.value = maxMinutes;
      info.value = `Tryb demo ogranicza czas lekcji live do ${maxMinutes} minut.`;
    }
  } catch {
    demoMaxLiveMinutes.value = null;
  }
}

function scheduleCoverageRefresh() {
  if (!state.lesson?.id) return;

  const now = Date.now();
  const elapsedSinceLast = now - lastCoverageRefreshMs.value;
  const delay = Math.max(0, COVERAGE_REFRESH_MIN_INTERVAL_MS - elapsedSinceLast);

  if (delay === 0) {
    void refreshCoverageThrottled(false);
    return;
  }

  if (coverageRefreshTimer.value) return;
  coverageRefreshTimer.value = setTimeout(() => {
    coverageRefreshTimer.value = null;
    void refreshCoverageThrottled(false);
  }, delay);
}

async function startSession() {
  try {
    error.value = "";
    await fetchLicenseStatus();
    if (!state.lesson) {
      error.value = "Brak lekcji. Najpierw utwórz plan.";
      return;
    }
    activeSessionDurationMinutes.value = selectedLessonDurationMinutes.value || 45;
    await startLive(state.lesson.id);
    await beginMic();
    isRecording.value = true;
    elapsedSec.value = 0;
    startAt.value = Date.now();
    timer.value = setInterval(() => {
      elapsedSec.value = Math.floor((Date.now() - startAt.value) / 1000);
      if (elapsedSec.value >= activeSessionDurationMinutes.value * 60) {
        info.value = `Osiągnięto ustawiony czas lekcji (${durationLabel.value}). Lekcja została zatrzymana automatycznie.`;
        stopSession();
      }
    }, 1000);
  } catch (e) {
    error.value = e.message;
    sttStatus.value = "error";
  }
}

function stopSession() {
  shouldKeepListening.value = false;
  recognition.value?.stop();
  recognition.value = null;
  mediaRecorder.value?.stop();
  mediaRecorder.value = null;
  isRecording.value = false;
  interimCaption.value = "";
  if (timer.value) clearInterval(timer.value);
  timer.value = null;
  if (analyserTimer.value) clearInterval(analyserTimer.value);
  analyserTimer.value = null;
  stopMicMeter();
  sttStatus.value = "idle";
  if (coverageRefreshTimer.value) {
    clearTimeout(coverageRefreshTimer.value);
    coverageRefreshTimer.value = null;
  }
  void refreshCoverageThrottled(true);
}

async function beginMic() {
  sttStatus.value = "starting";
  await startMicMeter();
  if (sttEngine.value === "whisper") {
    await beginWhisperMode();
    return;
  }
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) {
    sttStatus.value = "error";
    throw new Error("Ta przeglądarka nie wspiera SpeechRecognition. Użyj Chrome.");
  }
  const rec = new Ctor();
  rec.lang = "pl-PL";
  rec.continuous = true;
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  shouldKeepListening.value = true;
  rec.onresult = async (event) => {
    const finals = [];
    const interim = [];

    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i];
      const alternatives = Array.from(result || []);
      const text = alternatives.map((a) => a?.transcript || "").join(" ").trim();
      if (!text) continue;
      if (result.isFinal) {
        finals.push(text);
      } else if (text.length >= captionSensitivity.value) {
        interim.push(text);
      }
    }

    interimCaption.value = interim.join(" ").trim();

    if (finals.length) {
      const finalText = finals.join(" ").trim();
      lastFinalCaption.value = finalText;
      transcription.value.push(finalText);
      interimCaption.value = "";

      // Fire and forget to keep UI captions responsive.
      if (state.lesson?.id) {
        sendTranscript(state.lesson.id, finalText)
          .then(() => scheduleCoverageRefresh())
          .catch((e) => {
            info.value = `Błąd wysyłki transkrypcji: ${e.message || "nieznany"}`;
          });
      }
    }
  };
  rec.onstart = () => {
    sttStatus.value = "listening";
    info.value = "STT działa. Mów normalnie do mikrofonu.";
  };
  rec.onaudiostart = () => {
    micLevel.value = Math.min(100, Math.max(micLevel.value, 20 * micGain.value));
  };
  rec.onspeechstart = () => {
    micLevel.value = Math.min(100, 90 * micGain.value);
  };
  rec.onspeechend = () => {
    micLevel.value = Math.min(100, 25 * micGain.value);
  };
  rec.onaudioend = () => {
    if (!isRecording.value && !micTestActive.value) {
      micLevel.value = 0;
    }
  };
  rec.onend = () => {
    sttStatus.value = "idle";
    if (shouldKeepListening.value) {
      try {
        sttStatus.value = "starting";
        rec.start();
      } catch {
        // no-op
      }
    }
  };
  rec.onerror = (ev) => {
    const reason = ev.error || "nieznany";
    info.value = `Błąd mikrofonu: ${reason}`;

    // Common transient errors in browser speech recognition.
    if (reason === "no-speech" || reason === "aborted") {
      sttStatus.value = "starting";
      return;
    }
    sttStatus.value = "error";
  };
  recognition.value = rec;
  rec.start();
  sttStatus.value = "listening";
}

async function beginWhisperMode() {
  if (!micStream.value) {
    throw new Error("Nie udało się uruchomić strumienia mikrofonu.");
  }
  let recorder;
  try {
    recorder = new MediaRecorder(micStream.value, { mimeType: "audio/webm" });
  } catch {
    recorder = new MediaRecorder(micStream.value);
  }
  mediaRecorder.value = recorder;
  sttStatus.value = "listening";
  info.value = "Whisper aktywny. Wysyłam fragmenty audio co kilka sekund.";

  recorder.ondataavailable = async (event) => {
    if (!event.data || event.data.size < 1 || !state.lesson?.id) return;
    try {
      const form = new FormData();
      form.set("lessonId", state.lesson.id);
      form.set("file", event.data, `chunk-${Date.now()}.webm`);
      const { data: authData } = await supabase.auth.getSession();
      const token = authData?.session?.access_token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE}/api/transcribe`, {
        method: "POST",
        headers,
        body: form
      });
      const data = await response.json();
      if (!response.ok) {
        info.value = (data.message || data.error || "Błąd Whisper API.") + " Przełączam na STT przeglądarki.";
        // Automatic recovery: switch to browser STT when provider fails.
        sttEngine.value = "browser";
        mediaRecorder.value?.stop();
        mediaRecorder.value = null;
        await beginMic();
        return;
      }
      const text = String(data.text || "").trim();
      if (text.length >= captionSensitivity.value) {
        // Show Whisper text immediately on screen before lesson analysis.
        interimCaption.value = "Przetworzono fragment audio.";
        lastFinalCaption.value = text;
        transcription.value.push(text);
        await sendTranscript(state.lesson.id, text);
        scheduleCoverageRefresh();
        interimCaption.value = "";
      }
      if (data.limitReached) {
        info.value = "Osiągnięto limit kosztów sesji.";
      }
    } catch (e) {
      info.value = `Błąd Whisper: ${e.message || "nieznany"}`;
    }
  };

  recorder.onerror = () => {
    sttStatus.value = "error";
    info.value = "Błąd rejestratora audio dla Whisper.";
  };

  recorder.start(4000);
}

async function loadMicDevices() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    const devices = await navigator.mediaDevices.enumerateDevices();
    micDevices.value = devices.filter((d) => d.kind === "audioinput");
  } catch {
    micDevices.value = [];
  }
}

async function startMicMeter() {
  stopMicMeter();
  const constraints = selectedMicId.value
    ? { audio: { deviceId: { exact: selectedMicId.value } } }
    : { audio: true };
  micStream.value = await navigator.mediaDevices.getUserMedia(constraints);
  audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.value.createMediaStreamSource(micStream.value);
  analyserNode.value = audioContext.value.createAnalyser();
  analyserNode.value.fftSize = 512;
  source.connect(analyserNode.value);

  const data = new Uint8Array(analyserNode.value.frequencyBinCount);
  analyserTimer.value = setInterval(() => {
    if (!analyserNode.value) return;
    analyserNode.value.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i += 1) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    micLevel.value = Math.min(100, Math.max(0, rms * 260));
  }, 100);
}

function stopMicMeter() {
  if (micStream.value) {
    micStream.value.getTracks().forEach((t) => t.stop());
    micStream.value = null;
  }
  if (audioContext.value) {
    audioContext.value.close();
    audioContext.value = null;
  }
  analyserNode.value = null;
  micLevel.value = 0;
}

async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    apiStatus.value = response.ok ? "online" : "offline";
  } catch {
    apiStatus.value = "offline";
  }
}

async function startMicTest() {
  try {
    error.value = "";
    if (sttEngine.value === "whisper") {
      info.value = "Tryb testu działa na silniku przeglądarki. Whisper testuj w aktywnej lekcji.";
    } else {
      info.value = "Tryb testu: mów do mikrofonu i sprawdź napisy na żywo.";
    }
    micTestActive.value = true;
    const originalEngine = sttEngine.value;
    if (sttEngine.value === "whisper") {
      sttEngine.value = "browser";
    }
    await beginMic();
    sttEngine.value = originalEngine;
  } catch (e) {
    micTestActive.value = false;
    error.value = e.message;
  }
}

function stopMicTest() {
  shouldKeepListening.value = false;
  recognition.value?.stop();
  recognition.value = null;
  mediaRecorder.value?.stop();
  mediaRecorder.value = null;
  micTestActive.value = false;
  interimCaption.value = "";
  lastFinalCaption.value = "";
  sttStatus.value = "idle";
  if (analyserTimer.value) clearInterval(analyserTimer.value);
  stopMicMeter();
  micLevel.value = 0;
}

function goPresentation() {
  if (!state.lesson) return;
  router.push(`/presentation/${state.lesson.id}`);
}

async function finalizeNow() {
  if (!state.lesson) return;
  const note = await finalizeLesson(state.lesson.id, window.location.origin);
  router.push(`/archive?note=${encodeURIComponent(note.shareUrl)}`);
}

async function toggleManualApproval(point) {
  if (!state.lesson?.id || !point?.id) return;
  try {
    error.value = "";
    manualUpdateLoadingId.value = point.id;
    const nextApproved = !Boolean(point.manualApproved);
    await setManualPointApproval(state.lesson.id, point.id, nextApproved);
  } catch (e) {
    error.value = e.message || "Nie udało się zaktualizować statusu podtematu.";
  } finally {
    manualUpdateLoadingId.value = "";
  }
}
</script>
