<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] w-full overflow-x-hidden relative">
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0" />

    <div class="p-4 sm:p-6 md:p-12 pt-8 w-full max-w-[1664px] relative z-10 mx-auto">
      <div class="mb-7 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="max-w-[1024px]">
          <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
            Archiwum
          </h1>
          <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-[28px]">
            Przeglądaj i edytuj przeprowadzone lekcje, utworzone prezentacje i notatki końcowe.
          </p>
        </div>

        <!-- Global Class Filter -->
        
      </div>

      <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 xl:col-span-8 space-y-6">
          <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-5 sm:p-6">
            <div class="mb-4 flex flex-wrap gap-3">
              <button
                type="button"
                @click="activeTab = 'notes'"
                :class="[
                  'inline-flex h-11 items-center gap-2 rounded-full px-6 text-[15px] font-bold transition',
                  activeTab === 'notes' ? 'bg-[#0c3dfe] text-white' : 'bg-[#e7e8ee] text-[#4b5563] hover:bg-[#dde0e8]'
                ]"
              >
                <img :src="archiveIcon" alt="" class="h-4 w-4 shrink-0" :class="activeTab === 'notes' ? 'brightness-0 invert' : ''" />
                Notatki
              </button>
              <button
                type="button"
                @click="activeTab = 'lessons'"
                :class="[
                  'inline-flex h-11 items-center gap-2 rounded-full px-6 text-[15px] font-bold transition',
                  activeTab === 'lessons' ? 'bg-[#0c3dfe] text-white' : 'bg-[#e7e8ee] text-[#4b5563] hover:bg-[#dde0e8]'
                ]"
              >
                <img :src="liveLessonIcon" alt="" class="h-4 w-4 shrink-0" :class="activeTab === 'lessons' ? 'brightness-0 invert' : ''" />
                Lekcje
              </button>
              <button
                type="button"
                @click="activeTab = 'presentations'"
                :class="[
                  'inline-flex h-11 items-center gap-2 rounded-full px-6 text-[15px] font-bold transition',
                  activeTab === 'presentations' ? 'bg-[#0c3dfe] text-white' : 'bg-[#e7e8ee] text-[#4b5563] hover:bg-[#dde0e8]'
                ]"
              >
                <img :src="presentationIcon" alt="" class="h-4 w-4 shrink-0" :class="activeTab === 'presentations' ? 'brightness-0 invert' : ''" />
                Prezentacje
              </button>
              <button
                type="button"
                @click="activeTab = 'quizzes'"
                :class="[
                  'inline-flex h-11 items-center gap-2 rounded-full px-6 text-[15px] font-bold transition',
                  activeTab === 'quizzes' ? 'bg-[#0c3dfe] text-white' : 'bg-[#e7e8ee] text-[#4b5563] hover:bg-[#dde0e8]'
                ]"
              >
                <svg class="h-4 w-4 shrink-0" :class="activeTab === 'quizzes' ? 'text-white' : 'text-[#4b5563]'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sprawdziany
              </button>
            </div>
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block mb-2">
              {{ searchLabel }}
            </label>
            <div class="bg-[#e0e3e6] rounded-lg px-4 py-3">
              <input
                v-model="searchQuery"
                class="w-full bg-transparent outline-none border-none font-['Plus_Jakarta_Sans'] text-[16px] text-[#191c1e] placeholder-[#767683]"
                :placeholder="searchPlaceholder"
              />
            </div>
          </div>

          <div v-if="activeTab === 'lessons' && !filteredLessons.length" class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-10 text-center">
            <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[16px]">Brak zarchiwizowanych lekcji.</p>
          </div>

          <div
            v-if="activeTab === 'lessons'"
            v-for="lesson in filteredLessons"
            :key="lesson.id"
            class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-5 cursor-pointer transition-colors"
            :class="selected?.id === lesson.id ? 'ring-2 ring-[#0c3dfe]/30' : 'hover:bg-[#f5f7fb]'"
            @click="selectLesson(lesson)"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex w-full items-center gap-4">
                <img :src="liveLessonIcon" alt="" class="h-6 w-6 shrink-0 opacity-85" />
                <div class="min-w-0">
                  <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px] truncate">
                    {{ lesson.finalNote?.title || lesson.title }}
                  </h3>
                  <p class="font-['Inter'] text-[#454652] text-[14px] mt-1">
                    <span v-if="lesson.class_name" class="font-semibold text-[#0c3dfe]">{{ lesson.class_name }} • </span>
                    {{ lesson.finalNote?.subject || lesson.subject }} • {{ lesson.finalNote?.date || lesson.date }} •
                    <span class="font-semibold text-[#0053db]">
                      Omówione punkty: {{ discussed(lesson) }}/{{ lesson.plan?.length || 0 }}
                    </span>
                  </p>
                </div>
              </div>
              <span class="shrink-0 rounded-lg bg-[#e8eefb] px-3 py-1.5 font-['Inter'] font-semibold text-[12px] text-[#142588]">
                {{ lesson.month || "Brak miesiąca" }}
              </span>
            </div>
          </div>

          <div v-if="activeTab === 'notes' && !filteredNotes.length" class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-10 text-center">
            <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[16px]">Brak zapisanych notatek.</p>
          </div>

          <div
            v-if="activeTab === 'notes'"
            v-for="note in filteredNotes"
            :key="note.id"
            class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-5 cursor-pointer transition-colors"
            :class="selectedNote?.id === note.id ? 'ring-2 ring-[#0c3dfe]/30' : 'hover:bg-[#f5f7fb]'"
            @click="selectedNote = note"
          >
            <div class="flex w-full items-center gap-4">
              <img :src="archiveIcon" alt="" class="h-6 w-6 shrink-0 opacity-85" />
              <div class="min-w-0">
                <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px] truncate">
                  {{ note.title || "Bez tytułu" }}
                </h3>
                <p class="font-['Inter'] text-[#454652] text-[14px] mt-1">
                  <span v-if="note.class_name" class="font-semibold text-[#0c3dfe]">{{ note.class_name }} • </span>
                  {{ note.subject || "Brak przedmiotu" }} • {{ note.classLevel || "Brak poziomu" }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'presentations' && !filteredPresentations.length" class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-10 text-center">
            <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[16px]">Brak zapisanych prezentacji.</p>
          </div>

          <div
            v-if="activeTab === 'presentations'"
            v-for="item in filteredPresentations"
            :key="item.id"
            class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-5 cursor-pointer transition-colors"
            :class="selectedPresentation?.id === item.id ? 'ring-2 ring-[#0c3dfe]/30' : 'hover:bg-[#f5f7fb]'"
            @click="selectedPresentation = item"
          >
            <div class="flex w-full items-center gap-4">
              <img :src="presentationIcon" alt="" class="h-6 w-6 shrink-0 opacity-85" />
              <div class="min-w-0">
                <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px] truncate">
                  {{ item.title || "Prezentacja" }}
                </h3>
                <p class="font-['Inter'] text-[#454652] text-[14px] mt-1">
                  <span v-if="item.class_name" class="font-semibold text-[#0c3dfe]">{{ item.class_name }} • </span>
                  {{ item.createdAtLabel || formatDate(item.createdAt) }} • {{ item.slideCount || 0 }} slajdów • {{ styleLabels[item.style] || styleLabels.auto }}
                </p>
              </div>
            </div>
          </div>

          <!-- Quizzes List -->
          <div v-if="activeTab === 'quizzes' && !filteredQuizzes.length" class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-10 text-center">
            <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[16px]">Brak zapisanych sprawdzianów.</p>
          </div>

          <div
            v-if="activeTab === 'quizzes'"
            v-for="quiz in filteredQuizzes"
            :key="quiz.id"
            class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-5 cursor-pointer transition-colors"
            :class="selectedQuiz?.id === quiz.id ? 'ring-2 ring-[#0c3dfe]/30' : 'hover:bg-[#f5f7fb]'"
            @click="selectQuiz(quiz)"
          >
            <div class="flex w-full items-center gap-4">
              <div class="size-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px] truncate">
                  {{ quiz.title || "Sprawdzian" }}
                </h3>
                <p class="font-['Inter'] text-[#454652] text-[14px] mt-1">
                  {{ formatDate(quiz.createdAt) }} • {{ quiz.questions?.length || 0 }} pytań
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-12 xl:col-span-4 space-y-6">
          <div v-if="activeTab === 'lessons' && selected" class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px]">
                Szczegóły lekcji
              </h3>
              <button
                class="px-3 py-2 rounded-lg bg-[#ffe8dd] text-[#9e3f4e] text-sm font-semibold hover:bg-[#ffdacc] transition-colors disabled:opacity-60 cursor-pointer dark:bg-destructive/10 dark:text-destructive dark:hover:bg-destructive/20"
                @click="handleDeleteLesson"
                :disabled="saving"
              >
                Usuń
              </button>
            </div>

            <template v-if="selected?.finalNote">
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Temat</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5">
                <input v-model="editTitle" class="w-full bg-transparent border-none outline-none font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e]" placeholder="Tytuł notatki" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Przedmiot</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5">
                <input v-model="editSubject" class="w-full bg-transparent border-none outline-none font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e]" placeholder="Przedmiot" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Data</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5">
                <input v-model="editDate" type="date" class="w-full bg-transparent border-none outline-none font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e] [color-scheme:light]" />
              </div>
            </div>

            <button
              class="w-full rounded-lg bg-[#7b3400] text-[#ffa26e] font-['Inter'] font-semibold py-2.5 hover:bg-[#6a2d00] transition-colors disabled:opacity-60 cursor-pointer"
              :disabled="saving"
              @click="handleSaveFinalNote"
            >
              {{ saving ? "Zapisywanie..." : "Zapisz zmiany" }}
            </button>

            <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px] mt-4">
                Złota Notatka
            </h3>

            <button
              type="button"
              class="w-full rounded-xl bg-[#f2f4f7] p-3 transition-colors hover:bg-[#e8ebf0] cursor-pointer"
              @click="openQrModal"
            >
              <img :src="qrCodeUrl" alt="QR" width="220" height="220" class="mx-auto" />
            </button>

            <button
              v-if="selected.finalNote.shareUrl"
              class="w-full rounded-lg bg-[#0053db] text-white font-['Inter'] font-semibold py-2.5 hover:bg-[#0043b2] transition-colors cursor-pointer"
              @click="openFinalNote"
            >
              Otwórz notatkę (link)
            </button>

            <button
              v-if="selected.finalNote.shareUrl"
              class="w-full rounded-lg bg-[#0053db] text-white font-['Inter'] font-semibold py-2.5 hover:bg-[#0043b2] transition-colors cursor-pointer"
              @click="openTranscript"
            >
              Otwórz transkrypcję (link)
            </button>

            <button
              type="button"
              class="w-full rounded-lg bg-[#142588] text-white font-['Inter'] font-semibold py-2.5 hover:bg-[#0f1d66] transition-colors cursor-pointer"
              @click="openGoldenNotePreview"
            >
              Pokaż treść notatki
            </button>
            </template>
            <div v-else class="py-4">
              <p class="font-['Inter'] text-[#454652] text-[14px]">Dla tej lekcji nie ma jeszcze notatki końcowej.</p>
            </div>

           
          </div>

          <div v-else-if="activeTab === 'notes' && selectedNote" class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px]">
                Szczegóły notatki
              </h3>
              <button
                type="button"
                class="px-3 py-2 rounded-lg bg-[#ffe8dd] text-[#9e3f4e] text-sm font-semibold hover:bg-[#ffdacc] transition-colors cursor-pointer dark:bg-destructive/10 dark:text-destructive dark:hover:bg-destructive/20"
                @click="handleDeleteTeacherNote"
              >
                Usuń
              </button>
            </div>

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Tytuł</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5">
                <div class="font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e]">{{ selectedNote.title || "Bez tytułu" }}</div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Przedmiot</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5">
                <div class="font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e]">{{ selectedNote.subject || "Brak" }}</div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Poziom</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5">
                <div class="font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e]">{{ selectedNote.classLevel || "Brak" }}</div>
              </div>
            </div>

            <button
              type="button"
              class="w-full rounded-lg bg-[#142588] py-2.5 text-center font-['Inter'] font-semibold text-white hover:bg-[#0f1d66] transition-colors cursor-pointer"
              @click="openTeacherNotePreview"
            >
              Pokaż treść notatki
            </button>
            <!-- <RouterLink
              to="/notes"
              class="block w-full rounded-lg bg-[#e6e8eb] py-2.5 text-center font-['Inter'] font-semibold text-[#142588] hover:bg-[#d8dadd] transition-colors cursor-pointer"
            >
              Przejdź do notatek
            </RouterLink> -->
          </div>

          <div v-else-if="activeTab === 'presentations' && selectedPresentation" class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px]">
                Szczegóły prezentacji
              </h3>
              <button
                type="button"
                class="px-3 py-2 rounded-lg bg-[#ffe8dd] text-[#9e3f4e] text-sm font-semibold hover:bg-[#ffdacc] transition-colors cursor-pointer dark:bg-destructive/10 dark:text-destructive dark:hover:bg-destructive/20"
                @click="handleDeletePresentation"
              >
                Usuń
              </button>
            </div>

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Tytuł</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5">
                <div class="font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e]">{{ selectedPresentation.title || "Prezentacja" }}</div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Liczba slajdów</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5">
                <div class="font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e]">{{ selectedPresentation.slideCount || 0 }} slajdów</div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Styl wizualny</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5">
                <div class="font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e]">{{ styleLabels[selectedPresentation.style] || "Automatyczny" }}</div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Data utworzenia</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5">
                <div class="font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e]">{{ selectedPresentation.createdAtLabel || formatDate(selectedPresentation.createdAt) }}</div>
              </div>
            </div>

            <button
              type="button"
              class="w-full rounded-lg bg-[#0053db] text-white font-['Inter'] font-semibold py-2.5 hover:bg-[#0043b2] transition-colors cursor-pointer"
              @click="openSelectedPresentation"
            >
              Otwórz tę prezentację
            </button>

            <button
              type="button"
              class="w-full rounded-lg bg-[#e6e8eb] py-2.5 text-center font-['Inter'] font-semibold text-[#142588] hover:bg-[#d8dadd] transition-colors cursor-pointer"
              @click="editSelectedPresentation"
            >
              Edytuj prezentację
            </button>

            <!-- <button
              type="button"
              class="w-full rounded-lg bg-[#e6e8eb] py-2.5 text-center font-['Inter'] font-semibold text-[#142588] hover:bg-[#d8dadd] transition-colors cursor-pointer"
              @click="openPresentationGenerator"
            >
              Otwórz generator prezentacji
            </button> -->
          </div>

          <!-- Quiz Details -->
          <div v-else-if="activeTab === 'quizzes' && selectedQuiz" class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 space-y-6">
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px]">
                Szczegóły sprawdzianu
              </h3>
              <button
                type="button"
                class="px-3 py-2 rounded-lg bg-[#ffe8dd] text-[#9e3f4e] text-sm font-semibold hover:bg-[#ffdacc] transition-colors cursor-pointer"
                @click="handleDeleteQuiz"
              >
                Usuń
              </button>
            </div>

            <div class="space-y-4">
              <button
                @click="router.push(`/quiz/${selectedQuiz.lessonId || ''}`)"
                class="w-full rounded-lg bg-[#0c3dfe] text-white font-bold py-3 hover:opacity-90 transition"
              >
                Drukuj / Edytuj sprawdzian
              </button>
              
              <div class="border-t border-gray-100 pt-4">
                <h4 class="text-xs font-bold text-gray-400 uppercase mb-3">Wyniki uczniów ({{ quizResults.length }})</h4>
                <div v-if="quizResults.length === 0" class="text-center py-6 text-sm text-gray-400 italic">
                  Brak ocenionych prac dla tego sprawdzianu.
                </div>
                <div v-else class="space-y-3">
                  <div v-for="res in quizResults" :key="res.id" class="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div class="flex justify-between items-center mb-1">
                      <span class="font-bold text-sm">{{ res.student_name }}</span>
                      <span class="font-black text-blue-600">{{ res.total_points }}/{{ res.max_points }}</span>
                    </div>
                    <p class="text-[10px] text-gray-400">{{ new Date(res.created_at).toLocaleString() }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="qr-modal">
        <div
          v-if="isQrModalOpen && qrCodeUrl"
          class="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
          @click="closeQrModal"
        >
          <div class="rounded-3xl bg-white p-5 shadow-2xl" @click.stop>
            <img :src="qrCodeUrl" alt="QR" width="320" height="320" class="mx-auto h-auto w-full max-w-[320px]" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="textPreviewOpen"
        class="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
        @click.self="textPreviewOpen = false"
      >
        <div class="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" @click.stop>
          <div class="mb-4 flex justify-end">
            <button
              type="button"
              class="rounded-lg bg-[#f2f2f2] px-3 py-1.5 text-sm font-semibold text-[#454652] hover:bg-[#e5e5e5]"
              @click="textPreviewOpen = false"
            >
              Zamknij
            </button>
          </div>
          <pre class="whitespace-pre-wrap font-['Plus_Jakarta_Sans'] text-[14px] leading-relaxed text-[#191c1e]">{{ textPreviewBody }}</pre>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import { supabase } from "../supabase";
import { loadPresentationHistoryRaw, savePresentationHistoryRaw } from "../lib/presentationHistoryStorage";
import archiveIcon from "../assets/archive.svg";
import liveLessonIcon from "../assets/livelesson.svg";
import presentationIcon from "../assets/presentation.svg";

const styleLabels = {
  auto: "Automatyczny",
  academic: "Akademicki",
  creative: "Kreatywny",
  minimalist: "Minimalistyczny",
  fun: "Dla dzieci"
};

const ARCHIVE_OPEN_PRESENTATION_KEY = "coteach:open-presentation-id";
const ARCHIVE_ACTIVE_TAB_KEY = "coteach:archive-active-tab";
const SKIP_REVIEW_KEY = "coteach:skip-review";
const { state, fetchLessons, fetchTeacherNotes, fetchQuizzes, fetchQuizResults, deleteQuiz, updateFinalNote, deleteLesson, deleteTeacherNote, fetchUserClasses } = useLessonStore();
const router = useRouter();
const historyOwnerId = ref("");
const textPreviewOpen = ref(false);
const textPreviewBody = ref("");
const activeTab = ref(router.currentRoute.value.query.tab || localStorage.getItem(ARCHIVE_ACTIVE_TAB_KEY) || "lessons");
const searchQuery = ref("");
const selected = ref(null);
const selectedNote = ref(null);
const selectedPresentation = ref(null);
const presentationHistory = ref([]);
const saving = ref(false);
const editTitle = ref("");
const editSubject = ref("");
const editDate = ref("");
const isQrModalOpen = ref(false);
const selectedQuiz = ref(null);
const quizResults = ref([]);

onMounted(async () => {
  await Promise.all([fetchLessons(), fetchTeacherNotes(), fetchQuizzes(), fetchUserClasses()]);
  await refreshPresentationHistory();
  if (filteredLessons.value.length) selectLesson(filteredLessons.value[0]);

  // Prioritize route query tab on mount
  if (router.currentRoute.value.query.tab) {
    activeTab.value = router.currentRoute.value.query.tab;
  }

  if (filteredNotes.value.length) selectedNote.value = filteredNotes.value[0];
  if (filteredPresentations.value.length) selectedPresentation.value = filteredPresentations.value[0];
});


const filteredLessons = computed(() => {
  let archivedLessons = state.lessons;
  
  if (state.selectedClass) {
    archivedLessons = archivedLessons.filter(l => l.class_name === state.selectedClassName);
  }

  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return archivedLessons;
  return archivedLessons.filter((l) => {
    const noteTitle = l.finalNote?.title || l.title || "";
    const noteSubject = l.finalNote?.subject || l.subject || "";
    return `${noteTitle} ${noteSubject} ${l.month || ""}`.toLowerCase().includes(q);
  });
});

const filteredNotes = computed(() => {
  let notes = Array.isArray(state.notes) ? state.notes : [];

  if (state.selectedClass) {
    // Note uses classLevel or class_level
    notes = notes.filter(n => (n.classLevel === state.selectedClassName || n.class_level === state.selectedClassName));
  }

  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return notes;
  return notes.filter((note) => {
    return `${note.title || ""} ${note.subject || ""} ${note.classLevel || note.class_level || ""}`.toLowerCase().includes(q);
  });
});

const filteredPresentations = computed(() => {
  const uid = String(historyOwnerId.value || "").trim();
  let owned = presentationHistory.value.filter((item) => {
    if (!uid) return true;
    const oid = String(item.ownerId || "").trim();
    return !oid || oid === uid;
  });

  if (state.selectedClass) {
    owned = owned.filter(p => p.class_name === state.selectedClassName);
  }

  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return owned;
  return owned.filter((item) => {
    return `${item.title || ""} ${item.createdAtLabel || ""}`.toLowerCase().includes(q);
  });
});

const filteredQuizzes = computed(() => {
  let quizzes = state.quizzes || [];
  
  if (state.selectedClass) {
    quizzes = quizzes.filter(q => q.class_name === state.selectedClassName);
  }

  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return quizzes;
  return quizzes.filter((quiz) => {
    return `${quiz.title || ""} ${quiz.class_name || ""}`.toLowerCase().includes(q);
  });
});

const searchLabel = computed(() => {
  if (activeTab.value === "notes") return "Szukaj notatek";
  if (activeTab.value === "presentations") return "Szukaj prezentacji";
  if (activeTab.value === "quizzes") return "Szukaj sprawdzianów";
  return "Szukaj lekcji";
});

const searchPlaceholder = computed(() => {
  if (activeTab.value === "notes") return "Szukaj według tytułu, przedmiotu albo poziomu...";
  if (activeTab.value === "presentations") return "Szukaj według tytułu lub daty prezentacji...";
  if (activeTab.value === "quizzes") return "Szukaj według tytułu sprawdzianu...";
  return "Szukaj według przedmiotu, tytułu albo miesiąca...";
});

const qrCodeUrl = computed(() => {
  const shareUrl = selected.value?.finalNote?.shareUrl;
  if (!shareUrl) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(shareUrl)}`;
});

function discussed(lesson) {
  return (lesson.plan || []).filter((p) => p.status === "discussed").length;
}

function selectLesson(lesson) {
  isQrModalOpen.value = false;
  selected.value = lesson;
  editTitle.value = String(lesson?.finalNote?.title || "");
  editSubject.value = String(lesson?.finalNote?.subject || "");
  editDate.value = String(lesson?.finalNote?.date || "");
}

async function handleSaveFinalNote() {
  if (!selected.value?.id || !selected.value?.finalNote) return;
  try {
    saving.value = true;
    const lesson = await updateFinalNote(selected.value.id, {
      title: editTitle.value,
      subject: editSubject.value,
      date: editDate.value
    });
    selectLesson(lesson);
  } finally {
    saving.value = false;
  }
}

async function handleDeleteLesson() {
  if (!selected.value?.id) return;
  const confirmed = window.confirm("Na pewno usunąć tę lekcję z bazy danych? Tej operacji nie da się cofnąć.");
  if (!confirmed) return;
  const deletedLessonId = selected.value.id;
  try {
    saving.value = true;
    await deleteLesson(deletedLessonId);

    selected.value = filteredLessons.value[0] || null;
    if (selected.value) selectLesson(selected.value);
    else {
      editTitle.value = "";
      editSubject.value = "";
      editDate.value = "";
    }
  } finally {
    saving.value = false;
  }
}

function openFinalNote() {
  if (!selected.value?.finalNote?.shareUrl) return;
  window.open(selected.value.finalNote.shareUrl, "_blank", "noopener,noreferrer");
}

function openTranscript() {
  if (!selected.value?.finalNote?.shareUrl) return;
  window.open(selected.value.finalNote.shareUrl + "?type=transcript", "_blank", "noopener,noreferrer");
}

function openQrModal() {
  if (!qrCodeUrl.value) return;
  isQrModalOpen.value = true;
}

function closeQrModal() {
  isQrModalOpen.value = false;
}

async function refreshPresentationHistory() {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  historyOwnerId.value = String(session?.user?.id || "");
  const { list } = loadPresentationHistoryRaw(historyOwnerId.value);
  presentationHistory.value = list;
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function openGoldenNotePreview() {
  const html = selected.value?.finalNote?.html || "";
  textPreviewBody.value = stripHtml(html) || "Brak treści notatki.";
  textPreviewOpen.value = true;
}

function openTeacherNotePreview() {
  const raw = String(selectedNote.value?.content || "").trim();
  textPreviewBody.value = raw || "Brak treści notatki.";
  textPreviewOpen.value = true;
}

async function handleDeleteTeacherNote() {
  if (!selectedNote.value?.id) return;
  const ok = window.confirm("Na pewno usunąć tę notatkę? Operacji nie da się cofnąć.");
  if (!ok) return;
  try {
    await deleteTeacherNote(selectedNote.value.id);
    selectedNote.value = filteredNotes.value[0] || null;
  } catch (e) {
    window.alert(e?.message || "Nie udało się usunąć notatki.");
  }
}

function handleDeletePresentation() {
  if (!selectedPresentation.value?.id) return;
  const ok = window.confirm("Usunąć tę prezentację z archiwum na tym urządzeniu?");
  if (!ok) return;
  const id = selectedPresentation.value.id;
  presentationHistory.value = presentationHistory.value.filter((item) => item.id !== id);
  savePresentationHistoryRaw(historyOwnerId.value, presentationHistory.value);
  selectedPresentation.value = filteredPresentations.value[0] || null;
}

function formatDate(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "Brak daty";
  return date.toLocaleString("pl-PL");
}

function openPresentationGenerator() {
  router.push("/presentation");
}

function openSelectedPresentation() {
  if (!selectedPresentation.value?.id) return;
  localStorage.setItem(ARCHIVE_OPEN_PRESENTATION_KEY, String(selectedPresentation.value.id));
  localStorage.setItem(SKIP_REVIEW_KEY, 'true');
  router.push("/presentation");
}

function editSelectedPresentation() {
  if (!selectedPresentation.value?.id) return;
  localStorage.setItem(ARCHIVE_OPEN_PRESENTATION_KEY, String(selectedPresentation.value.id));
  localStorage.setItem(SKIP_REVIEW_KEY, 'false');
  router.push("/presentation");
}

async function selectQuiz(quiz) {
  selectedQuiz.value = quiz;
  quizResults.value = [];
  try {
    const results = await fetchQuizResults(quiz.id);
    quizResults.value = results;
  } catch (e) {
    console.error("Failed to fetch quiz results", e);
  }
}

async function handleDeleteQuiz() {
  if (!selectedQuiz.value?.id) return;
  const ok = window.confirm("Na pewno usunąć ten sprawdzian? Wyniki uczniów również zostaną usunięte.");
  if (!ok) return;
  try {
    await deleteQuiz(selectedQuiz.value.id);
    selectedQuiz.value = filteredQuizzes.value[0] || null;
    if (selectedQuiz.value) selectQuiz(selectedQuiz.value);
  } catch (e) {
    alert("Błąd podczas usuwania.");
  }
}

watch(activeTab, async (tab) => {
  localStorage.setItem(ARCHIVE_ACTIVE_TAB_KEY, tab);
  searchQuery.value = "";
  if (tab === "lessons" && filteredLessons.value.length && !selected.value) {
    selectLesson(filteredLessons.value[0]);
  }
  if (tab === "notes" && filteredNotes.value.length && !selectedNote.value) {
    selectedNote.value = filteredNotes.value[0];
  }
  if (tab === "presentations") {
    const prevId = selectedPresentation.value?.id;
    await refreshPresentationHistory();
    const next = prevId ? filteredPresentations.value.find((p) => p.id === prevId) : null;
    selectedPresentation.value = next || filteredPresentations.value[0] || null;
  }
  if (tab === "quizzes") {
    await fetchQuizzes();
    if (filteredQuizzes.value.length && !selectedQuiz.value) {
      selectQuiz(filteredQuizzes.value[0]);
    }
  }
});
</script>

<style scoped>
.qr-modal-enter-active,
.qr-modal-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.qr-modal-enter-from,
.qr-modal-leave-to {
  opacity: 0;
}

.qr-modal-enter-from > div,
.qr-modal-leave-to > div {
  transform: scale(0.92);
}

.qr-modal-enter-to > div,
.qr-modal-leave-from > div {
  transform: scale(1);
}
</style>
