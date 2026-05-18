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
              <button
                type="button"
                @click="activeTab = 'homework'"
                :class="[
                  'inline-flex h-11 items-center gap-2 rounded-full px-6 text-[15px] font-bold transition',
                  activeTab === 'homework' ? 'bg-[#0c3dfe] text-white' : 'bg-[#e7e8ee] text-[#4b5563] hover:bg-[#dde0e8]'
                ]"
              >
                <svg class="h-4 w-4 shrink-0" :class="activeTab === 'homework' ? 'text-white' : 'text-[#4b5563]'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Zadania domowe
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
            :class="selected?.id === lesson.id ? 'ring-2 ring-[#0c3dfe]/40 bg-blue-50/15' : 'hover:bg-[#f5f7fb]'"
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

            <!-- Action buttons inside active/selected lesson element -->
            <div v-if="selected?.id === lesson.id && lesson.finalNote" class="mt-4 pt-3.5 border-t border-gray-100/70 flex flex-wrap gap-2.5" @click.stop>
              <button
                v-if="lesson.finalNote.shareUrl"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg bg-[#0053db] text-white font-['Inter'] font-semibold text-xs px-3.5 py-2 hover:bg-[#0043b2] transition-colors cursor-pointer"
                @click="openFinalNote"
              >
                Otwórz notatkę (link)
              </button>

              <button
                v-if="lesson.finalNote.shareUrl"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg bg-[#0053db] text-white font-['Inter'] font-semibold text-xs px-3.5 py-2 hover:bg-[#0043b2] transition-colors cursor-pointer"
                @click="openTranscript"
              >
                Otwórz transkrypcję (link)
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg bg-[#142588] text-white font-['Inter'] font-semibold text-xs px-3.5 py-2 hover:bg-[#0f1d66] transition-colors cursor-pointer"
                @click="openGoldenNotePreview"
              >
                Pokaż treść
              </button>
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
            :class="selectedNote?.id === note.id ? 'ring-2 ring-[#0c3dfe]/40 bg-blue-50/15' : 'hover:bg-[#f5f7fb]'"
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
                  {{ note.subject || "Brak przedmiotu" }} • {{ note.classLevel || note.class_level || "Brak poziomu" }}
                </p>
              </div>
            </div>

            <!-- Action buttons inside active/selected note element -->
            <div v-if="selectedNote?.id === note.id" class="mt-4 pt-3.5 border-t border-gray-100/70 flex flex-wrap gap-2.5" @click.stop>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg bg-[#0053db] text-white font-['Inter'] font-semibold text-xs px-3.5 py-2 hover:bg-[#0043b2] transition-colors cursor-pointer"
                @click="openTeacherNoteLink"
              >
                Otwórz notatkę (link)
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg bg-[#142588] text-white font-['Inter'] font-semibold text-xs px-3.5 py-2 hover:bg-[#0f1d66] transition-colors cursor-pointer"
                @click="openTeacherNotePreview"
              >
                Pokaż treść
              </button>
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

          <div v-if="activeTab === 'homework' && !filteredHomework.length" class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-10 text-center">
            <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[16px]">Brak zapisanych zadań domowych.</p>
          </div>

          <div
            v-if="activeTab === 'homework'"
            v-for="lesson in filteredHomework"
            :key="lesson.id"
            class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-5 cursor-pointer transition-colors"
            :class="selectedHomework?.id === lesson.id ? 'ring-2 ring-[#0c3dfe]/30' : 'hover:bg-[#f5f7fb]'"
            @click="selectedHomework = lesson"
          >
            <div class="flex w-full items-center gap-4">
              <div class="size-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px] truncate">
                  Zadanie: {{ lesson.finalNote?.title || lesson.title }}
                </h3>
                <p class="font-['Inter'] text-[#454652] text-[14px] mt-1">
                  <span v-if="lesson.class_name" class="font-semibold text-[#0c3dfe]">{{ lesson.class_name }} • </span>
                  {{ lesson.finalNote?.subject || lesson.subject }} • {{ formatDate(lesson.updatedAt || lesson.createdAt) }}
                </p>
              </div>
            </div>
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

            <!-- Homework integration in Lesson Details -->
            <div v-if="selected.homework" class="pt-6 mt-6 border-t border-gray-100">
              <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[16px] mb-4 flex items-center gap-2">
                <svg class="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Zadanie domowe
              </h3>
              <div class="space-y-3">
                <button
                  class="w-full rounded-lg bg-[#0053db] text-white font-['Inter'] text-sm font-semibold py-2.5 hover:bg-[#0043b2] transition-colors cursor-pointer"
                  @click="openHomeworkLinkFromLesson"
                >
                  Otwórz zadanie (link)
                </button>
                <button
                  type="button"
                  class="w-full rounded-lg bg-[#f2f4f7] text-[#142588] font-['Inter'] text-sm font-semibold py-2.5 hover:bg-[#e8ebf0] transition-colors cursor-pointer"
                  @click="openHomeworkPreviewFromLesson"
                >
                  Podgląd zadania
                </button>
              </div>
            </div>
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
                <input v-model="editNoteTitle" class="w-full bg-transparent border-none outline-none font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e]" placeholder="Tytuł notatki" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Przedmiot</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5">
                <input v-model="editNoteSubject" class="w-full bg-transparent border-none outline-none font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e]" placeholder="Przedmiot" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Poziom Klasy</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2">
                <select v-model="editNoteClassLevel" class="w-full bg-transparent border-none outline-none font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e] cursor-pointer">
                  <option v-for="level in classOptions" :key="level" :value="level">{{ level }}</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              class="w-full rounded-lg bg-[#7b3400] text-[#ffa26e] font-['Inter'] font-semibold py-2.5 hover:bg-[#6a2d00] transition-colors disabled:opacity-60 cursor-pointer"
              :disabled="saving"
              @click="handleSaveTeacherNote"
            >
              {{ saving ? "Zapisywanie..." : "Zapisz zmiany" }}
            </button>

            <button
              type="button"
              class="w-full rounded-lg bg-[#e6e8eb] py-2.5 text-center font-['Inter'] font-semibold text-[#142588] hover:bg-[#d8dadd] transition-colors cursor-pointer"
              @click="openRawTextModalForNote"
            >
              Edytuj treść notatki
            </button>

            <button
              type="button"
              class="w-full rounded-lg bg-[#142588] py-2.5 text-center font-['Inter'] font-semibold text-white hover:bg-[#0f1d66] transition-colors cursor-pointer"
              @click="openTeacherNotePreview"
            >
              Pokaż treść notatki
            </button>

            <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px] mt-4">
              Złota notatka (QR)
            </h3>

            <button
              type="button"
              class="w-full rounded-xl bg-[#f2f4f7] p-3 transition-colors hover:bg-[#e8ebf0] cursor-pointer"
              @click="openQrModal"
            >
              <img :src="qrCodeUrl" alt="QR" width="220" height="220" class="mx-auto" />
            </button>
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

            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">Czas podsumowania (Autoplay)</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2">
                <select
                  v-model="archiveAutoPlayMinutes"
                  class="w-full bg-transparent border-none outline-none font-['Plus_Jakarta_Sans'] text-[15px] text-[#191c1e] cursor-pointer"
                >
                  <option value="manual">Brak automatycznego odtwarzania (Sterowanie ręczne)</option>
                  <option value="5">5 minut podsumowania (Automatyczne przesuwanie)</option>
                  <option value="10">10 minut podsumowania (Automatyczne przesuwanie)</option>
                  <option value="15">15 minut podsumowania (Automatyczne przesuwanie)</option>
                  <option value="20">20 minut podsumowania (Automatyczne przesuwanie)</option>
                </select>
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

          <div v-else-if="activeTab === 'homework' && selectedHomework" class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 space-y-6">
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px]">
                Szczegóły zadania domowego
              </h3>
              <button
                type="button"
                class="px-3 py-2 rounded-lg bg-[#ffe8dd] text-[#9e3f4e] text-sm font-semibold hover:bg-[#ffdacc] transition-colors cursor-pointer"
                @click="handleDeleteHomework"
              >
                Usuń
              </button>
            </div>
            
            <div class="space-y-4">
              <button
                class="w-full rounded-lg bg-[#0053db] text-white font-['Inter'] font-semibold py-2.5 hover:bg-[#0043b2] transition-colors cursor-pointer"
                @click="openHomeworkLink"
              >
                Otwórz zadanie (link)
              </button>

              <button
                type="button"
                class="w-full rounded-lg bg-[#142588] text-white font-['Inter'] font-semibold py-2.5 hover:bg-[#0f1d66] transition-colors cursor-pointer"
                @click="openHomeworkPreview"
              >
                Pokaż treść zadania
              </button>

              <div class="pt-4 border-t border-gray-100">
                <p class="text-xs text-[#767683] leading-relaxed">
                  Zadanie domowe jest powiązane z lekcją: <br/>
                  <span class="font-bold text-[#191c1e]">{{ selectedHomework.title }}</span>
                </p>
              </div>
            </div>
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
        <div class="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" @click.stop>
          <div class="mb-4 flex justify-end">
            <button
              type="button"
              class="rounded-lg bg-[#f2f2f2] px-3 py-1.5 text-sm font-semibold text-[#454652] hover:bg-[#e5e5e5]"
              @click="textPreviewOpen = false"
            >
              Zamknij
            </button>
          </div>
          <div v-if="textPreviewIsHtml" v-html="textPreviewBody" class="prose max-w-none dark:prose-invert prose-slate prose-headings:font-bold prose-headings:text-[#0c3dfe] p-4"></div>
          <div v-else v-html="renderMarkdownWithMath(textPreviewBody)" class="prose max-w-none dark:prose-invert prose-slate prose-headings:font-bold prose-headings:text-[#0c3dfe] p-4" @click="handlePreviewClick"></div>
        </div>
      </div>
    </Teleport>

    <!-- Beautiful KaTeX Math Editor Modal -->
    <Teleport to="body">
      <div v-if="showMathModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
        <div class="bg-white dark:bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden transform transition-all scale-100 flex flex-col z-[101]">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-gray-50 dark:bg-card/50">
            <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-lg text-black dark:text-foreground flex items-center gap-2">
              <span class="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </span>
              Edytor wzoru matematycznego
            </h3>
            <button @click="showMathModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-foreground transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-border">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 flex flex-col gap-5">
            <!-- Realtime Preview -->
            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Podgląd na żywo:</span>
              <div class="min-h-[80px] bg-slate-50 dark:bg-input-background border border-dashed border-border rounded-xl flex items-center justify-center p-4 transition-all overflow-x-auto">
                <div v-html="mathModalPreview || '<span class=\'text-gray-400 italic text-sm\'>Wpisz wzór...</span>'"></div>
              </div>
            </div>

            <!-- Latex Input -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Zapis matematyczny:</label>
              <input 
                v-model="mathModalRaw"
                type="text" 
                class="w-full bg-[#e0e3e6] dark:bg-input-background border-none outline-none p-3.5 rounded-xl font-mono text-base text-black dark:text-foreground focus:ring-2 focus:ring-blue-500"
                placeholder="Wpisz np. \frac{1}{2} lub x^2"
                @keydown.enter="saveMathEditor"
              />
            </div>

            <!-- Modal Helper Toolbar -->
            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Wstaw szablon:</span>
              <div class="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 dark:bg-input-background/50 rounded-xl border border-border">
                <button type="button" @click="mathModalRaw += '\\frac{a}{b}'" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card border border-border rounded hover:bg-gray-100 dark:hover:bg-border transition-colors">½ Ułamek</button>
                <button type="button" @click="mathModalRaw += '\\sqrt{x}'" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card border border-border rounded hover:bg-gray-100 dark:hover:bg-border transition-colors">√ Pierwiastek</button>
                <button type="button" @click="mathModalRaw += 'x^y'" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card border border-border rounded hover:bg-gray-100 dark:hover:bg-border transition-colors">x² Potęga</button>
                <button type="button" @click="mathModalRaw += 'x_i'" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card border border-border rounded hover:bg-gray-100 dark:hover:bg-border transition-colors">xₙ Indeks</button>
                <button type="button" @click="mathModalRaw += '\\cdot'" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card border border-border rounded hover:bg-gray-100 dark:hover:bg-border transition-colors">· Kropka</button>
                <button type="button" @click="mathModalRaw += '\\pm'" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card border border-border rounded hover:bg-gray-100 dark:hover:bg-border transition-colors">± Plus-minus</button>
                <button type="button" @click="mathModalRaw += '\\pi'" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card border border-border rounded hover:bg-gray-100 dark:hover:bg-border transition-colors">π Pi</button>
                <button type="button" @click="mathModalRaw += '\\infty'" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card border border-border rounded hover:bg-gray-100 dark:hover:bg-border transition-colors">∞ Nieskończoność</button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-gray-50 dark:bg-card/50">
            <button 
              type="button" 
              @click="showMathModal = false" 
              class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-muted-foreground hover:bg-gray-100 dark:hover:bg-border rounded-xl transition-colors"
            >
              Anuluj
            </button>
            <button 
              type="button" 
              @click="saveMathEditor" 
              class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
            >
              Zapisz zmiany
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Raw Text Editor Modal -->
    <Teleport to="body">
      <div v-if="showRawTextModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
        <div class="bg-white dark:bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] mx-4 overflow-hidden transform transition-all scale-100 flex flex-col z-[101]">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-gray-50 dark:bg-card/50">
            <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-lg text-black dark:text-foreground flex items-center gap-2">
              <span class="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </span>
              Edycja treści notatki (Markdown + LaTeX)
            </h3>
            <button @click="showRawTextModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-foreground transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-border">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 flex flex-col gap-4 flex-grow overflow-hidden">
            <!-- Asystent Matematyczny / Toolbar -->
            <div class="flex flex-wrap items-center gap-1.5 p-2 bg-[#f0f2f4] dark:bg-input-background/50 border border-border rounded-xl w-full">
              <span class="text-xs font-semibold text-[#454652] dark:text-muted-foreground mr-1">Wzory:</span>
              
              <button type="button" @click="insertMath('\\frac{a}{b}')" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-border border border-border rounded transition-all flex items-center gap-1 shadow-sm" title="Ułamek">
                <span class="text-[10px] text-blue-500 font-bold">½</span> Ułamek
              </button>

              <button type="button" @click="insertMath('\\sqrt{x}')" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-border border border-border rounded transition-all flex items-center gap-1 shadow-sm" title="Pierwiastek">
                <span class="text-blue-500 font-bold">√</span> Pierwiastek
              </button>

              <button type="button" @click="insertMath('x^y')" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-border border border-border rounded transition-all flex items-center gap-1 shadow-sm" title="Potęga">
                <span class="text-blue-500 font-bold">x²</span> Potęga
              </button>

              <button type="button" @click="insertMath('x_i')" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-border border border-border rounded transition-all flex items-center gap-1 shadow-sm" title="Indeks dolny">
                <span class="text-blue-500 font-bold">xₙ</span> Indeks
              </button>

              <button type="button" @click="insertMath('\\cdot')" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-border border border-border rounded transition-all flex items-center gap-1 shadow-sm" title="Mnożenie (kropka)">
                <span class="text-blue-500 font-bold">·</span> Mnożenie
              </button>

              <button type="button" @click="insertMath('\\pm')" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-border border border-border rounded transition-all flex items-center gap-1 shadow-sm" title="Plus-minus">
                <span class="text-blue-500 font-bold">±</span> Plus-minus
              </button>

              <button type="button" @click="insertMath('\\pi')" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-border border border-border rounded transition-all flex items-center gap-1 shadow-sm" title="Pi">
                <span class="text-blue-500 font-bold">π</span> Pi
              </button>

              <button type="button" @click="insertMath('\\infty')" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-border border border-border rounded transition-all flex items-center gap-1 shadow-sm" title="Nieskończoność">
                <span class="text-blue-500 font-bold">∞</span> Nieskończoność
              </button>

              <div class="h-4 w-[1px] bg-gray-300 dark:bg-border mx-1"></div>

              <span class="text-xs font-semibold text-[#454652] dark:text-muted-foreground mr-1">Chemia:</span>

              <button type="button" @click="insertMath('H_2O')" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-border border border-border rounded transition-all flex items-center gap-1 shadow-sm" title="Woda">
                <span class="text-green-500 font-bold">H₂O</span> Woda
              </button>

              <button type="button" @click="insertMath('CO_2')" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-border border border-border rounded transition-all flex items-center gap-1 shadow-sm" title="Dwutlenek węgla">
                <span class="text-green-500 font-bold">CO₂</span> CO₂
              </button>

              <button type="button" @click="insertMath('O_2')" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-border border border-border rounded transition-all flex items-center gap-1 shadow-sm" title="Tlen">
                <span class="text-green-500 font-bold">O₂</span> Tlen
              </button>
            </div>

            <!-- Textarea Editor -->
            <div class="flex-grow bg-[#e0e3e6] dark:bg-input-background relative rounded-xl flex transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50 overflow-hidden">
              <textarea 
                ref="textareaRef"
                v-model="editNoteContent"
                class="w-full h-full bg-transparent border-none outline-none p-6 text-[16px] text-[#191c1e] dark:text-foreground placeholder-[#767683] font-['Plus_Jakarta_Sans'] resize-none"
                placeholder="Wpisz treść notatki w formacie Markdown lub wklej materiał..."
              ></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-border flex items-center justify-between bg-gray-50 dark:bg-card/50">
            <span class="font-['Plus_Jakarta_Sans'] font-medium text-[#767683] text-sm">
              {{ editNoteContent.length }} / 25,000 Znaki
            </span>
            <div class="flex items-center gap-3">
              <button 
                type="button" 
                @click="showRawTextModal = false" 
                class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-muted-foreground hover:bg-gray-100 dark:hover:bg-border rounded-xl transition-colors"
              >
                Zamknij
              </button>
              <button 
                type="button" 
                @click="showRawTextModal = false" 
                class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
              >
                Zapisz i wróć do podglądu
              </button>
            </div>
          </div>
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
import katex from "katex";
import "katex/dist/katex.min.css";
import { marked } from "marked";

const classOptions = [
  "1 Klasa Szkoły Podstawowej",
  "2 Klasa Szkoły Podstawowej",
  "3 Klasa Szkoły Podstawowej",
  "4 Szkoła Podstawowa",
  "5 Szkoła Podstawowa",
  "6 Szkoła Podstawowa",
  "7 Szkoła Podstawowa",
  "8 Szkoła Podstawowa",
  "1 Szkoła Średnia",
  "2 Szkoła Średnia",
  "3 Szkoła Średnia",
  "4 Szkoła Średnia",
  "5 Szkoła Średnia",
  "Szkolenie firmowe",
  "Szkolenie wewnętrzne",
  "Warsztat",
  "Konsultacje",
  "Inny typ notatki"
];

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
const { state, fetchLessons, fetchTeacherNotes, fetchQuizzes, fetchQuizResults, deleteQuiz, updateFinalNote, deleteLesson, deleteTeacherNote, updateTeacherNote, fetchUserClasses } = useLessonStore();
const router = useRouter();
const historyOwnerId = ref("");
const textPreviewOpen = ref(false);
const textPreviewBody = ref("");
const textPreviewIsHtml = ref(false);
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
const selectedHomework = ref(null);
const archiveAutoPlayMinutes = ref("manual");

// Independent note editing state variables
const editNoteTitle = ref("");
const editNoteSubject = ref("");
const editNoteClassLevel = ref("");
const editNoteContent = ref("");

// Math and raw text modal variables
const showRawTextModal = ref(false);
const textareaRef = ref(null);
const showMathModal = ref(false);
const mathModalIndex = ref(null);
const mathModalDisplay = ref(false);
const mathModalRaw = ref("");

const mathModalPreview = computed(() => {
  if (!mathModalRaw.value) return "";
  try {
    return katex.renderToString(mathModalRaw.value.trim(), {
      throwOnError: false,
      displayMode: mathModalDisplay.value,
      strict: false
    });
  } catch (e) {
    return "<span class='text-red-500 text-sm'>Błąd składni wzoru matematycznego...</span>";
  }
});

// Watch for note selections to keep editing variables updated
watch(selectedNote, (note) => {
  if (note) {
    editNoteTitle.value = String(note.title || "");
    editNoteSubject.value = String(note.subject || "");
    editNoteClassLevel.value = String(note.classLevel || note.class_level || "");
    editNoteContent.value = String(note.content || "");
  } else {
    editNoteTitle.value = "";
    editNoteSubject.value = "";
    editNoteClassLevel.value = "";
    editNoteContent.value = "";
  }
}, { immediate: true });

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
  if (filteredHomework.value.length) selectedHomework.value = filteredHomework.value[0];
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

const filteredHomework = computed(() => {
  const lessonsWithHomework = state.lessons.filter(l => !!l.homework).map(l => ({ ...l, isNote: false }));
  const notesWithHomework = state.notes.filter(n => !!n.homework).map(n => ({ ...n, isNote: true }));
  
  let combined = [...lessonsWithHomework, ...notesWithHomework];

  if (state.selectedClass) {
    combined = combined.filter(item => item.class_name === state.selectedClassName || item.classLevel === state.selectedClassName);
  }

  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return combined;
  return combined.filter((item) => {
    const title = item.finalNote?.title || item.title || "";
    const subject = item.finalNote?.subject || item.subject || "";
    return `${title} ${subject}`.toLowerCase().includes(q);
  });
});

const searchLabel = computed(() => {
  if (activeTab.value === "notes") return "Szukaj notatek";
  if (activeTab.value === "presentations") return "Szukaj prezentacji";
  if (activeTab.value === "quizzes") return "Szukaj sprawdzianów";
  if (activeTab.value === "homework") return "Szukaj zadań domowych";
  return "Szukaj lekcji";
});

const searchPlaceholder = computed(() => {
  if (activeTab.value === "notes") return "Szukaj według tytułu, przedmiotu albo poziomu...";
  if (activeTab.value === "presentations") return "Szukaj według tytułu lub daty prezentacji...";
  if (activeTab.value === "quizzes") return "Szukaj według tytułu sprawdzianu...";
  if (activeTab.value === "homework") return "Szukaj według tytułu zadania...";
  return "Szukaj według przedmiotu, tytułu albo miesiąca...";
});

const qrCodeUrl = computed(() => {
  const shareId = selected.value?.finalNote?.id;
  if (!shareId) return "";
  const shareUrl = `${window.location.origin}/share/${shareId}`;
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
  const shareId = selected.value?.finalNote?.id;
  if (!shareId) return;
  window.open(`${window.location.origin}/share/${shareId}`, "_blank", "noopener,noreferrer");
}

function openTranscript() {
  const shareId = selected.value?.finalNote?.id;
  if (!shareId) return;
  window.open(`${window.location.origin}/share/${shareId}?type=transcript`, "_blank", "noopener,noreferrer");
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
  textPreviewBody.value = html || "Brak treści notatki.";
  textPreviewIsHtml.value = true;
  textPreviewOpen.value = true;
}

function openTeacherNotePreview() {
  const raw = String(selectedNote.value?.content || "").trim();
  textPreviewBody.value = raw || "Brak treści notatki.";
  textPreviewIsHtml.value = false;
  textPreviewOpen.value = true;
}

function openTeacherNoteLink() {
  const shareId = selectedNote.value?.id;
  if (!shareId) return;
  window.open(`${window.location.origin}/share/${shareId}`, "_blank", "noopener,noreferrer");
}

async function handleSaveTeacherNote() {
  if (!selectedNote.value?.id) return;
  try {
    saving.value = true;
    const updated = await updateTeacherNote(selectedNote.value.id, {
      title: editNoteTitle.value,
      subject: editNoteSubject.value,
      classLevel: editNoteClassLevel.value,
      content: editNoteContent.value
    });
    // Sync back to state.notes so it updates dynamically in the list too
    state.notes = state.notes.map((n) => (n.id === selectedNote.value.id ? updated : n));
    selectedNote.value = updated;
  } catch (e) {
    window.alert(e?.message || "Nie udało się zapisać zmian.");
  } finally {
    saving.value = false;
  }
}

function insertMath(latexExpr) {
  const el = textareaRef.value;
  if (!el) {
    editNoteContent.value += ` $${latexExpr}$`;
    return;
  }
  
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = editNoteContent.value;
  const formatted = `$${latexExpr}$`;
  
  editNoteContent.value = text.substring(0, start) + formatted + text.substring(end);
  const newCursorPos = start + formatted.length;
  
  setTimeout(() => {
    if (el) {
      el.focus();
      if (latexExpr.includes('{a}')) {
        const offset = formatted.indexOf('{a}') + 1;
        el.setSelectionRange(start + offset, start + offset + 1);
      } else if (latexExpr.includes('{x}')) {
        const offset = formatted.indexOf('{x}') + 1;
        el.setSelectionRange(start + offset, start + offset + 1);
      } else {
        el.setSelectionRange(newCursorPos, newCursorPos);
      }
    }
  }, 0);
}

function updateMathAtIndex(text, targetIndex, newValue, isDisplay) {
  let index = 0;
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  
  return text.replace(regex, (match) => {
    if (index === targetIndex) {
      index++;
      return isDisplay ? `$$\n${newValue}\n$$` : `$${newValue}$`;
    }
    index++;
    return match;
  });
}

function openMathEditor(index, isDisplay, rawMath) {
  mathModalIndex.value = index;
  mathModalDisplay.value = isDisplay;
  mathModalRaw.value = rawMath;
  showMathModal.value = true;
}

// Global math preview wrapper function
function renderMarkdownWithMath(text) {
  if (!text) return "";
  
  const placeholders = [];
  let str = String(text);
  
  str = str.replace(/\\\\/g, "\\");

  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  
  str = str.replace(regex, (match) => {
    const isDisplay = match.startsWith('$$');
    const mathExp = isDisplay ? match.slice(2, -2) : match.slice(1, -1);
    
    try {
      const cleanMath = mathExp.trim()
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
      
      const rendered = katex.renderToString(cleanMath, {
        throwOnError: false,
        displayMode: isDisplay,
        strict: false
      });
      
      const index = placeholders.length;
      const placeholder = `%%MATH_FORMULA_${index}%%`;
      const wrapped = `<span class="katex-editable hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:ring-2 hover:ring-blue-500 rounded px-1.5 py-0.5 transition-all cursor-pointer inline-block" data-math-index="${index}" data-math-display="${isDisplay ? 'true' : 'false'}" data-math-raw="${encodeURIComponent(mathExp.trim())}" title="Kliknij, aby edytować ten wzór">${rendered}</span>`;
      
      placeholders.push({ placeholder, wrapped });
      return placeholder;
    } catch (e) {
      console.warn("KaTeX rendering error:", e);
      return match;
    }
  });

  let html = marked.parse(str);

  for (const item of placeholders) {
    html = html.replace(item.placeholder, item.wrapped);
  }

  return html;
}

function saveMathEditor() {
  if (mathModalIndex.value === null) return;
  editNoteContent.value = updateMathAtIndex(
    editNoteContent.value,
    mathModalIndex.value,
    mathModalRaw.value.trim(),
    mathModalDisplay.value
  );
  showMathModal.value = false;
  mathModalIndex.value = null;
  mathModalRaw.value = "";
}

function openRawTextModalForNote() {
  showRawTextModal.value = true;
}

function handlePreviewClick(event) {
  const editable = event.target.closest('.katex-editable');
  if (!editable) return;
  
  const index = parseInt(editable.getAttribute('data-math-index'), 10);
  const isDisplay = editable.getAttribute('data-math-display') === 'true';
  const rawMath = decodeURIComponent(editable.getAttribute('data-math-raw'));
  
  openMathEditor(index, isDisplay, rawMath);
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
  localStorage.setItem("coteach:open-presentation-autoplay", archiveAutoPlayMinutes.value);
  router.push("/presentation");
}

function editSelectedPresentation() {
  if (!selectedPresentation.value?.id) return;
  localStorage.setItem(ARCHIVE_OPEN_PRESENTATION_KEY, String(selectedPresentation.value.id));
  localStorage.setItem(SKIP_REVIEW_KEY, 'false');
  localStorage.setItem("coteach:open-presentation-autoplay", archiveAutoPlayMinutes.value);
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

function openHomeworkLink() {
  const hw = selectedHomework.value;
  if (!hw || !hw.id) return;
  window.open(`${window.location.origin}/share/${hw.id}?type=homework`, "_blank", "noopener,noreferrer");
}

function openHomeworkPreview() {
  const text = selectedHomework.value?.homework || "";
  textPreviewBody.value = text || "Brak treści zadania domowego.";
  textPreviewOpen.value = true;
}

function openHomeworkLinkFromLesson() {
  if (!selected.value?.id) return;
  window.open(`${window.location.origin}/share/${selected.value.id}?type=homework`, "_blank", "noopener,noreferrer");
}

function openHomeworkPreviewFromLesson() {
  const text = selected.value?.homework || "";
  textPreviewBody.value = text || "Brak treści zadania domowego.";
  textPreviewOpen.value = true;
}

async function handleDeleteHomework() {
  const hw = selectedHomework.value;
  if (!hw || !hw.id) return;
  const ok = window.confirm("Na pewno usunąć to zadanie domowe?");
  if (!ok) return;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
    const url = hw.isNote 
      ? `${API_BASE}/api/notes/${hw.id}/homework`
      : `${API_BASE}/api/lessons/${hw.id}/homework`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${session?.access_token}` }
    });

    if (!res.ok) throw new Error("Failed to delete");
    
    // Update local state
    if (hw.isNote) {
      const note = state.notes.find(n => n.id === hw.id);
      if (note) note.homework = "";
    } else {
      const lesson = state.lessons.find(l => l.id === hw.id);
      if (lesson) lesson.homework = "";
    }
    
    selectedHomework.value = null;
  } catch (e) {
    alert("Błąd podczas usuwania.");
  }
}

watch(activeTab, async (tab) => {
  localStorage.setItem(ARCHIVE_ACTIVE_TAB_KEY, tab);
  searchQuery.value = "";
  archiveAutoPlayMinutes.value = "manual";
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

/* Premium KaTeX and Markdown styling for the note preview */
.prose {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e293b;
  line-height: 1.7;
}

.prose :deep(h1) {
  font-family: 'Manrope', sans-serif;
  font-size: 1.6rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #0c3dfe;
  font-weight: 800;
  letter-spacing: -0.025em;
  border-bottom: 2px solid rgba(12, 61, 254, 0.1);
  padding-bottom: 0.5rem;
}

.prose :deep(h2) {
  font-family: 'Manrope', sans-serif;
  font-size: 1.3rem;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
  font-weight: 700;
}

.prose :deep(h3) {
  font-family: 'Manrope', sans-serif;
  font-size: 1.1rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #334155;
  font-weight: 600;
}

.prose :deep(p) {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.prose :deep(ul) {
  list-style-type: disc !important;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose :deep(ol) {
  list-style-type: decimal !important;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose :deep(li) {
  margin-bottom: 0.4rem;
  padding-left: 0.25rem;
}

.prose :deep(strong) {
  color: #0f172a;
  font-weight: 700;
}

.prose :deep(code) {
  background-color: #f1f5f9;
  color: #0f172a;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  font-weight: 600;
}

.prose :deep(.katex) {
  font-size: 1.1em;
  line-height: 1.2;
}

/* Dark Mode styling */
:global(.dark) .prose {
  color: #cbd5e1;
}

:global(.dark) .prose :deep(h2) {
  color: #f8fafc;
}

:global(.dark) .prose :deep(h3) {
  color: #e2e8f0;
}

:global(.dark) .prose :deep(strong) {
  color: #ffffff;
}

:global(.dark) .prose :deep(code) {
  background-color: #334155;
  color: #f8fafc;
}
</style>
