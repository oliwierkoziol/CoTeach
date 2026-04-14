<template>
      </div>
      <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
        Lekcja: {{ state.lesson?.title || 'Brak tytuĹ‚u' }}
      </h1>
      <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-[28px]">
        Dodaj materiaĹ‚y przy uĹĽyciu tekstu lub zdjÄ™cia. MateriaĹ‚y te bÄ™dÄ… wykorzystane podczas prowadzenia lekcji na ĹĽywo.
      </p>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-12 gap-8 mb-7">
      <!-- Plan lekcji -->
      <div class="col-span-12 xl:col-span-4 bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 flex flex-col h-[497px]">
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
            <div class="flex items-center justify-between gap-2">
              <div class="font-semibold text-foreground">{{ isRecording ? "Nagrywanie aktywne" : "Oczekiwanie..." }}</div>
              <div class="text-sm text-muted-foreground">{{ elapsedLabel }} / {{ durationLabel }} | {{ costLabel }}</div>
            </div>
          </div>

          <div class="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 class="text-lg font-semibold text-foreground">Napisy na ĹĽywo</h2>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="rounded-xl border border-border bg-muted/30 p-3">
                <div class="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Napisy live (w trakcie)</div>
                <p class="min-h-[48px] text-sm text-foreground">{{ interimCaption || "..." }}</p>
              </div>
              <div class="rounded-xl border border-border bg-muted/30 p-3">
                <div class="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Ostatnia peĹ‚na wypowiedĹş</div>
                <p class="min-h-[48px] text-sm text-foreground">{{ lastFinalCaption || "..." }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-3 rounded-2xl border border-border bg-card p-6">
            <h2 class="text-lg font-semibold text-foreground">Plan lekcji</h2>
            <div
              v-for="(point, index) in points"
              :key="point.id"
              class="rounded-xl border-2 p-4"
              :class="point.status === 'discussed' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-border bg-card'"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="font-medium text-foreground">{{ index + 1 }}. {{ point.title }}</div>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <span v-for="k in point.keywords" :key="k" class="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{{ k }}</span>
                  </div>
  <div class="bg-[#f7f9fc] dark:bg-background min-h-[calc(100vh-64px)] w-full overflow-x-hidden relative">
    <!-- Background Decor -->
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0" />
    
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 pt-4 sm:pt-6 md:pt-8 w-full max-w-[1664px] relative z-10">
    <!-- Header -->
    <div class="mb-7 max-w-[1024px]">
      <div class="flex items-center gap-2 mb-2">
        <div class="size-2 rounded-full bg-[#9e3f4e]" :class="{ 'animate-pulse': isRecording }" />
        <p class="font-['Plus_Jakarta_Sans'] font-bold text-[#9e3f4e] text-[10.5px] tracking-[0.525px] uppercase">
          W TRAKCIE
        </p>
      </div>
      <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] dark:text-foreground text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
        Lekcja: {{ state.lesson?.title || 'Brak tytuĹ‚u' }}
      </h1>
      <p class="font-['Plus_Jakarta_Sans'] text-[#454652] dark:text-muted-foreground text-[18px] leading-[28px]">
        Dodaj materiaĹ‚y przy uĹĽyciu tekstu lub zdjÄ™cia. MateriaĹ‚y te bÄ™dÄ… wykorzystane podczas prowadzenia lekcji na ĹĽywo.
      </p>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-12 gap-4 sm:gap-6 md:gap-8 mb-7">
      <!-- Plan lekcji -->
      <div class="col-span-12 xl:col-span-4 bg-white dark:bg-[#16213a] border border-transparent dark:border-[#2b3f63] rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 flex flex-col h-[350px] sm:h-[400px] xl:h-[497px]">
        <h2 class="font-['Manrope'] font-bold text-[#142588] dark:text-sky-200 text-[18px] leading-[28px] mb-2">
          Plan lekcji
        </h2>

        <div class="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin">
          <div
            v-for="(point, index) in points"
            :key="point.id"
            class="rounded-lg py-3 group"
          >
            <div class="flex items-start gap-4">
              <button
                type="button"
                class="size-8 rounded-full flex items-center justify-center shrink-0 transition"
                :class="point.status === 'discussed' || point.manualApproved ? 'bg-[#68a962]' : 'bg-[#e0e3e6] group-hover:bg-[#d0d3d6]'"
                @click="handleSubtopicNumberClick(point)"
                title="Zaznacz caĹ‚y podtemat jako ukoĹ„czony"
              >
                <span 
                  class="font-['Inter'] font-semibold text-[16px]"
                  :class="point.status === 'discussed' || point.manualApproved ? 'text-white' : 'text-[#454652]'"
                >
                  <span v-if="manualUpdateLoadingId === point.id" class="block animate-spin">âźł</span>
                  <span v-else>{{ index + 1 }}</span>
                </span>
              </button>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-2">
                  <p class="font-['Inter'] font-semibold text-[#191c1e] dark:text-slate-100 text-[16px] leading-[24px]">
                    {{ point.title }}
                  </p>
                  <div class="flex gap-1">
                    <button
                      v-if="point.keywords.length > 0"
                      @click="toggleAllKeywords(point, true)"
                      class="text-[11px] px-2 py-1 rounded bg-[#0059bb]/10 text-[#0059bb] dark:bg-sky-500/20 dark:text-sky-100 hover:bg-[#0059bb]/20 dark:hover:bg-sky-500/30 transition font-semibold"
                      title="Zaznacz wszystkie sĹ‚owa kluczowe"
                    >
                      +wszystko
                    </button>
                    <button
                      v-if="point.keywords.length > 0 && hasSelectedKeywords(point.id)"
                      @click="toggleAllKeywords(point, false)"
                      class="text-[11px] px-2 py-1 rounded bg-[#9e3f4e]/10 text-[#9e3f4e] dark:bg-rose-500/20 dark:text-rose-100 hover:bg-[#9e3f4e]/20 dark:hover:bg-rose-500/30 transition font-semibold"
                      title="Odznacz wszystkie sĹ‚owa kluczowe"
                    >
                      -wszystko
                    </button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="(tag, i) in point.keywords"
                    :key="i"
                    @click="toggleKeywordSelection(point, i)"
                    :class="[
                      `px-2 py-0.5 rounded text-[12px] font-['Inter'] font-bold transition cursor-pointer flex items-center gap-1.5`,
                      isKeywordSelected(point.id, i)
                        ? 'bg-[#0059bb] text-white ring-2 ring-[#0059bb]/40 dark:bg-sky-500 dark:text-slate-950 dark:ring-sky-300/40'
                        : 'bg-[#e0e3e6] text-[#454652] hover:ring-2 hover:ring-[#e0e3e6]/40 dark:bg-[#273754] dark:text-slate-100 dark:hover:ring-[#3a5480]/50'
                    ]"
                    title="Kliknij aby zaznaczyÄ‡/odznacz sĹ‚owo kluczowe"
                  >
                    <input
                      type="checkbox"
                      :checked="isKeywordSelected(point.id, i)"
                      @click.stop="toggleKeywordSelection(point, i)"
                      class="w-3 h-3 cursor-pointer"
                    />
                    {{ tag }}
                  </button>
                </div>
                <span v-if="point.status === 'discussed'" class="text-emerald-400">âś“</span>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
                  :class="point.manualApproved ? 'border-amber-600 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-400/50 dark:bg-amber-500/20 dark:text-amber-100 dark:hover:bg-amber-500/30' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 hover:bg-emerald-500/20 dark:text-emerald-100 dark:hover:bg-emerald-500/30'"
                  :disabled="manualUpdateLoadingId === point.id"
                  @click="toggleManualApproval(point)"
                >
                  <span v-if="manualUpdateLoadingId === point.id" class="block animate-spin">âźł</span>
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
                    :class="point.status === 'discussed' || point.manualApproved ? 'bg-[#68a962] text-white' : 'bg-[#e0e3e6] text-[#454652]'"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-[#3b4f73]">
          <div class="flex items-center justify-between">
            <p class="font-['Manrope'] font-bold text-[#142588] dark:text-sky-200 text-[18px] leading-[28px]">
              {{ discussedCount }} z {{ points.length }} punktĂłw omĂłwionych
            </p>
            <p class="font-['Inter'] font-semibold text-[#142588] dark:text-sky-200 text-[16px]">
              {{ progress }}%
            </p>
          </div>
          <div class="bg-[#d8e2ff] dark:bg-[#2c3f62] h-4 rounded-full overflow-hidden">
            <div 
              class="bg-[#0059bb] dark:bg-sky-400 h-full rounded-full shadow-[0px_0px_8px_0px_rgba(0,89,187,0.4)] transition-all duration-300" 
              :style="{ width: `${progress}%` }" 
            />
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
          <h2 class="font-['Manrope'] font-bold text-[#142588] dark:text-sky-300 text-[18px] tracking-[0.9px] leading-[28px]">
            Napisy na ĹĽywo
          </h2>
        </div>

        <div class="bg-[#f2f4f7] dark:bg-card rounded-xl border-l-4 border-[#0059bb] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 h-[300px] sm:h-[350px] xl:h-[445px] overflow-y-auto">
          <p class="font-['Inter'] font-semibold text-[#0059bb] dark:text-sky-300 text-[12px] tracking-[1.2px] uppercase mb-3">
            NAPISY LIVE (W TRAKCIE)
          </p>
          
          <div v-if="lastFinalCaption || interimCaption" class="flex flex-col gap-4">
            <p class="font-['Inter'] italic text-[#454652] dark:text-muted-foreground text-[18px] leading-[29.25px]">
              {{ lastFinalCaption }}
            </p>
            <p class="font-['Inter'] italic text-[#8B8D97] text-[18px] leading-[29.25px]">
              {{ interimCaption }}
            </p>
            <p v-if="isDemoLicense" class="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
              Tryb demo: maksymalny czas lekcji live to {{ demoMaxLiveMinutes }} min.
            </p>
          </div>

      <!-- Microphone Settings -->
      <div class="col-span-12 xl:col-span-3 bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 space-y-6">
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
          <div class="bg-[#e0e3e6] rounded-lg px-4 py-3 flex items-center justify-between relative">
            <select
              v-model="selectedMicId"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              :disabled="isRecording"
            >
              <option value="">DomyĹ›lny mikrofon systemowy</option>
              <option v-for="d in micDevices" :key="d.deviceId" :value="d.deviceId">
                {{ d.label || `Mikrofon ${d.deviceId.slice(0, 6)}` }}
              </option>
            </select>
            <span class="font-['Plus_Jakarta_Sans'] text-[#191c1e] text-[16px] truncate max-w-[85%] pointer-events-none">
              {{ micDevices.find(d => d.deviceId === selectedMicId)?.label || 'DomyĹ›lny - System Mic' }}
            </span>
            <svg class="size-6 pointer-events-none shrink-0" fill="none" viewBox="0 0 24 24">
              <path d="M12 9.6L16.8 14.4L21.6 9.6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <!-- Silnik STT -->
        <div class="space-y-2">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] block">
            Silnik STT
          </label>
          <div class="relative">
            <div class="bg-[#e0e3e6] rounded-lg px-4 py-3 flex items-center justify-between relative">
              <select
                v-model="sttEngine"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                :disabled="isRecording"
              >
                <option value="browser">PrzeglÄ…darka Web Speech</option>
                <option value="whisper">Atheneum AI Whisper v3</option>
              </select>
              <span class="font-['Plus_Jakarta_Sans'] text-[#191c1e] text-[16px] pointer-events-none">
                {{ sttEngine === 'whisper' ? 'Atheneum AI Whisper v3' : 'PrzeglÄ…darka Web Speech' }}
              </span>
              <svg class="size-6 pointer-events-none shrink-0" fill="none" viewBox="0 0 24 24">
                <path d="M7.2 9.6L12 14.4L16.8 9.6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div
            v-if="pendingPoints.length > 0 && elapsedSec > 120"
            class="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground"
          >
            Uwaga! PozostaĹ‚o {{ pendingPoints.length }} nieomĂłwionych punktĂłw.
            <button
              type="button"
              class="mt-2 w-full rounded-xl border border-border bg-card py-2 text-sm font-medium transition hover:bg-muted/50"
              @click="goPresentation"
            >
              Generuj koĹ‚o ratunkowe
            </button>
          <p v-else class="font-['Inter'] italic text-[#454652] dark:text-muted-foreground text-[18px] leading-[29.25px]">
            Czekam na rozpoczÄ™cie wypowiedzi...<br />
            System jest gotowy do przechwytywania<br />
            dĹşwiÄ™ku w czasie rzeczywistym.
          </p>
        </div>
      </div>

      <!-- Microphone Settings -->
      <div class="col-span-12 xl:col-span-3 bg-white dark:bg-card border border-transparent dark:border-border rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 space-y-6">
        <div class="flex items-center gap-3">
          <!-- Mic Icon -->
          <svg class="w-6 h-[22px]" fill="none" stroke="#142588" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] dark:text-foreground text-[18px] leading-[28px]">
            Ustawienia mikrofonu
          </h3>
        </div>

        <!-- Mikrofon -->
        <div class="space-y-2">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] dark:text-muted-foreground text-[14px] block">
            Mikrofon
          </label>
          <div class="bg-[#e0e3e6] dark:bg-input-background border border-transparent dark:border-border rounded-lg px-4 py-3 flex items-center justify-between relative">
            <select
              v-model="selectedMicId"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              :disabled="isRecording"
            >
              <option value="">DomyĹ›lny mikrofon systemowy</option>
              <option v-for="d in micDevices" :key="d.deviceId" :value="d.deviceId">
                {{ d.label || `Mikrofon ${d.deviceId.slice(0, 6)}` }}
              </option>
            </select>
            <span class="font-['Plus_Jakarta_Sans'] text-[#191c1e] dark:text-foreground text-[16px] truncate max-w-[85%] pointer-events-none">
              {{ micDevices.find(d => d.deviceId === selectedMicId)?.label || 'DomyĹ›lny - System Mic' }}
            </span>
            <svg class="size-6 pointer-events-none shrink-0" fill="none" viewBox="0 0 24 24">
              <path d="M12 9.6L16.8 14.4L21.6 9.6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <!-- Silnik STT -->
        <div class="space-y-2">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] dark:text-muted-foreground text-[14px] block">
            Silnik STT
          </label>
          <div class="relative">
            <div class="bg-[#e0e3e6] dark:bg-input-background border border-transparent dark:border-border rounded-lg px-4 py-3 flex items-center justify-between relative">
              <select
                v-model="sttEngine"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                :disabled="isRecording"
              >
                <option value="browser">PrzeglÄ…darka Web Speech</option>
                <option value="whisper">Atheneum AI Whisper v3</option>
              </select>
              <span class="font-['Plus_Jakarta_Sans'] text-[#191c1e] dark:text-foreground text-[16px] pointer-events-none">
                {{ sttEngine === 'whisper' ? 'Atheneum AI Whisper v3' : 'PrzeglÄ…darka Web Speech' }}
              </span>
              <svg class="size-6 pointer-events-none shrink-0" fill="none" viewBox="0 0 24 24">
                <path d="M7.2 9.6L12 14.4L16.8 9.6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Poziom mikrofonu -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-['Inter'] font-semibold text-[#454652] text-[12px]">
              POZIOM MIKROFONU
            </span>
            <span class="font-['Inter'] font-semibold text-[#142588] dark:text-sky-300 text-[12px]">
              +{{ Math.round(micLevel) }}db
            </span>
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
          <div class="bg-[#e0e3e6] h-1 rounded-full overflow-hidden">
            <div class="bg-[#142588] h-full transition-all duration-100" :style="{ width: `${Math.min(100, micLevel)}%` }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="grid grid-cols-12 gap-4 sm:gap-6 md:gap-8">
      <!-- Progress Tracker -->
      <div class="col-span-12 lg:col-span-9 bg-white dark:bg-card border border-transparent dark:border-border rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <!-- Calendar Icon -->
            <svg class="w-[21px] h-[22px]" fill="none" stroke="#0053DB" viewBox="0 0 24 24" stroke-width="2.5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#566166] dark:text-slate-300 text-[14px] tracking-[0.7px] uppercase">
              POSTÄP LEKCJI
            </h3>
          </div>
          <p class="font-['Plus_Jakarta_Sans'] font-bold text-[#0053db] dark:text-sky-300 text-[14px]">
            {{ Math.floor(elapsedSec / 60) }} / {{ activeSessionDurationMinutes }} Minutes
          </p>
        </div>

        <div class="bg-[#d9e4ea] h-8 rounded-2xl overflow-hidden relative">
          <div 
            class="absolute inset-y-0 left-0 bg-[#0053db] rounded-2xl transition-all duration-1000 ease-linear" 
            :style="{ width: `${Math.min(100, Math.floor((elapsedSec / (activeSessionDurationMinutes * 60)) * 100))}%` }" 
          />
          <div class="absolute left-1/4 top-0 bottom-0 w-0.5 bg-white/30" />
          <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30" />
          <div class="absolute left-3/4 top-0 bottom-0 w-0.5 bg-white/50 shadow-[0px_0px_0px_2px_rgba(0,83,219,0.4)]" />
        </div>

        <div class="flex items-center justify-between text-[10px] font-['Plus_Jakarta_Sans'] font-bold tracking-[1px] uppercase">
          <span class="text-[#566166] dark:text-slate-300">POCZÄ„TEK</span>
          <span class="text-[#0053db] dark:text-sky-300">KONIEC</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="col-span-12 lg:col-span-3 space-y-4 flex flex-col justify-end">
        <button 
          class="w-full bg-[#e6e8eb] dark:bg-muted rounded-[24px] py-4 flex items-center justify-center gap-2 hover:bg-[#d8dadd] dark:hover:bg-muted/80 transition-colors"
          @click="goPresentation"
        >
          <!-- Presentation Icon -->
          <svg class="size-5" fill="none" stroke="#142588" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span class="font-['Inter'] font-semibold text-[#142588] dark:text-sky-300 text-[16px]">
            UtwĂłrz prezentacjÄ™
          </span>
        </button>

        <button 
          class="w-full bg-[#7b3400] rounded-[24px] py-4 flex items-center justify-center gap-2 hover:bg-[#6a2d00] transition-colors shadow-[0_4px_12px_rgba(123,52,0,0.2)]"
          @click="finalizeNow"
        >
          <!-- Archive Icon -->
          <svg class="size-5" fill="none" stroke="#FFA26E" stroke-width="2.2" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span class="font-['Inter'] font-semibold text-[#ffa26e] text-[16px]">
            ZakoĹ„cz i archiwizuj
          </span>
        </button>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import { fetchLicenseStatusCached } from "../composables/useLicenseStatus";
import { supabase } from "../supabase";

function normalizeBaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "";
const COVERAGE_REFRESH_MIN_INTERVAL_MS = 90_000;

const lessonDurationOptions = [
  { label: "45 min", minutes: 45 },
  { label: "1h 30 min", minutes: 90 },
  { label: "2h", minutes: 120 },
  { label: "2h 15 min", minutes: 135 },
  { label: "3h", minutes: 180 }
];

const route = useRoute();
const router = useRouter();
const { state, startLive, sendTranscript, refreshCoverage, setManualPointApproval, finalizeLesson, fetchLessons } = useLessonStore();

const isRecording = ref(false);
const recognition = ref(null);
const micDevices = ref([]);
const selectedMicId = ref("");
const micLevel = ref(0);
const micGain = ref(1);
const captionSensitivity = ref(2);
const sttEngine = ref("whisper");
const interimCaption = ref("");
const lastFinalCaption = ref("");
const micTestActive = ref(false);
const sttStatus = ref("idle");
const apiStatus = ref("checking");
const micStream = ref(null);
const audioContext = ref(null);
const analyserNode = ref(null);
const analyserTimer = ref(null);
const mediaRecorder = ref(null);
const startAt = ref(0);
const elapsedSec = ref(0);
const timer = ref(null);
const transcription = ref([]);
const error = ref("");
const info = ref("");
const shouldKeepListening = ref(false);
const manualUpdateLoadingId = ref("");
const selectedLessonDurationMinutes = ref(45);
const activeSessionDurationMinutes = ref(45);
const lastCoverageRefreshMs = ref(0);
const coverageRefreshTimer = ref(null);
const demoMaxLiveMinutes = ref(null);
const selectedKeywords = ref(new Map()); // Store selected keywords: Map<pointId, Set<keywordIndex>>
let apiPingTimer = null;

const points = computed(() => state.lesson?.plan || []);
const discussedCount = computed(() => points.value.filter((p) => p.status === "discussed").length);
const progress = computed(() => (points.value.length ? Math.round((discussedCount.value / points.value.length) * 100) : 0));
const pendingPoints = computed(() => points.value.filter((p) => p.status !== "discussed"));
const isDemoLicense = computed(() => Number.isFinite(Number(demoMaxLiveMinutes.value)) && Number(demoMaxLiveMinutes.value) > 0);
const availableLessonDurationOptions = computed(() => {
  if (!isDemoLicense.value) return lessonDurationOptions;
  const maxMinutes = Number(demoMaxLiveMinutes.value);
  const filtered = lessonDurationOptions.filter((option) => option.minutes <= maxMinutes);
  return filtered.length ? filtered : [{ label: `${maxMinutes} min`, minutes: maxMinutes }];
});
const elapsedLabel = computed(() => `${Math.floor(elapsedSec.value / 60)}:${String(elapsedSec.value % 60).padStart(2, "0")}`);
const durationLabel = computed(() => {
  const minutes = activeSessionDurationMinutes.value || selectedLessonDurationMinutes.value || 45;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder} min`;
});
const costLabel = computed(() =>
  state.costInfo ? `${Number(state.costInfo.total).toFixed(2)} PLN` : "0.00 PLN"
);
const sttStatusLabel = computed(() => {
  if (sttStatus.value === "listening") return "nasĹ‚uchiwanie";
  if (sttStatus.value === "starting") return "uruchamianie";
  if (sttStatus.value === "error") return "bĹ‚Ä…d";
  return "bezczynny";
});
const apiStatusLabel = computed(() => {
  if (apiStatus.value === "online") return "online";
  if (apiStatus.value === "offline") return "offline";
  return "sprawdzanie";
});

onMounted(async () => {
  await loadMicDevices();
  await checkApiHealth();
  await fetchLicenseStatus();
  apiPingTimer = setInterval(checkApiHealth, 10000);
  if (!state.lesson) {
    const lessons = await fetchLessons();
    const target = lessons.find((l) => l.id === route.params.lessonId) || lessons[0];
    if (target) state.lesson = target;
  }
  if (!isRecording.value) {
    startSession();
  }
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
  if (analyserTimer.value) clearInterval(analyserTimer.value);
  if (coverageRefreshTimer.value) clearTimeout(coverageRefreshTimer.value);
  if (apiPingTimer) clearInterval(apiPingTimer);
  stopMicMeter();
  recognition.value?.stop();
});

async function refreshCoverageThrottled(force = false) {
  if (!state.lesson?.id) return;
  const now = Date.now();
  if (!force && now - lastCoverageRefreshMs.value < COVERAGE_REFRESH_MIN_INTERVAL_MS) return;

  lastCoverageRefreshMs.value = now;
  try {
    await refreshCoverage(state.lesson.id);
  } catch (e) {
    info.value = `BĹ‚Ä…d odĹ›wieĹĽania pokrycia: ${e.message || "nieznany"}`;
  }
}

async function fetchLicenseStatus() {
  const demoInfoPrefix = "Tryb demo ogranicza czas lekcji live";
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) {
      demoMaxLiveMinutes.value = null;
      if (String(info.value || "").startsWith(demoInfoPrefix)) {
        info.value = "";
      }
      return;
    }

    const payload = await fetchLicenseStatusCached({ token, apiBase: API_BASE });
    if (!payload) {
      demoMaxLiveMinutes.value = null;
      if (String(info.value || "").startsWith(demoInfoPrefix)) {
        info.value = "";
      }
      return;
    }

    const isDemo = payload?.isDemoLicense === true || payload?.license?.demoMode === true;
    const maxMinutes = Number(payload?.demoLimits?.maxLiveMinutes || 0);
    demoMaxLiveMinutes.value = isDemo && maxMinutes > 0 ? maxMinutes : null;

    if (!isDemo && String(info.value || "").startsWith(demoInfoPrefix)) {
      info.value = "";
    }

    if (isDemo && maxMinutes > 0 && selectedLessonDurationMinutes.value > maxMinutes) {
      selectedLessonDurationMinutes.value = maxMinutes;
      info.value = `Tryb demo ogranicza czas lekcji live do ${maxMinutes} minut.`;
    }
  } catch {
    demoMaxLiveMinutes.value = null;
    if (String(info.value || "").startsWith(demoInfoPrefix)) {
      info.value = "";
    }
  }
}

function scheduleCoverageRefresh() {
  if (!state.lesson?.id) return;

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

async function startSession() {
  try {
    error.value = "";
    await fetchLicenseStatus();
    if (!state.lesson) {
      error.value = "Brak lekcji. Najpierw utwĂłrz plan.";
      return;
    }
    activeSessionDurationMinutes.value = selectedLessonDurationMinutes.value || 45;
    await startLive(state.lesson.id);
    await beginMic();
    isRecording.value = true;
    elapsedSec.value = 0;
    startAt.value = Date.now();
    timer.value = setInterval(() => {
      elapsedSec.value = Math.floor((Date.now() - startAt.value) / 1000);
      if (elapsedSec.value >= activeSessionDurationMinutes.value * 60) {
        info.value = `OsiÄ…gniÄ™to ustawiony czas lekcji (${durationLabel.value}). Lekcja zostaĹ‚a zatrzymana automatycznie.`;
        stopSession();
      }
    }, 1000);
  } catch (e) {
    error.value = e.message;
    sttStatus.value = "error";
  }
}

function stopSession() {
  shouldKeepListening.value = false;
  recognition.value?.stop();
  recognition.value = null;
  mediaRecorder.value?.stop();
  mediaRecorder.value = null;
  isRecording.value = false;
  interimCaption.value = "";
  if (timer.value) clearInterval(timer.value);
  timer.value = null;
  if (analyserTimer.value) clearInterval(analyserTimer.value);
  analyserTimer.value = null;
  stopMicMeter();
  sttStatus.value = "idle";
  if (coverageRefreshTimer.value) {
    clearTimeout(coverageRefreshTimer.value);
    coverageRefreshTimer.value = null;
  }
  void refreshCoverageThrottled(true);
}

async function beginMic() {
  sttStatus.value = "starting";
  await startMicMeter();
  if (sttEngine.value === "whisper") {
    await beginWhisperMode();
    return;
  }
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) {
    sttStatus.value = "error";
    throw new Error("Ta przeglÄ…darka nie wspiera SpeechRecognition. UĹĽyj Chrome.");
  }
  const rec = new Ctor();
  rec.lang = "pl-PL";
  rec.continuous = true;
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  shouldKeepListening.value = true;
  rec.onresult = async (event) => {
    const finals = [];
    const interim = [];

    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i];
      const alternatives = Array.from(result || []);
      const text = alternatives.map((a) => a?.transcript || "").join(" ").trim();
      if (!text) continue;
      if (result.isFinal) {
        finals.push(text);
      } else if (text.length >= captionSensitivity.value) {
        interim.push(text);
      }
    }

    interimCaption.value = interim.join(" ").trim();

    if (finals.length) {
      const finalText = finals.join(" ").trim();
      lastFinalCaption.value = finalText;
      transcription.value.push(finalText);
      interimCaption.value = "";

      // Fire and forget to keep UI captions responsive.
      if (state.lesson?.id) {
        sendTranscript(state.lesson.id, finalText)
          .then(() => scheduleCoverageRefresh())
          .catch((e) => {
            info.value = `BĹ‚Ä…d wysyĹ‚ki transkrypcji: ${e.message || "nieznany"}`;
          });
      }
    }
  };
  rec.onstart = () => {
    sttStatus.value = "listening";
    info.value = "STT dziaĹ‚a. MĂłw normalnie do mikrofonu.";
  };
  rec.onaudiostart = () => {
    micLevel.value = Math.min(100, Math.max(micLevel.value, 20 * micGain.value));
  };
  rec.onspeechstart = () => {
    micLevel.value = Math.min(100, 90 * micGain.value);
  };
  rec.onspeechend = () => {
    micLevel.value = Math.min(100, 25 * micGain.value);
  };
  rec.onaudioend = () => {
    if (!isRecording.value && !micTestActive.value) {
      micLevel.value = 0;
    }
  };
  rec.onend = () => {
    sttStatus.value = "idle";
    if (shouldKeepListening.value) {
      try {
        sttStatus.value = "starting";
        rec.start();
      } catch {
        // no-op
      }
    }
  };
  rec.onerror = (ev) => {
    const reason = ev.error || "nieznany";
    info.value = `BĹ‚Ä…d mikrofonu: ${reason}`;

    // Common transient errors in browser speech recognition.
    if (reason === "no-speech" || reason === "aborted") {
      sttStatus.value = "starting";
      return;
    }
    sttStatus.value = "error";
  };
  recognition.value = rec;
  rec.start();
  sttStatus.value = "listening";
}

async function beginWhisperMode() {
  if (!micStream.value) {
    throw new Error("Nie udaĹ‚o siÄ™ uruchomiÄ‡ strumienia mikrofonu.");
  }
  let recorder;
  try {
    recorder = new MediaRecorder(micStream.value, { mimeType: "audio/webm" });
  } catch {
    recorder = new MediaRecorder(micStream.value);
  }
  mediaRecorder.value = recorder;
  sttStatus.value = "listening";
  info.value = "Whisper aktywny. WysyĹ‚am fragmenty audio co kilka sekund.";

  recorder.ondataavailable = async (event) => {
    if (!event.data || event.data.size < 1 || !state.lesson?.id) return;
    try {
      const form = new FormData();
      form.set("lessonId", state.lesson.id);
      form.set("file", event.data, `chunk-${Date.now()}.webm`);
      const { data: authData } = await supabase.auth.getSession();
      const token = authData?.session?.access_token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE}/api/transcribe`, {
        method: "POST",
        headers,
        body: form
      });
      const data = await response.json();
      if (!response.ok) {
        info.value = (data.message || data.error || "BĹ‚Ä…d Whisper API.") + " PrzeĹ‚Ä…czam na STT przeglÄ…darki.";
        // Automatic recovery: switch to browser STT when provider fails.
        sttEngine.value = "browser";
        mediaRecorder.value?.stop();
        mediaRecorder.value = null;
        await beginMic();
        return;
      }
      const text = String(data.text || "").trim();
      if (text.length >= captionSensitivity.value) {
        // Show Whisper text immediately on screen before lesson analysis.
        interimCaption.value = "Przetworzono fragment audio.";
        lastFinalCaption.value = text;
        transcription.value.push(text);
        await sendTranscript(state.lesson.id, text);
        scheduleCoverageRefresh();
        interimCaption.value = "";
      }
      if (data.limitReached) {
        info.value = "OsiÄ…gniÄ™to limit kosztĂłw sesji.";
      }
    } catch (e) {
      info.value = `BĹ‚Ä…d Whisper: ${e.message || "nieznany"}`;
    }
  };

  recorder.onerror = () => {
    sttStatus.value = "error";
    info.value = "BĹ‚Ä…d rejestratora audio dla Whisper.";
  };

  recorder.start(4000);
}

async function loadMicDevices() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    const devices = await navigator.mediaDevices.enumerateDevices();
    micDevices.value = devices.filter((d) => d.kind === "audioinput");
  } catch {
    micDevices.value = [];
  }
}

async function startMicMeter() {
  stopMicMeter();
  const constraints = selectedMicId.value
    ? { audio: { deviceId: { exact: selectedMicId.value } } }
    : { audio: true };
  micStream.value = await navigator.mediaDevices.getUserMedia(constraints);
  audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.value.createMediaStreamSource(micStream.value);
  analyserNode.value = audioContext.value.createAnalyser();
  analyserNode.value.fftSize = 512;
  source.connect(analyserNode.value);

  const data = new Uint8Array(analyserNode.value.frequencyBinCount);
  analyserTimer.value = setInterval(() => {
    if (!analyserNode.value) return;
    analyserNode.value.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i += 1) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    micLevel.value = Math.min(100, Math.max(0, rms * 260));
  }, 100);
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
    if (sttEngine.value === "whisper") {
      info.value = "Tryb testu dziaĹ‚a na silniku przeglÄ…darki. Whisper testuj w aktywnej lekcji.";
    } else {
      info.value = "Tryb testu: mĂłw do mikrofonu i sprawdĹş napisy na ĹĽywo.";
    }
    micTestActive.value = true;
    const originalEngine = sttEngine.value;
    if (sttEngine.value === "whisper") {
      sttEngine.value = "browser";
    }
    await beginMic();
    sttEngine.value = originalEngine;
  } catch (e) {
    micTestActive.value = false;
    error.value = e.message;
  }
}

function stopMicTest() {
  shouldKeepListening.value = false;
  recognition.value?.stop();
  recognition.value = null;
  mediaRecorder.value?.stop();
  mediaRecorder.value = null;
  micTestActive.value = false;
  interimCaption.value = "";
  lastFinalCaption.value = "";
  sttStatus.value = "idle";
  if (analyserTimer.value) clearInterval(analyserTimer.value);
  stopMicMeter();
  micLevel.value = 0;
}

function goPresentation() {
  if (!state.lesson) return;
  router.push(`/presentation/${state.lesson.id}`);
}

async function finalizeNow() {
  if (!state.lesson) return;
  stopSession();
  const note = await finalizeLesson(state.lesson.id, window.location.origin);
  router.push(`/archive?note=${encodeURIComponent(note.shareUrl)}`);
}

async function toggleManualApproval(point) {
  if (!point?.id) return;
  return setPointApproval(point, !Boolean(point.manualApproved));
}

async function setPointApproval(point, approved) {
  if (!state.lesson?.id || !point?.id) return;
  try {
    error.value = "";
    manualUpdateLoadingId.value = point.id;
    await setManualPointApproval(state.lesson.id, point.id, Boolean(approved));
  } catch (e) {
    error.value = e.message || "Nie udaĹ‚o siÄ™ zaktualizowaÄ‡ statusu podtematu.";
  } finally {
    manualUpdateLoadingId.value = "";
  }
}

function areAllKeywordsSelected(point) {
  if (!point?.id || !Array.isArray(point.keywords) || point.keywords.length === 0) return false;
  const selected = selectedKeywords.value.get(point.id);
  return selected instanceof Set && selected.size === point.keywords.length;
}

async function syncPointApprovalFromKeywords(point) {
  if (!point?.id) return;
  const shouldBeApproved = areAllKeywordsSelected(point);
  if (Boolean(point.manualApproved) === shouldBeApproved) return;
  await setPointApproval(point, shouldBeApproved);
}

async function toggleKeywordSelection(point, keywordIndex) {
  if (!point?.id) return;
  const pointId = point.id;
  if (!selectedKeywords.value.has(pointId)) {
    selectedKeywords.value.set(pointId, new Set());
  }
  const selected = selectedKeywords.value.get(pointId);
  if (selected.has(keywordIndex)) {
    selected.delete(keywordIndex);
  } else {
    selected.add(keywordIndex);
  }
  // Trigger reactivity
  selectedKeywords.value = new Map(selectedKeywords.value);
  await syncPointApprovalFromKeywords(point);
}

function isKeywordSelected(pointId, keywordIndex) {
  return selectedKeywords.value.has(pointId) && selectedKeywords.value.get(pointId).has(keywordIndex);
}

function hasSelectedKeywords(pointId) {
  return selectedKeywords.value.has(pointId) && selectedKeywords.value.get(pointId).size > 0;
}

async function toggleAllKeywords(point, selectAll) {
  if (!point?.id) return;
  const pointId = point.id;
  
  if (selectAll) {
    const selected = new Set();
    for (let i = 0; i < point.keywords.length; i++) {
      selected.add(i);
    }
    selectedKeywords.value.set(pointId, selected);
  } else {
    selectedKeywords.value.delete(pointId);
  }
  // Trigger reactivity
  selectedKeywords.value = new Map(selectedKeywords.value);
  await syncPointApprovalFromKeywords(point);
}

async function handleSubtopicNumberClick(point) {
  if (!point?.id) return;
  if (Array.isArray(point.keywords) && point.keywords.length) {
    const selected = new Set(point.keywords.map((_, i) => i));
    selectedKeywords.value.set(point.id, selected);
    selectedKeywords.value = new Map(selectedKeywords.value);
  }

  if (!point.manualApproved) {
    await setPointApproval(point, true);
  }
}
</script>
