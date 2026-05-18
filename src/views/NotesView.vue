<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] relative overflow-x-hidden px-4 py-6 sm:px-6 md:p-12 pb-14 w-full">
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <div class="flex flex-col gap-[27px] w-full max-w-[1568px] relative z-10 mx-auto">
      <!-- Header -->
      <div class="content-stretch flex flex-col gap-[8px] items-center justify-center relative shrink-0 w-full mb-4">
        <div class="content-stretch flex flex-col items-start relative shrink-0 w-full">
          <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px]">Dodaj materiały</h2>
        </div>
        <div class="content-stretch flex flex-col items-start relative shrink-0 w-full">
          <p class="font-['Plus_Jakarta_Sans'] font-normal text-[#454652] text-[18px] leading-[28px]">Dodaj materiały przy użyciu tekstu lub zdjęcia. Materiały te będą wykorzystane podczas prowadzenia lekcji na żywo.</p>
        </div>
      </div>

      <!-- Podstawowe Informacje -->
      <div class="bg-white content-stretch flex flex-col gap-[12px] items-start pb-[24px] pt-[20px] px-[20px] sm:px-[32px] relative rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] shrink-0 w-full">
        <div class="content-stretch flex flex-col items-start relative shrink-0">
          <h3 class="font-['Manrope'] font-extrabold text-[#191c1e] text-[18px] leading-[28px]">Podstawowe informacje</h3>
        </div>

        <div class="gap-x-[32px] gap-y-[32px] grid grid-cols-1 lg:grid-cols-2 relative shrink-0 w-full mt-2">
          <!-- Przedmiot -->
          <div class="content-stretch flex flex-col gap-[8px] items-start justify-center relative self-start shrink-0 w-full">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] leading-[20px]">Przedmiot</label>
            <div class="bg-[#e0e3e6] dark:bg-input-background h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input v-model="subject" class="bg-transparent border-none outline-none w-full h-full px-4 text-[16px] text-[#191c1e] dark:text-foreground placeholder-[#767683] font-['Plus_Jakarta_Sans']" placeholder="np. Matematyka, Język Polski..." />
              <svg class="absolute right-[12px] w-[22px] h-[18px] pointer-events-none opacity-40 text-[#222E75]" fill="currentColor" viewBox="0 0 22 18">
                <path d="M11 0L0 5L11 10L22 5L11 0ZM11 12.5L2.3 8.5L0 9.5L11 14.5L22 9.5L19.7 8.5L11 12.5Z" />
              </svg>
            </div>
          </div>

          <!-- Data -->
          <div class="content-stretch flex flex-col gap-[8px] items-start justify-center relative self-start shrink-0 w-full">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] leading-[20px]">Data</label>
            <div class="bg-[#e0e3e6] dark:bg-input-background h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input type="date" v-model="lessonDate" class="bg-transparent border-none outline-none w-full h-full px-[16px] pr-[40px] text-[16px] text-[#191c1e] dark:text-foreground font-['Plus_Jakarta_Sans'] [color-scheme:light] dark:[color-scheme:dark]" />
              <svg class="absolute right-[12px] w-[18px] h-[20px] pointer-events-none opacity-40 text-[#222E75]" fill="currentColor" viewBox="0 0 18 20">
                <path d="M4 2H14V0H16V2H18V20H0V2H2V0H4V2ZM16 18V6H2V18H16ZM14 10H4V8H14V10ZM14 14H4V12H14V14Z" />
              </svg>
            </div>
          </div>

          <!-- Temat -->
          <div class="content-stretch flex flex-col gap-[8px] items-start justify-center relative self-start shrink-0 w-full mt-[-8px] lg:mt-0">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] leading-[20px]">Temat</label>
            <div class="bg-[#e0e3e6] dark:bg-input-background h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input v-model="title" class="bg-transparent border-none outline-none w-full h-full px-4 text-[16px] text-[#191c1e] dark:text-foreground placeholder-[#767683] font-['Plus_Jakarta_Sans']" placeholder="Wprowadź temat zajęć..." />
              <svg class="absolute right-[12px] w-[18px] h-[16px] pointer-events-none opacity-40 text-[#222E75]" fill="currentColor" viewBox="0 0 18 16">
                <path d="M14.06 0L18 3.94L16.42 5.51L12.49 1.58L14.06 0ZM0 12.49L11.08 1.41L15.02 5.35L3.94 16.43H0V12.49Z" />
              </svg>
            </div>
          </div>

          <!-- Klasa -->
          <div class="content-stretch flex flex-col gap-[8px] items-start justify-center relative self-start shrink-0 w-full mt-[-8px] lg:mt-0">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] leading-[20px]">Poziom Klasy</label>
            <div class="bg-[#e0e3e6] dark:bg-input-background h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <select v-model="classLevel" class="bg-transparent border-none outline-none w-full h-full px-4 appearance-none text-[16px] text-[#191c1e] dark:text-foreground font-['Plus_Jakarta_Sans'] cursor-pointer">
                <option v-for="level in classOptions" :key="level" :value="level" class="dark:bg-card dark:text-foreground">{{ level }}</option>
              </select>
              <div class="absolute right-[12px] flex gap-2 pointer-events-none items-center text-[#222E75] dark:text-muted-foreground opacity-40">
                <svg class="w-[22px] h-[20px]" fill="currentColor" viewBox="0 0 22 18">
                  <path d="M11 0L0 5L11 10L22 5L11 0ZM11 12.5L2.3 8.5L0 9.5L11 14.5L22 9.5L19.7 8.5L11 12.5Z" />
                </svg>
                <svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24">
                  <path d="M7.2 9.6L12 14.4L16.8 9.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Moja Klasa removed - moved to AppLayout header -->
        </div>
      </div>

      <!-- Modal dodawania nowej klasy removed - moved to AppLayout -->

      <!-- Ingestion Area -->
      <div class="gap-x-[32px] gap-y-[32px] grid grid-cols-1 xl:grid-cols-12 relative shrink-0 w-full xl:min-h-[400px]">
        
        <!-- Text Input Area -->
        <div class="xl:col-[1/span_9] content-stretch flex flex-col items-start relative shrink-0 w-full h-full">
          <div class="bg-white relative rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] shrink-0 w-full h-full">
            <div class="content-stretch flex flex-col gap-[24px] items-start p-[20px] sm:p-[32px] relative size-full h-full">
              <div class="relative flex w-full shrink-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-[16px] shrink-0">
                  <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px] whitespace-nowrap">Treść notatki</h3>
                </div>

                <div class="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-[16px]">
                  <button type="button" @click="showRawTextModal = true" class="bg-white dark:bg-card border border-border content-stretch flex items-center justify-center px-[20px] py-[10px] rounded-[8px] hover:bg-slate-50 dark:hover:bg-border transition-colors text-black dark:text-foreground font-semibold text-[16px] w-full sm:w-auto shadow-sm" :disabled="loading">
                    <svg class="mr-2 w-[18px] h-[18px] text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Edytuj całą notatkę
                  </button>

                  <button type="button" class="bg-[#0c3dfe] content-stretch flex items-center justify-center px-[20px] sm:px-[32px] py-[10px] rounded-[8px] hover:bg-[#0a34d4] transition-colors shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50 w-full sm:w-auto" :disabled="loading" @click="handleGenerate">
                    <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-white leading-[24px]">{{ loading ? "Generowanie..." : "Generuj notatkę AI" }}</span>
                    <svg class="ml-2 w-[16px] h-[16px]" fill="none" viewBox="0 0 15.7635 15.7635">
                      <path d="M7.88175 0L10.3204 5.4431L15.7635 7.88175L10.3204 10.3204L7.88175 15.7635L5.4431 10.3204L0 7.88175L5.4431 5.4431L7.88175 0Z" fill="white" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Main Content Workspace -->
              <div class="w-full flex-grow flex flex-col gap-2 min-h-[300px] relative">
                <!-- Preview container -->
                <div class="bg-white border border-[#e0e3e6] dark:border-border dark:bg-card relative rounded-[8px] w-full p-[24px] text-[16px] text-[#191c1e] dark:text-foreground font-['Plus_Jakarta_Sans'] overflow-y-auto max-h-[450px] min-h-[250px] flex-grow flex flex-col">
                  <div v-if="rawTextContent.trim()" class="prose max-w-none dark:prose-invert prose-slate prose-headings:font-bold prose-headings:text-[#0c3dfe] flex-grow" v-html="renderMarkdownWithMath(rawTextContent)" @click="handlePreviewClick"></div>
                  <div v-else class="text-gray-400 italic text-center py-10 w-full my-auto">Wpisz temat i przedmiot po lewej stronie, prześlij plik z materiałem lub kliknij "Edytuj całą notatkę", aby zacząć!</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Drag and Drop Zone -->
        <div class="xl:col-[10/span_3] bg-white relative rounded-[12px] self-stretch shrink-0 w-full min-h-[250px] xl:min-h-[400px]">
          <div class="overflow-hidden rounded-[12px] h-full w-full absolute inset-0">
            <div class="flex flex-col items-center justify-center p-[34px] xl:pb-[34px] xl:pt-[11px] size-full">
              <!-- Icon -->
              <div class="bg-[#e6e8eb] flex items-center justify-center rounded-full shrink-0 size-[64px] mb-[24px]">
                <img :src="cloudIcon" alt="Cloud upload icon" class="w-[28px] h-[20px]" />
              </div>
              <!-- Texts -->
              <h4 class="font-['Plus_Jakarta_Sans'] font-bold text-[20px] text-black dark:text-foreground text-center leading-[28px] max-w-[236px]">Prześlij plik z materiałem</h4>
              <div class="h-[9px] w-full shrink-0"></div>
              <p class="font-['Plus_Jakarta_Sans'] font-normal text-[#454652] text-[14px] text-center leading-[20px] max-w-[250px]">
                Upuść tu plik PDF, DOCX albo PPTX, aby odczytać z niego dane.
              </p>
              <div class="h-[24px] w-full shrink-0"></div>
              <!-- Button -->
              <button type="button" @click="$refs.fileInput.click()" class="bg-[#e0e3e6] px-[24px] py-[10px] rounded-[8px] hover:bg-[#d0d3d6] transition-colors shrink-0">
                <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[#0c3dfe] text-[16px] leading-[24px]">Wybierz pliki</span>
              </button>
              <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept=".pdf,.doc,.docx,.pptx,.txt" />
              <p v-if="selectedFile" class="mt-3 text-sm text-[#0c3dfe] truncate max-w-[200px]">{{ selectedFile.name }}</p>
            </div>
          </div>
          <div class="absolute border-2 border-[rgba(0,0,0,0.1)] dark:border-border border-dashed inset-0 pointer-events-none rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)]"></div>
        </div>
      </div>

      <!-- Action Buttons Footer -->
      <div class="bg-white content-stretch flex flex-col items-start justify-center p-[20px] sm:p-[32px] relative rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] shrink-0 w-full mb-7">
        <div v-if="error" class="mb-4 text-sm text-red-500 font-['Plus_Jakarta_Sans'] font-semibold">
           {{ error }}
        </div>
        <div v-if="info" class="mb-4 text-sm text-green-600 font-['Plus_Jakarta_Sans'] font-semibold">
           {{ info }}
        </div>
        <div class="content-stretch flex gap-[12px] flex-col md:flex-row items-center justify-between relative shrink-0 w-full">
          <button type="button" @click="downloadNotePdf()" class="bg-[#0c3dfe] content-stretch flex items-center justify-center px-[24px] py-[10px] rounded-[8px] hover:bg-[#0a34d4] transition-colors w-full md:w-auto disabled:opacity-50" :disabled="!rawTextContent">
            <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-white leading-[24px]">Pobierz notatkę jako PDF</span>
          </button>
          <div class="flex gap-[20px] items-center w-full md:w-auto mt-4 md:mt-0 justify-end flex-col sm:flex-row">
            <button type="button" @click="resetForm" class="bg-muted border border-border content-stretch flex items-center justify-center px-[24px] py-[10px] rounded-[8px] hover:bg-background/70 transition-colors w-full sm:w-auto">
              <span class="font-['Plus_Jakarta_Sans'] font-semibold text-muted-foreground text-[16px] leading-[24px]">Anuluj</span>
            </button>
            <button type="button" :disabled="saving" @click="handleSave" :class="[
              'bg-[#0c3dfe] content-stretch flex items-center justify-center px-[32px] py-[10px] rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] hover:bg-[#0a34d4] transition-colors disabled:opacity-50 w-full sm:w-auto',
              (!state.notes || state.notes.length === 0) && subject && title && rawTextContent ? 'sound-wave-btn' : ''
            ]">
              <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-white leading-[24px]">{{ saving ? 'Zapisywanie...' : 'Zapisz i kontynuuj' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Beautiful KaTeX Math Editor Modal -->
    <div v-if="showMathModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div class="bg-white dark:bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden transform transition-all scale-100 flex flex-col">
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
    <!-- Raw Text Editor Modal -->
    <div v-if="showRawTextModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div class="bg-white dark:bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] mx-4 overflow-hidden transform transition-all scale-100 flex flex-col">
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
              v-model="rawTextContent"
              class="w-full h-full bg-transparent border-none outline-none p-6 text-[16px] text-[#191c1e] dark:text-foreground placeholder-[#767683] font-['Plus_Jakarta_Sans'] resize-none"
              placeholder="Wpisz treść notatki w formacie Markdown lub wklej materiał..."
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-border flex items-center justify-between bg-gray-50 dark:bg-card/50">
          <span class="font-['Plus_Jakarta_Sans'] font-medium text-[#767683] text-sm">
            {{ rawTextContent.length }} / 25,000 Znaki
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import cloudIcon from "../assets/cloud.svg";
import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";

let pdfMakeInstance = null;
let pdfMakeLoadingPromise = null;

async function getPdfMake() {
  if (pdfMakeInstance) return pdfMakeInstance;
  if (pdfMakeLoadingPromise) return pdfMakeLoadingPromise;

  pdfMakeLoadingPromise = (async () => {
    try {
      const [pdfMakeModule, pdfFontsModule] = await Promise.all([
        import("pdfmake/build/pdfmake"),
        import("pdfmake/build/vfs_fonts"),
      ]);
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;

      let resolvedVfs = null;
      if (pdfFonts?.pdfMake?.vfs) resolvedVfs = pdfFonts.pdfMake.vfs;
      else if (pdfFonts?.vfs) resolvedVfs = pdfFonts.vfs;
      else if (pdfFonts?.default?.pdfMake?.vfs) resolvedVfs = pdfFonts.default.pdfMake.vfs;
      else if (pdfFonts?.default?.vfs) resolvedVfs = pdfFonts.default.vfs;
      else if (pdfFonts?.default && pdfFonts.default["Roboto-Regular.ttf"]) resolvedVfs = pdfFonts.default;
      else if (pdfFonts && pdfFonts["Roboto-Regular.ttf"]) resolvedVfs = pdfFonts;
      else if (typeof window !== "undefined" && window.pdfMake?.vfs) resolvedVfs = window.pdfMake.vfs;

      if (resolvedVfs) {
        if (typeof pdfMake.addVirtualFileSystem === "function") {
          pdfMake.addVirtualFileSystem(resolvedVfs);
        } else {
          pdfMake.vfs = resolvedVfs;
        }

        // Explicit font configuration with fallbacks to avoid 'File not found' errors.
        // pdfmake defaults to Roboto-Medium.ttf for bold style if not configured.
        pdfMake.fonts = {
          Roboto: {
            normal: "Roboto-Regular.ttf",
            bold: resolvedVfs["Roboto-Medium.ttf"] ? "Roboto-Medium.ttf" : "Roboto-Regular.ttf",
            italics: resolvedVfs["Roboto-Italic.ttf"] ? "Roboto-Italic.ttf" : "Roboto-Regular.ttf",
            bolditalics: resolvedVfs["Roboto-MediumItalic.ttf"] ? "Roboto-MediumItalic.ttf" : "Roboto-Regular.ttf",
          },
        };
      }

      pdfMakeInstance = pdfMake;
      return pdfMake;
    } catch (err) {
      pdfMakeLoadingPromise = null;
      throw err;
    }
  })();

  return pdfMakeLoadingPromise;
}

const { state, generateTeacherNote, saveTeacherNote, extractTextFromUpload, fetchTeacherNotes, fetchUserClasses, addUserClass } = useLessonStore();

onMounted(async () => {
  await fetchTeacherNotes();
  await fetchUserClasses();
});
const router = useRouter();
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

const subject = ref("");
const title = ref("");
const lessonDate = ref(new Date().toISOString().split("T")[0]);
const classLevel = ref("4 Szkoła Średnia");
const rawTextContent = ref("");
const selectedFile = ref(null);
const activeTab = ref("edit");
const showRawTextModal = ref(false);
const textareaRef = ref(null);

function insertMath(latexExpr) {
  const el = textareaRef.value;
  if (!el) {
    rawTextContent.value += ` $${latexExpr}$`;
    return;
  }
  
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = rawTextContent.value;
  const formatted = `$${latexExpr}$`;
  
  rawTextContent.value = text.substring(0, start) + formatted + text.substring(end);
  
  const newCursorPos = start + formatted.length;
  
  setTimeout(() => {
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

function renderMarkdownWithMath(text) {
  if (!text) return "";
  
  const placeholders = [];
  let str = String(text);
  
  // 1. Normalizuj podwójne backslashe (LLM/JSON strings)
  str = str.replace(/\\\\/g, "\\");

  // 2. Jednoprzebiegowe wyciąganie wzorów w kolejności ich występowania w tekście
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
      
      // Wrappowanie wyrenderowanego kodu w klikalny, interaktywny kontener z danymi
      const wrapped = `<span class="katex-editable hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:ring-2 hover:ring-blue-500 rounded px-1.5 py-0.5 transition-all cursor-pointer inline-block" data-math-index="${index}" data-math-display="${isDisplay ? 'true' : 'false'}" data-math-raw="${encodeURIComponent(mathExp.trim())}" title="Kliknij, aby edytować ten wzór">${rendered}</span>`;
      
      placeholders.push({ placeholder, wrapped });
      return placeholder;
    } catch (e) {
      console.warn("KaTeX rendering error:", e);
      return match;
    }
  });

  // 3. Przepuść tekst z bezpiecznymi placeholderami przez marked.parse
  let html = marked.parse(str);

  // 4. Wstaw z powrotem wyrenderowane i opakowane spany KaTeX
  for (const item of placeholders) {
    html = html.replace(item.placeholder, item.wrapped);
  }

  return html;
}

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

function openMathEditor(index, isDisplay, rawMath) {
  mathModalIndex.value = index;
  mathModalDisplay.value = isDisplay;
  mathModalRaw.value = rawMath;
  showMathModal.value = true;
}

function saveMathEditor() {
  if (mathModalIndex.value === null) return;
  rawTextContent.value = updateMathAtIndex(
    rawTextContent.value,
    mathModalIndex.value,
    mathModalRaw.value.trim(),
    mathModalDisplay.value
  );
  showMathModal.value = false;
  mathModalIndex.value = null;
  mathModalRaw.value = "";
}

function handlePreviewClick(event) {
  const editable = event.target.closest('.katex-editable');
  if (!editable) return;
  
  const index = parseInt(editable.getAttribute('data-math-index'), 10);
  const isDisplay = editable.getAttribute('data-math-display') === 'true';
  const rawMath = decodeURIComponent(editable.getAttribute('data-math-raw'));
  
  openMathEditor(index, isDisplay, rawMath);
}

const loading = ref(false);
const saving = ref(false);
const error = ref("");
const info = ref("");

async function handleFileChange(event) {
  const file = event.target.files?.[0];
  if (file) {
    selectedFile.value = file;
    try {
      loading.value = true;
      error.value = "";
      info.value = "AI odczytuje treść pliku...";
      const text = await extractTextFromUpload(file);
      if (text) {
        rawTextContent.value = text;
        info.value = "Treść pliku została wczytana pomyślnie.";
      }
    } catch (e) {
      error.value = "Błąd odczytu pliku: " + e.message;
    } finally {
      loading.value = false;
    }
  }
}

function resetForm() {
  subject.value = "";
  lessonDate.value = new Date().toISOString().split("T")[0];
  classLevel.value = "1 Klasa Szkoły Podstawowej";
  title.value = "";
  rawTextContent.value = "";
  selectedFile.value = null;
  error.value = "";
  info.value = "";
}

async function handleGenerate() {
  try {
    loading.value = true;
    error.value = "";
    info.value = "";
    if (!subject.value || !title.value) {
      error.value = "Wpisz przedmiot i temat lekcji.";
      return;
    }
    const result = await generateTeacherNote({
      subject: subject.value,
      topic: title.value,
      classLevel: classLevel.value,
      rawText: rawTextContent.value
    });
    rawTextContent.value = result || "";
    info.value = "Notatka wygenerowana. Możesz ją edytować i zapisać.";
    activeTab.value = "preview"; // Auto-switch to Preview tab so the teacher can see the formatted math!
  } catch (e) {
    error.value = e.message || "Nie udało się wygenerować notatki.";
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  try {
    saving.value = true;
    error.value = "";
    info.value = "";
    if (!subject.value || !title.value || !rawTextContent.value.trim()) {
      error.value = "Uzupełnij przedmiot, temat i treść w obszarze roboczym.";
      return;
    }
    const payload = {
      title: title.value,
      subject: subject.value,
      classLevel: classLevel.value,
      content: rawTextContent.value,
      source: "ai"
    };
    
    // Dodaj class_name jeśli użytkownik wybrał własną klasę z headera
    if (state.selectedClass) {
      payload.class_name = state.selectedClassName;
    }
    
    await saveTeacherNote(payload);
    info.value = "Notatka zapisana pomyślnie.";
    await router.push("/preparation");
  } catch (e) {
    error.value = e.message || "Nie udało się zapisać notatki.";
  } finally {
    saving.value = false;
  }
}

function sanitizeFileName(value) {
  return String(value || "notatka")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "notatka";
}

async function downloadNotePdf() {
  error.value = "";
  info.value = "";

  const noteTitle = String(title.value || "Notatka").trim();
  const noteSubject = String(subject.value || "").trim();
  const noteClass = String(classLevel.value || "").trim();
  const noteContent = String(rawTextContent.value || "").trim();

  if (!noteContent) {
    error.value = "Brak treści notatki do pobrania.";
    return;
  }

  const paragraphs = noteContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ text: line, style: "paragraph" }));

  const metaChunks = [];
  if (noteSubject) metaChunks.push({ text: `Przedmiot: ${noteSubject}` });
  if (noteClass) metaChunks.push({ text: `Klasa: ${noteClass}` });

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 48, 40, 44],
    content: [
      { text: noteTitle || "Notatka", style: "title" },
      ...(metaChunks.length ? [{ columns: metaChunks, columnGap: 16, margin: [0, 6, 0, 10], style: "meta" }] : []),
      ...paragraphs
    ],
    styles: {
      title: { fontSize: 18, bold: true, lineHeight: 1.15 },
      meta: { fontSize: 10, color: "#374151" },
      paragraph: { fontSize: 11, lineHeight: 1.35, margin: [0, 0, 0, 8] }
    },
    defaultStyle: { font: "Roboto" },
    footer(currentPage, pageCount) {
      return {
        text: `${currentPage}/${pageCount}`,
        alignment: "right",
        margin: [0, 0, 22, 12],
        fontSize: 9,
        color: "#6b7280"
      };
    }
  };

  const fileName = `${sanitizeFileName(noteTitle)}.pdf`;
  try {
    const pdfMake = await getPdfMake();
    const pdfDocument = pdfMake.createPdf(docDefinition);

    if (typeof pdfDocument?.download === "function") {
      pdfDocument.download(fileName);
      info.value = "Pobieranie notatki rozpoczęte.";
      return;
    }

    if (typeof pdfDocument?.getBlob === "function") {
      const maybePromise = pdfDocument.getBlob((blob) => {
        if (!blob) return;
        if (window.navigator?.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, fileName);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });

      if (maybePromise && typeof maybePromise.then === "function") {
        const blob = await maybePromise;
        if (blob) {
          if (window.navigator?.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
          } else {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            link.rel = "noopener";
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }
          info.value = "Pobieranie notatki rozpoczęte.";
          return;
        }
      } else {
        info.value = "Pobieranie notatki rozpoczęte.";
        return;
      }
    }

    throw new Error("Biblioteka PDF nie obsługuje pobierania pliku.");
  } catch (e) {
    error.value = e?.message || "Nie udało się pobrać notatki jako PDF.";
  }
}
</script>

<style scoped>
/* Premium KaTeX and Markdown styling for the note preview workspace */
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
