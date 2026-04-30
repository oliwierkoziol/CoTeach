<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] relative overflow-x-hidden px-4 py-6 sm:px-6 md:p-12 pb-14 w-full">
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <template v-if="!lesson || !lesson.plan?.length">
      <!-- Welcome Header -->
      <header class="mb-7 relative z-10 w-full text-left">
        <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
          Nowa lekcja
        </h2>
        <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-[28px] font-normal">
          Wybierz temat i notatkę bazową, aby przygotować plan zajęć. AI ułoży listę zagadnień do zrealizowania podczas lekcji na żywo.
        </p>
      </header>
  
      <!-- Card 1: Podstawowe informacje -->
      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 w-full relative z-10 mb-7">
        <h3 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[18px] leading-[28px] mb-6">
          Podstawowe informacje
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <!-- Temat Input -->
          <div class="flex flex-col gap-2 w-full">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Temat</label>
            <div class="bg-[#e0e3e6] h-[48px] relative rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input 
                v-model="title" 
                class="bg-transparent border-none outline-none w-full text-[16px] text-[#454652] placeholder-[rgba(118,118,131,0.6)] font-['Plus_Jakarta_Sans']" 
                placeholder="Wprowadź temat zajęć..." 
              />
              <svg class="h-4 w-4 ml-2 shrink-0 opacity-40 text-[#222E75]" fill="currentColor" viewBox="0 0 18 16">
                <path d="M14.06 0L18 3.94L16.42 5.51L12.49 1.58L14.06 0ZM0 12.49L11.08 1.41L15.02 5.35L3.94 16.43H0V12.49Z" />
              </svg>
            </div>
          </div>
          <!-- Czas Lekcji Input -->
          <div class="flex flex-col gap-2 w-full">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Czas lekcji (min)</label>
            <div class="bg-[#e0e3e6] h-[48px] relative rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input 
                v-model="lessonTime" type="number"
                class="bg-transparent border-none outline-none w-full text-[16px] text-[#454652] placeholder-[rgba(118,118,131,0.6)] font-['Plus_Jakarta_Sans']" 
                placeholder="45" 
              />
              <svg class="h-4 w-4 ml-2 shrink-0 opacity-40 text-[#222E75]" fill="currentColor" viewBox="0 0 18 16">
                <path d="M14.06 0L18 3.94L16.42 5.51L12.49 1.58L14.06 0ZM0 12.49L11.08 1.41L15.02 5.35L3.94 16.43H0V12.49Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Card 2: Wybierz notatke -->
      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 sm:p-8 w-full relative z-10 mb-7">
        <div class="mb-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px]">
            Wybierz notatkę
          </h3>
          <!-- Create new button -->
          <RouterLink to="/notes" type="button" :class="[
            'bg-[#0c3dfe] text-center text-white font-[\'Plus_Jakarta_Sans\'] font-semibold text-[16px] px-6 py-2.5 rounded-lg transition-colors hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] w-full sm:w-auto',
            !state.notes || state.notes.length === 0 ? 'sound-wave-btn' : ''
          ]">
            Utwórz nową
          </RouterLink>
        </div>
  
        <div class="flex flex-wrap gap-4 items-center w-full">
          <!-- Map over state.notes -->
          <button 
            v-for="note in state.notes" 
            :key="note.id"
            @click="selectedNoteId = note.id"
            :class="[
              'flex w-full sm:w-[200px] items-center gap-3 min-h-[63px] py-3 pl-[15px] pr-[16px] rounded-[8px] transition-all text-left', 
              selectedNoteId === note.id 
                ? 'bg-[#0c3dfe] text-white shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)]' 
                : 'bg-[#e4e4e4] text-[#2a3439] hover:bg-[#d4d4d4] shadow-[0px_10px_15px_0px_rgba(20,37,136,0.07)]'
            ]"
          >
            <!-- Note Icon -->
            <img
              :src="archiveIcon"
              alt="Archive icon"
              :class="[
                'h-[20px] w-[20px] shrink-0 opacity-90 transition-all',
                selectedNoteId === note.id ? 'brightness-0 invert' : ''
              ]"
            />
            <div class="flex flex-col justify-center font-['Plus_Jakarta_Sans'] font-bold text-[14px]">
              <p class="leading-[18px] truncate max-w-[130px]">{{ note.title || 'Brak tytułu' }}</p>
              <p class="leading-[18px] font-medium text-[12px] opacity-80 truncate max-w-[130px] mt-0.5" :class="selectedNoteId === note.id ? 'text-white' : 'text-[#454652]'">{{ note.subject || 'Brak przedmiotu' }}</p>
            </div>
          </button>
  
          <p v-if="!state.notes.length" class="text-sm font-['Plus_Jakarta_Sans'] text-muted-foreground w-full">
            Brak dostępnych notatek. Utwórz nową klikając przycisk.
          </p>
        </div>
      </div>
  
      <!-- Card 3: Footer Buttons -->
      <div class="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 md:p-8 w-full relative z-10 mb-7">
        <div v-if="error" class="mb-4 text-sm text-destructive font-['Plus_Jakarta_Sans'] font-semibold">
          {{ error }}
        </div>
        <div class="flex w-full flex-col items-stretch justify-end gap-5 sm:flex-row sm:items-center">
          <input type="file" ref="audioFileInput" class="hidden" accept="audio/*" @change="handleAudioLesson" />
          <button type="button" :disabled="!selectedNoteId || isGenerating" @click="triggerAudioUpload" class="bg-white border-2 border-dashed border-[#0c3dfe] text-[#0c3dfe] font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-6 py-2.5 rounded-lg hover:bg-[#f0f4ff] transition-colors w-full sm:w-auto sm:mr-auto disabled:opacity-50">
            {{ isGenerating ? "Przetwarzam..." : "Stwórz lekcję z pliku audio" }}
          </button>
          <!-- Button Anuluj -->
          <button type="button" @click="resetForm" class="bg-muted border border-border text-muted-foreground font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-6 py-2.5 rounded-lg hover:bg-background/70 transition-colors w-full sm:w-auto">
            Anuluj
          </button>
          <!-- Button Rozpocznij lekcję -->
          <button type="button" :disabled="isGenerating" @click="handleGenerate" :class="[
            'bg-[#0c3dfe] text-white font-[\'Plus_Jakarta_Sans\'] font-semibold text-[16px] leading-[24px] px-8 py-2.5 rounded-lg transition-colors hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50 w-full sm:w-auto',
            selectedNoteId && (!state.lessons || state.lessons.length <= 1) ? 'sound-wave-btn' : ''
          ]">
            {{ isGenerating ? "Przetwarzam..." : "Rozpocznij lekcję" }}
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="w-full relative z-10 space-y-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 class="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-[#191c1e] tracking-[-0.9px]">Edytor planu lekcji</h2>
            <p class="font-['Plus_Jakarta_Sans'] text-[16px] text-[#454652] mt-1">Korekta przed startem lekcji na żywo</p>
          </div>
          <div class="flex flex-wrap gap-5">
            <button type="button" class="font-['Plus_Jakarta_Sans'] rounded-xl border border-transparent bg-white px-6 py-2.5 text-[16px] font-semibold text-[#454652] hover:bg-[#f2f2f2] transition-colors shadow-sm" @click="resetPlan">
              Wróć
            </button>
            <button
              type="button"
              :class="[
                'font-[\'Plus_Jakarta_Sans\'] rounded-xl bg-[#0c3dfe] px-6 py-2.5 text-[16px] font-semibold text-white transition hover:bg-[#0a34d4] disabled:opacity-50 shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)]',
                !state.lessons || state.lessons.length <= 1 ? 'sound-wave-btn' : ''
              ]"
              :disabled="isSaving"
              @click="saveAndStart"
            >
              {{ isSaving ? "Zapisywanie..." : "Zapisz i rozpocznij lekcję" }}
            </button>
          </div>
        </div>

        <div class="space-y-12 rounded-xl bg-white shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
          <div v-if="sourceNote" class="rounded-xl border border-[#e0e3e6] bg-[#f7f9fc] p-4">
            <h3 class="font-['Plus_Jakarta_Sans'] mb-2 text-[14px] font-bold text-[#191c1e]">Notatka źródłowa</h3>
            <textarea :value="sourceNote" readonly class="font-['Plus_Jakarta_Sans'] min-h-[120px] w-full rounded-lg border-none bg-transparent p-0 text-[14px] text-[#454652] outline-none resize-none" />
          </div>
          
          <div class="space-y-4">
            <h3 class="font-['Plus_Jakarta_Sans'] text-[18px] font-extrabold text-[#191c1e]">Punkty lekcji</h3>
            
            <div class="space-y-12">
              <div v-for="(point, idx) in lesson.plan" :key="point.id" class="rounded-xl border border-[#e0e3e6] p-6 bg-[#fbfcfd] space-y-6">
                <!-- Title Field -->
                <div class="flex flex-col gap-2">
                  <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Tytuł punktu</label>
                  <div class="flex items-center gap-3">
                    <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0c3dfe]/10 text-sm font-bold text-[#0c3dfe]">{{ idx + 1 }}</span>
                    <input v-model="point.title" class="font-['Plus_Jakarta_Sans'] flex-1 rounded-lg border border-[#e0e3e6] bg-white px-4 py-2.5 text-[#191c1e] text-[16px] font-semibold outline-none focus:border-[#0c3dfe] focus:ring-1 focus:ring-[#0c3dfe] transition-colors" placeholder="Wpisz tytuł punktu..." />
                  </div>
                </div>

                <!-- Keywords Field -->
                <div class="flex flex-col gap-2">
                  <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Słowa kluczowe (po przecinku)</label>
                  <input
                    :value="point.keywords.join(', ')"
                    class="font-['Plus_Jakarta_Sans'] w-full rounded-lg border border-[#e0e3e6] bg-white px-4 py-2.5 text-[14px] text-[#454652] outline-none focus:border-[#0c3dfe] focus:ring-1 focus:ring-[#0c3dfe] transition-colors"
                    placeholder="np. fotosynteza, chlorofil, światło"
                    @input="setKeywords(idx, $event.target.value)"
                  />
                </div>

                <!-- Content Field -->
                <div class="flex flex-col gap-2">
                  <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Treść punktu</label>
                  <textarea v-model="point.description" class="font-['Plus_Jakarta_Sans'] min-h-[100px] w-full rounded-lg border border-[#e0e3e6] bg-white p-4 text-[14px] text-[#454652] outline-none focus:border-[#0c3dfe] focus:ring-1 focus:ring-[#0c3dfe] transition-colors resize-y" placeholder="Opisz co chcesz omówić w tym punkcie..." />
                </div>
                
                <div class="mt-2 flex justify-end">
                  <button type="button" class="font-['Plus_Jakarta_Sans'] text-[14px] font-semibold text-red-500 hover:text-red-700 transition-colors" @click="removePoint(point.id)">Usuń punkt</button>
                </div>
              </div>
            </div>
          </div>
          
          <button type="button" class="font-['Plus_Jakarta_Sans'] w-full rounded-xl border-2 border-dashed border-[#0c3dfe]/40 bg-[#0c3dfe]/5 py-4 text-[14px] font-bold text-[#0c3dfe] transition-colors hover:bg-[#0c3dfe]/10" @click="addPoint">
            + Dodaj punkt do planu
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import archiveIcon from "../assets/archive.svg";

const router = useRouter();
const { state, createLesson, uploadLessonMaterial, savePlan, startLive, fetchTeacherNotes, transcribeAudioFile, sendTranscript, refreshCoverage, deleteLesson } = useLessonStore();
const lesson = computed(() => state.lesson);

const title = ref("");
const lessonTime = ref(45);
const selectedNoteId = ref("");
const isGenerating = ref(false);
const lastAutoTitle = ref("");
const isSaving = ref(false);
const audioFileInput = ref(null);

const error = ref("");
const info = ref("");

const sourceNote = computed(() => {
  const files = Array.isArray(lesson.value?.sourceFiles) ? lesson.value.sourceFiles : [];
  const latest = [...files].reverse().find((item) => String(item?.extractedText || "").trim());
  return String(latest?.extractedText || "").trim();
});

const selectedNote = computed(() => state.notes.find((note) => note.id === selectedNoteId.value) || null);

onMounted(async () => {
  await fetchTeacherNotes();
});

watch(selectedNoteId, (noteId) => {
  if (!noteId) return;
  const note = state.notes.find((item) => item.id === noteId);
  if (!note) return;
  // Update title if it's empty or matches the last one set automatically
  if (!title.value || title.value === lastAutoTitle.value) {
    const newTitle = String(note.title || "");
    title.value = newTitle;
    lastAutoTitle.value = newTitle;
  }
});

function resetForm() {
  title.value = "";
  lastAutoTitle.value = "";
  selectedNoteId.value = "";
  lessonTime.value = 45;
  error.value = "";
  info.value = "";
}

async function handleGenerate() {
  try {
    isGenerating.value = true;
    error.value = "";
    info.value = "";
    
    if (!title.value) {
      error.value = "Wypełnij temat lekcji.";
      return;
    }
    if (!selectedNoteId.value) {
      error.value = "Wybierz notatkę z listy materiałów źródłowych.";
      return;
    }

    const normalizedDate = new Date().toISOString().split("T")[0];
    const lessonMonth = new Date().toLocaleString("pl-PL", { month: "long" });
    const generatedSubject = selectedNote.value?.subject || "Ogólny";
    const extractedRawText = selectedNote.value?.content || "";
    const parsedLessonMinutes = Number(lessonTime.value);
    const lessonLengthMinutes = Number.isFinite(parsedLessonMinutes) && parsedLessonMinutes > 0
      ? Math.round(parsedLessonMinutes)
      : 45;

    const created = await createLesson({
      subject: generatedSubject,
      title: title.value,
      month: lessonMonth,
      date: normalizedDate,
      length: lessonLengthMinutes,
      rawText: "",
      class_name: selectedNote.value?.class_name || null
    });
    
    await uploadLessonMaterial(created.id, {
      rawText: extractedRawText,
      file: null
    });
    
    info.value = state.info;
  } catch (e) {
    error.value = e.message;
  } finally {
    isGenerating.value = false;
  }
}

function triggerAudioUpload() {
  if (!selectedNoteId.value) {
    error.value = "Wybierz najpierw notatkę.";
    return;
  }
  audioFileInput.value?.click();
}

async function handleAudioLesson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    isGenerating.value = true;
    error.value = "";
    info.value = "Przygotowuję lekcję i transkrybuję plik...";

    if (!title.value) {
      error.value = "Wypełnij temat lekcji.";
      return;
    }

    const normalizedDate = new Date().toISOString().split("T")[0];
    const lessonMonth = new Date().toLocaleString("pl-PL", { month: "long" });
    const generatedSubject = selectedNote.value?.subject || "Ogólny";
    const extractedRawText = selectedNote.value?.content || "";
    const parsedLessonMinutes = Number(lessonTime.value) || 45;

    const created = await createLesson({
      subject: generatedSubject,
      title: title.value,
      month: lessonMonth,
      date: normalizedDate,
      length: Math.round(parsedLessonMinutes),
      rawText: "",
      class_name: selectedNote.value?.class_name || null
    });

    await uploadLessonMaterial(created.id, { rawText: extractedRawText, file: null });
    await startLive(created.id);

    info.value = "Transkrybuję plik audio (Whisper AI)...";
    const transcriptText = await transcribeAudioFile(created.id, file);

    if (transcriptText) {
      await sendTranscript(created.id, transcriptText);
      await refreshCoverage(created.id);
    }

    info.value = "Lekcja gotowa. Przekierowuję...";
    await router.push(`/live-lesson/${created.id}`);
  } catch (e) {
    error.value = "Błąd: " + e.message;
  } finally {
    isGenerating.value = false;
    if (audioFileInput.value) audioFileInput.value.value = "";
  }
}

function setKeywords(index, text) {
  state.lesson.plan[index].keywords = text.split(",").map((x) => x.trim()).filter(Boolean);
}

function addPoint() {
  state.lesson.plan.push({
    id: `point-${Date.now()}`,
    title: "Nowy punkt",
    keywords: [],
    description: "",
    status: "pending"
  });
}

function removePoint(id) {
  state.lesson.plan = state.lesson.plan.filter((p) => p.id !== id);
}

async function resetPlan() {
  if (state.lesson?.id) {
    try {
      await deleteLesson(state.lesson.id);
    } catch (err) {
      console.error("Błąd podczas usuwania draftu lekcji:", err);
    }
  }
  state.lesson = null;
}

async function saveAndStart() {
  try {
    isSaving.value = true;
    error.value = "";
    info.value = "";
    if (!state.lesson?.id) {
      error.value = "Brak lekcji do zapisania. Najpierw wygeneruj plan.";
      return;
    }
    if (!Array.isArray(state.lesson.plan) || !state.lesson.plan.length) {
      error.value = "Plan lekcji jest pusty. Dodaj przynajmniej jeden punkt.";
      return;
    }
    await savePlan(state.lesson.id, state.lesson.plan);
    await startLive(state.lesson.id);
    info.value = "Plan zapisany. Przechodzę do lekcji na żywo...";
    await router.push(`/live-lesson/${state.lesson.id}`);
  } catch (e) {
    error.value = e.message || "Nie udało się zapisać planu.";
  } finally {
    isSaving.value = false;
  }
}
</script>
