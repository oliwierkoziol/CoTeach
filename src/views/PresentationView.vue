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

      <div class="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
        <div :class="['mx-auto h-full max-h-full w-full max-w-6xl rounded-3xl p-5 shadow-2xl sm:p-7 lg:p-9', activeTheme.wrapperClass]">
          <div class="flex h-full min-h-0 flex-col">
            <div class="mb-3">
              <h1 class="clamp-2 text-2xl font-extrabold leading-tight sm:text-4xl">{{ current.title }}</h1>
              <p v-if="current.subtitle" class="clamp-2 mt-2 text-base text-white/85 sm:text-lg">{{ current.subtitle }}</p>
            </div>

            <div class="mb-3 flex flex-wrap gap-2">
              <span
                v-for="k in currentDetailChips"
                :key="k"
                class="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white sm:text-sm"
              >
                {{ k }}
              </span>
            </div>

            <div class="min-h-0 flex-1">
              <div v-if="isComparisonLayout" class="grid h-full min-h-0 grid-cols-2 gap-3">
                <div :class="['rounded-xl border p-4', activeTheme.panelClass]">
                  <p class="mb-2 text-sm font-semibold text-white/80">Aspekt A</p>
                  <p class="clamp-8 text-sm text-white/95">{{ comparisonLeft }}</p>
                </div>
                <div :class="['rounded-xl border p-4', activeTheme.panelClass]">
                  <p class="mb-2 text-sm font-semibold text-white/80">Aspekt B</p>
                  <p class="clamp-8 text-sm text-white/95">{{ comparisonRight }}</p>
                </div>
              </div>

              <div v-else-if="isAgendaLayout" :class="['h-full rounded-xl border p-4', activeTheme.panelClass]">
                <p class="mb-3 text-sm font-semibold text-white/80">Agenda slajdu</p>
                <ul class="space-y-2">
                  <li v-for="(item, i) in currentDetailChips.slice(0, 6)" :key="`${i}-${item}`" class="flex gap-2 text-sm text-white/95">
                    <span class="font-bold text-white/80">{{ i + 1 }}.</span>
                    <span class="clamp-2">{{ item }}</span>
                  </li>
                </ul>
                <p class="clamp-5 mt-4 text-sm text-white/90">{{ currentMainText }}</p>
              </div>

              <div v-else-if="isPracticeLayout" :class="['h-full rounded-xl border p-4', activeTheme.panelClass]">
                <p class="mb-2 text-sm font-semibold text-white/80">Ćwiczenie</p>
                <p class="clamp-5 mb-3 text-sm text-white/95">{{ currentMainText }}</p>
                <div :class="['rounded-lg p-3', activeTheme.innerPanelClass]">
                  <p class="clamp-5 text-sm text-white/85">{{ current.visualHint || "Zadanie: podaj przykład i krótko uzasadnij odpowiedź." }}</p>
                </div>
              </div>

              <div v-else :class="['h-full rounded-xl border p-4', activeTheme.panelClass]">
                <p class="clamp-8 text-sm leading-relaxed text-white/95 sm:text-base">{{ currentMainText }}</p>
                <div :class="['mt-3 rounded-lg p-3', activeTheme.innerPanelClass]">
                  <p class="clamp-4 text-sm text-white/85">{{ current.visualHint || "Wizualizacja: prosty schemat lub wykres wspierający ten slajd." }}</p>
                </div>
              </div>
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

  <div v-else-if="isGenerating" class="fixed inset-0 z-[110] flex items-center justify-center bg-[#f7f9fc]/95 px-6">
    <div class="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-[0px_12px_32px_0px_rgba(25,28,30,0.08)]">
      <div class="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-[#d8e0ff] border-t-[#0c3dfe]" />
      <h2 class="mb-2 font-['Plus_Jakarta_Sans'] text-[30px] font-extrabold leading-[36px] tracking-[-0.6px] text-[#191c1e]">
        Generuję prezentację...
      </h2>
      <p class="font-['Plus_Jakarta_Sans'] text-[16px] leading-[26px] text-[#454652]">
        Tworzę slajdy na podstawie notatki, planu i poziomu grupy.
      </p>
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

    <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 md:p-8 w-full relative z-10 mb-6">
      <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px] mb-3">
        Wybierz materiał prezentacji
      </h3>
      <div class="mb-4 flex gap-2">
        <button
          type="button"
          @click="presentationSource = 'note'"
          :class="[
            'inline-flex h-7 items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold transition',
            presentationSource === 'note' ? 'bg-[#0c3dfe] text-white' : 'bg-[#e8e8ed] text-[#454652] hover:bg-[#dbdbe2]'
          ]"
        >
          <img :src="archiveIcon" alt="" class="h-3.5 w-3.5 shrink-0" :class="presentationSource === 'note' ? 'brightness-0 invert' : ''" />
          Notatki
        </button>
        <button
          type="button"
          @click="presentationSource = 'lesson'"
          :class="[
            'inline-flex h-7 items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold transition',
            presentationSource === 'lesson' ? 'bg-[#0c3dfe] text-white' : 'bg-[#e8e8ed] text-[#454652] hover:bg-[#dbdbe2]'
          ]"
        >
          <img :src="liveLessonIcon" alt="" class="h-3.5 w-3.5 shrink-0" :class="presentationSource === 'lesson' ? 'brightness-0 invert' : ''" />
          Lekcje
        </button>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="item in sourceItems"
          :key="item.id"
          type="button"
          @click="selectSourceItem(item.id)"
          :class="[
            'flex w-full sm:w-[220px] items-center gap-3 min-h-[63px] py-3 pl-[15px] pr-[16px] rounded-[8px] transition-all text-left',
            selectedSourceId === item.id
              ? 'bg-[#0c3dfe] text-white shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)]'
              : 'bg-[#e4e4e4] text-[#2a3439] hover:bg-[#d4d4d4] shadow-[0px_10px_15px_0px_rgba(20,37,136,0.07)]'
          ]"
        >
          <img
            :src="presentationSource === 'lesson' ? liveLessonIcon : archiveIcon"
            alt=""
            class="h-[18px] w-[18px] shrink-0 opacity-90"
            :class="selectedSourceId === item.id ? 'brightness-0 invert' : ''"
          />
          <div class="flex flex-col justify-center font-['Plus_Jakarta_Sans'] font-bold text-[14px] min-w-0">
            <p class="leading-[18px] truncate">{{ item.title }}</p>
            <p
              class="leading-[18px] font-medium text-[12px] opacity-80 truncate mt-0.5"
              :class="selectedSourceId === item.id ? 'text-white' : 'text-[#454652]'"
            >
              {{ item.subtitle }}
            </p>
          </div>
        </button>
        <p v-if="!sourceItems.length" class="text-sm font-['Plus_Jakarta_Sans'] text-muted-foreground w-full">
          Brak dostępnych materiałów dla wybranego źródła.
        </p>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 md:p-8 w-full relative z-10 mb-6">
      <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px] mb-3">
        Ustawienia prezentacji
      </h3>
      <div class="max-w-none">
        <label class="mb-2 block font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Zakres</label>
        <select
          v-model="presentationScope"
          :disabled="presentationSource === 'note'"
          class="bg-[#d9dde2] h-[40px] rounded-md w-full px-4 text-[14px] text-[#2a3439] font-['Plus_Jakarta_Sans'] outline-none border-none focus:ring-2 focus:ring-[#0c3dfe]/50"
        >
          <option value="full">Cała lekcja/notatka</option>
          <option value="pending">Tylko nieomówione punkty</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 md:p-8 w-full relative z-10 mb-7">
      <div v-if="generationMessage" class="mb-4 rounded-[10px] border border-emerald-300 bg-emerald-50 px-4 py-3 text-[14px] font-['Plus_Jakarta_Sans'] text-emerald-800">
        {{ generationMessage }}
      </div>
      <div class="flex items-center justify-between gap-3 w-full">
        <p class="font-['Plus_Jakarta_Sans'] text-[14px] text-[#454652]">
          Liczba slajdów do wygenerowania: <span class="font-bold text-[#191c1e]">{{ plannedSlideCount }}</span>
        </p>
        <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          @click="$router.back()"
          class="bg-[#f2f2f2] text-[#454652] font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-6 py-2.5 rounded-lg hover:bg-[#e5e5e5] transition-colors"
        >
          Anuluj
        </button>
        <button
          type="button"
          :disabled="!canGenerate || isGenerating"
          @click="startGeneratedPresentation"
          class="bg-[#0c3dfe] text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-8 py-2.5 rounded-lg transition-colors hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50"
        >
          {{ isGenerating ? "Generuję..." : "Wygeneruj" }}
        </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import archiveIcon from "../assets/archive.svg";
import liveLessonIcon from "../assets/livelesson.svg";

const PRESENTATION_HISTORY_KEY = "coteach:presentation-history";
const ARCHIVE_OPEN_PRESENTATION_KEY = "coteach:open-presentation-id";

const route = useRoute();
const { state, fetchLessons, fetchTeacherNotes, generatePresentation } = useLessonStore();

const isGenerating = ref(false);
const isPresenting = ref(false);
const slides = ref([]);
const slideIndex = ref(0);
const presentationHistory = ref([]);
const selectedPresentation = ref(null);
const presentationSource = ref("lesson");
const selectedLessonId = ref("");
const presentationScope = ref("pending");
const selectedNoteId = ref("");
const generationMessage = ref("");
const presentationTheme = ref({
  wrapperClass: "bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700",
  panelClass: "border-white/20 bg-white/10",
  innerPanelClass: "bg-black/20"
});

const current = computed(() => slides.value[slideIndex.value] || { type: "concept", title: "", subtitle: "", details: [], summary: "", visualHint: "" });
const availableLessons = computed(() => (Array.isArray(state.lessons) ? state.lessons : []));
const hasLessons = computed(() => availableLessons.value.length > 0);
const availableNotes = computed(() => (Array.isArray(state.notes) ? state.notes : []));
const selectedLesson = computed(() => availableLessons.value.find((lesson) => lesson.id === selectedLessonId.value) || null);
const selectedNote = computed(() => availableNotes.value.find((note) => note.id === selectedNoteId.value) || null);
const sourceItems = computed(() => {
  if (presentationSource.value === "lesson") {
    return availableLessons.value.map((lesson) => ({
      id: lesson.id,
      title: lesson.title || "Bez tytułu",
      subtitle: lesson.subject || "Lekcja"
    }));
  }
  return availableNotes.value.map((note) => ({
    id: note.id,
    title: note.title || "Bez tytułu",
    subtitle: note.subject || "Notatka"
  }));
});
const selectedSourceId = computed(() => (presentationSource.value === "lesson" ? selectedLessonId.value : selectedNoteId.value));
const selectedClassLevel = computed(() => {
  if (presentationSource.value === "note") {
    return String(selectedNote.value?.classLevel || "").trim();
  }
  return String(selectedLesson.value?.classLevel || selectedNote.value?.classLevel || "").trim();
});
const effectivePresentationScope = computed(() => (presentationSource.value === "note" ? "full" : presentationScope.value));
const preparedSlides = computed(() => {
  if (presentationSource.value === "note") return [];
  const plan = Array.isArray(selectedLesson.value?.plan) ? selectedLesson.value.plan : [];
  if (effectivePresentationScope.value === "full") return plan;
  return plan.filter((point) => point.status !== "discussed");
});
const plannedSlideCount = computed(() => {
  if (presentationSource.value === "note") return 5;
  return preparedSlides.value.length;
});
const canGenerate = computed(() => {
  if (presentationSource.value === "note") return Boolean(selectedNote.value?.id);
  return Boolean(selectedLesson.value?.id) && preparedSlides.value.length > 0;
});
const currentMainText = computed(() => {
  const text = String(current.value.summary || "").trim();
  if (text) return text;
  return "Treść slajdu jest pusta. Spróbuj wygenerować prezentację ponownie dla pełnego zakresu lekcji.";
});
const currentDetailChips = computed(() => {
  const details = Array.isArray(current.value.details) ? current.value.details.filter(Boolean) : [];
  if (details.length) return details;
  const fallback = currentMainText.value
    .split(/[.;]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
  return fallback.length ? fallback : ["Najważniejsze punkty", "Przykład", "Wniosek"];
});
const activeTheme = computed(() => presentationTheme.value);
const currentType = computed(() => String(current.value.type || "").toLowerCase());
const isComparisonLayout = computed(() => currentType.value === "comparison");
const isAgendaLayout = computed(() => currentType.value === "agenda" || currentType.value === "summary");
const isPracticeLayout = computed(() => currentType.value === "practice" || currentType.value === "next_steps");
const comparisonLeft = computed(() => currentDetailChips.value.slice(0, Math.ceil(currentDetailChips.value.length / 2)).join(" • "));
const comparisonRight = computed(() => currentDetailChips.value.slice(Math.ceil(currentDetailChips.value.length / 2)).join(" • ") || currentMainText.value);

onMounted(async () => {
  const [lessonsResponse] = await Promise.all([fetchLessons(), fetchTeacherNotes()]);
  const lessons = Array.isArray(lessonsResponse) ? lessonsResponse : [];
  const routeLessonId = String(route.params.lessonId || "");
  const byRoute = lessons.find((lesson) => lesson.id === routeLessonId);
  const byCurrent = state.lesson?.id ? lessons.find((lesson) => lesson.id === state.lesson.id) : null;
  const initialLesson = byRoute || byCurrent || lessons[0] || null;
  selectedLessonId.value = initialLesson?.id || "";
  if (availableNotes.value.length > 0) {
    selectedNoteId.value = availableNotes.value[0].id;
  }
  state.lesson = initialLesson;
  loadPresentationHistory();
  tryOpenRequestedPresentation();
});

watch(selectedLesson, (lesson) => {
  state.lesson = lesson || null;
});

watch(presentationSource, (source) => {
  if (source === "note" && !selectedNoteId.value && availableNotes.value.length > 0) {
    selectedNoteId.value = availableNotes.value[0].id;
  }
  if (source === "lesson" && !selectedLessonId.value && availableLessons.value.length > 0) {
    selectedLessonId.value = availableLessons.value[0].id;
  }
  if (source === "note") {
    presentationScope.value = "full";
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
  const subject =
    (presentationSource.value === "note"
      ? selectedNote.value?.subject || selectedNote.value?.title
      : selectedLesson.value?.subject || selectedLesson.value?.title) || "Prezentacja";
  const scopeLabel = effectivePresentationScope.value === "full" ? "całość" : "nieomówione punkty";
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
  presentationTheme.value = resolvePresentationTheme(
    buildPresentationTitle(),
    currentSlides
  );
  isPresenting.value = true;
}

function selectSourceItem(id) {
  if (presentationSource.value === "lesson") {
    selectedLessonId.value = id;
    return;
  }
  selectedNoteId.value = id;
}

async function startGeneratedPresentation() {
  if (!canGenerate.value) return;

  isGenerating.value = true;
  generationMessage.value = "";
  try {
    const generated = await generatePresentation({
      lessonId: presentationSource.value === "lesson" ? selectedLesson.value?.id || "" : "",
      noteId: selectedNote.value?.id || "",
      classLevel: selectedClassLevel.value || "",
      scope: effectivePresentationScope.value,
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
    generationMessage.value = `Wygenerowano prezentację (${savedItem.slideCount} slajdów).`;
    startPresentation(generatedSlides);
  } finally {
    isGenerating.value = false;
  }
}

function openSavedPresentation(item) {
  const storedSlides = Array.isArray(item?.slides) ? item.slides : [];
  if (!storedSlides.length) return;
  startPresentation(storedSlides);
}

function tryOpenRequestedPresentation() {
  const requestedId = String(localStorage.getItem(ARCHIVE_OPEN_PRESENTATION_KEY) || "").trim();
  if (!requestedId) return;
  localStorage.removeItem(ARCHIVE_OPEN_PRESENTATION_KEY);
  const requested = presentationHistory.value.find((item) => String(item.id) === requestedId);
  if (!requested) return;
  selectedPresentation.value = requested;
  openSavedPresentation(requested);
}

function exitPresentation() {
  isPresenting.value = false;
}

function openPresentationWindow() {
  const url = window.location.href;
  window.open(url, "_blank", "noopener,noreferrer");
}

function resolvePresentationTheme(title, slides) {
  const text = `${title || ""} ${Array.isArray(slides) ? slides.map((s) => `${s.title || ""} ${s.summary || ""}`).join(" ") : ""}`.toLowerCase();
  if (/(fotosyntez|biolog|natura|ro[sl]in|ekologi|las|chlorofil)/.test(text)) {
    return {
      wrapperClass: "bg-gradient-to-br from-emerald-700 via-green-700 to-teal-700",
      panelClass: "border-white/25 bg-white/12",
      innerPanelClass: "bg-black/15"
    };
  }
  if (/(histori|wojn|pa[nń]stw|kr[oó]l|staro|średniowie)/.test(text)) {
    return {
      wrapperClass: "bg-gradient-to-br from-amber-700 via-orange-700 to-red-700",
      panelClass: "border-white/20 bg-white/10",
      innerPanelClass: "bg-black/20"
    };
  }
  if (/(matemat|fizy|chem|technicz|algorytm|program|kod)/.test(text)) {
    return {
      wrapperClass: "bg-gradient-to-br from-blue-700 via-indigo-700 to-cyan-700",
      panelClass: "border-white/20 bg-white/10",
      innerPanelClass: "bg-black/20"
    };
  }
  return {
    wrapperClass: "bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700",
    panelClass: "border-white/20 bg-white/10",
    innerPanelClass: "bg-black/20"
  };
}
</script>

<style scoped>
.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.clamp-5 {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.clamp-8 {
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
