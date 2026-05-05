<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] w-full overflow-x-hidden relative">
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0" />

    <!-- Sidebar / Selection -->
    <div class="p-4 sm:p-6 md:p-12 pt-8 w-full max-w-[1664px] relative z-10 mx-auto no-print">
      <div class="mb-7">
        <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
          Generator Sprawdzianów
        </h1>
        <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-[28px]">
          Wybierz lekcję i stwórz profesjonalny test wiedzy w kilka sekund.
        </p>
      </div>

      <div class="grid grid-cols-12 gap-8">
        <!-- Selection Column -->
        <div class="col-span-12 lg:col-span-4 space-y-6">
          <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6">
            
            <!-- Tabs -->
            <div class="flex p-1 bg-[#f2f4f7] rounded-lg mb-6">
              <button 
                @click="activeTab = 'quiz'"
                class="flex-1 py-2 text-sm font-bold rounded-md transition-all"
                :class="activeTab === 'quiz' ? 'bg-white text-[#0c3dfe] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              >
                Sprawdzian
              </button>
              <button 
                @click="activeTab = 'homework'"
                class="flex-1 py-2 text-sm font-bold rounded-md transition-all"
                :class="activeTab === 'homework' ? 'bg-white text-[#0c3dfe] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              >
                Zadanie Domowe
              </button>
            </div>

            <!-- Source Selection Toggle -->
            <div class="flex items-center justify-between mb-4 px-1">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Źródło treści</label>
              <div class="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button 
                  @click="sourceType = 'lesson'" 
                  class="px-3 py-1 text-[11px] font-bold rounded-md transition-all"
                  :class="sourceType === 'lesson' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'"
                >
                  Lekcje
                </button>
                <button 
                  @click="sourceType = 'note'" 
                  class="px-3 py-1 text-[11px] font-bold rounded-md transition-all"
                  :class="sourceType === 'note' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'"
                >
                  Notatki
                </button>
              </div>
            </div>

            <!-- List of Lessons -->
            <div v-if="sourceType === 'lesson'" class="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <div
                v-for="lesson in state.lessons"
                :key="lesson.id"
                @click="handleSelectLesson(lesson)"
                class="p-4 rounded-xl border transition-all cursor-pointer"
                :class="selectedLessonId === lesson.id ? 'border-[#0c3dfe] bg-[#f0f4ff]' : 'border-[#e0e3e6] hover:bg-gray-50'"
              >
                <h4 class="font-bold text-[#191c1e] truncate">{{ lesson.title }}</h4>
                <p class="text-xs text-[#454652] mt-1">{{ lesson.subject }} • {{ lesson.date }}</p>
              </div>
              <div v-if="state.lessons.length === 0" class="text-center py-8 text-xs text-gray-400 italic">
                Brak przeprowadzonych lekcji.
              </div>
            </div>

            <!-- List of Notes -->
            <div v-else class="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <div
                v-for="note in state.notes"
                :key="note.id"
                @click="handleSelectNote(note)"
                class="p-4 rounded-xl border transition-all cursor-pointer"
                :class="selectedNoteId === note.id ? 'border-[#0c3dfe] bg-[#f0f4ff]' : 'border-[#e0e3e6] hover:bg-gray-50'"
              >
                <h4 class="font-bold text-[#191c1e] truncate">{{ note.title }}</h4>
                <p class="text-xs text-[#454652] mt-1">{{ note.subject }} • {{ note.date }}</p>
              </div>
              <div v-if="state.notes.length === 0" class="text-center py-8 text-xs text-gray-400 italic">
                Brak zapisanych notatek.
              </div>
            </div>

            <!-- Quiz Settings -->
            <div v-if="activeTab === 'quiz'" class="mt-6 space-y-4">
              <div class="flex gap-4">
                <div class="flex-1">
                  <label class="text-xs font-bold text-muted-foreground uppercase mb-1 block">Pytania zamknięte</label>
                  <input type="number" v-model="numClosed" min="0" max="20" class="w-full bg-[#f2f4f7] rounded-lg p-2.5 outline-none font-bold" />
                </div>
                <div class="flex-1">
                  <label class="text-xs font-bold text-muted-foreground uppercase mb-1 block">Pytania otwarte</label>
                  <input type="number" v-model="numOpen" min="0" max="10" class="w-full bg-[#f2f4f7] rounded-lg p-2.5 outline-none font-bold" />
                </div>
              </div>

              <button
                @click="handleGenerateQuiz"
                :disabled="isGenerating || (!selectedLessonId && !selectedNoteId)"
                class="w-full bg-[#0c3dfe] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {{ isGenerating ? 'Generowanie...' : 'Generuj Sprawdzian' }}
              </button>
            </div>

            <!-- Homework Settings -->
            <div v-else class="mt-6 space-y-4">
              <label class="text-xs font-bold text-muted-foreground uppercase mb-1 block">Treść zadania (np. strona, numer zadania)</label>
              <textarea 
                v-model="homeworkText" 
                rows="4"
                placeholder="np. Zadania 1-5 ze strony 120 w podręczniku. Termin: środa."
                class="w-full bg-[#f2f4f7] rounded-lg p-3 outline-none font-medium text-sm resize-none"
              ></textarea>
              <button
                @click="handleSaveHomework"
                :disabled="isSavingHomework || !selectedLessonId"
                class="w-full bg-[#0c3dfe] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {{ isSavingHomework ? 'Zapisywanie...' : 'Zapisz i udostępnij zadanie' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Preview / Editor Column -->
        <div class="col-span-12 lg:col-span-8">
          <!-- Quiz Preview -->
          <div v-if="activeTab === 'quiz' && quiz" class="space-y-6">
            <div class="flex items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-border">
              <input v-model="quiz.title" class="text-xl font-bold text-foreground bg-transparent border-none outline-none flex-1" />
              <button @click="printQuiz" class="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition">
                Drukuj / PDF
              </button>
            </div>

            <div v-for="(q, idx) in quiz.questions" :key="q.id" class="bg-white rounded-xl shadow-md p-6 border-l-4" :class="q.type === 'closed' ? 'border-blue-500' : 'border-amber-500'">
              <div class="flex justify-between items-start gap-4 mb-4">
                <div class="flex-1">
                  <span class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 text-gray-500 mb-2 inline-block">
                    Zadanie {{ idx + 1 }} ({{ q.type === 'closed' ? 'Zamknięte' : 'Otwarte' }})
                  </span>
                  <textarea v-model="q.question" rows="2" class="w-full text-lg font-bold text-foreground bg-transparent border-none outline-none resize-none" />
                </div>
                <div class="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <input type="number" v-model="q.points" class="w-10 bg-transparent text-center font-bold text-primary outline-none" />
                  <span class="text-xs font-bold text-gray-400">PKT</span>
                </div>
              </div>

              <!-- Closed Question Options -->
              <div v-if="q.type === 'closed'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="(opt, oIdx) in q.options" :key="oIdx" class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-transparent" :class="q.correctAnswer === oIdx ? 'border-emerald-200 bg-emerald-50' : ''">
                  <span class="w-6 h-6 flex items-center justify-center rounded-full bg-white text-xs font-black shadow-sm">{{ ['A','B','C','D'][oIdx] }}</span>
                  <input v-model="q.options[oIdx]" class="flex-1 bg-transparent border-none outline-none text-sm" />
                  <input type="radio" :name="'correct-'+q.id" :checked="q.correctAnswer === oIdx" @change="q.correctAnswer = oIdx" class="accent-emerald-600" />
                </div>
              </div>

              <!-- Open Question Answer Guide -->
              <div v-else class="mt-2">
                <label class="text-[10px] font-bold text-amber-600 uppercase mb-1 block">Klucz odpowiedzi (ukryty na sprawdzianie)</label>
                <textarea v-model="q.answerGuide" class="w-full bg-amber-50/50 p-3 rounded-lg text-sm italic text-gray-600 outline-none border border-amber-100" />
              </div>
            </div>
          </div>

          <!-- Homework Preview / QR -->
          <div v-else-if="activeTab === 'homework' && homeworkSaved" class="bg-white rounded-2xl shadow-xl p-10 text-center flex flex-col items-center">
            <div class="size-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 class="text-2xl font-black text-gray-900 mb-2">Zadanie zostało zapisane!</h2>
            <p class="text-gray-500 mb-8 max-w-sm">Uczniowie mogą teraz zobaczyć to zadanie po wejściu w link do notatki lub skanując poniższy kod QR.</p>
            
            <div class="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200 mb-8">
              <img :src="homeworkQrUrl" alt="QR" class="size-48 mx-auto mb-4" />
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skanuj aby zobaczyć zadanie</p>
            </div>

            <div class="w-full max-w-md space-y-3">
              <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <input :value="homeworkShareUrl" readonly class="bg-transparent border-none outline-none flex-1 text-xs text-blue-600 font-medium" />
                <button @click="copyLink" class="text-xs font-bold text-gray-500 hover:text-primary">Kopiuj</button>
              </div>
            </div>
          </div>

          <div v-else-if="!isGenerating" class="h-full flex flex-col items-center justify-center py-20 text-center opacity-40">
            <img src="../assets/archive.svg" class="h-20 w-20 mb-4" />
            <h3 class="text-xl font-bold">{{ activeTab === 'quiz' ? 'Wybierz lekcję i wygeneruj sprawdzian' : 'Wybierz lekcję i zadaj zadanie domowe' }}</h3>
            <p>Treść pojawi się w tym miejscu.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PRINT TEMPLATE (Hidden from UI, visible only on print) -->
    <div v-if="quiz" class="print-only p-12 bg-white text-black min-h-screen font-serif">
      <div class="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-2xl font-bold mb-1">{{ quiz.title }}</h1>
          <p class="text-sm">Imię i nazwisko: ............................................................................</p>
        </div>
        <div class="text-right">
          <p class="text-sm">Klasa: ...........</p>
          <p class="text-sm">Data: ...........</p>
        </div>
      </div>

      <div class="space-y-8">
        <div v-for="(q, idx) in quiz.questions" :key="q.id" class="break-inside-avoid">
          <div class="flex justify-between items-baseline mb-2">
            <h3 class="font-bold">Zadanie {{ idx + 1 }}. (0-{{ q.points }} pkt)</h3>
          </div>
          <p class="mb-4 text-lg">{{ q.question }}</p>

          <div v-if="q.type === 'closed'" class="grid grid-cols-2 gap-y-3 gap-x-8">
            <div v-for="(opt, oIdx) in q.options" :key="oIdx" class="flex items-center gap-2">
              <span class="w-5 h-5 border border-black flex items-center justify-center text-xs font-bold">{{ ['A','B','C','D'][oIdx] }}</span>
              <span>{{ opt }}</span>
            </div>
          </div>
          <div v-else class="space-y-4 pt-4">
            <div class="border-b border-gray-300 h-8 w-full"></div>
            <div class="border-b border-gray-300 h-8 w-full"></div>
            <div class="border-b border-gray-300 h-8 w-full"></div>
            <div class="border-b border-gray-300 h-8 w-full"></div>
          </div>
        </div>
      </div>

      <!-- ANSWER KEY (Separate page on print) -->
      <div class="page-break-before mt-20 pt-10 border-t-4 border-dashed border-gray-200">
        <h2 class="text-xl font-bold mb-6 text-center text-gray-500 uppercase tracking-widest">Klucz odpowiedzi (Tylko dla Nauczyciela)</h2>
        <div class="space-y-4">
          <div v-for="(q, idx) in quiz.questions" :key="'key-'+q.id" class="flex gap-4 border-b border-gray-100 pb-2">
            <span class="font-bold w-20">Zad. {{ idx + 1 }}:</span>
            <div v-if="q.type === 'closed'" class="font-black text-emerald-700">
              Poprawna: {{ ['A','B','C','D'][q.correctAnswer] }}
            </div>
            <div v-else class="text-sm text-gray-600">
              <span class="font-bold">Wytyczne:</span> {{ q.answerGuide }}
            </div>
          </div>
        </div>
      </div>

      <div class="mt-20 text-center text-[10px] text-gray-400">
        Wygenerowano przy użyciu CoTeach.pl - Twój asystent AI w edukacji.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useLessonStore } from "../composables/useLessonStore";
import { useRoute } from "vue-router";
import { supabase } from "../supabase";

const { state, fetchLessons, fetchTeacherNotes } = useLessonStore();
const route = useRoute();

const sourceType = ref("lesson"); // 'lesson' | 'note'
const selectedLessonId = ref(route.params.lessonId || "");
const selectedNoteId = ref("");
const activeTab = ref("quiz");
const numClosed = ref(5);
const numOpen = ref(2);
const isGenerating = ref(false);
const quiz = ref(null);

// Homework state
const homeworkText = ref("");
const isSavingHomework = ref(false);
const homeworkSaved = ref(false);
const homeworkShareUrl = ref("");
const homeworkQrUrl = ref("");

onMounted(async () => {
  await Promise.all([fetchLessons(), fetchTeacherNotes()]);
  if (!selectedLessonId.value && state.lessons.length > 0) {
    handleSelectLesson(state.lessons[0]);
  }
});

function handleSelectLesson(lesson) {
  selectedLessonId.value = lesson.id;
  selectedNoteId.value = "";
  homeworkText.value = lesson.homework || "";
  homeworkSaved.value = false;
  homeworkShareUrl.value = "";
  homeworkQrUrl.value = "";
}

function handleSelectNote(note) {
  selectedNoteId.value = note.id;
  selectedLessonId.value = "";
  homeworkText.value = ""; // Homework only for lessons
  homeworkSaved.value = false;
}

async function handleGenerateQuiz() {
  if (!selectedLessonId.value && !selectedNoteId.value) return;
  
  isGenerating.value = true;
  quiz.value = null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    // Używamy tej samej logiki co w useLessonStore
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
    
    const response = await fetch(`${API_BASE}/api/quizzes/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        lessonId: selectedLessonId.value,
        noteId: selectedNoteId.value,
        numClosed: numClosed.value,
        numOpen: numOpen.value
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Błąd serwera");
    }
    
    quiz.value = data.quiz;
  } catch (error) {
    console.error(error);
    alert(`Wystąpił błąd: ${error.message}. Upewnij się, że masz aktywną licencję i serwer backendowy jest zaktualizowany.`);
  } finally {
    isGenerating.value = false;
  }
}

async function handleSaveHomework() {
  if (!selectedLessonId.value) return;
  isSavingHomework.value = true;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
    
    const response = await fetch(`${API_BASE}/api/lessons/${selectedLessonId.value}/homework`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ homework: homeworkText.value })
    });

    if (!response.ok) throw new Error("Failed to save homework");
    
    const data = await response.json();
    homeworkShareUrl.value = data.shareUrl;
    homeworkQrUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.shareUrl)}`;
    homeworkSaved.value = true;
    
    // Update local state
    const lesson = state.lessons.find(l => l.id === selectedLessonId.value);
    if (lesson) lesson.homework = homeworkText.value;
    
  } catch (error) {
    console.error(error);
    alert("Błąd podczas zapisywania zadania.");
  } finally {
    isSavingHomework.value = false;
  }
}

function copyLink() {
  navigator.clipboard.writeText(homeworkShareUrl.value);
  alert("Link skopiowany!");
}

function printQuiz() {
  window.print();
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
  .page-break-before {
    page-break-before: always;
  }
  body {
    background: white !important;
  }
}

.print-only {
  display: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e0e3e6;
  border-radius: 10px;
}
</style>
