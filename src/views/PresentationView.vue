<template>
  <div v-if="isPresenting" class="fixed inset-0 bg-black text-white">
    <button class="absolute right-4 top-4 z-50 rounded-lg bg-white/20 px-3 py-2 text-white" @click="exitPresentation">X</button>

    <div class="h-full flex flex-col">
      <div class="flex-1 flex items-center justify-center p-12">
        <div class="max-w-5xl w-full">
          <div class="rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 p-12 text-white shadow-2xl">
            <div class="mb-8">
              <h1 class="text-5xl font-bold mb-4">{{ current.point.title }}</h1>
              <div class="flex flex-wrap gap-2">
                <span v-for="k in current.point.keywords" :key="k" class="px-4 py-2 bg-white/20 rounded-full text-lg">{{ k }}</span>
              </div>
            </div>
            <p class="text-2xl leading-relaxed opacity-90 mb-8">{{ current.point.description }}</p>
            <div class="bg-white/10 rounded-2xl p-8 border-2 border-white/20">
              <div class="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <p class="text-xl opacity-70">[Grafika DALL-E 3]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-900 border-t border-gray-700 px-8 py-4">
        <div class="max-w-5xl mx-auto flex items-center justify-between text-white">
          <button :disabled="slideIndex === 0" @click="slideIndex -= 1" class="px-3 py-2 rounded border border-white/30 disabled:opacity-30">
            Poprzedni
          </button>
          <div>{{ slideIndex + 1 }} / {{ slides.length }}</div>
          <button :disabled="slideIndex === slides.length - 1" @click="slideIndex += 1" class="px-3 py-2 rounded border border-white/30 disabled:opacity-30">
            NastÄ™pny
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="isGenerating" class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900 text-white">
    <div class="text-center text-white">
      <h2 class="text-3xl font-bold mb-2">GenerujÄ™ prezentacjÄ™...</h2>
      <p class="text-purple-200">TworzÄ™ slajdy z nieomĂłwionych punktĂłw.</p>
    </div>
  </div>

  <div v-else class="bg-[#f7f9fc] dark:bg-background min-h-[calc(100vh-64px)] relative overflow-x-hidden p-8 md:p-12 pb-14 w-full">
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <header class="mb-7 relative z-10 w-full text-left">
      <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] dark:text-foreground text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
        Generator prezentacji
      </h2>
      <p class="font-['Plus_Jakarta_Sans'] text-[#454652] dark:text-muted-foreground text-[18px] leading-[28px] font-normal">
        TwĂłrz prezentacje z wybranej lekcji i wracaj do poprzednich wersji.
      </p>
    </header>

    <div class="bg-white dark:bg-card border border-transparent dark:border-border rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 w-full relative z-10 mb-7">
      <h3 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] dark:text-foreground text-[18px] leading-[28px] mb-6">
        Podstawowe informacje
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div class="flex flex-col gap-2 w-full">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] dark:text-muted-foreground text-[14px]">Wybierz lekcjÄ™</label>
          <select
            v-model="selectedLessonId"
            :disabled="!hasLessons"
            class="bg-[#e0e3e6] dark:bg-input-background border border-transparent dark:border-border h-[48px] rounded-lg w-full px-4 text-[16px] text-[#454652] dark:text-foreground font-['Plus_Jakarta_Sans'] outline-none focus:ring-2 focus:ring-[#0c3dfe]/50"
          >
            <option v-if="!hasLessons" value="">Brak dostÄ™pnych lekcji</option>
            <option v-for="lesson in availableLessons" :key="lesson.id" :value="lesson.id">
              {{ lesson.title || "Bez tytuĹ‚u" }}{{ lesson.subject ? ` (${lesson.subject})` : "" }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] dark:text-muted-foreground text-[14px]">Zakres prezentacji</label>
          <select
            v-model="presentationScope"
            class="bg-[#e0e3e6] dark:bg-input-background border border-transparent dark:border-border h-[48px] rounded-lg w-full px-4 text-[16px] text-[#454652] dark:text-foreground font-['Plus_Jakarta_Sans'] outline-none focus:ring-2 focus:ring-[#0c3dfe]/50"
          >
            <option value="full">CaĹ‚a lekcja</option>
            <option value="pending">Tylko nieomĂłwione punkty</option>
          </select>
        </div>
      </div>
      <p class="mt-5 font-['Plus_Jakarta_Sans'] text-[14px] text-[#454652] dark:text-muted-foreground">
        Liczba slajdĂłw do wygenerowania: <span class="font-bold text-[#191c1e] dark:text-foreground">{{ preparedSlides.length }}</span>
      </p>
      <p v-if="!hasLessons" class="mt-2 font-['Plus_Jakarta_Sans'] text-[13px] text-[#b54747]">
        Brak lekcji w archiwum. Najpierw utwĂłrz lekcjÄ™, aby wygenerowaÄ‡ prezentacjÄ™.
      </p>
    </div>

    <div class="bg-white dark:bg-card border border-transparent dark:border-border rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 w-full relative z-10 mb-7">
      <div class="flex items-center justify-between mb-8 w-full">
        <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] dark:text-foreground text-[18px] leading-[28px]">
          Poprzednie prezentacje
        </h3>
        <button
          type="button"
          class="bg-[#0c3dfe] text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px] px-8 py-2.5 rounded-lg transition-colors hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50"
          :disabled="!preparedSlides.length"
          @click="startGeneratedPresentation"
        >
          Generuj prezentacjÄ™
        </button>
      </div>

      <div class="flex flex-wrap gap-4 items-center w-full">
        <button
          v-for="item in presentationHistory"
          :key="item.id"
          type="button"
          @click="selectedPresentation = item"
          :class="[
            'flex items-center gap-3 min-h-[63px] py-3 pl-[15px] pr-[16px] rounded-[8px] transition-all text-left w-[260px]',
            selectedPresentation?.id === item.id
              ? 'bg-[#0c3dfe] text-white shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)]'
              : 'bg-[#e4e4e4] text-[#2a3439] hover:bg-[#d4d4d4] shadow-[0px_10px_15px_0px_rgba(20,37,136,0.07)]'
          ]"
        >
          <svg class="h-[20px] w-[20px] shrink-0 fill-current opacity-90" viewBox="0 0 20 20">
            <path d="M7 2h7l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h3zm1 0v4h4L8 2zm8 16V7h-5V2H4v16h14zm-4-4v2H7v-2h7zm2-4v2H7v-2h9z" />
          </svg>
          <div class="flex flex-col justify-center font-['Plus_Jakarta_Sans'] font-bold text-[14px]">
            <p class="leading-[18px] truncate max-w-[180px]">{{ item.title }}</p>
            <p
              class="leading-[18px] font-medium text-[12px] opacity-80 truncate max-w-[180px] mt-0.5"
              :class="selectedPresentation?.id === item.id ? 'text-white' : 'text-[#454652]'"
            >
              {{ item.createdAtLabel }} â€˘ {{ item.slideCount }} slajdĂłw
            </p>
          </div>
        </button>

        <p v-if="!presentationHistory.length" class="text-sm font-['Plus_Jakarta_Sans'] text-muted-foreground w-full">
          Brak dostÄ™pnych prezentacji. Wygeneruj prezentacjÄ™ klikajÄ…c przycisk.
        </p>
      </div>
    </div>

    <div class="bg-white dark:bg-card border border-transparent dark:border-border rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 md:p-8 w-full relative z-10 mb-7">
      <div class="flex items-center justify-end gap-3 w-full">
        <button
          type="button"
          @click="$router.back()"
          class="bg-[#f2f2f2] dark:bg-muted text-[#454652] dark:text-foreground font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-6 py-2.5 rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-muted/80 transition-colors"
        >
          Anuluj
        </button>
        <button
          type="button"
          :disabled="!selectedPresentation"
          @click="openSavedPresentation(selectedPresentation)"
          class="bg-[#0c3dfe] text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-8 py-2.5 rounded-lg transition-colors hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50"
        >
          OtwĂłrz wybranÄ…
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";

const PRESENTATION_HISTORY_KEY = "coteach:presentation-history";

const route = useRoute();
const { state, fetchLessons } = useLessonStore();

const isGenerating = ref(false);
const isPresenting = ref(false);
const slides = ref([]);
const slideIndex = ref(0);
const presentationHistory = ref([]);
const selectedPresentation = ref(null);
const selectedLessonId = ref("");
const presentationScope = ref("pending");

const current = computed(() => slides.value[slideIndex.value] || { point: { title: "", keywords: [], description: "" } });
const availableLessons = computed(() => (Array.isArray(state.lessons) ? state.lessons : []));
const hasLessons = computed(() => availableLessons.value.length > 0);
const selectedLesson = computed(() => availableLessons.value.find((lesson) => lesson.id === selectedLessonId.value) || null);
const preparedSlides = computed(() => {
  const plan = Array.isArray(selectedLesson.value?.plan) ? selectedLesson.value.plan : [];
  if (presentationScope.value === "full") {
    return plan.map((point) => ({ point, imageUrl: "" }));
  }
  return plan
    .filter((point) => point.status !== "discussed")
    .map((point) => ({ point, imageUrl: "" }));
});

onMounted(async () => {
  const lessonsResponse = await fetchLessons();
  const lessons = Array.isArray(lessonsResponse) ? lessonsResponse : [];
  const routeLessonId = String(route.params.lessonId || "");
  const byRoute = lessons.find((lesson) => lesson.id === routeLessonId);
  const byCurrent = state.lesson?.id ? lessons.find((lesson) => lesson.id === state.lesson.id) : null;
  const initialLesson = byRoute || byCurrent || lessons[0] || null;
  selectedLessonId.value = initialLesson?.id || "";
  state.lesson = initialLesson;
  loadPresentationHistory();
});

watch(selectedLesson, (lesson) => {
  state.lesson = lesson || null;
});

function loadPresentationHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PRESENTATION_HISTORY_KEY) || "[]");
    presentationHistory.value = Array.isArray(parsed) ? parsed : [];
    selectedPresentation.value = presentationHistory.value[0] || null;
  } catch {
    presentationHistory.value = [];
    selectedPresentation.value = null;
  }
}

function persistPresentationHistory() {
  localStorage.setItem(PRESENTATION_HISTORY_KEY, JSON.stringify(presentationHistory.value.slice(0, 15)));
}

function buildPresentationTitle() {
  const subject = selectedLesson.value?.subject || selectedLesson.value?.title || "Prezentacja";
  const scopeLabel = presentationScope.value === "full" ? "caĹ‚a lekcja" : "nieomĂłwione punkty";
  return `${subject} - ${scopeLabel} (${new Date().toLocaleDateString("pl-PL")})`;
}

function savePresentationSnapshot(currentSlides) {
  const createdAt = new Date().toISOString();
  presentationHistory.value.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: buildPresentationTitle(),
    createdAt,
    createdAtLabel: new Date(createdAt).toLocaleString("pl-PL"),
    slideCount: currentSlides.length,
    slides: currentSlides
  });
  persistPresentationHistory();
}

function startPresentation(currentSlides) {
  slides.value = currentSlides;
  slideIndex.value = 0;
  isPresenting.value = true;
}

function startGeneratedPresentation() {
  if (!preparedSlides.value.length) return;

  isGenerating.value = true;
  setTimeout(() => {
    const generatedSlides = preparedSlides.value.map((slide) => ({
      point: {
        title: slide.point.title,
        keywords: Array.isArray(slide.point.keywords) ? slide.point.keywords : [],
        description: slide.point.description || ""
      },
      imageUrl: ""
    }));
    savePresentationSnapshot(generatedSlides);
    startPresentation(generatedSlides);
    isGenerating.value = false;
    loadPresentationHistory();
  }, 900);
}

function openSavedPresentation(item) {
  const storedSlides = Array.isArray(item?.slides) ? item.slides : [];
  if (!storedSlides.length) return;
  startPresentation(storedSlides);
}

function exitPresentation() {
  isPresenting.value = false;
}
</script>
