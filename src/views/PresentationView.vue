<template>
  <div v-if="isPresenting" class="fixed inset-0 bg-black text-white">
    <button class="absolute right-4 top-4 z-50 rounded-lg bg-white/20 px-3 py-2 text-white" @click="exitPresentation">X</button>

    <div class="h-full flex flex-col">
      <div class="flex-1 flex items-center justify-center p-12">
        <div class="max-w-5xl w-full">
          <div class="rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 p-12 text-white shadow-2xl">
            <div class="mb-8">
              <p class="mb-3 text-sm uppercase tracking-[0.18em] text-white/70">{{ slideTypeLabel(current.type) }}</p>
              <h1 class="text-5xl font-bold mb-4">{{ current.title }}</h1>
              <p v-if="current.subtitle" class="mb-5 text-lg text-white/85">{{ current.subtitle }}</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="k in current.details" :key="k" class="px-4 py-2 bg-white/20 rounded-full text-lg">{{ k }}</span>
              </div>
            </div>
            <p class="text-2xl leading-relaxed opacity-90 mb-8">{{ current.summary }}</p>
            <div class="bg-white/10 rounded-2xl p-8 border-2 border-white/20">
              <div class="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <p class="text-xl opacity-70 text-center px-6">{{ current.visualHint || "[Sugerowana wizualizacja slajdu]" }}</p>
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

const current = computed(() => slides.value[slideIndex.value] || { type: "concept", title: "", subtitle: "", details: [], summary: "", visualHint: "" });
const availableLessons = computed(() => (Array.isArray(state.lessons) ? state.lessons : []));
const hasLessons = computed(() => availableLessons.value.length > 0);
const availableNotes = computed(() => (Array.isArray(state.notes) ? state.notes : []));
const selectedLesson = computed(() => availableLessons.value.find((lesson) => lesson.id === selectedLessonId.value) || null);
const selectedNote = computed(() => availableNotes.value.find((note) => note.id === selectedNoteId.value) || null);
const preparedSlides = computed(() => {
  const plan = Array.isArray(selectedLesson.value?.plan) ? selectedLesson.value.plan : [];
  if (presentationScope.value === "full") {
    return plan;
  }
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

async function startGeneratedPresentation() {
  if (!preparedSlides.value.length) return;

  isGenerating.value = true;
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

    if (!generatedSlides.length) return;
    savePresentationSnapshot(generatedSlides);
    startPresentation(generatedSlides);
    loadPresentationHistory();
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

function slideTypeLabel(type) {
  const value = String(type || "").toLowerCase();
  if (value === "title") return "Slajd tytułowy";
  if (value === "agenda") return "Agenda";
  if (value === "concept") return "Koncepcja";
  if (value === "example") return "Przykład";
  if (value === "comparison") return "Porównanie";
  if (value === "practice") return "Ćwiczenie";
  if (value === "summary") return "Podsumowanie";
  if (value === "next_steps") return "Następne kroki";
  return "Slajd";
}
</script>
