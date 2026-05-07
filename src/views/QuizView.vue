<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] w-full overflow-x-hidden relative">
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0"></div>

    <!-- Sidebar / Selection (Ukrywane przy druku) -->
    <div class="quiz-ui-container p-4 sm:p-6 md:p-12 pt-8 w-full max-w-[1664px] relative z-10 mx-auto no-print">
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
                class="flex-1 py-2 text-xs font-bold rounded-md transition-all"
                :class="activeTab === 'quiz' ? 'bg-white text-[#0c3dfe] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              >
                Generator
              </button>
              <button 
                @click="activeTab = 'grading'"
                class="flex-1 py-2 text-xs font-bold rounded-md transition-all"
                :class="activeTab === 'grading' ? 'bg-white text-[#0c3dfe] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              >
                Ocenianie
              </button>
              <button 
                @click="activeTab = 'homework'"
                class="flex-1 py-2 text-xs font-bold rounded-md transition-all"
                :class="activeTab === 'homework' ? 'bg-white text-[#0c3dfe] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              >
                Zadanie
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
                v-for="lesson in filteredLessons"
                :key="lesson.id"
                @click="handleSelectLesson(lesson)"
                class="p-4 rounded-xl border transition-all cursor-pointer"
                :class="selectedLessonId === lesson.id ? 'border-[#0c3dfe] bg-[#f0f4ff]' : 'border-[#e0e3e6] hover:bg-gray-50'"
              >
                <h4 class="font-bold text-[#191c1e] truncate">{{ lesson.title }}</h4>
                <p class="text-xs text-[#454652] mt-1">{{ lesson.subject }} • {{ lesson.date }}</p>
              </div>
              <div v-if="filteredLessons.length === 0" class="text-center py-8 text-xs text-gray-400 italic">
                {{ state.selectedClass ? 'Brak lekcji dla wybranej klasy.' : 'Brak przeprowadzonych lekcji.' }}
              </div>
            </div>

            <!-- List of Notes -->
            <div v-else class="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <div
                v-for="note in filteredNotes"
                :key="note.id"
                @click="handleSelectNote(note)"
                class="p-4 rounded-xl border transition-all cursor-pointer"
                :class="selectedNoteId === note.id ? 'border-[#0c3dfe] bg-[#f0f4ff]' : 'border-[#e0e3e6] hover:bg-gray-50'"
              >
                <h4 class="font-bold text-[#191c1e] truncate">{{ note.title }}</h4>
                <p class="text-xs text-[#454652] mt-1">{{ note.subject }} • {{ note.date }}</p>
              </div>
              <div v-if="filteredNotes.length === 0" class="text-center py-8 text-xs text-gray-400 italic">
                {{ state.selectedClass ? 'Brak notatek dla wybranej klasy.' : 'Brak zapisanych notatek.' }}
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

              <div>
                <label class="text-xs font-bold text-muted-foreground uppercase mb-1 block">Poziom trudności</label>
                <select v-model="difficulty" class="w-full bg-[#f2f4f7] rounded-lg p-2.5 outline-none font-bold">
                  <option value="łatwy">Łatwy</option>
                  <option value="średni">Średni</option>
                  <option value="trudny">Trudny</option>
                  <option value="bardzo trudny">Bardzo trudny (olimpiada)</option>
                </select>
              </div>

              <button
                @click="handleGenerateQuiz"
                :disabled="isGenerating || (!selectedLessonId && !selectedNoteId)"
                class="w-full bg-[#0c3dfe] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {{ isGenerating ? 'Generowanie...' : 'Generuj Sprawdzian' }}
              </button>
            </div>

            <!-- Grading Settings -->
            <div v-else-if="activeTab === 'grading'" class="mt-6 space-y-4">
              <label class="text-xs font-bold text-muted-foreground uppercase mb-1 block">Wybierz sprawdzian do oceny</label>
              <div class="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div
                  v-for="q in savedQuizzes"
                  :key="q.id"
                  @click="selectedGradingQuizId = q.id"
                  class="p-3 rounded-xl border transition-all cursor-pointer"
                  :class="selectedGradingQuizId === q.id ? 'border-[#0c3dfe] bg-[#f0f4ff]' : 'border-[#e0e3e6] hover:bg-gray-50'"
                >
                  <h4 class="font-bold text-sm text-[#191c1e] truncate">{{ q.title }}</h4>
                  <p class="text-[10px] text-[#454652] mt-0.5">{{ new Date(q.createdAt).toLocaleDateString() }} • {{ q.questions.length }} zadań</p>
                </div>
                <div v-if="savedQuizzes.length === 0" class="text-center py-8 text-xs text-gray-400 italic">
                  Brak zapisanych sprawdzianów. Wygeneruj sprawdzian najpierw.
                </div>
              </div>

              <div v-if="selectedGradingQuizId" class="pt-4 border-t border-gray-100">
                <input 
                  type="file" 
                  ref="fileInput" 
                  class="hidden" 
                  accept="image/*" 
                  @change="handleGradingUpload"
                />
                <button
                  @click="$refs.fileInput.click()"
                  :disabled="isGrading"
                  class="w-full bg-[#0c3dfe] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg v-if="isGrading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ isGrading ? 'Analizowanie pracy...' : 'Wgraj zdjęcie pracy' }}
                </button>
                <p class="text-[10px] text-center text-gray-400 mt-2">AI rozpozna pismo ręczne i zasugeruje ocenę.</p>

                <!-- Quiz Key Preview during grading -->
                <div v-if="selectedGradingQuiz" class="mt-6 pt-4 border-t border-gray-100">
                  <button 
                    @click="showKeyPreview = !showKeyPreview" 
                    class="w-full flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase hover:text-primary transition"
                  >
                    <span>Podgląd klucza pytań</span>
                    <svg :class="showKeyPreview ? 'rotate-180' : ''" class="w-4 h-4 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  
                  <div v-if="showKeyPreview" class="mt-3 space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <div v-for="(q, idx) in selectedGradingQuiz.questions" :key="q.id" class="p-3 bg-gray-50 rounded-lg text-[11px]">
                      <p class="font-bold mb-1 text-gray-700">Zadanie {{ idx + 1 }}: {{ q.question }}</p>
                      <p v-if="q.type === 'closed'" class="text-emerald-600 font-bold">Poprawna: {{ ['A','B','C','D'][q.correctAnswer] }}</p>
                      <p v-else class="text-amber-600 italic">Klucz: {{ q.answerGuide }}</p>
                    </div>
                  </div>
                </div>
              </div>
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
              <button @click="printQuiz" class="bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition shadow-md">
                Drukuj sprawdzian
              </button>
            </div>

            <div v-for="(q, idx) in quiz.questions" :key="q.id" class="bg-white rounded-xl shadow-md p-6 border-l-4" :class="q.type === 'closed' ? 'border-blue-500' : 'border-amber-500'">
              <div class="flex justify-between items-start gap-4 mb-4">
                <div class="flex-1">
                  <span class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 text-gray-500 mb-2 inline-block">
                    Zadanie {{ idx + 1 }} ({{ q.type === 'closed' ? 'Zamknięte' : 'Otwarte' }})
                  </span>
                  <textarea v-model="q.question" rows="2" class="w-full text-lg font-bold text-foreground bg-transparent border-none outline-none resize-none"></textarea>
                  <!-- Math Preview -->
                  <div v-if="q.question.includes('$')" class="mt-2 p-2 bg-blue-50/50 rounded border border-blue-100">
                    <p class="text-[10px] text-blue-400 font-bold uppercase mb-1">Podgląd matematyki:</p>
                    <div class="text-sm font-normal" v-html="renderMath(q.question)"></div>
                  </div>
                </div>
                <div class="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <input type="number" v-model="q.points" class="w-10 bg-transparent text-center font-bold text-primary outline-none" />
                  <span class="text-xs font-bold text-gray-400">PKT</span>
                </div>
              </div>

              <!-- Closed Question Options -->
              <div v-if="q.type === 'closed'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="(opt, oIdx) in q.options" :key="oIdx" class="flex flex-col gap-1">
                  <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-transparent" :class="q.correctAnswer === oIdx ? 'border-emerald-200 bg-emerald-50' : ''">
                    <span class="w-6 h-6 flex items-center justify-center rounded-full bg-white text-xs font-black shadow-sm">{{ ['A','B','C','D'][oIdx] }}</span>
                    <input v-model="q.options[oIdx]" class="flex-1 bg-transparent border-none outline-none text-sm" />
                    <input type="radio" :name="'correct-'+q.id" :checked="q.correctAnswer === oIdx" @change="q.correctAnswer = oIdx" class="accent-emerald-600" />
                  </div>
                  <!-- Math Preview for Option -->
                  <div v-if="opt.includes('$')" class="ml-2 text-xs text-blue-500" v-html="renderMath(opt)"></div>
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



          <!-- Grading Preview -->
          <div v-else-if="activeTab === 'grading' && gradingResult" class="space-y-6">
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
              <div class="bg-gradient-to-r from-[#0c3dfe] to-[#0059bb] p-6 text-white">
                <div class="flex justify-between items-start">
                  <div>
                    <h2 class="text-2xl font-black mb-1">Wynik: {{ gradingResult.studentName || 'Nieznany uczeń' }}</h2>
                    <p class="opacity-80 text-sm">Sprawdzian oceniony przez AI CoTeach</p>
                  </div>
                  <div class="text-right">
                    <div class="text-4xl font-black">{{ gradingResult.totalPoints }}/{{ gradingResult.maxPoints }}</div>
                    <div class="text-xs font-bold uppercase tracking-widest opacity-70">Suma punktów</div>
                  </div>
                </div>
              </div>

              <div class="p-6 space-y-4">
                <div v-for="res in gradingResult.results" :key="res.questionNumber" class="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div class="flex justify-between items-start mb-3">
                    <h4 class="font-bold text-gray-900">Zadanie {{ res.questionNumber }}</h4>
                    <div class="flex items-center gap-2">
                      <input type="number" step="0.5" v-model="res.pointsAwarded" class="w-12 bg-white border border-gray-200 rounded px-2 py-1 text-center font-bold text-primary" />
                      <span class="text-xs text-gray-400">/ {{ res.maxPoints }} PKT</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Rozpoznany tekst:</p>
                      <p class="text-sm italic text-gray-600">{{ res.recognizedText || '(brak tekstu)' }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Komentarz AI:</p>
                      <p class="text-sm text-gray-700">{{ res.comment }}</p>
                    </div>
                  </div>
                </div>

                <div class="pt-4 flex justify-end gap-3">
                  <button @click="gradingResult = null" class="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-700 transition">Anuluj</button>
                  <button @click="saveGradingResult" class="bg-[#0c3dfe] text-white px-8 py-2.5 rounded-xl font-bold hover:opacity-90 transition shadow-lg">
                    Zatwierdź i zapisz wynik
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="!isGenerating && !isGrading" class="h-full flex flex-col items-center justify-center py-20 text-center opacity-40">
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
          <p class="mb-4 text-lg" v-html="renderMath(q.question)"></p>

          <div v-if="q.type === 'closed'" class="grid grid-cols-2 gap-y-3 gap-x-8">
            <div v-for="(opt, oIdx) in q.options" :key="oIdx" class="flex items-center gap-2">
              <span class="w-5 h-5 border border-black flex items-center justify-center text-xs font-bold">{{ ['A','B','C','D'][oIdx] }}</span>
              <span v-html="renderMath(opt)"></span>
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
              <span class="font-bold">Wytyczne:</span> <span v-html="renderMath(q.answerGuide)"></span>
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
import { ref, onMounted, computed } from "vue";
import { useLessonStore } from "../composables/useLessonStore";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../supabase";

const { state, fetchLessons, fetchTeacherNotes, saveQuizResult } = useLessonStore();
const route = useRoute();
const router = useRouter();

const sourceType = ref("lesson"); // 'lesson' | 'note'
const selectedLessonId = ref(route.params.lessonId || "");
const selectedNoteId = ref("");
const activeTab = ref("quiz");
const numClosed = ref(5);
const numOpen = ref(2);
const difficulty = ref("średni");
const isGenerating = ref(false);
const isExporting = ref(false);
const quiz = ref(null);

// Homework state
const homeworkText = ref("");
const isSavingHomework = ref(false);
const homeworkSaved = ref(false);
const homeworkShareUrl = ref("");
const homeworkQrUrl = ref("");

// Grading state
const savedQuizzes = ref([]);
const selectedGradingQuizId = ref("");
const showKeyPreview = ref(false);
const isGrading = ref(false);
const gradingResult = ref(null);

const selectedGradingQuiz = computed(() => {
  return savedQuizzes.value.find(q => q.id === selectedGradingQuizId.value) || null;
});

const filteredLessons = computed(() => {
  if (!state.selectedClass || !state.selectedClassName) return state.lessons;
  return state.lessons.filter(l => 
    l.class_id === state.selectedClass || 
    l.class_name === state.selectedClassName ||
    l.classLevel === state.selectedClassName
  );
});

const filteredNotes = computed(() => {
  if (!state.selectedClass || !state.selectedClassName) return state.notes;
  return state.notes.filter(n => 
    n.class_id === state.selectedClass || 
    n.class_name === state.selectedClassName ||
    n.classLevel === state.selectedClassName
  );
});

function renderMath(text) {
  if (!text) return "";
  const str = String(text);
  if (typeof window === 'undefined' || !window.katex) return str;
  
  // Wykrywa matematykę w $...$ i podmienia na HTML z katexa
  return str.replace(/\$(.*?)\$/g, (match, mathExp) => {
    try {
      return window.katex.renderToString(mathExp, { 
        throwOnError: false, 
        displayMode: false,
        strict: false
      });
    } catch (e) {
      console.warn("KaTeX error:", e);
      return match;
    }
  });
}

onMounted(async () => {
  await Promise.all([fetchLessons(), fetchTeacherNotes(), fetchSavedQuizzes()]);
  if (!selectedLessonId.value && state.lessons.length > 0) {
    handleSelectLesson(state.lessons[0]);
  }
});

async function fetchSavedQuizzes() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
    const res = await fetch(`${API_BASE}/api/quizzes`, {
      headers: { "Authorization": `Bearer ${session?.access_token}` }
    });
    const data = await res.json();
    savedQuizzes.value = data.quizzes || [];
  } catch (e) {
    console.error("Failed to fetch quizzes", e);
  }
}

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
        numOpen: numOpen.value,
        difficulty: difficulty.value
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

function printQuiz() {
  window.print();
}

function copyLink() {
  navigator.clipboard.writeText(homeworkShareUrl.value);
  alert("Link skopiowany!");
}

async function handleGradingUpload(event) {
  const file = event.target.files[0];
  if (!file || !selectedGradingQuizId.value) return;

  isGrading.value = true;
  gradingResult.value = null;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("quizId", selectedGradingQuizId.value);

    const { data: { session } } = await supabase.auth.getSession();
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

    const response = await fetch(`${API_BASE}/api/quizzes/grade`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session?.access_token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Błąd serwera");
    
    gradingResult.value = data.gradingResult;
  } catch (error) {
    console.error(error);
    alert(`Błąd podczas oceniania: ${error.message}`);
  } finally {
    isGrading.value = false;
    // Reset input
    event.target.value = "";
  }
}

async function saveGradingResult() {
  if (!gradingResult.value || !selectedGradingQuizId.value) return;
  
  try {
    await saveQuizResult({
      quizId: selectedGradingQuizId.value,
      studentName: gradingResult.value.studentName,
      totalPoints: gradingResult.value.totalPoints,
      maxPoints: gradingResult.value.maxPoints,
      results: gradingResult.value.results
    });
    
    alert("Wynik został zapisany pomyślnie!");
    gradingResult.value = null;
    router.push("/archive?tab=quizzes");
  } catch (error) {
    console.error(error);
    alert("Błąd podczas zapisywania wyniku.");
  }
}
</script>

<style>
/* Style globalne dla druku - poza scoped, aby na pewno działały */
@media print {
  .no-print,
  header,
  aside,
  nav,
  .sidebar,
  .navbar,
  .quiz-ui-container {
    display: none !important;
  }

  .print-only {
    display: block !important;
    position: relative !important;
    background: white !important;
    color: black !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-only * {
    color: black !important;
    background-color: transparent !important;
    opacity: 1 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .page-break-before {
    page-break-before: always !important;
    padding-top: 3cm !important; /* Margines od góry dla każdej nowej strony (klucza odpowiedzi) */
  }

  @page {
    size: auto;
    margin: 0mm; /* To ukrywa nagłówki i stopki przeglądarki (datę, URL) */
  }

  body {
    margin: 0;
  }

  .print-only {
    padding: 3cm 2cm 2cm 2cm !important; /* Większy margines od góry (3cm) */
  }
}
</style>

<style scoped>
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
