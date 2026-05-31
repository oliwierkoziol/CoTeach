<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] w-full overflow-x-hidden relative">
    <!-- Background Decor -->
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0"></div>
    <div class="p-4 pt-6 sm:p-12 sm:pt-8 w-full max-w-[1664px] relative z-10">
    <!-- Header -->
    <div class="mb-7 flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div class="max-w-[1024px]">
        <div class="flex items-center gap-2 mb-2">
          <div class="size-2 rounded-full bg-[#9e3f4e]" :class="{ 'animate-pulse': isRecording }"></div>
          <p class="font-['Plus_Jakarta_Sans'] font-bold text-[#9e3f4e] text-[10.5px] tracking-[0.525px] uppercase">
            W TRAKCIE
          </p>
        </div>
        <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[24px] sm:text-[36px] tracking-[-0.9px] leading-tight sm:leading-[40px] mb-2">
          Lekcja: {{ state.lesson?.title || 'Brak tytułu' }}
        </h1>
        <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-sm sm:text-[18px] leading-relaxed sm:leading-[28px]">
          Mowa z mikrofonu jest przetwarzana. Lekcja skończy się po upływie czasu.
        </p>
      </div>

      <button
        @click="cancelLessonAndRedirect"
        class="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-[12px] bg-[#9e3f4e]/10 text-[#9e3f4e] font-['Plus_Jakarta_Sans'] font-bold border border-[#9e3f4e]/20 hover:bg-[#9e3f4e]/20 transition-all shadow-sm active:scale-95 text-sm sm:text-base"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Anuluj lekcję
      </button>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-12 gap-6 sm:gap-8 mb-7">
      <!-- Plan lekcji -->
      <div class="col-span-12 xl:col-span-4 bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-5 sm:p-6 flex flex-col h-[400px] sm:h-[497px]">
        <h2 class="font-['Manrope'] font-bold text-[#142588] text-[18px] leading-[28px] mb-2">
          Plan lekcji
        </h2>

        <div class="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin">
          <div
            v-for="(point, index) in points"
            :key="point.id"
            class="rounded-lg py-3 cursor-pointer group"
            @click="toggleManualApproval(point)"
          >
            <div class="flex items-start gap-4">
              <div 
                  class="size-8 rounded-full flex items-center justify-center shrink-0 transition"
                  :class="point.status === 'discussed' || point.manualApproved ? 'bg-[#68a962]' : 'bg-[#e0e3e6] group-hover:bg-[#d0d3d6]'"
                >
                <span
                  class="font-['Inter'] font-semibold text-[16px]"
                  :class="point.status === 'discussed' || point.manualApproved ? 'text-white' : 'text-[#454652]'"
                >
                  <span v-if="manualUpdateLoadingId === point.id" class="block animate-spin">⟳</span>
                  <span v-else>{{ index + 1 }}</span>
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-['Inter'] font-semibold text-[#191c1e] text-[16px] leading-[24px] mb-2">
                  {{ point.title }}
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="(tag, i) in point.keywords"
                    :key="i"
                    class="px-2 py-0.5 rounded text-[12px] font-['Inter'] font-bold transition"
                  :class="(point.foundKeywords && point.foundKeywords.includes(tag)) || point.manualApproved ? 'bg-[#68a962] text-white' : 'bg-[#e0e3e6] text-[#454652]'"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="space-y-2 pt-2 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <p class="font-['Manrope'] font-bold text-[#142588] text-[18px] leading-[28px]">
              {{ discussedCount }} z {{ points.length }} punktów omówionych
            </p>
            <p class="font-['Inter'] font-semibold text-[#142588] text-[16px]">
              {{ progress }}%
            </p>
          </div>
          <div class="bg-[#d8e2ff] dark:bg-muted h-4 rounded-full overflow-hidden">
            <div
              class="bg-[#0059bb] dark:bg-primary h-full rounded-full shadow-[0px_0px_8px_0px_rgba(0,89,187,0.4)] transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Live Transcription -->
      <div class="col-span-12 xl:col-span-5 space-y-6">
        <div class="flex items-center gap-2">
          <!-- Mic Wave Icon -->
            <svg class="w-[22px] h-[19px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" stroke="#0059BB" />
            </svg>
          <h2 class="font-['Manrope'] font-bold text-[#142588] text-[18px] tracking-[0.9px] leading-[28px]">
            Napisy na żywo
          </h2>

          <div class="flex items-center justify-between text-xs ml-auto">
            <div class="flex items-center gap-2">
              <button
                @click="resetCosts"
                class="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div class="bg-[#f2f4f7] rounded-xl border-l-4 border-[#0059bb] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-4 sm:p-6 h-[350px] sm:h-[445px] overflow-y-auto">
          <p class="font-['Inter'] font-semibold text-[#0059bb] text-[12px] tracking-[1.2px] uppercase mb-3">
            NAPISY LIVE (W TRAKCIE)
          </p>

          <div class="max-h-[350px] overflow-y-auto space-y-3" ref="transcriptionContainer" @scroll="handleScroll">
            <p
              v-for="(item, index) in transcription"
              :key="index"
              class="flex items-center font-['Inter'] text-[#454652] text-[18px] leading-[26.25px]"
            >
              <span class="font-mono text-[12px] text-[#8B8D97] mr-4 shrink-0">{{ item.timestamp }}</span>
              <span>{{ item.text }}</span>
            </p>

            <p v-if="interimCaption" class="font-['Inter'] italic text-[#8B8D97] text-[18px] leading-[29.25px]">
              {{ interimCaption }}
            </p>

            <div v-if="transcription.length === 0 && !interimCaption" class="font-['Inter'] italic text-[#454652] text-[18px] leading-[29.25px]">
              Czekam na rozpoczęcie wypowiedzi...<br />
              System jest gotowy do przechwytywania<br />
              dźwięku w czasie rzeczywistym.
            </div>
          </div>
          </div>
        </div>

      <!-- Microphone Settings -->
      <div class="col-span-12 xl:col-span-3 bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-5 sm:p-8 space-y-6">
        <div class="flex items-center gap-3">
          <!-- Mic Icon -->
          <svg class="w-6 h-[22px]" fill="none" stroke="#142588" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px]">
            Ustawienia mikrofonu
          </h3>
        </div>

        <!-- Mikrofon -->
        <div class="space-y-2">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">
            Mikrofon
          </label>
          <div class="bg-[#e0e3e6] dark:bg-input-background rounded-lg px-4 py-3 flex items-center justify-between relative">
            <select
              v-model="selectedMicId"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
              <option value="" class="dark:bg-card dark:text-foreground">Domyślny mikrofon systemowy</option>
              <option v-for="d in micDevices" :key="d.deviceId" :value="d.deviceId" class="dark:bg-card dark:text-foreground">
                {{ d.label || `Mikrofon ${d.deviceId.slice(0, 6)}` }}
              </option>
            </select>
            <span class="font-['Plus_Jakarta_Sans'] text-[#191c1e] dark:text-foreground text-[16px] truncate max-w-[85%] pointer-events-none">
              {{ micDevices.find(d => d.deviceId === selectedMicId)?.label || 'Domyślny - System Mic' }}
            </span>
            <svg class="size-6 pointer-events-none shrink-0" fill="none" viewBox="0 0 24 24">
              <path d="M12 9.6L16.8 14.4L21.6 9.6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <!-- Język Transkrybowania -->
        <div class="space-y-2">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">
            Język Transkrybowania
          </label>
          <div class="bg-[#e0e3e6] dark:bg-input-background rounded-lg px-4 py-3 flex items-center justify-between relative">
            <select
              v-model="transcriptionMethod"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
              <option value="webspeech" class="dark:bg-card dark:text-foreground">Język polski</option>
              <option value="whisper" class="dark:bg-card dark:text-foreground" disabled>Języki mieszane (wkrótce)</option>
            </select>
            <span class="font-['Plus_Jakarta_Sans'] text-[#191c1e] dark:text-foreground text-[16px] truncate max-w-[85%] pointer-events-none">
              {{ transcriptionMethod === 'whisper' ? 'Języki mieszane (wkrótce)' : 'Język polski' }}
            </span>
            <svg class="size-6 pointer-events-none shrink-0" fill="none" viewBox="0 0 24 24">
              <path d="M12 9.6L16.8 14.4L21.6 9.6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <!-- Poziom mikrofonu -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-['Inter'] font-semibold text-[#454652] text-[12px]">
              POZIOM MIKROFONU
            </span>
            <span class="font-['Inter'] font-semibold text-[#142588] text-[12px]">
              +{{ Math.round(micLevel) }}db
            </span>
          </div>
          <div class="bg-[#e0e3e6] dark:bg-muted h-1 rounded-full overflow-hidden">
            <div class="bg-[#142588] dark:bg-primary h-full transition-all duration-100" :style="{ width: `${Math.min(100, micLevel)}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ask Me Component -->
    <div class="col-span-12 bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-5 sm:p-8 mb-7">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <!-- Tabs -->
          <div class="flex flex-col md:flex-row md:items-center gap-6">
            <div class="flex gap-1 bg-[#e0e3e6] rounded-lg p-1 w-full sm:w-fit">
              <button
                @click="activeTab = 'ask'"
                :class="activeTab === 'ask' ? 'bg-white text-[#0059BB] shadow-sm' : 'text-[#6B7280]'"
                class="flex-1 sm:flex-none px-3 sm:px-4 py-2 font-['Inter'] font-semibold text-[13px] sm:text-[14px] rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Zapytaj mnie
              </button>
              <button
                @click="activeTab = 'equation'"
                :class="activeTab === 'equation' ? 'bg-white text-[#0059BB] shadow-sm' : 'text-[#6B7280]'"
                class="flex-1 sm:flex-none px-3 sm:px-4 py-2 font-['Inter'] font-semibold text-[13px] sm:text-[14px] rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                Równanie
              </button>
            </div>

            <p v-if="!aiQuery && !aiResponse && !aiError && !aiLoading" class="font-['Inter'] text-[#6B7280] text-[14px] opacity-70">
              {{ activeTab === 'ask' 
                  ? 'Możesz zapytać o wszystko: przykłady lekcji, pomysły na zadania czy wyjaśnienie pojęć.' 
                  : 'Wpisz równanie matematyczne lub wzór, aby otrzymać rozwiązanie krok po kroku.' }}
            </p>
          </div>
          

          <!-- Options & Actions -->
          <div class="flex items-center justify-between">
            <button
              v-if="aiQuery || aiResponse || aiError"
              @click="clearAI"
              class="px-4 py-2 bg-[#e6e8eb] text-[#0059BB] font-['Inter'] font-semibold text-[14px] rounded-md transition-colors hover:bg-[#d0d3d6]"
            >
              Wyczyść
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Left: Controls -->
          <div v-if="activeTab === 'equation'" class="lg:col-span-1 space-y-6">
            <!-- <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[12px] uppercase">Poziom klasy</label>
              <div class="bg-[#e0e3e6] rounded-lg px-4 py-2.5 relative">
                <select v-model="selectedClassLevel" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                  <option v-for="level in classOptions" :key="level" :value="level">{{ level }}</option>
                </select>
                <span class="font-['Plus_Jakarta_Sans'] text-[#191c1e] text-[14px] truncate block pr-6">
                  {{ selectedClassLevel }}
                </span>
              </div>
            </div> -->

            <div class="space-y-3">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[12px] uppercase">Szybkie symbole</label>
              <div class="flex flex-wrap gap-2">
              <button
                v-for="shortcut in mathShortcuts"
                :key="shortcut.label"
                @click="shortcut.action ? handleShortcutAction(shortcut.action) : insertMathShortcut(shortcut.template)"
                class="px-3 py-1.5 bg-muted dark:bg-input-background hover:bg-accent hover:text-accent-foreground text-foreground font-['Inter'] text-[12px] rounded-md transition-colors border border-border"
                :title="shortcut.label"
              >
                {{ shortcut.label }}
              </button>
              <button
                @click="openFractionBuilder"
                class="px-3 py-1.5 bg-primary hover:opacity-90 text-primary-foreground font-['Inter'] text-[12px] rounded-md transition-colors border border-primary"
                title="Stwórz ułamek"
              >
                <span class="text-lg font-bold">a/b</span>
              </button>
            </div>
          </div>
          </div>

          <!-- Right: Input & Response -->
          <div :class="[activeTab === 'equation' ? 'lg:col-span-3' : 'lg:col-span-4', 'space-y-4']">
            <div class="relative">
              <textarea
                ref="aiQueryTextarea"
                v-model="aiQuery"
                @keydown.enter.prevent="handleAISubmit"
                :placeholder="activeTab === 'ask' ? 'Wpisz pytanie lub zadanie...' : 'Wpisz równanie do rozwiązania...'"
                class="w-full h-32 px-4 py-3 bg-[#e0e3e6] rounded-lg font-['Inter'] text-[#191c1e] text-[16px] leading-[24px] resize-none focus:outline-none focus:ring-2 focus:ring-[#0059BB] placeholder:text-[#6B7280]"
                :disabled="aiLoading"
              ></textarea>
              <div class="absolute bottom-3 right-3">
                <button
                  @click="handleAISubmit"
                  :disabled="aiLoading || !aiQuery.trim()"
                  class="px-4 py-2 bg-[#0059BB] text-white font-['Inter'] font-semibold text-[14px] rounded-lg hover:bg-[#004799] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <svg v-if="aiLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>{{ activeTab === 'ask' ? 'Zapytaj' : 'Rozwiąż' }}</span>
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="aiError" class="px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p class="font-['Inter'] text-red-700 text-[14px]">{{ aiError }}</p>
            </div>

            <!-- Loading State -->
            <div v-if="aiLoading" class="px-4 py-6 bg-[#f2f4f7] rounded-lg flex items-center gap-3">
              <svg class="w-5 h-5 animate-spin text-[#0059BB]" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p class="font-['Inter'] text-[#454652] text-[14px]">AI przetwarza Twoje zapytanie...</p>
            </div>

            <!-- Result Area -->
            <div v-if="aiResponse" id="ai-result" class="space-y-4">
              <div class="px-4 py-3 bg-[#f2f4f7] border-l-4 border-[#0059BB] rounded-lg">
                <p class="font-['Inter'] font-semibold text-[#0059BB] text-[12px] tracking-[1.2px] uppercase mb-3">Odpowiedź AI</p>
                <div class="font-['Inter'] text-[#191c1e] text-[16px] leading-[26px] ask-me-content" v-html="renderedAIAnswer"></div>
              </div>
            </div>

        </div>

        <!-- Fraction Builder Modal -->
        <div v-if="showFractionBuilder" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-2xl p-6 w-[500px] max-w-[95vw]">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px]">
                Stwórz ułamek
              </h3>
              <button @click="closeFractionBuilder" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Math Symbols Toolbar (inside modal) -->
            <div class="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Wstaw symbol do ułamka</p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="shortcut in mathShortcuts.slice(0, 15)"
                  :key="'modal-' + shortcut.label"
                  @click="insertMathShortcut(shortcut.template)"
                    class="px-2 py-1 bg-card dark:bg-input-background hover:bg-muted text-foreground text-[11px] rounded border border-border transition-colors"
                >
                  {{ shortcut.label }}
                </button>
              </div>
            </div>

            <!-- Fraction Visual -->
            <div class="flex flex-col items-center mb-6">
              <input
                ref="numeratorInput"
                v-model="fractionNumerator"
                @focus="activeModalInput = 'numerator'"
                type="text"
                placeholder="Licznik"
                class="w-32 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-[#0059BB] focus:outline-none font-['Inter'] text-[16px]"
              />
              <div class="w-40 h-[2px] bg-gray-400 my-2"></div>
              <input
                ref="denominatorInput"
                v-model="fractionDenominator"
                @focus="activeModalInput = 'denominator'"
                type="text"
                placeholder="Mianownik"
                class="w-32 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-[#0059BB] focus:outline-none font-['Inter'] text-[16px]"
              />
            </div>

            <!-- Preview -->
            <div v-if="fractionNumerator && fractionDenominator" class="mb-4 p-3 bg-[#f2f4f7] rounded-lg text-center">
              <p class="font-['Inter'] text-[#14px] text-gray-600 mb-1">Podgląd:</p>
              <div class="text-[20px]" v-html="renderedFractionPreview"></div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3">
              <button
                @click="closeFractionBuilder"
                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-['Inter'] font-semibold text-[14px] rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anuluj
              </button>
              <button
                @click="insertFraction"
                :disabled="!fractionNumerator || !fractionDenominator"
                class="flex-1 px-4 py-2 bg-[#0059BB] text-white font-['Inter'] font-semibold text-[14px] rounded-lg hover:bg-[#004799] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Wstaw ułamek
              </button>
            </div>
          </div>
        </div>

        <!-- Quadratic Equation Builder Modal -->
        <div v-if="showQuadraticBuilder" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-2xl p-6 w-[400px] max-w-[95vw]">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px]">
                Stwórz równanie kwadratowe
              </h3>
              <button @click="closeQuadraticBuilder" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-4 mb-6">
              <label class="block">
                <span class="text-sm text-gray-700">Współczynnik a:</span>
                <input
                  ref="quadraticInputA"
                  v-model="quadraticA"
                  type="number"
                  placeholder="np. 1"
                  class="mt-1 w-full rounded-lg border-2 border-gray-300 px-3 py-2 focus:border-[#0059BB] focus:outline-none font-['Inter'] text-[16px]"
                  @keydown.enter.prevent="quadraticInputB?.focus()"
                />
              </label>
              <label class="block">
                <span class="text-sm text-gray-700">Współczynnik b:</span>
                <input
                  ref="quadraticInputB"
                  v-model="quadraticB"
                  type="number"
                  placeholder="np. 2"
                  class="mt-1 w-full rounded-lg border-2 border-gray-300 px-3 py-2 focus:border-[#0059BB] focus:outline-none font-['Inter'] text-[16px]"
                  @keydown.enter.prevent="quadraticInputC?.focus()"
                />
              </label>
              <label class="block">
                <span class="text-sm text-gray-700">Współczynnik c:</span>
                <input
                  ref="quadraticInputC"
                  v-model="quadraticC"
                  type="number"
                  placeholder="np. 3"
                  class="mt-1 w-full rounded-lg border-2 border-gray-300 px-3 py-2 focus:border-[#0059BB] focus:outline-none font-['Inter'] text-[16px]"
                  @keydown.enter.prevent="insertQuadraticEquation"
                />
              </label>
            </div>

            <!-- Preview -->
            <div class="mb-4 p-3 bg-[#f2f4f7] rounded-lg text-center">
              <p class="font-['Inter'] text-[#14px] text-gray-600 mb-1">Podgląd:</p>
              <div class="text-[20px]" v-html="renderedQuadraticPreview"></div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3">
              <button
                @click="closeQuadraticBuilder"
                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-['Inter'] font-semibold text-[14px] rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anuluj
              </button>
              <button
                @click="insertQuadraticEquation"
                :disabled="!quadraticA && !quadraticB && !quadraticC"
                class="flex-1 px-4 py-2 bg-[#0059BB] text-white font-['Inter'] font-semibold text-[14px] rounded-lg hover:bg-[#004799] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Wstaw równanie
              </button>
            </div>
          </div>
        </div>
    </div>
    </div>

    <!-- Bottom Section -->
    <div class="grid grid-cols-12 gap-6 sm:gap-8">
      <!-- Progress Tracker -->
      <div class="col-span-12 lg:col-span-9 bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-5 sm:p-6 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <!-- Calendar Icon -->
            <svg class="w-[21px] h-[22px] text-[#0053DB] dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#566166] dark:text-muted-foreground text-[14px] tracking-[0.7px] uppercase">
              POSTĘP LEKCJI
            </h3>
          </div>
          <p class="font-['Plus_Jakarta_Sans'] font-bold text-[#0053db] text-[14px]">
            {{ lessonProgressTimeLabel }}
          </p>
        </div>

        <div class="bg-[#d9e4ea] dark:bg-muted h-8 rounded-2xl overflow-hidden relative">
          <div
            class="absolute inset-y-0 left-0 bg-[#0053db] dark:bg-primary rounded-2xl transition-all duration-1000 ease-linear"
            :style="{ width: `${lessonProgressPercent}%` }"
          ></div>
          <div class="absolute left-1/4 top-0 bottom-0 w-0.5 bg-white/30"></div>
          <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30"></div>
          <div class="absolute left-3/4 top-0 bottom-0 w-0.5 bg-white/30"></div>
        </div>

        <div class="flex items-center justify-between text-[10px] font-['Plus_Jakarta_Sans'] font-bold tracking-[1px] uppercase">
          <span class="text-[#566166] dark:text-muted-foreground">POCZĄTEK</span>
          <span class="text-[#0053db]">KONIEC</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="col-span-12 lg:col-span-3 space-y-3 sm:space-y-4 flex flex-col justify-end">
        <button 
          class="presentation-btn-static w-full bg-[#e6e8eb] rounded-[18px] sm:rounded-[24px] py-3.5 sm:py-4 flex items-center justify-center gap-2 hover:bg-[#d8dadd] transition-colors cursor-pointer"
          @click="goPresentation"
        >
          <!-- Presentation Icon -->
          <svg class="size-5" fill="none" stroke="#142588" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span class="font-['Inter'] font-semibold text-[#142588] text-[16px]">
            Utwórz prezentację
          </span>
        </button>

        <button 
          class="w-full bg-[#7b3400] rounded-[18px] sm:rounded-[24px] py-3.5 sm:py-4 flex items-center justify-center gap-2 hover:bg-[#6a2d00] transition-colors shadow-[0_4px_12px_rgba(123,52,0,0.2)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-[#7b3400]"
          :disabled="isFinalizingLesson"
          @click="finalizeNow"
        >
          <!-- Archive Icon -->
          <svg class="size-5" fill="none" stroke="#FFA26E" stroke-width="2.2" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span class="font-['Inter'] font-semibold text-[#ffa26e] text-[16px]">
            {{ isFinalizingLesson ? "Przetwarzanie..." : "Zakończ i archiwizuj" }}
          </span>
        </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* KaTeX styles for math equations */
@import url('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css');

/* Custom styles for math rendering */
.ask-me-content,
.equation-content {
  line-height: 1.8;
}

.ask-me-content .katex,
.equation-content .katex {
  font-size: 1.1em;
}

.ask-me-content .katex-display,
.equation-content .katex-display {
  margin: 1.5em 0;
  overflow-x: auto;
  padding: 0.5em 0;
}

.ask-me-content .katex-display > .katex,
.equation-content .katex-display > .katex {
  text-align: left;
}

.ask-me-content strong,
.equation-content strong {
  color: #191c1e;
}

.ask-me-content code,
.equation-content code {
  background: rgba(0, 89, 187, 0.1);
  color: #0059BB;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.dark .app-shell .presentation-btn-static {
  background-color: #e6e8eb !important;
}
.dark .app-shell .presentation-btn-static:hover {
  background-color: #d8dadd !important;
}
.dark .app-shell .presentation-btn-static span {
  color: #142588 !important;
}
.dark .app-shell .presentation-btn-static svg {
  stroke: #142588 !important;
}
</style>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import { supabase } from "../supabase";
import katex from "katex";

function normalizeBaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

function formatTimestamp(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function hasRepetitiveLoops(text) {
  if (!text || typeof text !== "string") return false;
  const clean = text.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length < 8) return false;

  // 1. Check unique words ratio for longer texts - adjusted to prevent false positives for lists of math terms
  const uniqueWords = new Set(words);
  const ratio = uniqueWords.size / words.length;
  if (words.length >= 20 && ratio < 0.25) {
    console.warn(`[RepetitionDetector] Triggered unique words ratio: ${ratio.toFixed(2)} (${uniqueWords.size}/${words.length})`);
    return true;
  }

  // 2. Check consecutive word sequences - safer thresholds to avoid false positives for emphasis/teaching repetitions
  for (let len = 1; len <= 4; len++) {
    const requiredRepeats = len === 1 ? 6 : (len === 2 ? 5 : 4);
    for (let i = 0; i <= words.length - len * requiredRepeats; i++) {
      const sequences = [];
      for (let r = 0; r < requiredRepeats; r++) {
        sequences.push(words.slice(i + r * len, i + (r + 1) * len).join(" "));
      }
      
      const allEqual = sequences.every(seq => seq === sequences[0]);
      if (allEqual) {
        console.warn(`[RepetitionDetector] Triggered consecutive sequence loop: "${sequences[0]}" repeated ${requiredRepeats} times`);
        return true;
      }
    }
  }

  return false;
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "";
const COVERAGE_REFRESH_MIN_INTERVAL_MS = 2_000; // Reduced from 90s to 5s for faster coverage updates

const lessonDurationOptions = [
  { label: "45 min", minutes: 45 },
  { label: "1h 30 min", minutes: 90 },
  { label: "2h", minutes: 120 },
  { label: "2h 15 min", minutes: 135 },
  { label: "3h", minutes: 180 }
];

const route = useRoute();
const router = useRouter();
const {
  state,
  startLive,
  deleteLesson, // Changed from cancelLesson to deleteLesson
  sendTranscript,
  refreshCoverage,
  setManualPointApproval,
  finalizeLesson,
  fetchLessons,
  fetchLesson,
  hydrateLessonFromCache, 
  askMeAI
} = useLessonStore();

const aiQueryTextarea = ref(null);
const numeratorInput = ref(null);
const denominatorInput = ref(null);
const activeModalInput = ref('numerator');
const isRecording = ref(false);
const micDevices = ref([]);
const selectedMicId = ref("");
const transcriptionMethod = ref("webspeech");
const recognition = ref(null);
const micLevel = ref(0);
const interimCaption = ref("");
const sttStatus = ref("idle");
const apiStatus = ref("checking");
const micStream = ref(null);
const isTranscribing = ref(false); // Prevent duplicate transcriptions
const processedTranscriptionIds = new Set(); // Track processed transcriptions
const transcriptionContainer = ref(null); // Ref for auto-scrolling
const isUserScrolling = ref(false); // Track if user is manually scrolling
const lastScrollPosition = ref(0); // Track last scroll position
const audioContext = ref(null);
const analyserNode = ref(null);
const mediaRecorder = ref(null);
const startAt = ref(0);
const elapsedSec = ref(0);
const timer = ref(null);
const transcription = ref([]);
const audioChunks = ref([]); // Global audio chunks for transcription
const error = ref("");
const info = ref("");
const shouldKeepListening = ref(false);
const isFinalizingLesson = ref(false);
const manualUpdateLoadingId = ref("");
const selectedLessonDurationMinutes = ref(45);
const activeSessionDurationMinutes = ref(45);
const lastCoverageRefreshMs = ref(0);
const coverageRefreshTimer = ref(null);
let apiPingTimer = null;
let interimScrollTimer = null;
let handleEscapeKey = null;

// Unified AI Assistant state
const aiQuery = ref("");
const aiResponse = ref("");
const aiLoading = ref(false);
const aiError = ref("");
const selectedClassLevel = ref("");
const activeTab = ref("ask"); // "ask" or "equation"

const classOptions = ref([]);

// Math shortcuts for quick formula insertion
const mathShortcuts = [
  { label: "√x", template: "$\\sqrt{liczba}$" },
  { label: "x²", template: "$liczba^2$" },
  { label: "x³", template: "$liczba^3$" },
  { label: "xⁿ", template: "$podstawa^{wykładnik}$" },
  { label: "∑", template: "$\\sum_{i=od}^{do}$" },
  { label: "∫", template: "$\\int_{od}^{do} f(x) dx$" },
  { label: "H₂O", template: "$H_2O$" },
  { label: "CO₂", template: "$CO_2$" },
  { label: "aᵇ", template: "$podstawa^{wykładnik}$" },
  { label: "log₂", template: "$\\log_{podstawa}(liczba)$" },
  { label: "sin/cos", template: "$\\sin(kąt)$" },
  { label: "α, β, γ", template: "$\\alpha, \\beta, \\gamma$" },
  { label: "±", template: "$\\pm$" },
  { label: "≈", template: "$\\approx$" },
  { label: "≠", template: "$\\neq$" }, 
  { label: "Δ", template: "$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$" },
  { label: "ax²+bx+c=0", action: "openQuadraticBuilder" },
  { label: "=", template: "$=$" },
  { label: "≤", template: "$\\leq$" },
  { label: "≥", template: "$\\geq$" },
  { label: "→", template: "$\\rightarrow$" },
  { label: "∞", template: "$\\infty$" }
];

// Fraction builder state
const showFractionBuilder = ref(false);
const fractionNumerator = ref("");
const fractionDenominator = ref("");

// Quadratic equation builder state
const showQuadraticBuilder = ref(false);
const quadraticA = ref("");
const quadraticB = ref("");
const quadraticC = ref("");
const quadraticInputA = ref(null);
const quadraticInputB = ref(null);
const quadraticInputC = ref(null);

function insertMathShortcut(template) {
  // Jeśli okno ułamka jest otwarte, usuwamy znaki $ z szablonu, aby nie dublować kontekstu matematycznego
  const cleanTemplate = showFractionBuilder.value ? template.replace(/\$/g, '') : template;

  let targetInput;
  let targetValue;

  if (showFractionBuilder.value) {
    if (activeModalInput.value === 'numerator') {
      targetInput = numeratorInput.value;
      targetValue = fractionNumerator;
    } else {
      targetInput = denominatorInput.value;
      targetValue = fractionDenominator;
    }
  } else {
    targetInput = aiQueryTextarea.value;
    targetValue = aiQuery;
  }

  if (targetInput) {
    const start = targetInput.selectionStart;
    const end = targetInput.selectionEnd;
    const currentVal = targetValue.value;
    
    targetValue.value = currentVal.slice(0, start) + cleanTemplate + currentVal.slice(end);

    nextTick(() => {
      targetInput.selectionStart = targetInput.selectionEnd = start + cleanTemplate.length;
      targetInput.focus();
    });
  }
}

function handleShortcutAction(action) {
  if (action === 'openQuadraticBuilder') {
    openQuadraticBuilder();
  }
}

function openQuadraticBuilder() {
  showQuadraticBuilder.value = true;
  quadraticA.value = '';
  quadraticB.value = '';
  quadraticC.value = '';
  nextTick(() => {
    quadraticInputA.value?.focus();
  });
}

function closeQuadraticBuilder() {
  showQuadraticBuilder.value = false;
  quadraticA.value = '';
  quadraticB.value = '';
  quadraticC.value = '';
}

function insertQuadraticEquation() {
  const a = parseFloat(quadraticA.value);
  const b = parseFloat(quadraticB.value);
  const c = parseFloat(quadraticC.value);

  if (isNaN(a) && isNaN(b) && isNaN(c)) {
    insertMathShortcut('$ax^2 + bx + c = 0$');
    closeQuadraticBuilder();
    return;
  }

  let equation = '';
  let isFirstTerm = true;

  // Wyraz ax^2
  if (!isNaN(a) && a !== 0) {
    if (a === 1) equation += 'x^2';
    else if (a === -1) equation += '-x^2';
    else equation += `${a}x^2`;
    isFirstTerm = false;
  }

  // Wyraz bx
  if (!isNaN(b) && b !== 0) {
    if (b > 0) {
      equation += (isFirstTerm ? '' : ' + ');
      if (b === 1) equation += 'x';
      else equation += `${b}x`;
    } else {
      equation += (isFirstTerm ? '' : ' - ');
      if (b === -1) equation += 'x';
      else equation += `${Math.abs(b)}x`;
    }
    isFirstTerm = false;
  }

  // Wyraz wolny c
  if (!isNaN(c) && c !== 0) {
    if (c > 0) {
      equation += (isFirstTerm ? '' : ' + ');
      equation += `${c}`;
    } else {
      equation += (isFirstTerm ? '' : ' - ');
      equation += `${Math.abs(c)}`;
    }
    isFirstTerm = false;
  }

  if (!equation) equation = '0';

  // Czyszczenie ewentualnych spacji na początku
  if (equation.startsWith(' + ')) equation = equation.substring(3);
  else if (equation.startsWith('+')) equation = equation.substring(1);

  insertMathShortcut(`$${equation} = 0$`);
  closeQuadraticBuilder();
}

function openFractionBuilder() {
  if (showFractionBuilder.value) {
    // Jeśli okno jest już otwarte, wstaw kod ułamka w aktualne pole (piętrowy ułamek)
    insertMathShortcut('\\frac{}{}');
  } else {
    showFractionBuilder.value = true;
    fractionNumerator.value = "";
    fractionDenominator.value = "";
    activeModalInput.value = 'numerator';
    nextTick(() => {
      numeratorInput.value?.focus();
    });
  }
}

function insertFraction() {
  if (fractionNumerator.value && fractionDenominator.value) {
    const fractionTemplate = `$\\frac{${fractionNumerator.value}}{${fractionDenominator.value}}$`;
    // Najpierw zamykamy modal, aby insertMathShortcut wiedział, że ma teraz celować 
    // w główne pole tekstowe aiQuery i nie usuwać znaków $
    showFractionBuilder.value = false;
    nextTick(() => {
      insertMathShortcut(fractionTemplate);
    });
  }
}

function closeFractionBuilder() {
  showFractionBuilder.value = false;
  fractionNumerator.value = "";
  fractionDenominator.value = "";
}
// KaTeX rendering function for math equations
function renderMathInText(text) {
  if (!text) return "";

  // Split text into LaTeX math parts and regular text parts
  // Supports both $...$ and $$...$$ delimiters
  const parts = [];
  let currentPos = 0;
  let regex = /\$\$?([^$]+)\$\$?/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the LaTeX equation
    if (match.index > currentPos) {
      parts.push({ type: 'text', content: text.substring(currentPos, match.index) });
    }

    // Process the LaTeX equation
    const latex = match[1];
    const isDisplayMode = match[0].startsWith('$$');

    try {
      const renderedHtml = katex.renderToString(latex, {
        displayMode: isDisplayMode,
        throwOnError: false,
        strict: false
      });
      parts.push({ type: 'math', content: renderedHtml, isDisplayMode });
    } catch (error) {
      // If KaTeX fails, fallback to the raw LaTeX text
      parts.push({ type: 'text', content: match[0] });
    }

    currentPos = match.index + match[0].length;
  }

  // Add remaining text after the last LaTeX equation
  if (currentPos < text.length) {
    parts.push({ type: 'text', content: text.substring(currentPos) });
  }

  // Combine all parts into HTML
  return parts.map(part => {
    if (part.type === 'math') {
      return part.isDisplayMode ? `<div class="my-4">${part.content}</div>` : `<span>${part.content}</span>`;
    } else {
      return part.content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic text
        .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>'); // Code
    }
  }).join('');
}

// Computed property for rendered unified AI response
const renderedAIAnswer = computed(() => renderMathInText(aiResponse.value));

// Computed property for rendered fraction preview
const renderedFractionPreview = computed(() => {
  if (!fractionNumerator.value || !fractionDenominator.value) return "";

  // Czyścimy licznik i mianownik z ewentualnych znaków $, aby KaTeX mógł je poprawnie złożyć
  const n = fractionNumerator.value.replace(/\$/g, '');
  const d = fractionDenominator.value.replace(/\$/g, '');

  try {
    // Renderujemy grafikę ułamka bezpośrednio za pomocą KaTeX
    return katex.renderToString(`\\frac{${n}}{${d}}`, {
      throwOnError: false,
      displayMode: true // Tryb blokowy sprawia, że ułamek wygląda profesjonalnie (większy rozmiar)
    });
  } catch (e) {
    return `\\frac{${n}}{${d}}`;
  }
});

const points = computed(() => state.lesson?.plan || []);
const discussedCount = computed(() => 
  points.value.filter((p) => p.status === "discussed" || p.manualApproved).length
);
const progress = computed(() => 
  points.value.length ? Math.round((discussedCount.value / points.value.length) * 100) : 0
);
const pendingPoints = computed(() => points.value.filter((p) => p.status !== "discussed" && !p.manualApproved));

// Watch transcription changes for auto-scroll
watch(transcription, () => {
  autoScrollToBottom();
}, { deep: true });

// Restart session automatically when settings change
watch([selectedMicId, transcriptionMethod], () => {
  if (isRecording.value) {
    console.log("[LiveLesson] Setting changed, restarting session...");
    stopSession();
    // Small delay to allow resources to release before restarting
    setTimeout(() => {
      startSession();
    }, 400);
  }
});

// Sync transcription with existing data from database when returning to a lesson
watch(
  () => state.lesson?.transcripts,
  (newVal) => {
    if (newVal && Array.isArray(newVal) && transcription.value.length === 0) {
      // Fix: Determine a proper baseline for relative timestamps.
      // Using 0 (default startAt.value) results in Unix Epoch timestamps (huge numbers).
      let baseline = startAt.value;

      if (baseline <= 0) {
        const lessonStartAt = new Date(state.lesson?.startedAt || 0).getTime();
        baseline = (Number.isFinite(lessonStartAt) && lessonStartAt > 0) ? lessonStartAt : 0;
      }

      if (baseline <= 0 && newVal.length > 0) {
        const first = newVal[0];
        baseline = first.startedAtMs || (first.createdAt ? new Date(first.createdAt).getTime() : Date.now());
      }

      transcription.value = newVal.map((t) => {
        const text = typeof t === "string" ? t : t.text;
        const entryTime = t.startedAtMs || (t.createdAt ? new Date(t.createdAt).getTime() : baseline);
        const relativeMs = entryTime - baseline;
        return {
          text,
          timestamp: formatTimestamp(relativeMs)
        };
      }).filter(item => item.text);
      nextTick(() => autoScrollToBottom());
    }
  },
  { immediate: true }
);

// Watch interim caption for auto-scroll during processing (with throttling)
watch(interimCaption, () => {
  if (interimCaption.value) {
    // Clear existing timer and set new one (throttled scroll)
    if (interimScrollTimer) clearTimeout(interimScrollTimer);
    interimScrollTimer = setTimeout(() => {
      autoScrollToBottom();
    }, 300); // Scroll every 300ms max while processing
  }
});
const availableLessonDurationOptions = computed(() => lessonDurationOptions);
const elapsedLabel = computed(() => `${Math.floor(elapsedSec.value / 60)}:${String(elapsedSec.value % 60).padStart(2, "0")}`);
const elapsedMinutes = computed(() => Math.floor(elapsedSec.value / 60));
const elapsedSecondsRemainder = computed(() => elapsedSec.value % 60);
const lessonProgressTimeLabel = computed(
  () =>
    `${elapsedMinutes.value} minut ${elapsedSecondsRemainder.value} sekund / ${activeSessionDurationMinutes.value} minut`
);
const durationLabel = computed(() => {
  const minutes = activeSessionDurationMinutes.value || selectedLessonDurationMinutes.value || 45;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder} min`;
});
const sttStatusLabel = computed(() => {
  if (sttStatus.value === "listening") return "nasłuchiwanie";
  if (sttStatus.value === "starting") return "uruchamianie";
  if (sttStatus.value === "error") return "błąd";
  return "bezczynny";
});
const apiStatusLabel = computed(() => {
  if (apiStatus.value === "online") return "online";
  if (apiStatus.value === "offline") return "offline";
  return "sprawdzanie";
});

const lessonProgressPercent = computed(() => {
  const totalSeconds = Math.max(1, activeSessionDurationMinutes.value * 60);
  return Math.min(100, Math.floor((elapsedSec.value / totalSeconds) * 100));
});

function resolveLessonDurationMinutes(lesson) {
  const parsedLength = Number(lesson?.length);
  const minutes = Number.isFinite(parsedLength) && parsedLength > 0 ? Math.round(parsedLength) : 45;
  return Math.max(1, minutes);
}

function hydrateLessonProgressFromState() {
  if (!state.lesson) return;
  activeSessionDurationMinutes.value = resolveLessonDurationMinutes(state.lesson);
  const startedAtMs = new Date(state.lesson?.startedAt || 0).getTime();
  const nowMs = Date.now();
  startAt.value = Number.isFinite(startedAtMs) && startedAtMs > 0 ? startedAtMs : nowMs;
  elapsedSec.value = Math.max(0, Math.floor((nowMs - startAt.value) / 1000));
}

onMounted(async () => {
  const routeLessonId = String(route.params.lessonId || "").trim();
  const currentLessonId = String(state.lesson?.id || "").trim();
  let cachedRouteLesson = null;
  if (routeLessonId) {
    cachedRouteLesson = hydrateLessonFromCache(routeLessonId);
    if (cachedRouteLesson) {
      hydrateLessonProgressFromState();
    }
  }

  // Pobierz listę klas z profilu użytkownika
  await loadUserClasses();

  // Do not block lesson UI hydration on secondary async tasks.
  void loadMicDevices();
  void checkApiHealth();
  void fetchLicenseStatus();
  apiPingTimer = setInterval(checkApiHealth, 10000);

  // Check microphone permissions first
  try {
    info.value = "Sprawdzam uprawnienia do mikrofonu...";
    await loadMicDevices();
    info.value = "";
  } catch (micErr) {
    console.error('[onMounted] Microphone permission check failed:', micErr);
    error.value = `Brak uprawnień do mikrofonu. Sprawdź ustawienia przeglądarki i przyznaj dostęp do mikrofonu.`;
  }

  if (routeLessonId) {
    if (routeLessonId !== currentLessonId) {
      if (cachedRouteLesson) {
        // Render instantly from local cache, then silently refresh.
        void fetchLesson(routeLessonId);
      } else {
        await fetchLesson(routeLessonId);
        hydrateLessonProgressFromState();
      }
    } else {
      // Keep UI instant when returning, but refresh lesson in background.
      void fetchLesson(routeLessonId);
    }
  } else if (!state.lesson) {
    const lessons = await fetchLessons();
    const target = lessons[0];
    if (target) {
      state.lesson = target;
      hydrateLessonProgressFromState();
    }
  } else {
    hydrateLessonProgressFromState();
  }

  // Add scroll event listener for auto-scroll behavior
  await nextTick();
  if (transcriptionContainer.value) {
    transcriptionContainer.value.addEventListener('scroll', handleScroll);
  }

  // Only start session if we have microphone permission
  if (!isRecording.value && micDevices.value.length > 0) {
    startSession();
  } else if (!isRecording.value) {
    info.value = "Oczekuję na uprawnienia do mikrofonu...";
  }

  // Handle Escape key to close fraction builder
  handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      if (showFractionBuilder.value) {
        closeFractionBuilder();
      } else if (showQuadraticBuilder.value) {
        closeQuadraticBuilder();
      }
    }
  };
  document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  stopSession();
  if (timer.value) clearInterval(timer.value);
  if (window.__whisperActivityInterval) clearInterval(window.__whisperActivityInterval);
  if (window.__whisperCleanup) {
    window.__whisperCleanup();
    window.__whisperCleanup = null;
  }
  if (coverageRefreshTimer.value) clearTimeout(coverageRefreshTimer.value);
  if (apiPingTimer) clearInterval(apiPingTimer);
  if (interimScrollTimer) clearTimeout(interimScrollTimer);
  stopMicMeter();

  // Clean up scroll event listener
  if (transcriptionContainer.value) {
    transcriptionContainer.value.removeEventListener('scroll', handleScroll);
  }

  // Clean up Escape key listener
  document.removeEventListener('keydown', handleEscapeKey);
});

async function loadUserClasses() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("classes")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.classes && profile.classes.length > 0) {
    classOptions.value = profile.classes;
    if (!selectedClassLevel.value) selectedClassLevel.value = profile.classes[0];
  } else {
    classOptions.value = ["Brak klas w profilu"];
    selectedClassLevel.value = classOptions.value[0];
  }
}

async function refreshCoverageThrottled(force = false) {
  if (!state.lesson?.id) return;
  const now = Date.now();
  if (!force && now - lastCoverageRefreshMs.value < COVERAGE_REFRESH_MIN_INTERVAL_MS) {
    console.log(`⏱️ Coverage check throttled (${(now - lastCoverageRefreshMs.value)/1000}s < ${COVERAGE_REFRESH_MIN_INTERVAL_MS/1000}s)`);
    return;
  }

  lastCoverageRefreshMs.value = now;
  console.log(`🔄 Checking coverage (force: ${force})...`);
  try {
    const result = await refreshCoverage(state.lesson.id);
    console.log(`✅ Coverage check completed. Points discussed: ${result.plan.filter(p => p.status === 'discussed').length}/${result.plan.length}`);
  } catch (e) {
    console.error(`❌ Coverage check error:`, e.message);
    info.value = `Błąd odświeżania pokrycia: ${e.message || "nieznany"}`;
  }
}

async function fetchLicenseStatus() {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return;

    await fetch(`${API_BASE}/api/account/license-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Demo mode checks removed
  } catch (e) {
    console.error("Failed to fetch license status", e);
  }
}

function scheduleCoverageRefresh(forceImmediate = false) {
  if (!state.lesson?.id) return;

  // Force immediate check if requested (e.g., after transcription)
  if (forceImmediate) {
    console.log(`🚀 Forcing immediate coverage check`);
    void refreshCoverageThrottled(true);
    return;
  }

  const now = Date.now();
  const elapsedSinceLast = now - lastCoverageRefreshMs.value;
  const delay = Math.max(0, COVERAGE_REFRESH_MIN_INTERVAL_MS - elapsedSinceLast);

  if (delay === 0) {
    void refreshCoverageThrottled(false);
    return;
  }

  if (coverageRefreshTimer.value) return;
  coverageRefreshTimer.value = setTimeout(() => {
    coverageRefreshTimer.value = null;
    void refreshCoverageThrottled(false);
  }, delay);
}

function autoScrollToBottom() {
  if (transcriptionContainer.value && !isUserScrolling.value) {
    const container = transcriptionContainer.value;
    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;

    // Only auto-scroll if user is near the bottom (within 100px)
    if (scrollHeight - scrollTop - clientHeight < 100) {
      container.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      });
    }
  }
}

// Track user scrolling behavior
function handleScroll() {
  if (!transcriptionContainer.value) return;
  const container = transcriptionContainer.value;
  const scrollPosition = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;
  const distanceFromBottom = scrollHeight - scrollPosition - clientHeight;

  // Detect if user is scrolling up (manually viewing earlier content)
  if (distanceFromBottom > 50) {
    isUserScrolling.value = true;
  } else if (distanceFromBottom < 20) {
    // User is back at the bottom, re-enable auto-scroll
    isUserScrolling.value = false;
  }

  lastScrollPosition.value = scrollPosition;
}

async function startSession() {
  if (isRecording.value) return;
  try {
    error.value = "";
    await fetchLicenseStatus();
    if (!state.lesson) {
      error.value = "Brak lekcji. Najpierw utwórz plan.";
      return;
    }
    hydrateLessonProgressFromState();
    if (state.lesson.status !== "live") {
      await startLive(state.lesson.id);
      hydrateLessonProgressFromState();
    }
    if (timer.value) clearInterval(timer.value);
    timer.value = setInterval(() => {
      elapsedSec.value = Math.floor((Date.now() - startAt.value) / 1000);
      if (elapsedSec.value >= activeSessionDurationMinutes.value * 60) {
        info.value = `Osiągnięto ustawiony czas lekcji (${durationLabel.value}). Lekcja została zatrzymana automatycznie.`;
        stopSession();
      }
    }, 1000);

    info.value = `Uruchamiam transkrypcję (${transcriptionMethod.value === 'whisper' ? 'Języki mieszane' : 'Język polski'})...`;
    isRecording.value = true; // Set to true BEFORE starting mic so monitorAudio doesn't stop

    try {
      sttStatus.value = "starting";
      await startMicMeter();

      if (transcriptionMethod.value === 'whisper') {
        await beginWhisperMode();
        info.value = "Języki mieszane aktywne. Mów do mikrofonu - transkrypcja będzie aktualizowana co kilka sekund.";
      } else {
        await beginWebSpeechMode();
      }
    } catch (err) {
      console.error('[startSession] Error starting transcription:', err);
      error.value = `Nie udało się uruchomić transkrypcji: ${err.message}`;
      sttStatus.value = "error";
      isRecording.value = false;
      if (timer.value) clearInterval(timer.value);
    }
  } catch (e) {
    console.error('[startSession] Error:', e);
    error.value = e.message;
    sttStatus.value = "error";
  }
}

function stopSession() {
  isRecording.value = false;
  sttStatus.value = "idle";
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  
  if (recognition.value) {
    recognition.value.onend = null; // Prevent auto-restart
    recognition.value.stop();
    recognition.value = null;
  }
  
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
  }
  mediaRecorder.value = null;

  // Call cleanup function if it exists
  if (window.__whisperCleanup) {
    window.__whisperCleanup();
    window.__whisperCleanup = null;
  }

  mediaRecorder.value?.stop();
  mediaRecorder.value = null;
  isRecording.value = false;
  interimCaption.value = "";

  if (timer.value) clearInterval(timer.value);
  timer.value = null;

  if (window.__whisperActivityInterval) clearInterval(window.__whisperActivityInterval);
  window.__whisperActivityInterval = null;

  stopMicMeter();
  sttStatus.value = "idle";

  if (coverageRefreshTimer.value) {
    clearTimeout(coverageRefreshTimer.value);
    coverageRefreshTimer.value = null;
  }

  void refreshCoverageThrottled(true);
}

async function beginWebSpeechMode() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    throw new Error("Twoja przeglądarka nie obsługuje lokalnej transkrypcji (Web Speech API). Użyj trybu języków mieszanych.");
  }

  recognition.value = new SpeechRecognition();
  recognition.value.lang = 'pl-PL';
  // Na Androidzie continuous = true powoduje, że wyniki nie są w ogóle zwracane lub tylko na samym końcu. 
  // Ustawienie false wymusza szybsze zwracanie finalnych wyników po każdej frazie i restart w onend.
  const isAndroid = /Android/i.test(navigator.userAgent);
  recognition.value.continuous = !isAndroid;
  recognition.value.interimResults = true;

  recognition.value.onstart = () => {
    sttStatus.value = "listening";
    info.value = "Transkrypcja w języku polskim aktywna. Przetwarzanie odbywa się lokalnie w przeglądarce.";
  };

  recognition.value.onresult = async (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        const text = event.results[i][0].transcript.trim();
        if (text) {
          if (hasRepetitiveLoops(text)) {
            console.warn(`[WebSpeech] Discarded highly repetitive transcript loop: "${text.substring(0, 100)}..."`);
            interimCaption.value = "";
            return;
          }
          const relativeMs = Date.now() - startAt.value;
          transcription.value.push({ text, timestamp: formatTimestamp(relativeMs) });
          isUserScrolling.value = false;
          autoScrollToBottom();
          await sendTranscript(state.lesson.id, text);
          scheduleCoverageRefresh(true);
        }
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    interimCaption.value = interim;
  };

  recognition.value.onerror = (event) => {
    // Ignore 'no-speech' and 'aborted' as they are often transient and not fatal
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      console.error("WebSpeech Error:", event.error);
      const errorMap = {
        'network': 'Błąd sieci: transkrypcja lokalna (Język polski) nie może połączyć się z serwerem Google. Sprawdź internet lub użyj trybu języków mieszanych.',
        'not-allowed': 'Brak uprawnień do mikrofonu dla transkrypcji lokalnej.',
      };
      error.value = errorMap[event.error] || `Błąd transkrypcji lokalnej: ${event.error}`;
    } else {
      console.log(`[WebSpeech] Info: ${event.error}`);
    }
  };

  recognition.value.onend = () => {
    // Auto-restart if we are still recording
    if (isRecording.value && transcriptionMethod.value === 'webspeech') {
      try {
        setTimeout(() => {
          if (isRecording.value && transcriptionMethod.value === 'webspeech' && recognition.value) recognition.value.start();
        }, 500);
      } catch (e) {
        console.warn("Could not restart Web Speech recognition:", e);
      }
    }
  };

  recognition.value.start();

  // Start level monitoring for Web Speech
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const webSpeechAudioContext = new AudioContextClass();
  if (webSpeechAudioContext.state === 'suspended') {
    await webSpeechAudioContext.resume();
  }

  const source = webSpeechAudioContext.createMediaStreamSource(micStream.value);
  const analyser = webSpeechAudioContext.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  // Register cleanup to close the context when the session stops
  window.__whisperCleanup = () => {
    webSpeechAudioContext.close();
  };

  const monitorLevel = () => {
    if (!isRecording.value || transcriptionMethod.value !== 'webspeech') {
      return;
    }

    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    // Update the global micLevel ref for the UI
    micLevel.value = Math.min(100, average);

    requestAnimationFrame(monitorLevel);
  };
  monitorLevel();
}

async function beginWhisperMode() {
  console.log("[WhisperMode] Starting beginWhisperMode function");

  if (!micStream.value) {
    throw new Error("Nie udało się uruchomić strumienia mikrofonu.");
  }
  console.log("[WhisperMode] Mic stream available");

  // Set up Web Audio API for silence detection
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContextClass();

  // Resume AudioContext if it's suspended (required for user gesture)
  if (audioContext.state === 'suspended') {
    console.log("[WhisperMode] Resuming suspended AudioContext");
    await audioContext.resume();
  }

  const source = audioContext.createMediaStreamSource(micStream.value);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.fftSize);
  let silenceStart = null;
  let hasSpeechDetected = false; // Flag to track if any speech was heard in current fragment
  let noiseFloor = 2.0; // Dynamic baseline noise floor
  const SILENCE_DURATION = 2000; // 2 seconds of silence before sending (allow for natural pauses)

  console.log(`[WhisperMode] Audio setup complete (Adaptive RMS volume detection). Duration: ${SILENCE_DURATION}ms`);

  // Set up MediaRecorder
  let recorder;
  const supportedTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4"
  ];

  for (const type of supportedTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      try {
        recorder = new MediaRecorder(micStream.value, {
          mimeType: type,
          audioBitsPerSecond: 128000
        });
        break;
      } catch (e) {
        continue;
      }
    }
  }

  if (!recorder) {
    recorder = new MediaRecorder(micStream.value, {
      audioBitsPerSecond: 128000
    });
  }

  mediaRecorder.value = recorder;
  sttStatus.value = "listening";
  info.value = "Gemini Flash aktywny. System wykrywa mowę i automatycznie wysyła fragmenty.";

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      audioChunks.value.push(event.data);
      lastChunkTime = Date.now();
      console.log(`📦 Audio chunk: ${event.data.size} bytes (total: ${audioChunks.value.length})`);
    }
  };

  // Function to send collected audio for transcription (accepts parameter to avoid race conditions)
  const sendAudioForTranscription = async (chunksToSend) => {
    const activeChunks = chunksToSend || [...audioChunks.value];
    if (!chunksToSend) {
      audioChunks.value = []; // Clear the source array if we read it here
    }

    if (activeChunks.length === 0 || !state.lesson?.id) {
      return;
    }

    // Prevent duplicate transcriptions
    if (isTranscribing.value) {
      console.log("⏸️ Already transcribing, queueing chunks for next cycle");
      audioChunks.value = [...activeChunks, ...audioChunks.value];
      setTimeout(() => {
        hasSpeechDetected = true;
      }, 0);
      return;
    }

    isTranscribing.value = true;

    try {
      interimCaption.value = "Przetwarzanie audio...";

      const audioBlob = new Blob(activeChunks, { type: recorder.mimeType || 'audio/webm' });
      console.log(`🔊 Processing audio: ${audioBlob.size} bytes, ${activeChunks.length} chunks`);

      // More reasonable filtering - balance between filtering noise and capturing speech
      const minSize = 1000; // Minimum ~1KB of audio
      const estimatedDurationMs = activeChunks.length * 1000; // ~1 second per chunk
      const minDuration = 1000; // Require at least 1 second of audio

      if (audioBlob.size < minSize || estimatedDurationMs < minDuration) {
        console.log(`❌ Audio too short: ${audioBlob.size}b / ${estimatedDurationMs}ms (min: ${minSize}b/${minDuration}ms)`);
        interimCaption.value = "";
        return;
      }

      const blobType = audioBlob.type || 'audio/webm';
      const fileExt = blobType.includes('mp4') ? 'mp4' :
                     blobType.includes('ogg') ? 'ogg' : 'webm';

      const form = new FormData();
      form.set("lessonId", state.lesson.id);
      form.set("file", audioBlob, `audio-${Date.now()}.${fileExt}`);

      console.log(`[Transcribe] Sending to API: ${API_BASE}/api/transcribe`);

      const { data: authData } = await supabase.auth.getSession();
      const token = authData?.session?.access_token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE}/api/transcribe`, {
        method: "POST",
        headers,
        body: form
      });

      console.log(`📡 API status: ${response.status}`);

      const data = await response.json();

      if (!response.ok) {
        // Handle budget exceeded error specifically
        if (response.status === 402 || data.error === "Budget exceeded") {
          const errorMessage = "Limit kosztów transkrypcji został osiągnięty. Spróbuj ponownie później lub skontaktuj się z administratorem.";
          error.value = errorMessage;
          throw new Error(errorMessage);
        }
        throw new Error(data.error || data.message || "Błąd transkrypcji");
      }

      const rawText = String(data.text || "").trim();
      const hallucinationRegex = /(napisy (by|przygotował|stworzone)|facebooku i instagramie|oglądajcie, subskrybujcie|dzięki za oglądanie|amara\.org|nie dodawaj podpisów|ignorować ciszę|lekcji online prowadzonej)/i;
      const obviousHallucinations = /^(dziękuję|dzięki|dzień dobry|dobry wieczór|proszę|cześć|hej|hi|hello|thanks|please|dziękuję,? dzień dobry\.?|dziękuję bardzo\.?|do widzenia\.?)$/i;

      let cleanText = rawText;

      const isValidTranscription = cleanText &&
                              cleanText.length >= 2 &&
                              !obviousHallucinations.test(cleanText) &&
                              !hallucinationRegex.test(cleanText) &&
                              !hasRepetitiveLoops(cleanText);

      if (isValidTranscription) {
        // Prevent duplicate double-triggers within 1.5 seconds, while allowing repeated speech throughout the lesson
        const lastItem = transcription.value[transcription.value.length - 1];
        const isDuplicate = lastItem && lastItem.text === cleanText && (Date.now() - (lastItem.addedAt || 0) < 1500);
        if (isDuplicate) {
          console.log(`⚠️ Duplicate double-trigger skipped: "${cleanText.substring(0, 30)}..."`);
        } else {
          const relativeMs = Date.now() - startAt.value;
          transcription.value.push({
            text: cleanText,
            timestamp: formatTimestamp(relativeMs),
            addedAt: Date.now()
          });
          console.log(`✅ Added transcription #${transcription.value.length}`);
          await nextTick();

          // Reset user scrolling flag when new content is added
          isUserScrolling.value = false;

          // Auto-scroll to bottom after adding new transcription
          autoScrollToBottom();

          await sendTranscript(state.lesson.id, cleanText); // FIXED: 'text' -> 'cleanText'

          // Small delay to prevent overwhelming the server, then check coverage
          setTimeout(() => {
            scheduleCoverageRefresh(true); // Force immediate coverage check after transcription
          }, 100);

        }
      } else {
        console.log(`❌ Filtered: "${cleanText}" (hallucination/too short)`);
      }

      if (data.limitReached) {
        info.value = "Osiągnięto limit kosztów sesji.";
      }

      console.log("[Transcribe] ✅ Success");
    } catch (e) {
      console.error(`❌ Transcription error: ${e.message}`);
      error.value = `Błąd transkrypcji: ${e.message}`;
    } finally {
      interimCaption.value = "";
      isTranscribing.value = false; // Reset transcription flag
      console.log(`🧹 Cleaned up`);
    }
  };

  recorder.onerror = (error) => {
    console.error("[MediaRecorder] Error:", error);
    sttStatus.value = "error";
    info.value = "Błąd nagrywania audio.";
  };

  recorder.onstart = () => {
    console.log("[MediaRecorder] Started successfully");
  };

  recorder.onstop = () => {
    console.log(`[MediaRecorder] Stopped. Chunks collected: ${audioChunks.value.length}`);
  };

  try {
    recorder.start(1000); // Start with 1 second intervals to get chunks
    console.log("[MediaRecorder] Start called with 1000ms interval");
  } catch (startErr) {
    console.error("[MediaRecorder] Failed to start:", startErr);
    audioContext.close();
    throw new Error(`Nie udało się uruchomić nagrywania: ${startErr.message}`);
  }

  // Safe and clean function to stop and restart the MediaRecorder.
  // Solving the asynchronous restart bug on Safari and mobile WebKit.
  const stopAndRestartRecorder = () => {
    if (!recorder || recorder.state === 'inactive') return;

    // Capture the chunks currently in the queue
    const chunksToSend = [...audioChunks.value];
    audioChunks.value = []; // Clear the queue immediately for the next recording cycle

    // Temporarily override the onstop handler to handle our safe restart
    const originalOnStop = recorder.onstop;
    recorder.onstop = () => {
      console.log(`[MediaRecorder] Stopped safely. State is now: ${recorder.state}`);
      
      // Process transcription in background
      if (hasSpeechDetected && chunksToSend.length > 0) {
        void sendAudioForTranscription(chunksToSend);
      } else {
        console.log(`[MediaRecorder] Skipping send. Speech detected: ${hasSpeechDetected}, Chunks: ${chunksToSend.length}`);
      }

      // Reset state for next cycle
      recordingStartTime = Date.now();
      silenceStart = null;
      hasSpeechDetected = false;

      // Restore original onstop handler
      recorder.onstop = originalOnStop;

      // Safely restart the recorder only when state is inactive, with a slight delay
      // to ensure the browser's audio pipeline has fully released the previous session.
      if (isRecording.value && transcriptionMethod.value === 'whisper') {
        setTimeout(() => {
          if (!isRecording.value || transcriptionMethod.value !== 'whisper') return;
          try {
            if (recorder.state === 'inactive') {
              recorder.start(1000);
              console.log("[MediaRecorder] Restarted safely after delay in dynamically overridden onstop");
            }
          } catch (err) {
            console.error("[MediaRecorder] Failed to restart after delay in dynamically overridden onstop:", err);
          }
        }, 150);
      }
    };

    try {
      recorder.stop();
    } catch (err) {
      console.error("[MediaRecorder] Error stopping recorder:", err);
    }
  };

  // Monitor audio levels for silence detection
  let recordingStartTime = Date.now();
  const MAX_RECORDING_TIME = 30000; // Max 30 seconds before forcing send
  let frameCount = 0;
  let lastChunkTime = Date.now();
  let isMonitoring = true;

  const monitorAudio = () => {
    if (!isRecording.value && frameCount > 10) {
      console.log("🛑 Monitor stopped - recording inactive");
      audioContext.close();
      isMonitoring = false;
      return;
    }

    if (!isMonitoring) return;

    analyser.getByteTimeDomainData(dataArray);

    // Calculate Root Mean Square (RMS) for precise volume detection
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128; // scale to -1.0 to 1.0
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    const average = rms * 100; // scale to 0-100

    // Adapt noise floor (slowly follow the quietest level observed)
    if (average < noiseFloor) {
      noiseFloor = average; // Instantly follow downward spikes
    } else {
      noiseFloor = noiseFloor * 0.999 + average * 0.0015; // Slowly drift upwards to adapt to background noise
    }
    noiseFloor = Math.max(0.5, Math.min(15, noiseFloor));
    const dynamicThreshold = Math.max(noiseFloor + 3.0, noiseFloor * 1.6);

    // Update mic level for UI
    micLevel.value = Math.min(100, average * 2.5); // scale/amplify for excellent UI visualization

    frameCount++;

    // Status logging every 60 frames
    if (frameCount % 60 === 0) {
      console.log(`🎤 Recording active | Level: ${average.toFixed(1)} | Floor: ${noiseFloor.toFixed(1)} | Thresh: ${dynamicThreshold.toFixed(1)} | Chunks: ${audioChunks.value.length}`);
    }

    // Force send after max recording time
    const recordingDuration = Date.now() - recordingStartTime;
    if (recordingDuration > MAX_RECORDING_TIME && audioChunks.value.length > 0) {
      if (isTranscribing.value) {
        // If we are already transcribing, do not force stop, just let it keep recording
        requestAnimationFrame(monitorAudio);
        return;
      }
      if (hasSpeechDetected) {
        console.log(`⏱️ Max time reached, forcing transcription`);
        stopAndRestartRecorder();
      } else {
        // Safe memory cleanup for long silence
        console.log(`🧹 Clearing silent chunks after max recording time`);
        audioChunks.value = [];
        recordingStartTime = Date.now();
        silenceStart = null;
      }
      requestAnimationFrame(monitorAudio);
      return;
    }

    // Detect silence or speech
    if (average > dynamicThreshold) {
      silenceStart = null;
      hasSpeechDetected = true; // Mark that we heard something in this fragment
      if (frameCount % 60 === 0) {
        info.value = `Mowa wykryta (poziom: ${Math.round(average)})`;
      }
    } else if (silenceStart === null) {
      silenceStart = Date.now();
    } else {
      // Check if silence has lasted long enough
      const silenceDuration = Date.now() - silenceStart;
      if (silenceDuration >= SILENCE_DURATION && audioChunks.value.length > 0 && hasSpeechDetected) {
        if (isTranscribing.value) {
          // If we are already transcribing, do not stop and restart the recorder.
          // This prevents stopping and restarting every 2 seconds while waiting for the server,
          // which avoids pipeline corruption and duplicate requests.
          if (frameCount % 60 === 0) {
            info.value = "Przetwarzam poprzedni fragment...";
          }
        } else {
          console.log(`⏸️ Silence detected, sending transcription`);
          stopAndRestartRecorder();
        }
      } else if (frameCount % 60 === 0) {
        info.value = hasSpeechDetected 
          ? `Czekam na mowę... (${Math.round(silenceDuration/1000)}s ciszy)` 
          : "Wykrywam dźwięk...";
      }
    }

    requestAnimationFrame(monitorAudio);
  };

  // Start monitoring
  console.log("[WhisperMode] Starting audio monitoring");
  monitorAudio();

  // Store cleanup function
  window.__whisperCleanup = () => {
    console.log("[WhisperMode] Cleanup called");
    audioContext.close();
    if (audioChunks.value.length > 0) {
      console.log("[WhisperMode] Sending remaining chunks during cleanup");
      sendAudioForTranscription();
    }
  };
  console.log("[WhisperMode] ✅ beginWhisperMode completed successfully");
}

async function loadMicDevices() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Przeglądarka nie obsługuje API mediów. Spróbuj użyć innej przeglądarki.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    const devices = await navigator.mediaDevices.enumerateDevices();
    micDevices.value = devices.filter((d) => d.kind === "audioinput");
  } catch (err) {
    micDevices.value = [];

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      error.value = "Odmówiono dostępu do mikrofonu. Sprawdź ustawienia przeglądarki i przyznaj uprawnienia.";
    } else if (err.name === 'NotFoundError') {
      error.value = "Nie znaleziono mikrofonu. Podłącz mikrofon i spróbuj ponownie.";
    } else if (err.name === 'NotReadableError') {
      error.value = "Mikrofon jest zajęty przez inną aplikację. Zamknij inne aplikacje używające mikrofonu.";
    } else {
      error.value = `Nie udało się załadować urządzeń audio: ${err.message || 'Sprawdź uprawnienia'}`;
    }
  }
}

async function startMicMeter() {
  // Reuse existing stream if available and live
  if (micStream.value && micStream.value.getAudioTracks().some(t => t.readyState === 'live')) {
    if (audioContext.value) {
      audioContext.value.close();
      audioContext.value = null;
    }
    analyserNode.value = null;
    micLevel.value = 10;
    return;
  }

  // Need to get a new stream
  const constraints = selectedMicId.value
    ? { audio: { deviceId: { exact: selectedMicId.value } } }
    : { audio: true };
  try {
    micStream.value = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    throw new Error(`Nie udało się uzyskać dostępu do mikrofonu: ${err.message || 'Sprawdź uprawnienia'}`);
  }

  micLevel.value = 10;
}

function stopMicMeter() {
  if (micStream.value) {
    micStream.value.getTracks().forEach((t) => t.stop());
    micStream.value = null;
  }
  if (audioContext.value) {
    audioContext.value.close();
    audioContext.value = null;
  }
  analyserNode.value = null;
  micLevel.value = 0;
}

async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    apiStatus.value = response.ok ? "online" : "offline";
  } catch {
    apiStatus.value = "offline";
  }
}


async function startMicTest() {
  try {
    error.value = "";
    info.value = "Tryb testu: mów do mikrofonu - system w trybie języków mieszanych przetworzy Twój głos.";
    micTestActive.value = true;
    await beginMic();
  } catch (e) {
    micTestActive.value = false;
    error.value = e.message;
  }
}

function stopMicTest() {
  // Call cleanup function if it exists
  if (window.__whisperCleanup) {
    window.__whisperCleanup();
    window.__whisperCleanup = null;
  }

  mediaRecorder.value?.stop();
  mediaRecorder.value = null;
  if (window.__whisperActivityInterval) clearInterval(window.__whisperActivityInterval);
  window.__whisperActivityInterval = null;

  micTestActive.value = false;
  interimCaption.value = "";
  sttStatus.value = "idle";

  stopMicMeter();
  micLevel.value = 0; 
}

async function goPresentation() {
  if (!state.lesson?.id) return;
  try {
    // Force a coverage refresh to ensure the plan status is synchronized with transcripts
    // in the database before the presentation generator runs on the server.
    await refreshCoverageThrottled(true);
  } catch {
    // ignore sync errors, the generator will attempt to load data anyway
  }
  // Redirect with query parameters that trigger auto-generation in PresentationView
  router.push({ path: `/presentation/${state.lesson.id}`, query: { generate: '1', scope: 'full' } });
}

async function finalizeNow() {
  if (!state.lesson || isFinalizingLesson.value) return;
  try {
    isFinalizingLesson.value = true;
    error.value = "";
    stopSession();
    const note = await finalizeLesson(state.lesson.id, window.location.origin);
    router.push(`/archive?note=${encodeURIComponent(note.shareUrl)}`);
  } catch (e) {
    error.value = e.message || "Nie udało się zakończyć lekcji.";
  } finally {
    isFinalizingLesson.value = false;
  }
}

async function cancelLessonAndRedirect() {
  if (!state.lesson?.id) return;
  try {
    error.value = "";
    stopSession(); // Stop recording and timers
    await deleteLesson(state.lesson.id); // Call deleteLesson instead of cancelLesson
    info.value = "Lekcja została anulowana i usunięta."; // Updated message
    router.push("/preparation"); // Redirect to preparation view
  } catch (e) {
    error.value = e.message || "Nie udało się anulować lekcji.";
    console.error("Delete lesson error:", e); // Updated error message
  }
}

async function toggleManualApproval(point) {
  if (!state.lesson?.id || !point?.id) return;
  console.log(`[ManualApproval] Toggling point ${point.id}. Current manualApproved: ${point.manualApproved}`);
  try {
    error.value = "";
    manualUpdateLoadingId.value = point.id;
    const nextApproved = !Boolean(point.manualApproved);
    const updatedLesson = await setManualPointApproval(state.lesson.id, point.id, nextApproved);
    console.log(`[ManualApproval] Success. New status in state:`, points.value.find(p => p.id === point.id));
  } catch (e) {
    console.error(`[ManualApproval] Error:`, e);
    error.value = e.message || "Nie udało się zaktualizować statusu podtematu.";
  } finally {
    manualUpdateLoadingId.value = "";
  }
}

async function resetCosts() {
  if (!state.lesson?.id) return;
  try {
    error.value = "";
    const { data: authData } = await supabase.auth.getSession();
    const token = authData?.session?.access_token;
    const response = await fetch(`${API_BASE}/api/lessons/${state.lesson.id}/costs`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (response.ok) {
      const data = await response.json();
      info.value = data.message || "Koszty zostały zresetowane.";
      await updateCurrentCost();
    } else {
      throw new Error("Nie udało się zresetować kosztów");
    }
  } catch (e) {
    error.value = e.message || "Błąd podczas resetowania kosztów";
  }
}

async function handleAISubmit() {
  if (!aiQuery.value.trim()) return;
  
  try {
    aiLoading.value = true;
    aiError.value = "";
    aiResponse.value = "";

    const prompt = activeTab.value === 'equation' 
      ? `Rozwiąż to równanie krok po kroku i wyjaśnij metodę: ${aiQuery.value.trim()}` 
      : aiQuery.value.trim();

    const answer = await askMeAI(prompt, state.lesson?.id || null, selectedClassLevel.value);
    aiResponse.value = answer;

    await nextTick();
    const resultElement = document.getElementById('ai-result');
    if (resultElement) {
      resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  } catch (e) {
    aiError.value = e.message || "Błąd komunikacji z AI.";
    console.error("AI Submit error:", e);
  } finally {
    aiLoading.value = false;
  }
}

function clearAI() {
  aiQuery.value = "";
  aiResponse.value = "";
  aiError.value = "";
}
</script>
