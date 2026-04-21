<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] w-full overflow-x-hidden relative">
    <!-- Background Decor -->
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0" />
    
    <div class="p-12 pt-8 w-full max-w-[1664px] relative z-10">
    <!-- Header -->
    <div class="mb-7 max-w-[1024px]">
      <div class="flex items-center gap-2 mb-2">
        <div class="size-2 rounded-full bg-[#9e3f4e]" :class="{ 'animate-pulse': isRecording }" />
        <p class="font-['Plus_Jakarta_Sans'] font-bold text-[#9e3f4e] text-[10.5px] tracking-[0.525px] uppercase">
          W TRAKCIE
        </p>
      </div>
      <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
        Lekcja: {{ state.lesson?.title || 'Brak tytułu' }}
      </h1>
      <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-[28px]">
        Mowa z mikrofonu jest przetwarzana. Lekcja skończy się po upływie czasu.
      </p>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-12 gap-8 mb-7">
      <!-- Plan lekcji -->
      <div class="col-span-12 xl:col-span-4 bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 flex flex-col h-[497px]">
        <h2 class="font-['Manrope'] font-bold text-[#142588] text-[18px] leading-[28px] mb-2">
          Plan lekcji
        </h2>

        <div class="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin">
          <div
            v-for="(point, index) in points"
            :key="point.id"
            class="rounded-lg py-3 cursor-pointer group"
            @click="toggleManualApproval(point)"
          >
            <div class="flex items-start gap-4">
              <div 
                class="size-8 rounded-full flex items-center justify-center shrink-0 transition"
                :class="point.status === 'discussed' || point.manualApproved ? 'bg-[#68a962]' : 'bg-[#e0e3e6] group-hover:bg-[#d0d3d6]'"
              >
                <span 
                  class="font-['Inter'] font-semibold text-[16px]"
                  :class="point.status === 'discussed' || point.manualApproved ? 'text-white' : 'text-[#454652]'"
                >
                  <span v-if="manualUpdateLoadingId === point.id" class="block animate-spin">⟳</span>
                  <span v-else>{{ index + 1 }}</span>
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-['Inter'] font-semibold text-[#191c1e] text-[16px] leading-[24px] mb-2">
                  {{ point.title }}
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="(tag, i) in point.keywords"
                    :key="i"
                    class="px-2 py-0.5 rounded text-[12px] font-['Inter'] font-bold transition"
                    :class="point.status === 'discussed' || point.manualApproved ? 'bg-[#68a962] text-white' : 'bg-[#e0e3e6] text-[#454652]'"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="space-y-2 pt-2 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <p class="font-['Manrope'] font-bold text-[#142588] text-[18px] leading-[28px]">
              {{ discussedCount }} z {{ points.length }} punktów omówionych
            </p>
            <p class="font-['Inter'] font-semibold text-[#142588] text-[16px]">
              {{ progress }}%
            </p>
          </div>
          <div class="bg-[#d8e2ff] h-4 rounded-full overflow-hidden">
            <div 
              class="bg-[#0059bb] h-full rounded-full shadow-[0px_0px_8px_0px_rgba(0,89,187,0.4)] transition-all duration-300" 
              :style="{ width: `${progress}%` }" 
            />
          </div>
        </div>
      </div>

      <!-- Live Transcription -->
      <div class="col-span-12 xl:col-span-5 space-y-6">
        <div class="flex items-center gap-2">
          <!-- Mic Wave Icon -->
          <svg class="w-[22px] h-[19px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" stroke="#0059BB" />
          </svg>
          <h2 class="font-['Manrope'] font-bold text-[#142588] text-[18px] tracking-[0.9px] leading-[28px]">
            Napisy na żywo
          </h2>

          <div class="flex items-center justify-between text-xs">
            <span class="font-['Inter'] text-[#454652]">
              Koszt: {{ currentCost.toFixed(2) }} PLN / {{ costLimit.toFixed(2) }} PLN
            </span>
            <div class="flex items-center gap-2">
              <span
                class="font-['Inter'] font-semibold"
                :class="currentCost >= costLimit ? 'text-red-600' : 'text-green-600'"
              >
                {{ ((currentCost / costLimit) * 100).toFixed(0) }}%
              </span>
              <button
                @click="resetCosts"
                class="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div class="bg-[#f2f4f7] rounded-xl border-l-4 border-[#0059bb] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 h-[445px] overflow-y-auto">
          <p class="font-['Inter'] font-semibold text-[#0059bb] text-[12px] tracking-[1.2px] uppercase mb-3">
            NAPISY LIVE (W TRAKCIE)
          </p>

          <div class="max-h-[350px] overflow-y-auto space-y-3" ref="transcriptionContainer" @scroll="handleScroll">
            <div
              v-for="(text, index) in transcription"
              :key="index"
              class="font-['Inter'] italic text-[#454652] text-[18px] leading-[29.25px] p-2 bg-white/50 rounded"
            >
              {{ index + 1 }}. {{ text }}
            </div>

            <p v-if="interimCaption" class="font-['Inter'] italic text-[#8B8D97] text-[18px] leading-[29.25px]">
              {{ interimCaption }}
            </p>

            <div v-if="transcription.length === 0 && !interimCaption" class="font-['Inter'] italic text-[#454652] text-[18px] leading-[29.25px]">
              Czekam na rozpoczęcie wypowiedzi...<br />
              System jest gotowy do przechwytywania<br />
              dźwięku w czasie rzeczywistym.
            </div>
          </div>

          <p v-if="isDemoLicense" class="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
            Tryb demo: maksymalny czas lekcji live to {{ demoMaxLiveMinutes }} min.
          </p>
        </div>
      </div>

      <!-- Microphone Settings -->
      <div class="col-span-12 xl:col-span-3 bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 space-y-6">
        <div class="flex items-center gap-3">
          <!-- Mic Icon -->
          <svg class="w-6 h-[22px]" fill="none" stroke="#142588" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px]">
            Ustawienia mikrofonu
          </h3>
        </div>

        <!-- Mikrofon -->
        <div class="space-y-2">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">
            Mikrofon
          </label>
          <div class="bg-[#e0e3e6] rounded-lg px-4 py-3 flex items-center justify-between relative">
            <select
              v-model="selectedMicId"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              :disabled="isRecording"
            >
              <option value="">Domyślny mikrofon systemowy</option>
              <option v-for="d in micDevices" :key="d.deviceId" :value="d.deviceId">
                {{ d.label || `Mikrofon ${d.deviceId.slice(0, 6)}` }}
              </option>
            </select>
            <span class="font-['Plus_Jakarta_Sans'] text-[#191c1e] text-[16px] truncate max-w-[85%] pointer-events-none">
              {{ micDevices.find(d => d.deviceId === selectedMicId)?.label || 'Domyślny - System Mic' }}
            </span>
            <svg class="size-6 pointer-events-none shrink-0" fill="none" viewBox="0 0 24 24">
              <path d="M12 9.6L16.8 14.4L21.6 9.6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>


        <!-- Poziom mikrofonu -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-['Inter'] font-semibold text-[#454652] text-[12px]">
              POZIOM MIKROFONU
            </span>
            <span class="font-['Inter'] font-semibold text-[#142588] text-[12px]">
              +{{ Math.round(micLevel) }}db
            </span>
          </div>
          <div class="bg-[#e0e3e6] h-1 rounded-full overflow-hidden">
            <div class="bg-[#142588] h-full transition-all duration-100" :style="{ width: `${Math.min(100, micLevel)}%` }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="grid grid-cols-12 gap-8">
      <!-- Progress Tracker -->
      <div class="col-span-12 lg:col-span-9 bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <!-- Calendar Icon -->
            <svg class="w-[21px] h-[22px]" fill="none" stroke="#0053DB" viewBox="0 0 24 24" stroke-width="2.5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#566166] text-[14px] tracking-[0.7px] uppercase">
              POSTĘP LEKCJI
            </h3>
          </div>
          <p class="font-['Plus_Jakarta_Sans'] font-bold text-[#0053db] text-[14px]">
            {{ lessonProgressTimeLabel }}
          </p>
        </div>

        <div class="bg-[#d9e4ea] h-8 rounded-2xl overflow-hidden relative">
          <div 
            class="absolute inset-y-0 left-0 bg-[#0053db] rounded-2xl transition-all duration-1000 ease-linear" 
            :style="{ width: `${lessonProgressPercent}%` }" 
          />
          <div class="absolute left-1/4 top-0 bottom-0 w-0.5 bg-white/30" />
          <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30" />
          <div class="absolute left-3/4 top-0 bottom-0 w-0.5 bg-white/30" />
        </div>

        <div class="flex items-center justify-between text-[10px] font-['Plus_Jakarta_Sans'] font-bold tracking-[1px] uppercase">
          <span class="text-[#566166]">POCZĄTEK</span>
          <span class="text-[#0053db]">KONIEC</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="col-span-12 lg:col-span-3 space-y-4 flex flex-col justify-end">
        <button 
          class="w-full bg-[#e6e8eb] rounded-[24px] py-4 flex items-center justify-center gap-2 hover:bg-[#d8dadd] transition-colors cursor-pointer"
          @click="goPresentation"
        >
          <!-- Presentation Icon -->
          <svg class="size-5" fill="none" stroke="#142588" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span class="font-['Inter'] font-semibold text-[#142588] text-[16px]">
            Utwórz prezentację
          </span>
        </button>

        <button 
          class="w-full bg-[#7b3400] rounded-[24px] py-4 flex items-center justify-center gap-2 hover:bg-[#6a2d00] transition-colors shadow-[0_4px_12px_rgba(123,52,0,0.2)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-[#7b3400]"
          :disabled="isFinalizingLesson"
          @click="finalizeNow"
        >
          <!-- Archive Icon -->
          <svg class="size-5" fill="none" stroke="#FFA26E" stroke-width="2.2" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span class="font-['Inter'] font-semibold text-[#ffa26e] text-[16px]">
            {{ isFinalizingLesson ? "Przetwarzanie..." : "Zakończ i archiwizuj" }}
          </span>
        </button>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import { supabase } from "../supabase";

function normalizeBaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "";
const COVERAGE_REFRESH_MIN_INTERVAL_MS = 5_000; // Reduced from 90s to 5s for faster coverage updates

const lessonDurationOptions = [
  { label: "45 min", minutes: 45 },
  { label: "1h 30 min", minutes: 90 },
  { label: "2h", minutes: 120 },
  { label: "2h 15 min", minutes: 135 },
  { label: "3h", minutes: 180 }
];

const route = useRoute();
const router = useRouter();
const {
  state,
  startLive,
  sendTranscript,
  refreshCoverage,
  setManualPointApproval,
  finalizeLesson,
  fetchLessons,
  fetchLesson,
  hydrateLessonFromCache
} = useLessonStore();

const isRecording = ref(false);
const micDevices = ref([]);
const selectedMicId = ref("");
const micLevel = ref(0);
const micGain = ref(1);
const captionSensitivity = ref(2);
const interimCaption = ref("");
const lastFinalCaption = ref("");
const micTestActive = ref(false);
const sttStatus = ref("idle");
const apiStatus = ref("checking");
const currentCost = ref(0);
const costLimit = ref(3.5);
const micStream = ref(null);
const isTranscribing = ref(false); // Prevent duplicate transcriptions
const processedTranscriptionIds = new Set(); // Track processed transcriptions
const transcriptionContainer = ref(null); // Ref for auto-scrolling
const isUserScrolling = ref(false); // Track if user is manually scrolling
const lastScrollPosition = ref(0); // Track last scroll position
const audioContext = ref(null);
const analyserNode = ref(null);
const mediaRecorder = ref(null);
const startAt = ref(0);
const elapsedSec = ref(0);
const timer = ref(null);
const transcription = ref([]);
const audioChunks = ref([]); // Global audio chunks for transcription
const error = ref("");
const info = ref("");
const shouldKeepListening = ref(false);
const isFinalizingLesson = ref(false);
const manualUpdateLoadingId = ref("");
const selectedLessonDurationMinutes = ref(45);
const activeSessionDurationMinutes = ref(45);
const lastCoverageRefreshMs = ref(0);
const coverageRefreshTimer = ref(null);
const demoMaxLiveMinutes = ref(null);
let apiPingTimer = null;
let interimScrollTimer = null;

const points = computed(() => state.lesson?.plan || []);
const discussedCount = computed(() => points.value.filter((p) => p.status === "discussed").length);
const progress = computed(() => (points.value.length ? Math.round((discussedCount.value / points.value.length) * 100) : 0));
const pendingPoints = computed(() => points.value.filter((p) => p.status !== "discussed"));
const isDemoLicense = computed(() => Number.isFinite(Number(demoMaxLiveMinutes.value)) && Number(demoMaxLiveMinutes.value) > 0);

// Watch transcription changes for auto-scroll
watch(transcription, () => {
  autoScrollToBottom();
}, { deep: true });

// Watch interim caption for auto-scroll during processing (with throttling)
watch(interimCaption, () => {
  if (interimCaption.value) {
    // Clear existing timer and set new one (throttled scroll)
    if (interimScrollTimer) clearTimeout(interimScrollTimer);
    interimScrollTimer = setTimeout(() => {
      autoScrollToBottom();
    }, 300); // Scroll every 300ms max while processing
  }
});
const availableLessonDurationOptions = computed(() => {
  if (!isDemoLicense.value) return lessonDurationOptions;
  const maxMinutes = Number(demoMaxLiveMinutes.value);
  const filtered = lessonDurationOptions.filter((option) => option.minutes <= maxMinutes);
  return filtered.length ? filtered : [{ label: `${maxMinutes} min`, minutes: maxMinutes }];
});
const elapsedLabel = computed(() => `${Math.floor(elapsedSec.value / 60)}:${String(elapsedSec.value % 60).padStart(2, "0")}`);
const elapsedMinutes = computed(() => Math.floor(elapsedSec.value / 60));
const elapsedSecondsRemainder = computed(() => elapsedSec.value % 60);
const lessonProgressTimeLabel = computed(
  () =>
    `${elapsedMinutes.value} minut ${elapsedSecondsRemainder.value} sekund / ${activeSessionDurationMinutes.value} minut`
);
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

const lessonProgressPercent = computed(() => {
  const totalSeconds = Math.max(1, activeSessionDurationMinutes.value * 60);
  return Math.min(100, Math.floor((elapsedSec.value / totalSeconds) * 100));
});

function resolveLessonDurationMinutes(lesson) {
  const parsedLength = Number(lesson?.length);
  let minutes = Number.isFinite(parsedLength) && parsedLength > 0 ? Math.round(parsedLength) : 45;
  if (isDemoLicense.value && Number(demoMaxLiveMinutes.value) > 0) {
    minutes = Math.min(minutes, Number(demoMaxLiveMinutes.value));
  }
  return Math.max(1, minutes);
}

function hydrateLessonProgressFromState() {
  if (!state.lesson) return;
  activeSessionDurationMinutes.value = resolveLessonDurationMinutes(state.lesson);
  const startedAtMs = new Date(state.lesson?.startedAt || 0).getTime();
  const nowMs = Date.now();
  startAt.value = Number.isFinite(startedAtMs) && startedAtMs > 0 ? startedAtMs : nowMs;
  elapsedSec.value = Math.max(0, Math.floor((nowMs - startAt.value) / 1000));
}

onMounted(async () => {
  const routeLessonId = String(route.params.lessonId || "").trim();
  const currentLessonId = String(state.lesson?.id || "").trim();
  let cachedRouteLesson = null;
  if (routeLessonId) {
    cachedRouteLesson = hydrateLessonFromCache(routeLessonId);
    if (cachedRouteLesson) {
      hydrateLessonProgressFromState();
    }
  }

  // Do not block lesson UI hydration on secondary async tasks.
  void loadMicDevices();
  void checkApiHealth();
  void fetchLicenseStatus();
  void updateCurrentCost();
  apiPingTimer = setInterval(checkApiHealth, 10000);
  setInterval(updateCurrentCost, 5000); // Update costs every 5 seconds

  // Add scroll event listener for auto-scroll behavior
  await nextTick();
  if (transcriptionContainer.value) {
    transcriptionContainer.value.addEventListener('scroll', handleScroll);
  }

  // Check microphone permissions first
  try {
    info.value = "Sprawdzam uprawnienia do mikrofonu...";
    await loadMicDevices();
    info.value = "";
  } catch (micErr) {
    console.error('[onMounted] Microphone permission check failed:', micErr);
    error.value = `Brak uprawnień do mikrofonu. Sprawdź ustawienia przeglądarki i przyznaj dostęp do mikrofonu.`;
  }

  if (routeLessonId) {
    if (routeLessonId !== currentLessonId) {
      if (cachedRouteLesson) {
        // Render instantly from local cache, then silently refresh.
        void fetchLesson(routeLessonId);
      } else {
        await fetchLesson(routeLessonId);
        hydrateLessonProgressFromState();
      }
    } else {
      // Keep UI instant when returning, but refresh lesson in background.
      void fetchLesson(routeLessonId);
    }
  } else if (!state.lesson) {
    const lessons = await fetchLessons();
    const target = lessons[0];
    if (target) {
      state.lesson = target;
      hydrateLessonProgressFromState();
    }
  } else {
    hydrateLessonProgressFromState();
  }

  // Only start session if we have microphone permission
  if (!isRecording.value && micDevices.value.length > 0) {
    startSession();
  } else if (!isRecording.value) {
    info.value = "Oczekuję na uprawnienia do mikrofonu...";
  }
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
  if (window.__whisperActivityInterval) clearInterval(window.__whisperActivityInterval);
  if (window.__whisperCleanup) {
    window.__whisperCleanup();
    window.__whisperCleanup = null;
  }
  if (coverageRefreshTimer.value) clearTimeout(coverageRefreshTimer.value);
  if (apiPingTimer) clearInterval(apiPingTimer);
  if (interimScrollTimer) clearTimeout(interimScrollTimer);
  stopMicMeter();

  // Clean up scroll event listener
  if (transcriptionContainer.value) {
    transcriptionContainer.value.removeEventListener('scroll', handleScroll);
  }
});

async function refreshCoverageThrottled(force = false) {
  if (!state.lesson?.id) return;
  const now = Date.now();
  if (!force && now - lastCoverageRefreshMs.value < COVERAGE_REFRESH_MIN_INTERVAL_MS) {
    console.log(`⏱️ Coverage check throttled (${(now - lastCoverageRefreshMs.value)/1000}s < ${COVERAGE_REFRESH_MIN_INTERVAL_MS/1000}s)`);
    return;
  }

  lastCoverageRefreshMs.value = now;
  console.log(`🔄 Checking coverage (force: ${force})...`);
  try {
    const result = await refreshCoverage(state.lesson.id);
    console.log(`✅ Coverage check completed. Points discussed: ${result.plan.filter(p => p.status === 'discussed').length}/${result.plan.length}`);
  } catch (e) {
    console.error(`❌ Coverage check error:`, e.message);
    info.value = `Błąd odświeżania pokrycia: ${e.message || "nieznany"}`;
  }
}

async function fetchLicenseStatus() {
  const demoInfoPrefix = "Tryb demo ogranicza czas lekcji live";
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) {
      demoMaxLiveMinutes.value = null;
      if (String(info.value || "").startsWith(demoInfoPrefix)) {
        info.value = "";
      }
      return;
    }

    const response = await fetch(`${API_BASE}/api/account/license-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      demoMaxLiveMinutes.value = null;
      if (String(info.value || "").startsWith(demoInfoPrefix)) {
        info.value = "";
      }
      return;
    }

    const isDemo = payload?.isDemoLicense === true || payload?.license?.demoMode === true;
    const maxMinutes = Number(payload?.demoLimits?.maxLiveMinutes || 0);
    demoMaxLiveMinutes.value = isDemo && maxMinutes > 0 ? maxMinutes : null;

    if (!isDemo && String(info.value || "").startsWith(demoInfoPrefix)) {
      info.value = "";
    }

    if (isDemo && maxMinutes > 0 && selectedLessonDurationMinutes.value > maxMinutes) {
      selectedLessonDurationMinutes.value = maxMinutes;
      info.value = `Tryb demo ogranicza czas lekcji live do ${maxMinutes} minut.`;
    }
  } catch {
    demoMaxLiveMinutes.value = null;
    if (String(info.value || "").startsWith(demoInfoPrefix)) {
      info.value = "";
    }
  }
}

function scheduleCoverageRefresh(forceImmediate = false) {
  if (!state.lesson?.id) return;

  // Force immediate check if requested (e.g., after transcription)
  if (forceImmediate) {
    console.log(`🚀 Forcing immediate coverage check`);
    void refreshCoverageThrottled(true);
    return;
  }

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

function autoScrollToBottom() {
  if (transcriptionContainer.value && !isUserScrolling.value) {
    const container = transcriptionContainer.value;
    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;

    // Only auto-scroll if user is near the bottom (within 100px)
    if (scrollHeight - scrollTop - clientHeight < 100) {
      container.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      });
    }
  }
}

// Track user scrolling behavior
function handleScroll() {
  if (!transcriptionContainer.value) return;
  const container = transcriptionContainer.value;
  const scrollPosition = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;
  const distanceFromBottom = scrollHeight - scrollPosition - clientHeight;

  // Detect if user is scrolling up (manually viewing earlier content)
  if (distanceFromBottom > 50) {
    isUserScrolling.value = true;
  } else if (distanceFromBottom < 20) {
    // User is back at the bottom, re-enable auto-scroll
    isUserScrolling.value = false;
  }

  lastScrollPosition.value = scrollPosition;
}

async function startSession() {
  try {
    error.value = "";
    await fetchLicenseStatus();
    if (!state.lesson) {
      error.value = "Brak lekcji. Najpierw utwórz plan.";
      return;
    }
    hydrateLessonProgressFromState();
    if (state.lesson.status !== "live") {
      await startLive(state.lesson.id);
      hydrateLessonProgressFromState();
    }
    if (timer.value) clearInterval(timer.value);
    timer.value = setInterval(() => {
      elapsedSec.value = Math.floor((Date.now() - startAt.value) / 1000);
      if (elapsedSec.value >= activeSessionDurationMinutes.value * 60) {
        info.value = `Osiągnięto ustawiony czas lekcji (${durationLabel.value}). Lekcja została zatrzymana automatycznie.`;
        stopSession();
      }
    }, 1000);

    info.value = "Uruchamiam mikrofon i transkrypcję Whisper...";
    isRecording.value = true; // Set to true BEFORE starting mic so monitorAudio doesn't stop
    try {
      await beginMic();
      info.value = "Whisper aktywny. Mów do mikrofonu - transkrypcja będzie aktualizowana co kilka sekund.";
    } catch (micError) {
      console.error('[startSession] Microphone error:', micError);
      error.value = `Nie udało się uruchomić mikrofonu: ${micError.message}`;
      sttStatus.value = "error";
      isRecording.value = false;
    }
  } catch (e) {
    console.error('[startSession] Error:', e);
    error.value = e.message;
    sttStatus.value = "error";
  }
}

function stopSession() {
  // Call cleanup function if it exists
  if (window.__whisperCleanup) {
    window.__whisperCleanup();
    window.__whisperCleanup = null;
  }

  mediaRecorder.value?.stop();
  mediaRecorder.value = null;
  isRecording.value = false;
  interimCaption.value = "";

  if (timer.value) clearInterval(timer.value);
  timer.value = null;

  if (window.__whisperActivityInterval) clearInterval(window.__whisperActivityInterval);
  window.__whisperActivityInterval = null;

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

  try {
    await startMicMeter();
  } catch (err) {
    sttStatus.value = "error";
    throw new Error(`Nie udało się uruchomić mikrofonu: ${err.message}`);
  }

  await beginWhisperMode();
}


async function beginWhisperMode() {
  console.log("[WhisperMode] Starting beginWhisperMode function");

  if (!micStream.value) {
    throw new Error("Nie udało się uruchomić strumienia mikrofonu.");
  }
  console.log("[WhisperMode] Mic stream available");

  // Set up Web Audio API for silence detection
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContextClass();

  // Resume AudioContext if it's suspended (required for user gesture)
  if (audioContext.state === 'suspended') {
    console.log("[WhisperMode] Resuming suspended AudioContext");
    await audioContext.resume();
  }

  const source = audioContext.createMediaStreamSource(micStream.value);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  let silenceStart = null;
  const SILENCE_THRESHOLD = 20; // Balanced threshold for speech detection
  const SILENCE_DURATION = 500; // 0.5 seconds of silence before sending (faster response)

  console.log(`[WhisperMode] Audio setup complete. Threshold: ${SILENCE_THRESHOLD}, Duration: ${SILENCE_DURATION}ms`);

  // Set up MediaRecorder
  let recorder;
  const supportedTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4"
  ];

  for (const type of supportedTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      try {
        recorder = new MediaRecorder(micStream.value, {
          mimeType: type,
          audioBitsPerSecond: 128000
        });
        break;
      } catch (e) {
        continue;
      }
    }
  }

  if (!recorder) {
    recorder = new MediaRecorder(micStream.value, {
      audioBitsPerSecond: 128000
    });
  }

  mediaRecorder.value = recorder;
  sttStatus.value = "listening";
  info.value = "Whisper aktywny. System wykrywa mowę i automatycznie wysyła fragmenty.";

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      audioChunks.value.push(event.data);
      lastChunkTime = Date.now();
      console.log(`📦 Audio chunk: ${event.data.size} bytes (total: ${audioChunks.value.length})`);
    }
  };

  // Function to send collected audio for transcription
  const sendAudioForTranscription = async () => {
    if (audioChunks.value.length === 0 || !state.lesson?.id) {
      return;
    }

    // Prevent duplicate transcriptions
    if (isTranscribing.value) {
      console.log("⏸️ Already transcribing, skipping duplicate");
      return;
    }

    isTranscribing.value = true;

    try {
      interimCaption.value = "Przetwarzanie audio...";

      const audioBlob = new Blob(audioChunks.value, { type: recorder.mimeType || 'audio/webm' });
      console.log(`🔊 Processing audio: ${audioBlob.size} bytes, ${audioChunks.value.length} chunks`);

      // More reasonable filtering - balance between filtering noise and capturing speech
      const minSize = 5000; // Minimum 5KB of audio
      const estimatedDurationMs = audioChunks.value.length * 1000; // ~1 second per chunk
      const minDuration = 1500; // Require at least 1.5 seconds of audio

      if (audioBlob.size < minSize || estimatedDurationMs < minDuration) {
        console.log(`❌ Audio too short: ${audioBlob.size}b / ${estimatedDurationMs}ms (min: ${minSize}b/${minDuration}ms)`);
        audioChunks.value.length = 0;
        interimCaption.value = "";
        return;
      }

      const blobType = audioBlob.type || 'audio/webm';
      const fileExt = blobType.includes('mp4') ? 'mp4' :
                     blobType.includes('ogg') ? 'ogg' : 'webm';

      const form = new FormData();
      form.set("lessonId", state.lesson.id);
      form.set("file", audioBlob, `audio-${Date.now()}.${fileExt}`);

      console.log(`[Transcribe] Sending to API: ${API_BASE}/api/transcribe`);

      const { data: authData } = await supabase.auth.getSession();
      const token = authData?.session?.access_token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE}/api/transcribe`, {
        method: "POST",
        headers,
        body: form
      });

      console.log(`📡 API status: ${response.status}`);

      const data = await response.json();

      if (!response.ok) {
        // Handle budget exceeded error specifically
        if (response.status === 402 || data.error === "Budget exceeded") {
          const errorMessage = "Limit kosztów transkrypcji został osiągnięty. Spróbuj ponownie później lub skontaktuj się z administratorem.";
          error.value = errorMessage;
          throw new Error(errorMessage);
        }
        throw new Error(data.error || data.message || "Błąd transkrypcji");
      }

      const text = String(data.text || "").trim();
      console.log(`📝 Transcription: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${text.length} chars)`);

      // Simplified filtering - only filter obvious single-word hallucinations
      const obviousHallucinations = /^(dziękuję|dzięki|dzień dobry|dobry wieczór|proszę|cześć|hej|hi|hello|thanks|please)$/i;
      const isValidTranscription = text &&
                              text.length > 5 && // Only require minimum length
                              !obviousHallucinations.test(text);

      if (isValidTranscription) {
        // Check if this text is already in the array to prevent duplicates
        const isDuplicate = transcription.value.includes(text);
        if (isDuplicate) {
          console.log(`⚠️ Duplicate skipped: "${text.substring(0, 30)}..."`);
        } else {
          transcription.value.push(text);
          console.log(`✅ Added transcription #${transcription.value.length}`);
          await nextTick();

          // Reset user scrolling flag when new content is added
          isUserScrolling.value = false;

          // Auto-scroll to bottom after adding new transcription
          autoScrollToBottom();

          await sendTranscript(state.lesson.id, text);

          // Small delay to prevent overwhelming the server, then check coverage
          setTimeout(() => {
            scheduleCoverageRefresh(true); // Force immediate coverage check after transcription
          }, 100);

          void updateCurrentCost(); // Update costs after successful transcription
        }
      } else {
        console.log(`❌ Filtered: "${text}" (hallucination/too short)`);
      }

      if (data.limitReached) {
        info.value = "Osiągnięto limit kosztów sesji.";
      }

      console.log("[Transcribe] ✅ Success");
    } catch (e) {
      console.error(`❌ Transcription error: ${e.message}`);
      error.value = `Błąd transkrypcji: ${e.message}`;
    } finally {
      interimCaption.value = "";
      audioChunks.value.length = 0;
      isTranscribing.value = false; // Reset transcription flag
      console.log(`🧹 Cleaned up`);
    }
  };

  recorder.onerror = (error) => {
    console.error("[MediaRecorder] Error:", error);
    sttStatus.value = "error";
    info.value = "Błąd nagrywania audio.";
  };

  recorder.onstart = () => {
    console.log("[MediaRecorder] Started successfully");
  };

  recorder.onstop = () => {
    console.log(`[MediaRecorder] Stopped. Chunks collected: ${audioChunks.value.length}`);
  };

  try {
    recorder.start(1000); // Start with 1 second intervals to get chunks
    console.log("[MediaRecorder] Start called with 1000ms interval");
  } catch (startErr) {
    console.error("[MediaRecorder] Failed to start:", startErr);
    audioContext.close();
    throw new Error(`Nie udało się uruchomić nagrywania: ${startErr.message}`);
  }

  // Monitor audio levels for silence detection
  let recordingStartTime = Date.now();
  const MAX_RECORDING_TIME = 30000; // Max 30 seconds before forcing send
  let frameCount = 0;
  let lastChunkTime = Date.now();
  let isMonitoring = true;

  const monitorAudio = () => {
    if (!isRecording.value && frameCount > 10) {
      console.log("🛑 Monitor stopped - recording inactive");
      audioContext.close();
      isMonitoring = false;
      return;
    }

    if (!isMonitoring) return;

    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;

    // Update mic level for UI
    micLevel.value = Math.min(100, average);

    frameCount++;

    // Status logging every 60 frames
    if (frameCount % 60 === 0) {
      console.log(`🎤 Recording active | Level: ${average.toFixed(1)} | Chunks: ${audioChunks.value.length}`);
    }

    // Force send after max recording time
    const recordingDuration = Date.now() - recordingStartTime;
    if (recordingDuration > MAX_RECORDING_TIME && audioChunks.value.length > 0) {
      console.log(`⏱️ Max time reached, forcing transcription`);
      sendAudioForTranscription();
      recorder.stop();
      audioChunks.value.length = 0;
      recorder.start(1000);
      recordingStartTime = Date.now();
      silenceStart = null;
      requestAnimationFrame(monitorAudio);
      return;
    }

    // Detect silence or speech
    if (average > SILENCE_THRESHOLD) {
      silenceStart = null;
      if (frameCount % 60 === 0) {
        info.value = `Mowa wykryta (poziom: ${Math.round(average)})`;
      }
    } else if (silenceStart === null) {
      silenceStart = Date.now();
    } else {
      // Check if silence has lasted long enough
      const silenceDuration = Date.now() - silenceStart;
      if (silenceDuration >= SILENCE_DURATION && audioChunks.value.length > 0) {
        console.log(`⏸️ Silence detected, sending transcription`);
        sendAudioForTranscription();
        recorder.stop();
        audioChunks.value.length = 0;
        recorder.start(1000);
        recordingStartTime = Date.now();
        silenceStart = null;
      } else if (frameCount % 60 === 0) {
        info.value = `Czekam na mowę... (${Math.round(silenceDuration/1000)}s ciszy)`;
      }
    }

    requestAnimationFrame(monitorAudio);
  };

  // Start monitoring
  console.log("[WhisperMode] Starting audio monitoring");
  monitorAudio();

  // Store cleanup function
  window.__whisperCleanup = () => {
    console.log("[WhisperMode] Cleanup called");
    audioContext.close();
    if (audioChunks.value.length > 0) {
      console.log("[WhisperMode] Sending remaining chunks during cleanup");
      sendAudioForTranscription();
    }
  };
  console.log("[WhisperMode] ✅ beginWhisperMode completed successfully");
}

async function loadMicDevices() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Przeglądarka nie obsługuje API mediów. Spróbuj użyć innej przeglądarki.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    const devices = await navigator.mediaDevices.enumerateDevices();
    micDevices.value = devices.filter((d) => d.kind === "audioinput");
  } catch (err) {
    micDevices.value = [];

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      error.value = "Odmówiono dostępu do mikrofonu. Sprawdź ustawienia przeglądarki i przyznaj uprawnienia.";
    } else if (err.name === 'NotFoundError') {
      error.value = "Nie znaleziono mikrofonu. Podłącz mikrofon i spróbuj ponownie.";
    } else if (err.name === 'NotReadableError') {
      error.value = "Mikrofon jest zajęty przez inną aplikację. Zamknij inne aplikacje używające mikrofonu.";
    } else {
      error.value = `Nie udało się załadować urządzeń audio: ${err.message || 'Sprawdź uprawnienia'}`;
    }
  }
}

async function startMicMeter() {
  // Reuse existing stream if available and live
  if (micStream.value && micStream.value.getAudioTracks().some(t => t.readyState === 'live')) {
    if (audioContext.value) {
      audioContext.value.close();
      audioContext.value = null;
    }
    analyserNode.value = null;
    micLevel.value = 10;
    return;
  }

  // Need to get a new stream
  const constraints = selectedMicId.value
    ? { audio: { deviceId: { exact: selectedMicId.value } } }
    : { audio: true };
  try {
    micStream.value = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    throw new Error(`Nie udało się uzyskać dostępu do mikrofonu: ${err.message || 'Sprawdź uprawnienia'}`);
  }

  micLevel.value = 10;
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

async function updateCurrentCost() {
  if (!state.lesson?.id) return;
  try {
    const { data: authData } = await supabase.auth.getSession();
    const token = authData?.session?.access_token;
    const response = await fetch(`${API_BASE}/api/lessons/${state.lesson.id}/costs`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (response.ok) {
      const data = await response.json();
      currentCost.value = data.total || 0;
      costLimit.value = data.limit || 3.5;
    }
  } catch (e) {
    console.error("Failed to fetch costs:", e);
  }
}

async function startMicTest() {
  try {
    error.value = "";
    info.value = "Tryb testu: mów do mikrofonu - Whisper przetworzy Twój głos.";
    micTestActive.value = true;
    await beginMic();
  } catch (e) {
    micTestActive.value = false;
    error.value = e.message;
  }
}

function stopMicTest() {
  // Call cleanup function if it exists
  if (window.__whisperCleanup) {
    window.__whisperCleanup();
    window.__whisperCleanup = null;
  }

  mediaRecorder.value?.stop();
  mediaRecorder.value = null;
  if (window.__whisperActivityInterval) clearInterval(window.__whisperActivityInterval);
  window.__whisperActivityInterval = null;

  micTestActive.value = false;
  interimCaption.value = "";
  lastFinalCaption.value = "";
  sttStatus.value = "idle";

  stopMicMeter();
  micLevel.value = 0;
}

function goPresentation() {
  if (!state.lesson) return;
  router.push(`/presentation/${state.lesson.id}`);
}

async function finalizeNow() {
  if (!state.lesson || isFinalizingLesson.value) return;
  try {
    isFinalizingLesson.value = true;
    error.value = "";
    stopSession();
    const note = await finalizeLesson(state.lesson.id, window.location.origin);
    if (state.lesson) {
      state.lesson = {
        ...state.lesson,
        status: "finished",
        finishedAt: new Date().toISOString()
      };
    }
    router.push(`/archive?note=${encodeURIComponent(note.shareUrl)}`);
  } catch (e) {
    error.value = e.message || "Nie udało się zakończyć lekcji.";
  } finally {
    isFinalizingLesson.value = false;
  }
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

async function resetCosts() {
  if (!state.lesson?.id) return;
  try {
    error.value = "";
    const { data: authData } = await supabase.auth.getSession();
    const token = authData?.session?.access_token;
    const response = await fetch(`${API_BASE}/api/lessons/${state.lesson.id}/costs`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (response.ok) {
      const data = await response.json();
      info.value = data.message || "Koszty zostały zresetowane.";
      await updateCurrentCost();
    } else {
      throw new Error("Nie udało się zresetować kosztów");
    }
  } catch (e) {
    error.value = e.message || "Błąd podczas resetowania kosztów";
  }
}
</script>
