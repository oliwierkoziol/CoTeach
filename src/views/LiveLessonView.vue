<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="border rounded-lg px-3 py-2 bg-white">←</RouterLink>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Lekcja na Żywo</h1>
            <p class="text-gray-600">Monitoring na żywo i analiza postępu</p>
          </div>
        </div>
        <button v-if="!isRecording" class="px-4 py-2 rounded-lg bg-green-600 text-white" @click="startSession">Rozpocznij Lekcję</button>
        <button v-else class="px-4 py-2 rounded-lg bg-red-600 text-white" @click="stopSession">Zatrzymaj</button>
      </div>

      <div v-if="error" class="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 p-4">{{ error }}</div>
      <div v-if="info" class="mb-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 p-4">{{ info }}</div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl border p-6" :class="isRecording ? 'border-green-500 bg-green-50' : ''">
            <div class="flex items-center justify-between">
              <div class="font-semibold">{{ isRecording ? "Nagrywanie aktywne" : "Oczekiwanie..." }}</div>
              <div class="text-sm">{{ elapsedLabel }} | {{ costLabel }}</div>
            </div>
          </div>

          <div class="bg-white rounded-xl border p-6 space-y-4">
            <h2 class="text-lg font-semibold">Panel Mikrofonu i Napisów</h2>
            <div class="rounded-lg border p-3 text-sm" :class="sttStatus === 'listening' ? 'bg-green-50 border-green-200 text-green-800' : sttStatus === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-700'">
              STT status: <strong>{{ sttStatusLabel }}</strong>
            </div>
            <div class="rounded-lg border p-3 text-sm" :class="apiStatus === 'online' ? 'bg-green-50 border-green-200 text-green-800' : apiStatus === 'offline' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-700'">
              API status: <strong>{{ apiStatusLabel }}</strong>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600 block mb-1">Urządzenie mikrofonu</label>
                <select
                  v-model="selectedMicId"
                  class="w-full border rounded-lg px-3 py-2"
                  :disabled="isRecording"
                >
                  <option value="">Domyślny mikrofon systemowy</option>
                  <option v-for="d in micDevices" :key="d.deviceId" :value="d.deviceId">
                    {{ d.label || `Mikrofon ${d.deviceId.slice(0, 6)}` }}
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  Uwaga: rozpoznawanie mowy przeglądarki zwykle używa domyślnego mikrofonu systemu.
                </p>
              </div>
              <div>
                <label class="text-sm text-gray-600 block mb-1">Silnik STT</label>
                <select v-model="sttEngine" class="w-full border rounded-lg px-3 py-2" :disabled="isRecording || micTestActive">
                  <option value="browser">Przeglądarka (Web Speech)</option>
                  <option value="whisper">Whisper (OpenAI API)</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  Whisper wysyła fragmenty audio do backendu i transkrybuje przez OpenAI.
                </p>
              </div>
              <div>
                <label class="text-sm text-gray-600 block mb-1">Poziom mikrofonu</label>
                <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-3 bg-blue-600 transition-all duration-100" :style="{ width: `${micLevel}%` }" />
                </div>
                <p class="text-xs text-gray-500 mt-1">Sygnał wejściowy: {{ Math.round(micLevel) }}%</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600 block mb-1">Wzmocnienie mikrofonu (podgląd)</label>
                <input v-model.number="micGain" type="range" min="0.5" max="2" step="0.1" class="w-full" />
                <p class="text-xs text-gray-500 mt-1">x{{ micGain.toFixed(1) }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600 block mb-1">Czułość napisów live</label>
                <input v-model.number="captionSensitivity" type="range" min="1" max="12" step="1" class="w-full" />
                <p class="text-xs text-gray-500 mt-1">Minimum długości fragmentu: {{ captionSensitivity }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="rounded-lg bg-gray-50 border p-3">
                <div class="text-xs uppercase tracking-wide text-gray-500 mb-1">Napisy live (w trakcie)</div>
                <p class="text-sm min-h-[48px]">{{ interimCaption || "..." }}</p>
              </div>
              <div class="rounded-lg bg-gray-50 border p-3">
                <div class="text-xs uppercase tracking-wide text-gray-500 mb-1">Ostatnia pełna wypowiedź</div>
                <p class="text-sm min-h-[48px]">{{ lastFinalCaption || "..." }}</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                class="px-3 py-2 rounded-lg border bg-white"
                :disabled="isRecording || micTestActive"
                @click="startMicTest"
              >
                Test mikrofonu (bez lekcji)
              </button>
              <button
                class="px-3 py-2 rounded-lg border bg-white"
                :disabled="!micTestActive"
                @click="stopMicTest"
              >
                Stop testu mikrofonu
              </button>
            </div>
          </div>

          <div class="bg-white rounded-xl border p-6">
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>{{ discussedCount }} z {{ points.length }} punktów omówionych</span>
              <span>{{ progress }}%</span>
            </div>
            <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-2 bg-green-600" :style="{ width: `${progress}%` }" />
            </div>
          </div>

          <div class="bg-white rounded-xl border p-6 space-y-3">
            <h2 class="text-lg font-semibold">Plan Lekcji - Dashboard Nauczyciela</h2>
            <div v-for="(point, index) in points" :key="point.id" class="p-4 rounded-lg border-2" :class="point.status === 'discussed' ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'">
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-medium">{{ index + 1 }}. {{ point.title }}</div>
                  <div class="flex flex-wrap gap-1 mt-2">
                    <span v-for="k in point.keywords" :key="k" class="text-xs px-2 py-1 rounded bg-gray-100">{{ k }}</span>
                  </div>
                </div>
                <span v-if="point.status === 'discussed'" class="text-green-600">✓</span>
              </div>
            </div>
          </div>

          <div v-if="transcription.length" class="bg-white rounded-xl border p-6">
            <h2 class="text-lg font-semibold mb-3">Transkrypcja na Żywo</h2>
            <div class="space-y-2 max-h-[300px] overflow-y-auto bg-gray-50 p-4 rounded-lg text-sm">
              <div v-for="(text, idx) in transcription.slice(-10)" :key="idx">{{ text }}</div>
            </div>
          </div>
        </div>

        <div class="space-y-6">

          <div v-if="pendingPoints.length > 0 && elapsedSec > 120" class="rounded-lg border border-red-300 bg-red-50 p-4 text-sm">
            Uwaga! Pozostało {{ pendingPoints.length }} nieomówionych punktów.
            <button class="mt-2 w-full border rounded-lg py-2 bg-white" @click="goPresentation">Generuj Koło Ratunkowe</button>
          </div>

          <div class="bg-white rounded-xl border p-4 space-y-2">
            <button class="w-full border rounded-lg py-2" :disabled="pendingPoints.length === 0" @click="goPresentation">Koło Ratunkowe ({{ pendingPoints.length }})</button>
            <button class="w-full border rounded-lg py-2" @click="finalizeNow">Zakończ i Archiwizuj</button>
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

const route = useRoute();
const router = useRouter();
const { state, startLive, sendTranscript, refreshCoverage, finalizeLesson, fetchLessons } = useLessonStore();

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
let apiPingTimer = null;

const points = computed(() => state.lesson?.plan || []);
const discussedCount = computed(() => points.value.filter((p) => p.status === "discussed").length);
const progress = computed(() => (points.value.length ? Math.round((discussedCount.value / points.value.length) * 100) : 0));
const pendingPoints = computed(() => points.value.filter((p) => p.status !== "discussed"));
const elapsedLabel = computed(() => `${Math.floor(elapsedSec.value / 60)}:${String(elapsedSec.value % 60).padStart(2, "0")}`);
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
  if (apiPingTimer) clearInterval(apiPingTimer);
  stopMicMeter();
  recognition.value?.stop();
});

async function startSession() {
  try {
    error.value = "";
    if (!state.lesson) {
      error.value = "Brak lekcji. Najpierw utwórz plan.";
      return;
    }
    await startLive(state.lesson.id);
    await beginMic();
    isRecording.value = true;
    startAt.value = Date.now();
    timer.value = setInterval(() => {
      elapsedSec.value = Math.floor((Date.now() - startAt.value) / 1000);
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
  if (analyserTimer.value) clearInterval(analyserTimer.value);
  stopMicMeter();
  sttStatus.value = "idle";
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
          .then(() => refreshCoverage(state.lesson.id))
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
        await refreshCoverage(state.lesson.id);
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
</script>
