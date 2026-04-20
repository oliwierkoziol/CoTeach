<template>
  <div v-if="isPresenting" class="fixed inset-0 z-[120] bg-[#05070f] text-white">
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-white/10 bg-black/35 px-4 py-3 sm:px-6">
        <button
          class="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          @click="exitPresentation"
        >
          Zakończ prezentację
        </button>
        <div class="text-sm text-white/80">{{ slideIndex + 1 }} / {{ slides.length }}</div>
        <button
          class="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          @click="openPresentationWindow"
        >
          Otwórz w nowym oknie
        </button>
      </div>

      <div class="flex-1 overflow-auto p-4 sm:p-8 lg:p-10">
        <div class="mx-auto w-full max-w-6xl rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 p-6 shadow-2xl sm:p-10 lg:p-14">
          <h1 class="mb-5 text-3xl font-extrabold leading-tight sm:text-5xl">{{ current.title }}</h1>
          <p v-if="current.subtitle" class="mb-4 text-lg text-white/85 sm:text-xl">{{ current.subtitle }}</p>
          <div class="mb-6 flex flex-wrap gap-2 sm:gap-3">
            <span
              v-for="k in current.details"
              :key="k"
              class="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold text-white sm:px-4 sm:py-2 sm:text-base"
            >
              {{ k }}
            </span>
          </div>
          <p class="mb-8 text-lg leading-relaxed text-white/95 sm:text-2xl">{{ current.summary }}</p>
          <div class="rounded-2xl border border-white/20 bg-white/10 p-5 sm:p-7">
            <div class="aspect-video rounded-xl bg-black/20 p-4">
              <p class="text-base text-white/80 sm:text-lg">{{ current.visualHint || "Podpowiedź wizualna pojawi się tutaj." }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-white/10 bg-black/35 px-4 py-3 sm:px-6">
        <div class="mx-auto flex w-full max-w-6xl items-center justify-between">
          <button
            :disabled="slideIndex === 0"
            @click="slideIndex -= 1"
            class="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-30 sm:px-5 sm:text-base"
          >
            Poprzedni
          </button>
          <button
            :disabled="slideIndex === slides.length - 1"
            @click="slideIndex += 1"
            class="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-30 sm:px-5 sm:text-base"
          >
            Następny
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="isGenerating" class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900 text-white">
    <div class="text-center text-white">
      <h2 class="text-3xl font-bold mb-2">Generuję prezentację...</h2>
      <p class="text-purple-200">Tworzę slajdy na podstawie notatki, planu i poziomu klasy.</p>
    </div>
  </div>

  <div v-else class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] relative overflow-x-hidden p-8 md:p-12 pb-14 w-full">
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <header class="mb-7 relative z-10 w-full text-left">
      <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
        Generator prezentacji
      </h2>
      <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-[28px] font-normal">
        Twórz prezentacje z wybranej lekcji i notatki, dopasowane do poziomu klasy.
      </p>
    </header>

    <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 w-full relative z-10 mb-7">
      <h3 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[18px] leading-[28px] mb-6">
        Podstawowe informacje
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div class="flex flex-col gap-2 w-full">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Wybierz lekcję</label>
          <select
            v-model="selectedLessonId"
            :disabled="!hasLessons"
            class="bg-[#e0e3e6] h-[48px] rounded-lg w-full px-4 text-[16px] text-[#454652] font-['Plus_Jakarta_Sans'] outline-none border-none focus:ring-2 focus:ring-[#0c3dfe]/50"
          >
            <option v-if="!hasLessons" value="">Brak dostępnych lekcji</option>
            <option v-for="lesson in availableLessons" :key="lesson.id" :value="lesson.id">
              {{ lesson.title || "Bez tytułu" }}{{ lesson.subject ? ` (${lesson.subject})` : "" }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Zakres prezentacji</label>
          <select
            v-model="presentationScope"
            class="bg-[#e0e3e6] h-[48px] rounded-lg w-full px-4 text-[16px] text-[#454652] font-['Plus_Jakarta_Sans'] outline-none border-none focus:ring-2 focus:ring-[#0c3dfe]/50"
          >
            <option value="full">Cała lekcja</option>
            <option value="pending">Tylko nieomówione punkty</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-5">
        <div class="flex flex-col gap-2 w-full">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Notatka źródłowa</label>
          <select
            v-model="selectedNoteId"
            class="bg-[#e0e3e6] h-[48px] rounded-lg w-full px-4 text-[16px] text-[#454652] font-['Plus_Jakarta_Sans'] outline-none border-none focus:ring-2 focus:ring-[#0c3dfe]/50"
          >
            <option value="">Automatycznie z lekcji</option>
            <option v-for="note in availableNotes" :key="note.id" :value="note.id">
              {{ note.title || "Bez tytułu" }}{{ note.subject ? ` (${note.subject})` : "" }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Poziom klasy</label>
          <input
            v-model="selectedClassLevel"
            class="bg-[#e0e3e6] h-[48px] rounded-lg w-full px-4 text-[16px] text-[#454652] font-['Plus_Jakarta_Sans'] outline-none border-none focus:ring-2 focus:ring-[#0c3dfe]/50"
            placeholder="np. 6 Szkoła Podstawowa"
          />
        </div>
      </div>

      <p class="mt-5 font-['Plus_Jakarta_Sans'] text-[14px] text-[#454652]">
        Liczba slajdów do wygenerowania: <span class="font-bold text-[#191c1e]">{{ preparedSlides.length }}</span>
      </p>
      <p v-if="!hasLessons" class="mt-2 font-['Plus_Jakarta_Sans'] text-[13px] text-[#b54747]">
        Brak lekcji w archiwum. Najpierw utwórz lekcję, aby wygenerować prezentację.
      </p>
    </div>

    <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 w-full relative z-10 mb-7">
      <div class="flex items-center justify-between mb-8 w-full">
        <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px]">
          Poprzednie prezentacje
        </h3>
        <button
          type="button"
          class="bg-[#0c3dfe] text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px] px-8 py-2.5 rounded-lg transition-colors hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50"
          :disabled="!preparedSlides.length || isGenerating"
          @click="startGeneratedPresentation"
        >
          Generuj prezentację
        </button>
      </div>

      <div
        v-if="generationMessage"
        class="mb-5 rounded-[10px] border border-emerald-300 bg-emerald-50 px-4 py-3 text-[14px] font-['Plus_Jakarta_Sans'] text-emerald-800"
      >
        {{ generationMessage }}
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
              {{ item.createdAtLabel }} • {{ item.slideCount }} slajdów
            </p>
          </div>
        </button>

        <p v-if="!presentationHistory.length" class="text-sm font-['Plus_Jakarta_Sans'] text-muted-foreground w-full">
          Brak dostępnych prezentacji. Wygeneruj prezentację klikając przycisk.
        </p>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 md:p-8 w-full relative z-10 mb-7">
      <div class="flex items-center justify-end gap-3 w-full">
        <button
          type="button"
          @click="$router.back()"
          class="bg-[#f2f2f2] text-[#454652] font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-6 py-2.5 rounded-lg hover:bg-[#e5e5e5] transition-colors"
        >
          Anuluj
        </button>
        <button
          type="button"
          :disabled="!selectedPresentation"
          @click="openSavedPresentation(selectedPresentation)"
          class="bg-[#0c3dfe] text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-8 py-2.5 rounded-lg transition-colors hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50"
        >
          Otwórz wybraną
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
const { state, fetchLessons, fetchTeacherNotes, generatePresentation } = useLessonStore();

const isGenerating = ref(false);
const isPresenting = ref(false);
const slides = ref([]);
const slideIndex = ref(0);
const presentationHistory = ref([]);
const selectedPresentation = ref(null);
const selectedLessonId = ref("");
const presentationScope = ref("pending");
const selectedNoteId = ref("");
const selectedClassLevel = ref("");
const generationMessage = ref("");

const current = computed(() => slides.value[slideIndex.value] || { type: "concept", title: "", subtitle: "", details: [], summary: "", visualHint: "" });
const availableLessons = computed(() => (Array.isArray(state.lessons) ? state.lessons : []));
const hasLessons = computed(() => availableLessons.value.length > 0);
const availableNotes = computed(() => (Array.isArray(state.notes) ? state.notes : []));
const selectedLesson = computed(() => availableLessons.value.find((lesson) => lesson.id === selectedLessonId.value) || null);
const selectedNote = computed(() => availableNotes.value.find((note) => note.id === selectedNoteId.value) || null);
const preparedSlides = computed(() => {
  const plan = Array.isArray(selectedLesson.value?.plan) ? selectedLesson.value.plan : [];
  if (presentationScope.value === "full") return plan;
  return plan.filter((point) => point.status !== "discussed");
});

onMounted(async () => {
  const [lessonsResponse] = await Promise.all([fetchLessons(), fetchTeacherNotes()]);
  const lessons = Array.isArray(lessonsResponse) ? lessonsResponse : [];
  const routeLessonId = String(route.params.lessonId || "");
  const byRoute = lessons.find((lesson) => lesson.id === routeLessonId);
  const byCurrent = state.lesson?.id ? lessons.find((lesson) => lesson.id === state.lesson.id) : null;
  const initialLesson = byRoute || byCurrent || lessons[0] || null;
  selectedLessonId.value = initialLesson?.id || "";
  selectedClassLevel.value = selectedNote.value?.classLevel || "";
  state.lesson = initialLesson;
  loadPresentationHistory();
});

watch(selectedLesson, (lesson) => {
  state.lesson = lesson || null;
});

watch(selectedNote, (note) => {
  if (!selectedClassLevel.value && note?.classLevel) {
    selectedClassLevel.value = note.classLevel;
  }
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
  localStorage.setItem(PRESENTATION_HISTORY_KEY, JSON.stringify(presentationHistory.value.slice(0, 20)));
}

function buildPresentationTitle() {
  const subject = selectedLesson.value?.subject || selectedLesson.value?.title || selectedNote.value?.title || "Prezentacja";
  const scopeLabel = presentationScope.value === "full" ? "cała lekcja" : "nieomówione punkty";
  return `${subject} - ${scopeLabel} (${new Date().toLocaleDateString("pl-PL")})`;
}

function savePresentationSnapshot(currentSlides) {
  const createdAt = new Date().toISOString();
  const item = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: buildPresentationTitle(),
    createdAt,
    createdAtLabel: new Date(createdAt).toLocaleString("pl-PL"),
    slideCount: currentSlides.length,
    slides: currentSlides
  };
  presentationHistory.value.unshift(item);
  persistPresentationHistory();
  return item;
}

function startPresentation(currentSlides) {
  slides.value = currentSlides;
  slideIndex.value = 0;
  isPresenting.value = true;
}

async function startGeneratedPresentation() {
  if (!preparedSlides.value.length) return;

  isGenerating.value = true;
  generationMessage.value = "";
  try {
    const generated = await generatePresentation({
      lessonId: selectedLesson.value?.id || "",
      noteId: selectedNote.value?.id || "",
      classLevel: selectedClassLevel.value || selectedNote.value?.classLevel || "",
      scope: presentationScope.value,
      maxSlides: 12
    });
    const generatedSlides = (generated?.slides || [])
      .map((slide) => ({
        id: slide.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: String(slide.type || "concept").trim().toLowerCase(),
        title: String(slide.title || "").trim(),
        subtitle: String(slide.subtitle || "").trim(),
        summary: String(slide.summary || "").trim(),
        details: Array.isArray(slide.details) ? slide.details.map((item) => String(item || "").trim()).filter(Boolean) : [],
        visualHint: String(slide.visualHint || "").trim()
      }))
      .filter((slide) => slide.title || slide.summary || slide.details.length);

    if (!generatedSlides.length) {
      generationMessage.value = "Nie udało się wygenerować slajdów dla wybranych danych.";
      return;
    }

    const savedItem = savePresentationSnapshot(generatedSlides);
    selectedPresentation.value = savedItem;
    generationMessage.value = `Wygenerowano prezentację (${savedItem.slideCount} slajdów). Kliknij "Otwórz wybraną", aby ją wyświetlić.`;
  } finally {
    isGenerating.value = false;
  }
}

function openSavedPresentation(item) {
  const storedSlides = Array.isArray(item?.slides) ? item.slides : [];
  if (!storedSlides.length) return;
  startPresentation(storedSlides);
}

function exitPresentation() {
  isPresenting.value = false;
}

function openPresentationWindow() {
  const url = window.location.href;
  window.open(url, "_blank", "noopener,noreferrer");
}
</script>
