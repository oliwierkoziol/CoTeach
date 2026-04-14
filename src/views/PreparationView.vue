<template>
  <div class="bg-[#f7f9fc] dark:bg-background min-h-[calc(100vh-64px)] relative overflow-x-hidden px-4 py-6 sm:px-6 md:p-12 pb-14 w-full">
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <template v-if="!lesson || !lesson.plan?.length">
      <!-- Welcome Header -->
      <header class="mb-7 relative z-10 w-full text-left">
        <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] dark:text-foreground text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
          Nowa lekcja
        </h2>
        <p class="font-['Plus_Jakarta_Sans'] text-[#454652] dark:text-muted-foreground text-[18px] leading-[28px] font-normal">
          Dodaj materiaĹ‚y przy uĹĽyciu tekstu lub zdjÄ™cia. MateriaĹ‚y te bÄ™dÄ… wykorzystane podczas prowadzenia lekcji na ĹĽywo.
        </p>
      </header>
  
      <!-- Card 1: Podstawowe informacje -->
      <div class="bg-white dark:bg-card border border-transparent dark:border-border rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 w-full relative z-10 mb-7">
        <h3 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] dark:text-foreground text-[18px] leading-[28px] mb-6">
          Podstawowe informacje
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <!-- Temat Input -->
          <div class="flex flex-col gap-2 w-full">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] dark:text-muted-foreground text-[14px]">Temat</label>
            <div class="bg-[#e0e3e6] dark:bg-input-background border border-transparent dark:border-border h-[48px] relative rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input 
                v-model="title" 
                class="bg-transparent border-none outline-none w-full text-[16px] text-[#454652] dark:text-foreground placeholder-[rgba(118,118,131,0.6)] dark:placeholder:text-muted-foreground font-['Plus_Jakarta_Sans']" 
                placeholder="WprowadĹş temat zajÄ™Ä‡..." 
              />
              <svg class="h-4 w-4 ml-2 shrink-0 opacity-40 text-[#222E75]" fill="currentColor" viewBox="0 0 18 16">
                <path d="M14.06 0L18 3.94L16.42 5.51L12.49 1.58L14.06 0ZM0 12.49L11.08 1.41L15.02 5.35L3.94 16.43H0V12.49Z" />
              </svg>
            </div>
          </div>
          <!-- Czas Lekcji Input -->
          <div class="flex flex-col gap-2 w-full">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] dark:text-muted-foreground text-[14px]">Czas lekcji</label>
            <div class="bg-[#e0e3e6] dark:bg-input-background border border-transparent dark:border-border h-[48px] relative rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input 
                v-model="lessonTime" 
                class="bg-transparent border-none outline-none w-full text-[16px] text-[#454652] dark:text-foreground placeholder-[rgba(118,118,131,0.6)] dark:placeholder:text-muted-foreground font-['Plus_Jakarta_Sans']" 
                placeholder="1-90min" 
              />
              <svg class="h-4 w-4 ml-2 shrink-0 opacity-40 text-[#222E75]" fill="currentColor" viewBox="0 0 18 16">
                <path d="M14.06 0L18 3.94L16.42 5.51L12.49 1.58L14.06 0ZM0 12.49L11.08 1.41L15.02 5.35L3.94 16.43H0V12.49Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Card 2: Wybierz notatke -->
      <div class="bg-white dark:bg-card border border-transparent dark:border-border rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 sm:p-8 w-full relative z-10 mb-7">
        <div class="mb-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] dark:text-foreground text-[18px] leading-[28px]">
            Wybierz notatkÄ™
          </h3>
          <!-- Create new button -->
          <RouterLink to="/notes" type="button" class="bg-[#0c3dfe] text-center text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px] px-6 py-2.5 rounded-lg transition-colors hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] w-full sm:w-auto">
            UtwĂłrz nowÄ…
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
                ? 'bg-[#0c3dfe] text-white shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] dark:bg-sky-500 dark:text-slate-950' 
                : 'bg-[#e4e4e4] text-[#2a3439] hover:bg-[#d4d4d4] shadow-[0px_10px_15px_0px_rgba(20,37,136,0.07)] dark:bg-[#2a3c5e] dark:text-slate-100 dark:hover:bg-[#324971]'
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
              <p class="leading-[18px] truncate max-w-[130px]">{{ note.title || 'Brak tytuĹ‚u' }}</p>
              <p class="leading-[18px] font-medium text-[12px] opacity-80 truncate max-w-[130px] mt-0.5" :class="selectedNoteId === note.id ? 'text-white dark:text-slate-900' : 'text-[#454652] dark:text-slate-300'">{{ note.subject || 'Brak przedmiotu' }}</p>
            </div>
          </button>
  
          <p v-if="!state.notes.length" class="text-sm font-['Plus_Jakarta_Sans'] text-muted-foreground w-full">
            Brak dostÄ™pnych notatek. UtwĂłrz nowÄ… klikajÄ…c przycisk.
          </p>
        </div>
      </div>
  
      <!-- Card 3: Footer Buttons -->
      <div class="bg-white dark:bg-card border border-transparent dark:border-border rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 md:p-8 w-full relative z-10 mb-7">
        <div v-if="error" class="mb-4 text-sm text-destructive font-['Plus_Jakarta_Sans'] font-semibold">
          {{ error }}
        </div>
        <div class="flex w-full flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
          <!-- Button Anuluj -->
          <button type="button" @click="resetForm" class="bg-[#f2f2f2] dark:bg-muted text-[#454652] dark:text-foreground font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-6 py-2.5 rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-muted/80 transition-colors w-full sm:w-auto">
            Anuluj
          </button>
          <!-- Button Rozpocznij lekcjÄ™ -->
          <button type="button" :disabled="isGenerating" @click="handleGenerate" class="bg-[#0c3dfe] text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-8 py-2.5 rounded-lg transition-colors hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50 w-full sm:w-auto">
            {{ isGenerating ? "Przetwarzam..." : "Rozpocznij lekcjÄ™" }}
          </button>
        </div>
      </div>
    </template>

      <div v-if="error" class="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {{ error }}
      </div>
      <div v-if="info" class="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
        {{ info }}
      </div>

      <div v-if="!lesson || !lesson.plan?.length" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <div class="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 class="text-lg font-semibold text-foreground">Podstawowe informacje</h2>
            <div>
              <label class="text-sm text-muted-foreground">Przedmiot</label>
              <input v-model="subject" class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" placeholder="np. Biologia" />
            </div>
            <div>
              <label class="text-sm text-muted-foreground">Temat lekcji</label>
              <input v-model="title" class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" placeholder="np. Fotosynteza" />
            </div>
            <div>
              <label class="text-sm text-muted-foreground">Klasa</label>
              <select
                v-model="classLevel"
                class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                @focus="expandSelectOnMobile"
                @blur="collapseSelect"
                @change="collapseSelect"
              >
                <option v-for="level in classOptions" :key="level" :value="level">{{ level }}</option>
              </select>
            </div>
            <div>
              <label class="text-sm text-muted-foreground">Data lekcji</label>
              <input
                v-model="dateInput"
                type="date"
                class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              />
              <svg class="h-4 w-4 ml-2 shrink-0 opacity-40 text-[#222E75]" fill="currentColor" viewBox="0 0 18 16">
                <path d="M14.06 0L18 3.94L16.42 5.51L12.49 1.58L14.06 0ZM0 12.49L11.08 1.41L15.02 5.35L3.94 16.43H0V12.49Z" />
              </svg>
            </div>
          </div>
          <!-- Czas Lekcji Input -->
          <div class="flex flex-col gap-2 w-full">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Czas lekcji</label>
            <div class="bg-[#e0e3e6] h-[48px] relative rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input 
                v-model="lessonTime" 
                class="bg-transparent border-none outline-none w-full text-[16px] text-[#454652] placeholder-[rgba(118,118,131,0.6)] font-['Plus_Jakarta_Sans']" 
                placeholder="1-90min" 
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
            Wybierz notatkÄ™
          </h3>
          <!-- Create new button -->
          <RouterLink to="/notes" type="button" class="bg-[#0c3dfe] text-center text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px] px-6 py-2.5 rounded-lg transition-colors hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] w-full sm:w-auto">
            UtwĂłrz nowÄ…
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
              <p class="leading-[18px] truncate max-w-[130px]">{{ note.title || 'Brak tytuĹ‚u' }}</p>
              <p class="leading-[18px] font-medium text-[12px] opacity-80 truncate max-w-[130px] mt-0.5" :class="selectedNoteId === note.id ? 'text-white' : 'text-[#454652]'">{{ note.subject || 'Brak przedmiotu' }}</p>
            </div>
          </button>
  
          <p v-if="!state.notes.length" class="text-sm font-['Plus_Jakarta_Sans'] text-muted-foreground w-full">
            Brak dostÄ™pnych notatek. UtwĂłrz nowÄ… klikajÄ…c przycisk.
          </p>
        </div>
      </div>
  
      <!-- Card 3: Footer Buttons -->
      <div class="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-6 md:p-8 w-full relative z-10 mb-7">
        <div v-if="error" class="mb-4 text-sm text-destructive font-['Plus_Jakarta_Sans'] font-semibold">
          {{ error }}
        </div>
        <div class="flex w-full flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
          <!-- Button Anuluj -->
          <button type="button" @click="resetForm" class="bg-[#f2f2f2] text-[#454652] font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-6 py-2.5 rounded-lg hover:bg-[#e5e5e5] transition-colors w-full sm:w-auto">
            Anuluj
          </button>
          <!-- Button Rozpocznij lekcjÄ™ -->
          <button type="button" :disabled="isGenerating" @click="handleGenerate" class="bg-[#0c3dfe] text-white font-['Plus_Jakarta_Sans'] font-semibold text-[16px] leading-[24px] px-8 py-2.5 rounded-lg transition-colors hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50 w-full sm:w-auto">
            {{ isGenerating ? "Przetwarzam..." : "Rozpocznij lekcjÄ™" }}
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="w-full relative z-10 space-y-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 class="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-[#191c1e] dark:text-foreground tracking-[-0.9px]">Edytor planu lekcji</h2>
            <p class="font-['Plus_Jakarta_Sans'] text-[16px] text-[#454652] dark:text-muted-foreground mt-1">Korekta przed startem lekcji na ĹĽywo</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="font-['Plus_Jakarta_Sans'] rounded-xl border border-transparent bg-white dark:bg-muted px-6 py-2.5 text-[16px] font-semibold text-[#454652] dark:text-foreground hover:bg-[#f2f2f2] dark:hover:bg-muted/80 transition-colors shadow-sm" @click="resetPlan">
              WrĂłÄ‡
            </button>
            <button
              type="button"
              class="font-['Plus_Jakarta_Sans'] rounded-xl bg-[#0c3dfe] px-6 py-2.5 text-[16px] font-semibold text-white transition hover:bg-[#0a34d4] disabled:opacity-50 shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)]"
              :disabled="isSaving"
              @click="saveAndStart"
            >
              {{ isSaving ? "Zapisywanie..." : "Zapisz i rozpocznij lekcjÄ™" }}
            </button>
          </div>
        </div>

        <div class="space-y-4 rounded-xl bg-white dark:bg-card border border-transparent dark:border-border shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
          <div v-if="sourceNote" class="rounded-xl border border-[#e0e3e6] bg-[#f7f9fc] p-4">
            <h3 class="font-['Plus_Jakarta_Sans'] mb-2 text-[14px] font-bold text-[#191c1e]">Notatka ĹşrĂłdĹ‚owa</h3>
            <textarea :value="sourceNote" readonly class="font-['Plus_Jakarta_Sans'] min-h-[120px] w-full rounded-lg border-none bg-transparent p-0 text-[14px] text-[#454652] outline-none resize-none" />
          </div>
          
          <div v-for="(point, idx) in lesson.plan" :key="point.id" class="rounded-xl border border-[#e0e3e6] p-5 bg-[#fbfcfd]">
            <div class="mb-4 flex items-center gap-3">
              <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0c3dfe]/10 text-sm font-bold text-[#0c3dfe]">{{ idx + 1 }}</span>
              <input v-model="point.title" class="font-['Plus_Jakarta_Sans'] flex-1 rounded-lg border border-[#e0e3e6] bg-white px-4 py-2.5 text-[#191c1e] text-[16px] font-semibold outline-none focus:border-[#0c3dfe] focus:ring-1 focus:ring-[#0c3dfe] transition-colors" placeholder="TytuĹ‚ punktu" />
            </div>
            <input
              v-model="point.keywordsDraft"
              class="font-['Plus_Jakarta_Sans'] mb-3 w-full rounded-lg border border-[#e0e3e6] bg-white px-4 py-2 text-[14px] text-[#454652] outline-none focus:border-[#0c3dfe] focus:ring-1 focus:ring-[#0c3dfe] transition-colors"
              placeholder="SĹ‚owa kluczowe (po przecinku)"
              @focus="ensureKeywordsDraft(point)"
              @blur="commitKeywords(point)"
              @keydown.enter.prevent="commitKeywords(point)"
            />
            <textarea v-model="point.description" class="font-['Plus_Jakarta_Sans'] min-h-[80px] w-full rounded-lg border border-[#e0e3e6] bg-white p-4 text-[14px] text-[#454652] outline-none focus:border-[#0c3dfe] focus:ring-1 focus:ring-[#0c3dfe] transition-colors resize-y" placeholder="Opis punktu do poruszenia na ĹĽywo..." />
            
            <div class="mt-2 flex justify-end">
              <button type="button" class="font-['Plus_Jakarta_Sans'] text-[14px] font-semibold text-red-500 hover:text-red-700 transition-colors" @click="removePoint(point.id)">UsuĹ„ punkt</button>
            </div>
          </div>
          </button>
          
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" class="font-['Plus_Jakarta_Sans'] w-full rounded-xl border-2 border-dashed border-[#0c3dfe]/40 bg-[#0c3dfe]/5 py-4 text-[14px] font-bold text-[#0c3dfe] transition-colors hover:bg-[#0c3dfe]/10" @click="addPoint">
              + Dodaj punkt do planu
            </button>
            <button
              v-if="removedPointsStack.length"
              type="button"
              class="font-['Plus_Jakarta_Sans'] w-full rounded-xl border border-[#f59e0b]/50 bg-[#fff7ed] py-4 text-[14px] font-bold text-[#b45309] transition-colors hover:bg-[#ffedd5]"
              @click="undoRemovePoint"
            >
              Cofnij usuniÄ™cie punktu
            </button>
          </div>
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
const { state, createLesson, uploadLessonMaterial, savePlan, fetchTeacherNotes } = useLessonStore();
const lesson = computed(() => state.lesson);

const title = ref("");
const lessonTime = ref("1-90min");
const selectedNoteId = ref("");
const isGenerating = ref(false);
const isSaving = ref(false);
const removedPointsStack = ref([]);

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
  title.value = String(note.title || title.value || "");
});

watch(
  () => lesson.value?.plan,
  (plan) => {
    if (!Array.isArray(plan)) return;
    for (const point of plan) {
      ensureKeywordsDraft(point);
    }
  },
  { immediate: true }
);

function resetForm() {
  title.value = "";
  selectedNoteId.value = "";
  lessonTime.value = "1-90min";
  removedPointsStack.value = [];
  error.value = "";
  info.value = "";
}

async function handleGenerate() {
  try {
    isGenerating.value = true;
    error.value = "";
    info.value = "";
    
    if (!title.value) {
      error.value = "WypeĹ‚nij temat lekcji.";
      return;
    }
    if (!selectedNoteId.value) {
      error.value = "Wybierz notatkÄ™ z listy materiaĹ‚Ăłw ĹşrĂłdĹ‚owych.";
      return;
    }

    const normalizedDate = new Date().toISOString().split("T")[0];
    const lessonMonth = new Date().toLocaleString("pl-PL", { month: "long" });
    const generatedSubject = selectedNote.value?.subject || "OgĂłlny";
    const extractedRawText = selectedNote.value?.content || "";

    const created = await createLesson({
      subject: generatedSubject,
      title: title.value,
      month: lessonMonth,
      date: normalizedDate,
      rawText: ""
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

function ensureKeywordsDraft(point) {
  if (!point) return;
  if (typeof point.keywordsDraft !== "string") {
    point.keywordsDraft = Array.isArray(point.keywords) ? point.keywords.join(", ") : "";
  }
}

function commitKeywords(point) {
  if (!point) return;
  const draft = String(point.keywordsDraft || "");
  point.keywords = draft
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  point.keywordsDraft = point.keywords.join(", ");
}

function addPoint() {
  state.lesson.plan.push({
    id: `point-${Date.now()}`,
    title: "Nowy punkt",
    keywords: [],
    keywordsDraft: "",
    description: "",
    status: "pending"
  });
}

function removePoint(id) {
  const index = state.lesson.plan.findIndex((p) => p.id === id);
  if (index < 0) return;
  const removedPoint = state.lesson.plan[index];
  removedPointsStack.value.push({ point: { ...removedPoint }, index });
  state.lesson.plan.splice(index, 1);
}

function undoRemovePoint() {
  const last = removedPointsStack.value.pop();
  if (!last) return;
  const safeIndex = Math.min(Math.max(Number(last.index || 0), 0), state.lesson.plan.length);
  state.lesson.plan.splice(safeIndex, 0, last.point);
}

function resetPlan() {
  state.lesson = null;
  removedPointsStack.value = [];
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

    const normalizedPlan = state.lesson.plan.map((point) => {
      const draft = String(point?.keywordsDraft || "");
      const keywords = draft
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean);
      return {
        ...point,
        keywords
      };
    });

    await savePlan(state.lesson.id, normalizedPlan);
    info.value = "Plan zapisany. PrzechodzÄ™ do lekcji na ĹĽywo...";
    await router.push(`/live-lesson/${state.lesson.id}`);
  } catch (e) {
    error.value = e.message || "Nie udaĹ‚o siÄ™ zapisaÄ‡ planu.";
  } finally {
    isSaving.value = false;
  }
}
</script>
