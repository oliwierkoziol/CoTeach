<template>
  <div v-if="isPresenting" class="presentation-view fixed inset-0 z-[120] bg-[#05070f] text-white">
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-white/10 bg-black/35 px-4 py-3 sm:px-6">
        <button
          class="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          @click="exitPresentation"
        >
          Zakończ prezentację
        </button>
        <!-- Beautiful Autoplay Timer / Progress indicator -->
        <div v-if="activeDurationMinutes !== 'manual' && totalSeconds > 0" class="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
          <!-- Play / Pause Button -->
          <button 
            type="button" 
            @click="toggleAutoPlay" 
            class="text-white hover:text-indigo-400 transition-colors focus:outline-none flex items-center justify-center"
            :title="isAutoPlaying ? 'Wstrzymaj autoodtwarzanie' : 'Wznów autoodtwarzanie'"
          >
            <!-- Pause Icon -->
            <svg v-if="isAutoPlaying" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
            <!-- Play Icon -->
            <svg v-else class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          
          <div class="h-4 w-[1px] bg-white/20"></div>
          
          <!-- Timer Text -->
          <span class="font-mono text-sm font-bold text-indigo-300">
            {{ formatTime(remainingSeconds) }}
          </span>
          
          <div class="h-4 w-[1px] bg-white/20"></div>
          
          <!-- Progress bar -->
          <div class="w-24 bg-white/15 h-1.5 rounded-full overflow-hidden relative" title="Czas do końca podsumowania">
            <div 
              class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
              :style="{ width: `${(remainingSeconds / totalSeconds) * 100}%` }"
            ></div>
          </div>
          
          <div class="h-4 w-[1px] bg-white/20"></div>

          <!-- Slide Switch countdown -->
          <span class="text-xs text-white/50 font-medium">
            Slajd za: <span class="font-mono font-bold text-white">{{ currentSlideTimer }}s</span>
          </span>
        </div>

        <div class="text-sm text-white/80">{{ slideIndex + 1 }} / {{ slides.length }}</div>
        <div class="flex gap-2">
          <button
            v-if="isPilot"
            class="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
            @click="isPilot = false"
          >
            Podgląd slajdów
          </button>
          <button
            class="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            @click="openPresentationWindow"
          >
            Otwórz w nowym oknie
          </button>
        </div>
      </div>

      <!-- Pilot Mode UI -->
      <div v-if="isPilot" class="flex flex-1 flex-col items-center justify-center p-6 bg-[#0a0c14]">
        <div class="mb-10 text-center">
          <h2 class="text-3xl font-bold mb-2 text-white">Tryb pilota</h2>
          <p class="text-white/60">Sterujesz prezentacją wyświetlaną w nowym oknie</p>
        </div>
        
        <div class="w-full max-w-md space-y-6">
          <div class="flex items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/10">
            <div class="text-left">
              <p class="text-xs uppercase tracking-widest text-white/40 mb-1">Aktualny slajd</p>
              <p class="text-2xl font-bold text-white">{{ slideIndex + 1 }} / {{ slides.length }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs uppercase tracking-widest text-white/40 mb-1">Typ</p>
              <p class="text-sm font-medium px-2 py-1 bg-white/10 rounded uppercase text-white/80">{{ slideTypeTranslations[current.type] || current.type }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-6">
            <button 
              :disabled="slideIndex === 0"
              @click="slideIndex--"
              class="flex flex-col items-center justify-center aspect-square rounded-[2rem] border-2 border-white/10 bg-white/5 text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-20"
            >
              <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M15 19l-7-7 7-7"/></svg>
              <span class="mt-2 font-bold">Wstecz</span>
            </button>
            <button 
              :disabled="slideIndex === slides.length - 1"
              @click="slideIndex++"
              class="flex flex-col items-center justify-center aspect-square rounded-[2rem] border-2 border-indigo-500/50 bg-indigo-500/10 transition hover:bg-indigo-500/20 active:scale-95 disabled:opacity-20"
            >
              <svg class="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M9 5l7 7-7 7"/></svg>
              <span class="mt-2 font-bold text-indigo-200">Dalej</span>
            </button>
          </div>

          <div class="pt-10 flex flex-col gap-3">
            <button 
              @click="isPilot = false" 
              class="px-6 py-4 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition text-sm font-semibold"
            >
              Powrót do podglądu slajdów
            </button>
            <button 
              @click="exitPresentation" 
              class="w-full py-4 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/20 transition"
            >
              Zakończ sesję prezentacji
            </button>
          </div>
        </div>
      </div>

      <div v-else :class="['flex-1 overflow-hidden transition-colors duration-700', activeTheme.wrapperClass]">
        <div :class="['relative mx-auto h-full max-h-full w-full max-w-full overflow-hidden transition-all duration-700', activeTheme.panelClass]">
          
          <div class="relative z-10 flex h-full min-h-0 flex-col">
            <!-- Last Slide / Branding -->
            <template v-if="slideIndex === slides.length - 1">
              <div class="flex h-full flex-col items-center justify-center text-center p-12">
                <div class="mb-8 flex flex-col items-center">
                  <img :src="sygnetUrl" alt="CoTeach Signet" class="h-24 w-auto mb-5 opacity-95 drop-shadow-xl" />
                  <div :class="['text-[clamp(2rem,5vh,3.5rem)] font-black tracking-tighter', activeTheme.titleClass]">
                    CoTeach
                  </div>
                </div>
                
                <div :class="['max-w-2xl px-8 py-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl', activeTheme.accentClass]">
                  <p :class="['text-[clamp(1.2rem,3vh,2rem)] font-extrabold mb-2', activeTheme.titleClass]">
                    Dziękujemy za wspólną lekcję!
                  </p>
                  <p :class="['text-[clamp(1rem,2vh,1.4rem)] font-bold opacity-60', activeTheme.textClass]">
                    Przygotowano przy użyciu CoTeach
                  </p>
                </div>

                <div class="mt-20 opacity-30">
                  <div class="h-1 w-20 bg-blue-500 rounded-full mx-auto mb-4"></div>
                  <p :class="['text-sm font-bold uppercase tracking-widest', activeTheme.textClass]">
                    Asystent AI dla Nauczycieli
                  </p>
                </div>
              </div>
            </template>

            <!-- Title Slide Layout -->
            <template v-else-if="current.type === 'title'">
              <div class="h-full overflow-hidden flex flex-col justify-center py-6 px-6 lg:px-24">
                <div class="max-w-4xl w-full mx-auto space-y-6 text-center">
                  <div class="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-500/20">
                    Prezentacja Lekcji
                  </div>
                  <h1 :class="['text-[clamp(1.8rem,5vh,3rem)] font-black leading-[1.1] tracking-tight', activeTheme.titleClass]" v-html="renderMath(current.title)"></h1>
                  <div class="w-16 h-1 bg-blue-600 rounded-full mx-auto my-4"></div>
                  <p v-if="current.subtitle" :class="['text-[clamp(1rem,2.2vh,1.3rem)] font-bold opacity-80', activeTheme.textClass]" v-html="renderMath(current.subtitle)"></p>
                  <p v-if="current.summary" :class="['mt-4 text-[clamp(0.95rem,2.2vh,1.15rem)] font-medium leading-relaxed opacity-70 max-w-3xl mx-auto', activeTheme.textClass]" v-html="renderMath(current.summary)"></p>
                </div>
              </div>
            </template>
 
            <!-- Summary/Agenda Slide Layout -->
            <template v-else-if="current.type === 'summary' || current.type === 'agenda'">
              <div class="h-full overflow-hidden flex flex-col justify-center py-6 px-6 lg:px-20">
                <div class="max-w-5xl w-full mx-auto text-center space-y-6">
                  <div class="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest border border-indigo-500/20">
                    {{ current.type === 'agenda' ? 'Rozkład lekcji' : 'Podsumowanie' }}
                  </div>
                  <h2 :class="['text-[clamp(1.8rem,4.5vh,2.8rem)] font-black tracking-tight', activeTheme.titleClass]" v-html="renderMath(current.title || (current.type === 'agenda' ? 'Plan lekcji' : 'Podsumowanie'))"></h2>
                  <div :class="['p-6 md:p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl w-full', activeTheme.accentClass]">
                    <p :class="['text-[clamp(1rem,2.2vh,1.25rem)] font-semibold leading-relaxed text-left lg:text-center', activeTheme.textClass]" v-html="renderMath(current.summary)"></p>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <!-- 0: Double-Panel Split (Key Concept + Details) -->
              <div v-if="slideLayoutType === 0" class="h-full overflow-hidden flex flex-col lg:flex-row lg:items-stretch">
                <div :class="['w-full lg:w-[45%] flex flex-col justify-center p-6 lg:p-10 border-r border-white/5 shrink-0', activeTheme.panelClass]">
                  <div class="space-y-4">
                    <span class="px-3 py-1 text-xs font-bold bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 uppercase tracking-widest">
                      {{ slideTypeTranslations[current.type] || 'Koncepcja' }}
                    </span>
                    <h2 :class="['text-[clamp(1.5rem,3.8vh,2.4rem)] font-black leading-tight', activeTheme.titleClass]" v-html="renderMath(current.title)"></h2>
                    <p v-if="current.subtitle" :class="['text-[clamp(0.95rem,2vh,1.2rem)] font-bold opacity-70', activeTheme.textClass]" v-html="renderMath(current.subtitle)"></p>
                    <p :class="['text-[clamp(0.95rem,2.2vh,1.2rem)] font-medium leading-relaxed opacity-80 border-l-4 border-blue-500 pl-4', activeTheme.textClass]" v-html="renderMath(currentMainText)"></p>
                  </div>
                </div>
                <div :class="['flex-1 flex flex-col justify-center p-6 lg:p-10', activeTheme.accentClass]">
                  <div class="w-full">
                    <h3 :class="['text-xs uppercase tracking-widest font-extrabold mb-4 opacity-40', activeTheme.textClass]">Szczegóły i Ciekawostki</h3>
                    <div class="space-y-3 max-w-2xl">
                      <div v-for="(detail, dIdx) in current.details.slice(0, 4)" :key="dIdx" class="flex items-start gap-3 p-3.5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm shadow-sm transition hover:translate-x-1 duration-300">
                        <div class="flex-shrink-0 w-6 h-6 rounded-md bg-blue-500/15 flex items-center justify-center font-bold text-blue-400 text-xs">
                          {{ dIdx + 1 }}
                        </div>
                        <p :class="['text-[clamp(0.85rem,1.8vh,1.1rem)] font-semibold leading-relaxed', activeTheme.textClass]" v-html="renderMath(detail)"></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
 
              <!-- 1: Header + Horizontal Detail Cards Grid -->
              <div v-else-if="slideLayoutType === 1" class="h-full overflow-hidden flex flex-col justify-center py-6 px-6 lg:px-20">
                <div class="w-full max-w-6xl mx-auto space-y-6">
                  <div class="space-y-3">
                    <span class="px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                      {{ slideTypeTranslations[current.type] || 'Zagadnienie' }}
                    </span>
                    <h2 :class="['text-[clamp(1.6rem,4vh,2.6rem)] font-black tracking-tight', activeTheme.titleClass]" v-html="renderMath(current.title)"></h2>
                    <p :class="['text-[clamp(1rem,2.2vh,1.25rem)] font-medium leading-relaxed opacity-85 max-w-4xl', activeTheme.textClass]" v-html="renderMath(currentMainText)"></p>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div v-for="(detail, dIdx) in current.details.slice(0, 3)" :key="dIdx" class="p-4 sm:p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg flex flex-col justify-between">
                      <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-sm mb-4">
                        {{ dIdx + 1 }}
                      </div>
                      <p :class="['text-[clamp(0.85rem,1.8vh,1.05rem)] font-semibold leading-relaxed', activeTheme.textClass]" v-html="renderMath(detail)"></p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2: Centered Typographic Masterpiece -->
              <div v-else-if="slideLayoutType === 2" class="h-full overflow-hidden flex flex-col justify-center py-6 px-6 lg:px-20">
                <div :class="['w-full max-w-5xl mx-auto text-center space-y-4 lg:space-y-6', activeTheme.panelClass]">
                  <span class="px-3 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 uppercase tracking-widest">
                    Wiedza w pigułce
                  </span>
                  <h2 :class="['text-[clamp(1.8rem,4.5vh,2.8rem)] font-black tracking-tight', activeTheme.titleClass]" v-html="renderMath(current.title)"></h2>
                  <p v-if="current.subtitle" :class="['mx-auto max-w-3xl text-[clamp(1rem,2.2vh,1.3rem)] font-bold opacity-60', activeTheme.textClass]" v-html="renderMath(current.subtitle)"></p>
                  <div class="h-0.5 w-12 bg-amber-500/50 mx-auto"></div>
                  <p :class="['mx-auto max-w-4xl text-[clamp(0.95rem,2.2vh,1.2rem)] font-medium leading-relaxed opacity-95', activeTheme.textClass]" v-html="renderMath(currentMainText)"></p>
                  
                  <div v-if="current.details && current.details.length" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
                    <div v-for="(detail, dIdx) in current.details.slice(0, 4)" :key="dIdx" class="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 shadow-sm">
                      <span class="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-amber-500 opacity-60"></span>
                      <p :class="['text-[clamp(0.85rem,1.8vh,1.05rem)] font-semibold leading-relaxed', activeTheme.textClass]" v-html="renderMath(detail)"></p>
                    </div>
                  </div>
                </div>
              </div>
 
              <!-- 3: Elegant Side-by-Side Compare / Multi-Section Blocks -->
              <div v-else class="h-full overflow-hidden flex flex-col justify-center py-6 px-6 lg:px-20">
                <div class="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch">
                  <div :class="['w-full lg:w-[45%] flex flex-col justify-center p-6 lg:p-8 rounded-2xl border border-white/5 backdrop-blur-sm', activeTheme.accentClass]">
                    <span class="px-3 py-1 text-xs font-bold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 uppercase tracking-widest w-fit mb-4">
                      Kluczowy wniosek
                    </span>
                    <h2 :class="['text-[clamp(1.4rem,3.5vh,2.2rem)] font-black leading-tight mb-4', activeTheme.titleClass]" v-html="renderMath(current.title)"></h2>
                    <p :class="['text-[clamp(0.95rem,2vh,1.15rem)] font-semibold leading-relaxed opacity-90', activeTheme.textClass]" v-html="renderMath(currentMainText)"></p>
                  </div>
                  
                  <div class="flex-1 flex flex-col justify-center gap-3">
                    <div class="w-full space-y-3">
                      <div v-for="(detail, dIdx) in current.details.slice(0, 4)" :key="dIdx" class="p-3.5 sm:p-4 rounded-xl border border-white/10 bg-white/5 shadow-md flex items-center gap-3">
                        <div class="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-[11px] flex-shrink-0">
                          {{ dIdx + 1 }}
                        </div>
                        <p :class="['text-[clamp(0.85rem,1.8vh,1.05rem)] font-semibold leading-relaxed', activeTheme.textClass]" v-html="renderMath(detail)"></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div v-if="!isPilot" class="border-t border-white/10 bg-black/35 px-4 py-3 sm:px-6">
        <div class="mx-auto flex w-full max-w-full items-center justify-between">
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

  <div v-else-if="isGenerating" class="fixed inset-0 z-[110] flex items-center justify-center bg-background/95 px-6">
    <div class="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-card p-10 shadow-[0px_32px_64px_-16px_rgba(0,0,0,0.1)]">
      <div class="relative flex flex-col items-center text-center">
        <!-- Reverted to Old Throbber -->
        <div class="mx-auto mb-8 h-12 w-12 animate-spin rounded-full border-4 border-[#d8e0ff] border-t-[#0c3dfe]" />

        <h2 class="mb-3 font-['Plus_Jakarta_Sans'] text-[32px] font-extrabold leading-tight tracking-tight text-[#191c1e]">
          Generuję prezentację...
        </h2>
        
        <div class="max-w-sm">
          <p class="font-['Plus_Jakarta_Sans'] text-[17px] leading-relaxed text-[#454652]">
            Tworzę inteligentne slajdy na podstawie Twoich materiałów. To zajmie tylko chwilę.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="isReviewing" class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] w-full overflow-x-hidden relative">
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0" />

    <div class="p-4 sm:p-6 md:p-12 pt-8 w-full max-w-[1664px] relative z-10 mx-auto">
      <div class="mb-7 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="max-w-[1024px]">
          <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
            Przegląd slajdów
          </h1>
          <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-[28px]">
            Możesz edytować treści przed rozpoczęciem prezentacji.
          </p>
        </div>
        <div class="flex gap-4">
          <button @click="isReviewing = false" class="px-6 py-3 rounded-xl border-2 border-gray-100 bg-white font-bold text-[#454652] hover:bg-gray-50 transition-all">
            Wróć
          </button>
          <button @click="isPresenting = true" class="px-8 py-3 rounded-xl bg-[#0c3dfe] text-white font-bold shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] hover:bg-[#0a34d4] hover:-translate-y-0.5 transition-all">
            Rozpocznij prezentację
          </button>
        </div>
      </div>

      <div class="space-y-6 max-w-5xl mx-auto pb-20">
        <div v-for="(slide, index) in slides" :key="index" class="bg-white rounded-[12px] p-6 sm:p-8 shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] relative group">
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div class="lg:col-span-1">
              <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Typ slajdu</label>
              <div class="inline-flex items-center px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-extrabold uppercase tracking-wide border border-indigo-100/50">
                {{ slideTypeTranslations[slide.type] || "Slajd" }}
              </div>
            </div>

            <div class="lg:col-span-3 space-y-5">
              <div>
                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tytuł slajdu</label>
                <input v-model="slide.title" class="w-full bg-[#e0e3e6] border-none rounded-[8px] px-4 py-2 font-bold text-[18px] text-[#191c1e] font-['Plus_Jakarta_Sans'] focus:ring-2 focus:ring-[#0c3dfe]/50 transition-all" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Główne podsumowanie</label>
                <textarea v-model="slide.summary" rows="5" class="w-full bg-[#e0e3e6] border-none rounded-[8px] px-4 py-3 text-[15px] leading-relaxed text-[#454652] font-['Plus_Jakarta_Sans'] focus:ring-2 focus:ring-[#0c3dfe]/50 transition-all"></textarea>
              </div>
            </div>
          </div>

          <button @click="slides.splice(index, 1)" class="absolute top-8 right-8 p-3 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] relative overflow-x-hidden px-4 py-6 sm:px-6 md:p-12 pb-14 w-full">
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <div class="flex flex-col gap-[27px] w-full max-w-[1568px] relative z-10 mx-auto">
      <!-- Beta Info Banner -->
      <div class="mb-2 rounded-2xl bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border border-blue-500/10 p-4 flex items-center gap-4 shadow-sm">
        <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-[14px] leading-relaxed text-blue-800 dark:text-blue-300 font-semibold font-['Plus_Jakarta_Sans']">
          Ta funkcja jest w fazie intensywnego rozwoju. Dziękujemy szkołom partnerskim za pomoc w testowaniu i współtworzeniu nowych możliwości CoTeach!
        </p>
      </div>

      <!-- Header -->
      <div class="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full mb-4">
        <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px]">Generator prezentacji</h2>
        <p class="font-['Plus_Jakarta_Sans'] font-normal text-[#454652] text-[18px] leading-[28px]">Twórz prezentacje z wybranej lekcji i notatki, dopasowane do poziomu klasy.</p>
      </div>
      <div class="bg-card border border-border content-stretch flex flex-col gap-[12px] items-start pb-[24px] pt-[20px] px-[20px] sm:px-[32px] relative rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] shrink-0 w-full">
        <h3 class="font-['Manrope'] font-extrabold text-foreground text-[18px] leading-[28px] mb-2 flex items-center gap-2">Źródło materiałów
        </h3>

        <div class="mb-8 flex rounded-full border border-border bg-muted p-[6px] w-fit">
          <button
            type="button"
            @click="presentationSource = 'note'"
            :class="[
              'inline-flex h-10 items-center gap-2 rounded-full px-6 text-[14px] font-bold transition-all',
              presentationSource === 'note'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
            ]"
          >
            Notatki
          </button>
          <button
            type="button"
            @click="presentationSource = 'lesson'"
            :class="[
              'inline-flex h-10 items-center gap-2 rounded-full px-6 text-[14px] font-bold transition-all',
              presentationSource === 'lesson'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
            ]"
          >
            Lekcje na żywo
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div v-for="item in sourceItems" :key="item.id" class="group relative">
            <button
              type="button"
              @click="selectSourceItem(item.id)"
              :class="[
                'flex w-full flex-row items-center text-left gap-4 p-5 rounded-[12px] transition-all border-2',
                selectedSourceId === item.id
                  ? 'bg-primary border-primary text-primary-foreground shadow-[0px_12px_24px_-4px_rgba(12,61,254,0.3)]'
                  : 'bg-background border-border text-foreground hover:border-primary/30'
              ]"
            >
              <img 
                :src="presentationSource === 'lesson' ? liveLessonIcon : archiveIcon" 
                class="w-6 h-6 shrink-0" 
                :class="selectedSourceId === item.id ? 'brightness-0 invert' : 'opacity-70'"
              />
              <div class="min-w-0 flex-1">
                <p class="font-bold text-[15px] leading-tight truncate w-full">{{ item.title }}</p>
                <p class="font-medium text-[12px] truncate opacity-70">{{ item.subtitle }}</p>
              </div>
            </button>
            <div 
              v-if="selectedSourceId === item.id" 
              class="absolute -top-1.5 -right-1.5 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4"><path d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>

          <p v-if="!sourceItems.length" class="text-sm font-['Plus_Jakarta_Sans'] text-muted-foreground w-full">
            Brak dostępnych materiałów dla wybranego źródła.
          </p>
        </div>
      </div>

      <div class="bg-card border border-border content-stretch flex flex-col gap-6 items-start pb-[24px] pt-[20px] px-[20px] sm:px-[32px] relative rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] shrink-0 w-full">
        <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 class="font-['Manrope'] font-extrabold text-foreground text-[18px] leading-[28px] flex items-center gap-2">
            Ustawienia prezentacji
          </h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div class="content-stretch flex flex-col gap-[8px] items-start justify-center relative self-start shrink-0 w-full">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-muted-foreground text-[14px] leading-[20px]">Zakres treści</label>
            <div class="bg-input-background border border-border h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-primary/30">
              <select
                v-model="presentationScope"
                :disabled="presentationSource === 'note'"
                class="bg-transparent border-none outline-none w-full h-full px-4 appearance-none text-[16px] text-foreground font-['Plus_Jakarta_Sans'] cursor-pointer disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                <option value="full" class="dark:bg-card dark:text-foreground">Cała lekcja/notatka</option>
                <option value="pending" class="dark:bg-card dark:text-foreground">Tylko nieomówione punkty</option>
              </select>
              <div class="absolute right-[12px] flex gap-2 pointer-events-none items-center text-muted-foreground opacity-70">
                <svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24">
                  <path d="M7.2 9.6L12 14.4L16.8 9.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
                </svg>
              </div>
            </div>
          </div>

          <div class="content-stretch flex flex-col gap-[8px] items-start justify-center relative self-start shrink-0 w-full">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-muted-foreground text-[14px] leading-[20px]">Liczba slajdów</label>
            <div class="bg-input-background border border-border h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-primary/30">
              <select
                v-model="maxSlidesSelection"
                class="bg-transparent border-none outline-none w-full h-full px-4 appearance-none text-[16px] text-foreground font-['Plus_Jakarta_Sans'] cursor-pointer"
              >
                <option value="auto" class="dark:bg-card dark:text-foreground">Automatyczna (polecane)</option>
                <option :value="5" class="dark:bg-card dark:text-foreground">5 slajdów (Krótka)</option>
                <option :value="10" class="dark:bg-card dark:text-foreground">10 slajdów (Średnia)</option>
                <option :value="15" class="dark:bg-card dark:text-foreground">15 slajdów (Długa)</option>
                <option :value="20" class="dark:bg-card dark:text-foreground">20 slajdów (Maksymalna)</option>
              </select>
              <div class="absolute right-[12px] flex gap-2 pointer-events-none items-center text-muted-foreground opacity-70">
                <svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24">
                  <path d="M7.2 9.6L12 14.4L16.8 9.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
                </svg>
              </div>
            </div>
          </div>

          <div class="content-stretch flex flex-col gap-[8px] items-start justify-center relative self-start shrink-0 w-full md:col-span-2">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-muted-foreground text-[14px] leading-[20px]">Czas podsumowania (Autoodtwarzanie)</label>
            <div class="bg-input-background border border-border h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-primary/30">
              <select
                v-model="autoPlayMinutes"
                class="bg-transparent border-none outline-none w-full h-full px-4 appearance-none text-[16px] text-foreground font-['Plus_Jakarta_Sans'] cursor-pointer"
              >
                <option value="manual" class="dark:bg-card dark:text-foreground">Brak automatycznego odtwarzania (Sterowanie ręczne)</option>
                <option value="5" class="dark:bg-card dark:text-foreground">5 minut podsumowania (Automatyczne przesuwanie)</option>
                <option value="10" class="dark:bg-card dark:text-foreground">10 minut podsumowania (Automatyczne przesuwanie)</option>
                <option value="15" class="dark:bg-card dark:text-foreground">15 minut podsumowania (Automatyczne przesuwanie)</option>
                <option value="20" class="dark:bg-card dark:text-foreground">20 minut podsumowania (Automatyczne przesuwanie)</option>
              </select>
              <div class="absolute right-[12px] flex gap-2 pointer-events-none items-center text-muted-foreground opacity-70">
                <svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24">
                  <path d="M7.2 9.6L12 14.4L16.8 9.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
                </svg>
              </div>
            </div>
          </div>

          <div class="content-stretch flex flex-col gap-[12px] items-start justify-center relative self-start shrink-0 w-full md:col-span-2 mt-4">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-muted-foreground text-[14px] leading-[20px] mb-2">Styl prezentacji</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
              <button
                v-for="style in availableStyles"
                :key="style.id"
                type="button"
                @click="presentationStyle = style.id"
                :class="[
                  'group relative flex flex-col gap-3 p-3 rounded-2xl border-2 transition-all text-left',
                  presentationStyle === style.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-background hover:border-primary/30'
                ]"
              >
                <!-- Mini Preview Box -->
                <div :class="['w-full aspect-[16/10] rounded-lg overflow-hidden flex flex-col p-2 gap-1.5 shadow-sm transition-transform group-hover:scale-[1.02]', style.preview.wrapper]">
                  <div class="flex gap-1.5 h-full">
                    <div :class="['w-[40%] h-full rounded-sm p-1.5 flex flex-col gap-1', style.preview.accent]">
                      <div :class="['h-1.5 w-full rounded-full opacity-40', style.preview.title]"></div>
                      <div :class="['h-1 w-[80%] rounded-full opacity-20', style.preview.text]"></div>
                      <div :class="['h-1 w-[60%] rounded-full opacity-20', style.preview.text]"></div>
                    </div>
                    <div class="flex-1 flex flex-col justify-center gap-1 px-1">
                      <div :class="['h-2 w-full rounded-full', style.preview.title]"></div>
                      <div :class="['h-1 w-[90%] rounded-full opacity-30', style.preview.text]"></div>
                      <div :class="['h-1 w-[70%] rounded-full opacity-30', style.preview.text]"></div>
                    </div>
                  </div>
                </div>

                <div class="px-1">
                  <p :class="['font-bold text-[14px] leading-tight mb-0.5', presentationStyle === style.id ? 'text-primary' : 'text-foreground']">
                    {{ style.name }}
                  </p>
                  <p class="text-[11px] text-muted-foreground leading-tight">{{ style.description }}</p>
                </div>

                <!-- Checkmark for selected -->
                <div 
                  v-if="presentationStyle === style.id" 
                  class="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4"><path d="M5 13l4 4L19 7"/></svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-card border border-border content-stretch flex flex-col items-start justify-center p-[20px] sm:p-[32px] relative rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] shrink-0 w-full mb-7">
        <div v-if="generationMessage" class="mb-4 rounded-[10px] border border-blue-300 bg-blue-50 px-4 py-3 text-[14px] font-['Plus_Jakarta_Sans'] text-blue-800">
          {{ generationMessage }}
        </div>
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-[12px] bg-primary/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M4 6h16M4 12h16m-7 6h7"/></svg>
            </div>
            <div>
              <p class="font-['Plus_Jakarta_Sans'] text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Estymacja</p>
              <p class="font-['Plus_Jakarta_Sans'] text-[16px] text-foreground">
                Liczba slajdów: <span class="font-extrabold text-primary">{{ plannedSlideCount }}</span>
              </p>
            </div>
          </div>
          
          <div class="flex gap-[12px] items-center w-full sm:w-auto justify-end flex-col sm:flex-row">
            <button
              type="button"
              @click="$router.back()"
              class="bg-muted border border-border content-stretch flex items-center justify-center px-[24px] py-[10px] rounded-[8px] hover:bg-background/70 transition-colors w-full sm:w-auto font-['Plus_Jakarta_Sans'] font-semibold text-muted-foreground text-[16px] leading-[24px]"
            >
              Anuluj
            </button>
            <button
              type="button"
              :disabled="!canGenerate || isGenerating"
              @click="startGeneratedPresentation"
              class="bg-primary content-stretch flex items-center justify-center px-[32px] py-[10px] rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-primary-foreground leading-[24px]"
            >
              {{ isGenerating ? "Generuję..." : "Wygeneruj slajdy" }}
            </button>
          </div>
        </div>
      </div>
  </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick, onUnmounted } from "vue";
import katex from "katex";
import { useRoute } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";
import { loadPresentationHistoryRaw, savePresentationHistoryRaw } from "../lib/presentationHistoryStorage";
import archiveIcon from "../assets/archive.svg";
import liveLessonIcon from "../assets/livelesson.svg";
import logoUrl from "../assets/logo.svg";
import sygnetUrl from "../assets/sygnet.svg";

const ARCHIVE_OPEN_PRESENTATION_KEY = "coteach:open-presentation-id";
const SKIP_REVIEW_KEY = "coteach:skip-review";

const API_BASE = String(import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");

const route = useRoute();
const { state, fetchLessons, fetchLesson, fetchTeacherNotes, generatePresentation } = useLessonStore();
const historyOwnerId = ref("");

const isGenerating = ref(false);
const isPresenting = ref(false);
const slides = ref([]);
const slideIndex = ref(0);
const presentationHistory = ref([]);
const isReviewing = ref(false);
const isPilot = ref(false);
const syncChannel = ref(null);
const router = useRouter();
const originatingLessonId = ref(null);
const selectedPresentation = ref(null);
const presentationSource = ref("lesson");
const selectedLessonId = ref("");

const slideLayoutType = computed(() => {
  if (!slides.value || slides.value.length === 0) return 0;
  // Use a mix of slide index and total slides to vary layouts
  // Ensure title/agenda/summary always have their own logic
  const currentSlide = slides.value[slideIndex.value];
  if (['title', 'summary', 'agenda'].includes(currentSlide?.type)) return 0;
  
  return (slideIndex.value + (slides.value[0]?.title?.length || 0)) % 4;
});

const slideTypeTranslations = {
  title: "Tytuł",
  agenda: "Rozkład lekcji",
  concept: "Sekcja tematyczna",
  example: "Przykład",
  comparison: "Zestawienie",
  practice: "Ćwiczenie",
  summary: "Podsumowanie",
  next_steps: "Zadania domowe"
};

function renderMath(text) {
  if (!text) return "";
  let str = String(text);
  
  // Clean double backslashes
  str = str.replace(/\\\\/g, "\\");

  if (!katex) return str;

  // Detect formulas in $...$
  return str.replace(/\$(.*?)\$/g, (match, mathExp) => {
    try {
      return katex.renderToString(mathExp, {
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

const availableStyles = [
  {
    id: "auto",
    name: "Automatyczny",
    description: "Dopasowany do tematu",
    preview: {
      wrapper: "bg-[#f3f4f6]",
      accent: "bg-[#0c3dfe]/10",
      title: "bg-[#102a63]",
      text: "bg-gray-400"
    }
  },
  {
    id: "academic",
    name: "Akademicki",
    description: "Formalny i poważny",
    preview: {
      wrapper: "bg-slate-200",
      accent: "bg-slate-300 border-l-2 border-slate-800",
      title: "bg-slate-900",
      text: "bg-slate-500"
    }
  },
  {
    id: "creative",
    name: "Kreatywny",
    description: "Dynamiczny i barwny",
    preview: {
      wrapper: "bg-rose-50",
      accent: "bg-rose-100 rounded-lg",
      title: "bg-rose-800",
      text: "bg-rose-400"
    }
  },
  {
    id: "minimalist",
    name: "Przyciemniony",
    description: "Czysty i łatwy dla oczu",
    preview: {
      wrapper: "bg-[oklch(0.18_0.026_265)]",
      accent: "bg-[oklch(0.26_0.024_265)]",
      title: "bg-[oklch(0.93_0.02_95)]",
      text: "bg-[oklch(0.72_0.018_95)]"
    }
  },
  {
    id: "fun",
    name: "Dla dzieci",
    description: "Zabawny i przyjazny",
    preview: {
      wrapper: "bg-yellow-50",
      accent: "bg-yellow-100 rounded-xl border-2 border-yellow-200",
      title: "bg-yellow-800",
      text: "bg-yellow-600"
    }
  },
  {
    id: "modern",
    name: "Nowoczesny",
    description: "Czysty i profesjonalny",
    preview: {
      wrapper: "bg-white",
      accent: "bg-blue-600/5",
      title: "bg-blue-900",
      text: "bg-slate-600"
    }
  },
  {
    id: "nature",
    name: "Ekologia",
    description: "Zielony i organiczny",
    preview: {
      wrapper: "bg-emerald-50",
      accent: "bg-emerald-600/10 rounded-full",
      title: "bg-emerald-900",
      text: "bg-emerald-800"
    }
  },
  {
    id: "contrast",
    name: "Kontrast",
    description: "Mocny i czytelny",
    preview: {
      wrapper: "bg-black",
      accent: "bg-yellow-400/20 border border-yellow-400",
      title: "bg-yellow-400",
      text: "bg-yellow-200"
    }
  },
  {
    id: "vintage",
    name: "Klasyczny",
    description: "Elegancki i ponadczasowy",
    preview: {
      wrapper: "bg-[#f4f1ea]",
      accent: "bg-[#e5e0d4] border-y border-[#d1cbb8]",
      title: "bg-[#2c2c2c]",
      text: "bg-[#4a4a4a]"
    }
  }
];

const presentationScope = ref("pending");
const selectedNoteId = ref("");
const generationMessage = ref("");
const presentationStyle = ref("auto");
const maxSlidesSelection = ref("auto");
const autoPlayMinutes = ref("manual");
const presentationTheme = ref({
  wrapperClass: "bg-[#f3f4f6]",
  panelClass: "bg-white border-none shadow-none rounded-none",
  titleClass: "text-[#102a63]",
  textClass: "text-[#454652]",
  accentClass: "bg-[#f0f1f4]"
});

const current = computed(() => slides.value[slideIndex.value] || { type: "concept", title: "", subtitle: "", details: [], summary: "" });
const availableLessons = computed(() => {
  let lessons = Array.isArray(state.lessons) ? state.lessons : [];
  if (state.selectedClass) {
    lessons = lessons.filter(l => l.class_name === state.selectedClassName);
  }
  return lessons;
});
const hasLessons = computed(() => availableLessons.value.length > 0);
const availableNotes = computed(() => {
  let notes = Array.isArray(state.notes) ? state.notes : [];
  if (state.selectedClass) {
    notes = notes.filter(n => n.class_name === state.selectedClassName);
  }
  return notes;
});
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
  if (maxSlidesSelection.value === "auto") return "Decyduje AI";
  if (presentationSource.value === "note") return maxSlidesSelection.value;
  return effectivePresentationScope.value === "full" ? maxSlidesSelection.value : Math.min(preparedSlides.value.length, maxSlidesSelection.value) || maxSlidesSelection.value;
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
  // Setup BroadcastChannel for cross-window slide sync
  if (typeof window !== 'undefined' && window.BroadcastChannel) {
    syncChannel.value = new BroadcastChannel('coteach_presentation_sync');
    syncChannel.value.onmessage = (event) => {
      if (event.data?.type === 'SYNC_INDEX') {
        if (slideIndex.value !== event.data.index) {
          slideIndex.value = event.data.index;
        }
      } else if (event.data?.type === 'CLOSE_WINDOW') {
        window.close();
      } else if (event.data?.type === 'REQUEST_INITIAL_SYNC' && isPresenting.value) {
        syncChannel.value.postMessage({ type: 'SYNC_INDEX', index: slideIndex.value });
      }
    };
    
    // Request sync in case another window is already presenting
    syncChannel.value.postMessage({ type: 'REQUEST_INITIAL_SYNC' });
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();
  historyOwnerId.value = String(session?.user?.id || "");

  await Promise.all([fetchLessons(), fetchTeacherNotes()]);

  const routeLessonId = String(route.params.lessonId || "").trim();

  // Only pre-select a lesson if a lessonId is provided in the route.
  // Otherwise, selectedLessonId should remain empty by default,
  // requiring explicit selection by the user.
  if (routeLessonId) {
    let initialLesson = (Array.isArray(state.lessons) ? state.lessons : []).find((lesson) => lesson.id === routeLessonId) || null;
    if (!initialLesson && state.lesson?.id === routeLessonId) {
      initialLesson = state.lesson; // Use the currently active lesson if it matches route
    }
    if (!initialLesson) {
      // If not found in current list or state, try to fetch it
      await fetchLesson(routeLessonId);
      initialLesson = state.lesson; // state.lesson will be updated by fetchLesson
    }
    selectedLessonId.value = initialLesson?.id || "";
    state.lesson = initialLesson; // Ensure state.lesson is set for consistency
  } else {
    selectedLessonId.value = ""; // No lesson pre-selected if not in route
    state.lesson = null; // Clear state.lesson if no route lessonId
  }

  if (availableNotes.value.length > 0) {
    selectedNoteId.value = availableNotes.value[0].id;
  }
  loadPresentationHistory();
  tryOpenRequestedPresentation();

  // Handle automatic generation and presentation requests (e.g. from Dashboard)
  if (route.query.generate === "1") {
    if (route.query.scope) {
      presentationScope.value = route.query.scope;
    }
    if (route.query.autoPlayMinutes) {
      autoPlayMinutes.value = route.query.autoPlayMinutes;
    }
    
    await nextTick();
    if (canGenerate.value) {
      await startGeneratedPresentation();
    }
  }
});

watch(
  () => route.params.lessonId,
  async (rawId) => {
    const id = String(rawId || "").trim();
    if (!id) return;
    const lessons = Array.isArray(state.lessons) ? state.lessons : [];
    if (!lessons.some((lesson) => lesson.id === id) && state.lesson?.id !== id) {
      await fetchLesson(id);
    }
    const found = (Array.isArray(state.lessons) ? state.lessons : []).find((lesson) => lesson.id === id) || null;
    if (found?.id === id) {
      selectedLessonId.value = id;
      presentationSource.value = "lesson";
      state.lesson = found;
    } else if (state.lesson?.id === id) {
      selectedLessonId.value = id;
      presentationSource.value = "lesson";
    }
  }
);

watch(selectedLesson, (lesson) => {
  state.lesson = lesson || null;
});

watch(slideIndex, () => {
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

// Watch slideIndex to notify other windows
watch(slideIndex, (newVal) => {
  if (syncChannel.value) {
    syncChannel.value.postMessage({ type: 'SYNC_INDEX', index: newVal });
  }
});

const activeDurationMinutes = ref("manual");
const isAutoPlaying = ref(false);
const totalSeconds = ref(0);
const remainingSeconds = ref(0);
const slideIntervalSeconds = ref(0);
const currentSlideTimer = ref(0);

let timerId = null;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startAutoplay(resume = false) {
  stopAutoplay();
  
  if (activeDurationMinutes.value === "manual" || !slides.value.length) return;
  
  if (!resume) {
    const T = parseInt(activeDurationMinutes.value) * 60;
    totalSeconds.value = T;
    remainingSeconds.value = T;
    
    // Calculate interval per slide: total seconds / number of slides
    const interval = Math.max(2, Math.ceil(T / slides.value.length));
    slideIntervalSeconds.value = interval;
    currentSlideTimer.value = interval;
  }
  
  isAutoPlaying.value = true;
  
  timerId = setInterval(() => {
    if (!isAutoPlaying.value) return;
    
    // Decrement total remaining time if any left
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--;
    }
    
    // Decrement current slide countdown
    if (currentSlideTimer.value > 1) {
      currentSlideTimer.value--;
    } else {
      // Time for next slide transition
      if (slideIndex.value < slides.value.length - 1) {
        slideIndex.value++;
      } else {
        // We are on the last slide!
        if (remainingSeconds.value > 0) {
          // If there is still time left, loop back to the first slide!
          slideIndex.value = 0;
        } else {
          // No time left, and we reached the end of the presentation, stop autoplay!
          stopAutoplay();
          return;
        }
      }
      currentSlideTimer.value = slideIntervalSeconds.value;
    }
  }, 1000);
}

function stopAutoplay() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  isAutoPlaying.value = false;
}

function toggleAutoPlay() {
  if (isAutoPlaying.value) {
    stopAutoplay();
  } else {
    if (remainingSeconds.value <= 0) {
      startAutoplay(false);
    } else {
      startAutoplay(true);
    }
  }
}

// Watch slideIndex: if manually changed, reset the slide switch timer
watch(slideIndex, () => {
  if (isAutoPlaying.value) {
    currentSlideTimer.value = slideIntervalSeconds.value;
  }
});

// Watch isPresenting to trigger autoplay automatically when presenting starts
watch(isPresenting, (presenting) => {
  if (presenting) {
    startAutoplay();
  } else {
    stopAutoplay();
  }
});

onUnmounted(() => {
  stopAutoplay();
});
function loadPresentationHistory() {
  const { list } = loadPresentationHistoryRaw(historyOwnerId.value);
  presentationHistory.value = list;
  selectedPresentation.value = presentationHistory.value[0] || null;
}

function persistPresentationHistory() {
  savePresentationHistoryRaw(historyOwnerId.value, presentationHistory.value);
}

function buildPresentationTitle() {
  const subject =
    (presentationSource.value === "note"
      ? selectedNote.value?.subject || selectedNote.value?.title
      : selectedLesson.value?.subject || selectedLesson.value?.title) || "Prezentacja";
  const scopeLabel = effectivePresentationScope.value === "full" ? "całość" : "nieomówione punkty";
  return `${subject} - ${scopeLabel}`;
}

function savePresentationSnapshot(currentSlides) {
  const createdAt = new Date().toISOString();
  const item = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: buildPresentationTitle(),
    createdAt,
    createdAtLabel: new Date(createdAt).toLocaleString("pl-PL"),
    slideCount: currentSlides.length,
    slides: currentSlides, // Store slides directly
    originatingLessonId: (presentationSource.value === "lesson" && selectedLesson.value?.id) ? selectedLesson.value.id : null,
    style: presentationStyle.value,
    ownerId: String(historyOwnerId.value || "").trim() || undefined,
    class_name: state.selectedClassName || null
  };
  presentationHistory.value.unshift(item);
  persistPresentationHistory();
  return item;
}

function startPresentation(currentSlides, skipReview = false, style = "auto", durationMinutes = "manual") {
  slides.value = currentSlides;
  slideIndex.value = 0;
  presentationTheme.value = resolvePresentationTheme(
    buildPresentationTitle(),
    currentSlides,
    style,
  );
  activeDurationMinutes.value = durationMinutes;
  isReviewing.value = !skipReview;
  isPresenting.value = skipReview;
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
      noteId: presentationSource.value === "note" ? selectedNote.value?.id || "" : "",
      classLevel: selectedClassLevel.value || "",
      style: presentationStyle.value,
      scope: effectivePresentationScope.value,
      maxSlides: typeof plannedSlideCount.value === 'number' ? plannedSlideCount.value : maxSlidesSelection.value,
      class_name: state.selectedClassName || null
    });
    const generatedSlides = (generated?.slides || [])
      .map((slide) => ({
        id: slide.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: String(slide.type || "concept").trim().toLowerCase(),
        title: String(slide.title || "").trim(),
        subtitle: String(slide.subtitle || "").trim(),
        summary: String(slide.summary || "").trim(),
        details: Array.isArray(slide.details) ? slide.details.map((item) => String(item || "").trim()).filter(Boolean) : [],
        imageUrl: slide.imageUrl || ""
      }))
      .filter((slide) => slide.title || slide.summary || slide.details.length);

    if (!generatedSlides.length) {
      generationMessage.value = "Nie udało się wygenerować slajdów dla wybranych danych.";
      return;
    }

    const savedItem = savePresentationSnapshot(generatedSlides);
    selectedPresentation.value = savedItem;
    generationMessage.value = `Wygenerowano prezentację (${savedItem.slideCount} slajdów).`;
    startPresentation(generatedSlides, route.query.generate === "1", presentationStyle.value, autoPlayMinutes.value);
    originatingLessonId.value = (presentationSource.value === "lesson" && selectedLesson.value?.id) ? selectedLesson.value.id : null;
  } catch (error) {
    generationMessage.value = error?.message
      ? `Nie udało się wygenerować prezentacji: ${error.message}`
      : "Nie udało się wygenerować prezentacji.";
  } finally {
    isGenerating.value = false;
  }
}

function openSavedPresentation(item) {
  const storedSlides = Array.isArray(item?.slides) ? item.slides : [];
  if (!storedSlides.length) return;
  startPresentation(storedSlides, false, item?.style || "auto");
}

function tryOpenRequestedPresentation() {
  const requestedId = String(localStorage.getItem(ARCHIVE_OPEN_PRESENTATION_KEY) || "").trim();
  if (!requestedId) return;
  localStorage.removeItem(ARCHIVE_OPEN_PRESENTATION_KEY);
  
  const shouldSkipReview = localStorage.getItem(SKIP_REVIEW_KEY) === 'true';
  localStorage.removeItem(SKIP_REVIEW_KEY);

  const autoplayMinutes = localStorage.getItem("coteach:open-presentation-autoplay") || "manual";
  localStorage.removeItem("coteach:open-presentation-autoplay");

  const requested = presentationHistory.value.find((item) => String(item.id) === requestedId);
  if (!requested) return;
  
  selectedPresentation.value = requested;
  originatingLessonId.value = requested.originatingLessonId || null; // Set originatingLessonId from history
  const storedSlides = Array.isArray(requested?.slides) ? requested.slides : [];
  if (!storedSlides.length) return;

  slides.value = storedSlides;
  slideIndex.value = 0;
  presentationTheme.value = resolvePresentationTheme(requested.title, storedSlides, requested.style || "auto");
  
  activeDurationMinutes.value = autoplayMinutes;

  if (shouldSkipReview) {
    isPresenting.value = true;
    isReviewing.value = false;
  } else {
    isReviewing.value = true;
    isPresenting.value = false;
  }
}

function exitPresentation() {
  if (isPilot.value && syncChannel.value) {
    syncChannel.value.postMessage({ type: 'CLOSE_WINDOW' });
  }
  
  // Clean, intuitive navigation: go back to where the user came from (e.g. Dashboard, Archive, Notes, or Live Lesson)
  if (window.history.length > 1 && window.history.state && window.history.state.back) {
    router.back();
  } else {
    router.push({ path: '/dashboard' });
  }

  // Reset local state after navigation is initiated
  isPresenting.value = false;
  isReviewing.value = false;
  isPilot.value = false;
}

function openPresentationWindow() {
  const presentationId = selectedPresentation.value?.id;
  if (!presentationId) return;
  
  // Save to localStorage so new window knows which presentation to load
  localStorage.setItem(ARCHIVE_OPEN_PRESENTATION_KEY, presentationId);
  localStorage.setItem(SKIP_REVIEW_KEY, 'true');
  
  // Open in new window and turn current window into a pilot
  // Dodanie wymiarów (width/height) wymusza na większości przeglądarek otwarcie nowego okna zamiast karty.
  // Menubar=no, toolbar=no dodatkowo sprawiają, że okno wygląda bardziej jak czysty odtwarzacz prezentacji.
  const windowFeatures = `width=${window.screen.availWidth * 0.8},height=${window.screen.availHeight * 0.8},menubar=no,toolbar=no,location=no,status=no,noopener,noreferrer`;
  window.open(window.location.href, "_blank", windowFeatures);
  isPilot.value = true;
}

function resolvePresentationTheme(title, slides, style = "auto") {
  const text = `${title || ""} ${Array.isArray(slides) ? slides.map((s) => `${s.title || ""} ${s.summary || ""}`).join(" ") : ""}`.toLowerCase();
  
  const basePanel = "bg-white border-none shadow-none rounded-none";
  const defaultTheme = {
    wrapperClass: "bg-[#f3f4f6]",
    panelClass: basePanel,
    titleClass: "text-[#102a63]",
    textClass: "text-[#454652]",
    accentClass: "bg-[#f0f1f4]"
  };

  // If specific style is selected, use it
  if (style === "academic") {
    return {
      wrapperClass: "bg-[#e2e8f0]",
      panelClass: basePanel,
      titleClass: "text-[#0f172a] font-serif",
      textClass: "text-[#334155]",
      accentClass: "bg-slate-100 border-l-4 border-slate-800"
    };
  }
  if (style === "creative") {
    return {
      wrapperClass: "bg-[#fff1f2]",
      panelClass: basePanel,
      titleClass: "text-[#9f1239] font-black tracking-tight",
      textClass: "text-[#4c0519] font-sans font-medium",
      accentClass: "bg-rose-50 rounded-3xl"
    };
  }
  if (style === "minimalist") {
    return {
      wrapperClass: "bg-[oklch(0.18_0.026_265)]",
      panelClass: "bg-[oklch(0.22_0.028_265)] border-none shadow-none rounded-none",
      titleClass: "text-[oklch(0.93_0.02_95)] tracking-tighter",
      textClass: "text-[oklch(0.72_0.018_95)]",
      accentClass: "bg-[oklch(0.26_0.024_265)]"
    };
  }
  if (style === "fun") {
    return {
      wrapperClass: "bg-[#fef9c3]",
      panelClass: basePanel,
      titleClass: "text-[#854d0e] font-['Comic_Sans_MS',_cursive]",
      textClass: "text-[#713f12]",
      accentClass: "bg-yellow-50 rounded-[40px] border-4 border-yellow-200"
    };
  }
  if (style === "modern") {
    return {
      wrapperClass: "bg-white",
      panelClass: basePanel,
      titleClass: "text-[#1e3a8a] font-['Inter',_sans-serif] tracking-tight",
      textClass: "text-[#334155]",
      accentClass: "bg-blue-50/50 border-r-8 border-blue-600"
    };
  }
  if (style === "nature") {
    return {
      wrapperClass: "bg-[#f0fdf4]",
      panelClass: basePanel,
      titleClass: "text-[#064e3b] font-medium",
      textClass: "text-[#065f46]",
      accentClass: "bg-emerald-100/50 rounded-[60px]"
    };
  }
  if (style === "contrast") {
    return {
      wrapperClass: "bg-black",
      panelClass: "bg-black border-2 border-yellow-400/20",
      titleClass: "text-yellow-400 font-black uppercase",
      textClass: "text-yellow-100",
      accentClass: "bg-yellow-400/10 border-l-4 border-yellow-400"
    };
  }
  if (style === "vintage") {
    return {
      wrapperClass: "bg-[#f4f1ea]",
      panelClass: "bg-[#fdfcf9] shadow-inner",
      titleClass: "text-[#2c2c2c] font-serif font-extrabold tracking-wide",
      textClass: "text-[#4a4a4a] font-sans font-medium",
      accentClass: "bg-[#e5e0d4] border-y-2 border-[#d1cbb8]"
    };
  }

  // Auto/Default theme resolution
  if (/(fotosyntez|biolog|natura|ro[sl]in|ekologi|las|chlorofil|ziemi|zwierz)/.test(text)) {
    return {
      ...defaultTheme,
      accentClass: "bg-[#eff6ff]",
      titleClass: "text-[#1e3a8a]",
    };
  }
  if (/(histori|wojn|pa[nń]stw|kr[oó]l|staro|średniowie|wiek|wojsk)/.test(text)) {
    return {
      ...defaultTheme,
      accentClass: "bg-[#fff1f2]",
      titleClass: "text-[#881337]",
    };
  }
  if (/(matemat|fizy|chem|technicz|algorytm|program|kod|licz|równan)/.test(text)) {
    return {
      ...defaultTheme,
      accentClass: "bg-[#eef2ff]",
      titleClass: "text-[#1e1b4b]",
    };
  }
  return defaultTheme;
}
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css');

/* Custom beautiful scrollbar for slides */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 9999px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

/* For dark wrappers, make scrollbar white-translucent */
:deep(.bg-\[\#05070f\]) .overflow-y-auto,
:deep(.bg-\[oklch\(0\.18_0\.026_265\)\]) .overflow-y-auto,
:deep(.bg-black) .overflow-y-auto {
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent !important;
}
:deep(.bg-\[\#05070f\]) .overflow-y-auto::-webkit-scrollbar-thumb,
:deep(.bg-\[oklch\(0\.18_0\.026_265\)\]) .overflow-y-auto::-webkit-scrollbar-thumb,
:deep(.bg-black) .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

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
