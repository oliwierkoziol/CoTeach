<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] relative overflow-x-hidden p-8 md:p-12 pb-14 w-full">
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
      <div class="bg-white content-stretch flex flex-col gap-[12px] items-start pb-[32px] pt-[20px] px-[32px] relative rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] shrink-0 w-full">
        <div class="content-stretch flex flex-col items-start relative shrink-0">
          <h3 class="font-['Manrope'] font-extrabold text-[#191c1e] text-[18px] leading-[28px]">Podstawowe informacje</h3>
        </div>

        <div class="gap-x-[32px] gap-y-[32px] grid grid-cols-1 lg:grid-cols-2 relative shrink-0 w-full mt-2">
          <!-- Przedmiot -->
          <div class="content-stretch flex flex-col gap-[8px] items-start justify-center relative self-start shrink-0 w-full">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] leading-[20px]">Przedmiot</label>
            <div class="bg-[#e0e3e6] h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input v-model="subject" class="bg-transparent border-none outline-none w-full h-full px-4 text-[16px] text-[#191c1e] placeholder-[#767683] font-['Plus_Jakarta_Sans']" placeholder="np. Matematyka, Język Polski..." />
              <svg class="absolute right-[12px] w-[22px] h-[18px] pointer-events-none opacity-40 text-[#222E75]" fill="currentColor" viewBox="0 0 22 18">
                <path d="M11 0L0 5L11 10L22 5L11 0ZM11 12.5L2.3 8.5L0 9.5L11 14.5L22 9.5L19.7 8.5L11 12.5Z" />
              </svg>
            </div>
          </div>

          <!-- Data -->
          <div class="content-stretch flex flex-col gap-[8px] items-start justify-center relative self-start shrink-0 w-full">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] leading-[20px]">Data</label>
            <div class="bg-[#e0e3e6] h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input type="date" v-model="lessonDate" class="bg-transparent border-none outline-none w-full h-full px-[16px] pr-[40px] text-[16px] text-[#191c1e] font-['Plus_Jakarta_Sans'] [color-scheme:light]" />
              <svg class="absolute right-[12px] w-[18px] h-[20px] pointer-events-none opacity-40 text-[#222E75]" fill="currentColor" viewBox="0 0 18 20">
                <path d="M4 2H14V0H16V2H18V20H0V2H2V0H4V2ZM16 18V6H2V18H16ZM14 10H4V8H14V10ZM14 14H4V12H14V14Z" />
              </svg>
            </div>
          </div>

          <!-- Temat -->
          <div class="content-stretch flex flex-col gap-[8px] items-start justify-center relative self-start shrink-0 w-full mt-[-8px] lg:mt-0">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] leading-[20px]">Temat</label>
            <div class="bg-[#e0e3e6] h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input v-model="title" class="bg-transparent border-none outline-none w-full h-full px-4 text-[16px] text-[#191c1e] placeholder-[#767683] font-['Plus_Jakarta_Sans']" placeholder="Wprowadź temat zajęć..." />
              <svg class="absolute right-[12px] w-[18px] h-[16px] pointer-events-none opacity-40 text-[#222E75]" fill="currentColor" viewBox="0 0 18 16">
                <path d="M14.06 0L18 3.94L16.42 5.51L12.49 1.58L14.06 0ZM0 12.49L11.08 1.41L15.02 5.35L3.94 16.43H0V12.49Z" />
              </svg>
            </div>
          </div>

          <!-- Klasa -->
          <div class="content-stretch flex flex-col gap-[8px] items-start justify-center relative self-start shrink-0 w-full mt-[-8px] lg:mt-0">
            <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] leading-[20px]">Klasa</label>
            <div class="bg-[#e0e3e6] h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <select v-model="classLevel" class="bg-transparent border-none outline-none w-full h-full px-4 appearance-none text-[16px] text-[#191c1e] font-['Plus_Jakarta_Sans'] cursor-pointer">
                <option v-for="level in classOptions" :key="level" :value="level">{{ level }}</option>
              </select>
              <div class="absolute right-[12px] flex gap-2 pointer-events-none items-center text-[#222E75] opacity-40">
                <svg class="w-[22px] h-[20px]" fill="currentColor" viewBox="0 0 22 18">
                  <path d="M11 0L0 5L11 10L22 5L11 0ZM11 12.5L2.3 8.5L0 9.5L11 14.5L22 9.5L19.7 8.5L11 12.5Z" />
                </svg>
                <svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24">
                  <path d="M7.2 9.6L12 14.4L16.8 9.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ingestion Area -->
      <div class="gap-x-[32px] gap-y-[32px] grid grid-cols-1 xl:grid-cols-12 relative shrink-0 w-full xl:min-h-[282px]">
        
        <!-- Text Input Area -->
        <div class="xl:col-[1/span_9] content-stretch flex flex-col items-start relative shrink-0 w-full h-full">
          <div class="bg-white relative rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] shrink-0 w-full h-full">
            <div class="content-stretch flex flex-col gap-[24px] items-start p-[32px] relative size-full h-full">
              <div class="flex items-center justify-between relative shrink-0 w-full">
                <div class="content-stretch flex flex-col items-start relative shrink-0">
                  <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-[18px] leading-[28px] whitespace-nowrap">Materiały źródłowe</h3>
                </div>
                <div class="flex items-center gap-[16px]">
                  <button type="button" class="bg-[#0c3dfe] content-stretch flex items-center px-[32px] py-[10px] rounded-[8px] hover:bg-[#0a34d4] transition-colors shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50" :disabled="loading" @click="handleGenerate">
                    <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-white leading-[24px]">{{ loading ? "Generowanie..." : "Generuj notatkę AI" }}</span>
                    <svg class="ml-2 w-[16px] h-[16px]" fill="none" viewBox="0 0 15.7635 15.7635">
                      <path d="M7.88175 0L10.3204 5.4431L15.7635 7.88175L10.3204 10.3204L7.88175 15.7635L5.4431 10.3204L0 7.88175L5.4431 5.4431L7.88175 0Z" fill="white" />
                    </svg>
                  </button>
                  <div class="content-stretch flex flex-col items-start">
                    <p class="font-['Plus_Jakarta_Sans'] font-medium text-[#767683] text-[12px] leading-[16px] whitespace-nowrap">
                      {{ rawTextContent.length }} / 25,000 Znaki
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-[#e0e3e6] relative rounded-[8px] w-full flex-grow flex transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50 min-h-[150px]">
                <textarea 
                  v-model="rawTextContent"
                  class="w-full h-full bg-transparent border-none outline-none p-[24px] text-[16px] text-[#191c1e] placeholder-[#767683] font-['Plus_Jakarta_Sans'] resize-none rounded-[8px]"
                  placeholder="Paste lecture notes, book transcripts, or structured syllabi here for deep analysis..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Drag and Drop Zone -->
        <div class="xl:col-[10/span_3] bg-white relative rounded-[12px] self-stretch shrink-0 w-full min-h-[250px] xl:min-h-[282px]">
          <div class="overflow-hidden rounded-[12px] h-full w-full absolute inset-0">
            <div class="flex flex-col items-center justify-center p-[34px] xl:pb-[34px] xl:pt-[11px] size-full">
              <!-- Icon -->
              <div class="bg-[#e6e8eb] flex items-center justify-center rounded-full shrink-0 size-[64px] mb-[24px]">
                <img :src="cloudIcon" alt="Cloud upload icon" class="w-[28px] h-[20px]" />
              </div>
              <!-- Texts -->
              <h4 class="font-['Plus_Jakarta_Sans'] font-bold text-[20px] text-black text-center leading-[28px] max-w-[236px]">Prześlij plik z materiałem</h4>
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
          <div class="absolute border-2 border-[rgba(0,0,0,0.1)] border-dashed inset-0 pointer-events-none rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)]"></div>
        </div>
      </div>

      <!-- Action Buttons Footer -->
      <div class="bg-white content-stretch flex flex-col items-start justify-center p-[32px] relative rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] shrink-0 w-full mb-7">
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
          <div class="flex gap-[12px] items-center w-full md:w-auto mt-4 md:mt-0 justify-end">
            <button type="button" @click="resetForm" class="bg-[#f2f2f2] content-stretch flex items-center justify-center px-[24px] py-[10px] rounded-[8px] hover:bg-[#e5e5e5] transition-colors">
              <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[16px] leading-[24px]">Anuluj</span>
            </button>
            <button type="button" :disabled="saving" @click="handleSave" class="bg-[#0c3dfe] content-stretch flex items-center justify-center px-[32px] py-[10px] rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] hover:bg-[#0a34d4] transition-colors disabled:opacity-50">
              <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-white leading-[24px]">{{ saving ? 'Zapisywanie...' : 'Zapisz i kontynuuj' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useLessonStore } from "../composables/useLessonStore";
import cloudIcon from "../assets/cloud.svg";

let pdfMakeInstance = null;

async function getPdfMake() {
  if (pdfMakeInstance) return pdfMakeInstance;
  const [pdfMakeModule, pdfFontsModule] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;

  const resolvedVfs =
    pdfFonts?.vfs ||
    pdfFonts?.pdfMake?.vfs ||
    pdfFonts?.default?.vfs ||
    pdfFonts?.default?.pdfMake?.vfs;

  if (typeof pdfMake.addVirtualFileSystem === "function" && resolvedVfs) {
    pdfMake.addVirtualFileSystem(resolvedVfs);
  } else if (resolvedVfs) {
    pdfMake.vfs = resolvedVfs;
  }

  pdfMakeInstance = pdfMake;
  return pdfMake;
}

const { state, generateTeacherNote, saveTeacherNote } = useLessonStore();
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
const classLevel = ref("1 Klasa Szkoły Podstawowej");
const rawTextContent = ref("");
const selectedFile = ref(null);

const loading = ref(false);
const saving = ref(false);
const error = ref("");
const info = ref("");

function handleFileChange(event) {
  const file = event.target.files?.[0];
  if (file) {
    selectedFile.value = file;
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
    await saveTeacherNote({
      title: title.value,
      subject: subject.value,
      classLevel: classLevel.value,
      content: rawTextContent.value,
      source: "ai"
    });
    info.value = "Notatka zapisana pomyślnie.";
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
      return;
    }

    if (typeof pdfDocument?.getBlob === "function") {
      pdfDocument.getBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      });
      return;
    }

    throw new Error("Biblioteka PDF nie obsługuje pobierania.");
  } catch (e) {
    error.value = e?.message || "Nie udało się przygotować pliku PDF.";
  }
}
</script>
