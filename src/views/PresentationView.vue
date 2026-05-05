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
            <!-- Title Slide Layout -->
            <template v-if="current.type === 'title'">
              <div class="flex h-full flex-col lg:flex-row">
                <div :class="['w-full lg:w-[55%] flex flex-col justify-center p-12 lg:p-20', activeTheme.accentClass]">
                  <h1 :class="['text-[clamp(2.5rem,7vh,5rem)] font-black leading-[1.1] mb-8', activeTheme.titleClass]">{{ current.title }}</h1>
                  <p v-if="current.subtitle" :class="['text-[clamp(1.2rem,3vh,2rem)] font-bold opacity-80', activeTheme.textClass]">{{ current.subtitle }}</p>
                  <p v-if="current.summary" :class="['mt-10 text-[clamp(1.1rem,2.5vh,1.5rem)] font-medium leading-relaxed opacity-70', activeTheme.textClass]">{{ current.summary }}</p>
                </div>
                <div :class="['flex-1 flex items-center justify-center p-12', activeTheme.panelClass]">
                  <div class="w-full h-full max-h-[500px] bg-gray-100 rounded-sm overflow-hidden flex items-center justify-center border border-black/5">
                    <img v-if="current.imageUrl" :src="current.imageUrl" class="w-full h-full object-cover" />
                    <div v-else class="flex flex-col items-center opacity-20">
                      <svg class="w-24 h-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <span class="font-bold uppercase tracking-widest text-sm">Ilustracja</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Summary/Agenda Slide Layout -->
            <template v-else-if="current.type === 'summary' || current.type === 'agenda'">
              <div class="flex h-full flex-col">
                <div :class="['flex-1 p-12 lg:p-20 flex flex-col justify-center text-center', activeTheme.panelClass]">
                  <h2 :class="['text-[clamp(2.5rem,6vh,4.5rem)] font-black mb-8', activeTheme.titleClass]">{{ current.title || 'Podsumowanie' }}</h2>
                  <p :class="['mx-auto max-w-4xl text-[clamp(1.2rem,3vh,1.8rem)] font-medium leading-relaxed', activeTheme.textClass]">{{ current.summary }}</p>
                </div>
                <div :class="['h-[35%] w-full flex items-center justify-center p-10', activeTheme.accentClass]">
                  <div :class="['w-full max-w-2xl h-full rounded-sm overflow-hidden border border-black/5 flex items-center justify-center', activeTheme.panelClass]">
                    <img v-if="current.imageUrl" :src="current.imageUrl" class="w-full h-full object-cover" />
                    <div v-else class="flex items-center gap-4 opacity-10">
                      <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <span class="font-bold uppercase tracking-widest text-xs">Materiał poglądowy</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <!-- Practice/General Slide with Split Layout -->
              <div v-if="slideIndex % 2 === 0" class="flex h-full flex-col lg:flex-row">
                <div :class="['w-full lg:w-[45%] flex flex-col justify-center p-12 lg:p-16', activeTheme.accentClass]">
                  <p v-if="current.type === 'practice'" class="mb-4 text-sm font-bold text-blue-600 uppercase tracking-widest">Ćwiczenie praktyczne</p>
                  <h2 :class="['text-[clamp(2rem,5vh,3.5rem)] font-extrabold leading-tight mb-6', activeTheme.titleClass]">{{ current.title }}</h2>
                  <p v-if="current.subtitle" :class="['text-[clamp(1.1rem,2.2vh,1.4rem)] font-bold opacity-70 mb-4', activeTheme.textClass]">{{ current.subtitle }}</p>
                  <p :class="['text-[clamp(1.1rem,2.5vh,1.5rem)] font-medium leading-relaxed opacity-80', activeTheme.textClass]">{{ currentMainText }}</p>
                </div>
                <div :class="['flex-1 flex items-center justify-center p-12', activeTheme.panelClass]">
                   <div class="w-full h-full bg-gray-50 rounded-sm overflow-hidden flex items-center justify-center border border-black/5 relative group">
                    <img v-if="current.imageUrl" :src="current.imageUrl" class="w-full h-full object-cover" />
                    <div v-else class="flex flex-col items-center opacity-10">
                      <svg class="w-20 h-20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Top-Down Split Layout -->
              <div v-else class="flex h-full flex-col">
                <div :class="['flex-1 p-12 lg:p-16 flex flex-col justify-center text-center', activeTheme.panelClass]">
                   <h2 :class="['text-[clamp(2.2rem,5.5vh,4rem)] font-extrabold leading-tight mb-6', activeTheme.titleClass]">{{ current.title }}</h2>
                   <p v-if="current.subtitle" :class="['mx-auto max-w-3xl text-[clamp(1.2rem,2.8vh,1.6rem)] font-bold opacity-60 mb-6', activeTheme.textClass]">{{ current.subtitle }}</p>
                   <p :class="['mx-auto max-w-5xl text-[clamp(1.1rem,2.5vh,1.5rem)] font-medium leading-relaxed opacity-90', activeTheme.textClass]">{{ currentMainText }}</p>
                </div>
                <div :class="['h-[40%] w-full flex items-center justify-center p-12', activeTheme.accentClass]">
                  <div :class="['w-full max-w-3xl h-full rounded-sm overflow-hidden border border-black/5 flex items-center justify-center shadow-sm', activeTheme.panelClass]">
                    <img v-if="current.imageUrl" :src="current.imageUrl" class="w-full h-full object-cover" />
                    <div v-else class="opacity-5">
                      <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
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

          <div class="content-stretch flex flex-col gap-[12px] items-start justify-center relative self-start shrink-0 w-full md:col-span-2 mt-4">
            <label class="font-['Plus_Jakarta_Sans'] font-bold text-foreground text-[16px] leading-[20px] mb-2">Wybierz styl wizualny</label>
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
import { computed, onMounted, ref, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import { supabase } from "../supabase";
import { loadPresentationHistoryRaw, savePresentationHistoryRaw } from "../lib/presentationHistoryStorage";
import archiveIcon from "../assets/archive.svg";
import liveLessonIcon from "../assets/livelesson.svg";

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
const selectedPresentation = ref(null);
const presentationSource = ref("lesson");
const selectedLessonId = ref("");

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
    name: "Minimalistyczny",
    description: "Czysty i konkretny, przyciemniony",
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
  }
];

const presentationScope = ref("pending");
const selectedNoteId = ref("");
const generationMessage = ref("");
const presentationStyle = ref("auto");
const presentationTheme = ref({
  wrapperClass: "bg-[#f3f4f6]",
  panelClass: "bg-white border-none shadow-none rounded-none",
  titleClass: "text-[#102a63]",
  textClass: "text-[#454652]",
  accentClass: "bg-[#f0f1f4]"
});

const current = computed(() => slides.value[slideIndex.value] || { type: "concept", title: "", subtitle: "", details: [], summary: "" });
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
  if (routeLessonId) {
    const inList = (Array.isArray(state.lessons) ? state.lessons : []).some((lesson) => lesson.id === routeLessonId);
    if (!inList && state.lesson?.id !== routeLessonId) {
      await fetchLesson(routeLessonId);
    }
  }

  const lessons = Array.isArray(state.lessons) ? state.lessons : [];
  let initialLesson = null;
  if (routeLessonId) {
    initialLesson = lessons.find((lesson) => lesson.id === routeLessonId) || null;
    if (!initialLesson && state.lesson?.id === routeLessonId) {
      initialLesson = state.lesson;
    }
  }
  if (!initialLesson) {
    initialLesson = state.lesson?.id ? lessons.find((lesson) => lesson.id === state.lesson.id) : null;
  }
  if (!initialLesson) {
    initialLesson = lessons[0] || null;
  }

  selectedLessonId.value = initialLesson?.id || "";
  if (availableNotes.value.length > 0) {
    selectedNoteId.value = availableNotes.value[0].id;
  }
  state.lesson = initialLesson;
  loadPresentationHistory();
  tryOpenRequestedPresentation();

  // Handle automatic generation and presentation requests (e.g. from Dashboard)
  if (route.query.generate === "1") {
    if (route.query.scope) {
      presentationScope.value = route.query.scope;
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
    slides: currentSlides,
    style: presentationStyle.value,
    ownerId: String(historyOwnerId.value || "").trim() || undefined
  };
  presentationHistory.value.unshift(item);
  persistPresentationHistory();
  return item;
}

function startPresentation(currentSlides, skipReview = false, style = "auto") {
  slides.value = currentSlides;
  slideIndex.value = 0;
  presentationTheme.value = resolvePresentationTheme(
    buildPresentationTitle(),
    currentSlides,
    style
  );
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
      maxSlides: 5,
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
    startPresentation(generatedSlides, route.query.generate === "1", presentationStyle.value);
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

  const requested = presentationHistory.value.find((item) => String(item.id) === requestedId);
  if (!requested) return;
  
  selectedPresentation.value = requested;
  const storedSlides = Array.isArray(requested?.slides) ? requested.slides : [];
  if (!storedSlides.length) return;

  slides.value = storedSlides;
  slideIndex.value = 0;
  presentationTheme.value = resolvePresentationTheme(requested.title, storedSlides, requested.style || "auto");
  
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
  isPresenting.value = false;
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
      titleClass: "text-[#9f1239] italic",
      textClass: "text-[#4c0519]",
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
