<template>
  <div class="min-h-full px-4 py-8 sm:px-6 lg:px-10">
    <div class="mx-auto max-w-7xl">
      <header class="mb-8">
        <p class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Moduł</p>
        <h1 class="text-3xl font-bold text-foreground">Generator notatek</h1>
        <p class="mt-1 text-sm text-muted-foreground">Tworzenie i zapisywanie samych notatek lekcyjnych</p>
      </header>

      <div v-if="error" class="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {{ error }}
      </div>
      <div v-if="info" class="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
        {{ info }}
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <div class="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Nowa notatka</h2>
            <div>
              <label class="text-sm text-muted-foreground">Przedmiot</label>
              <input v-model="subject" class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" placeholder="np. Historia" />
            </div>
            <div>
              <label class="text-sm text-muted-foreground">Temat lekcji</label>
              <input v-model="title" class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" placeholder="np. Powstanie listopadowe" />
            </div>
            <div>
              <label class="text-sm text-muted-foreground">Klasa</label>
              <select
                v-model="classLevel"
                class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                @focus="expandSelectOnMobile"
                @blur="collapseSelect"
                @change="collapseSelect"
              >
                <option v-for="level in classOptions" :key="level" :value="level">{{ level }}</option>
              </select>
            </div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button type="button" class="rounded-xl border border-border bg-card py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/40 disabled:opacity-50" :disabled="loading" @click="handleGenerate">
                {{ loading ? "Generuję..." : "Generuj notatkę AI" }}
              </button>
              <button type="button" class="rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50" :disabled="saving" @click="handleSave">
                {{ saving ? "Zapisuję..." : "Zapisz notatkę" }}
              </button>
            </div>
            <button
              type="button"
              class="w-full rounded-xl border border-border bg-card py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/40 disabled:opacity-50"
              :disabled="!content.trim()"
              @click="downloadNotePdf()"
            >
              Pobierz bieżącą notatkę (PDF)
            </button>
            <div>
              <label class="text-sm text-muted-foreground">Treść notatki</label>
              <textarea v-model="content" class="mt-1 min-h-[280px] w-full rounded-xl border border-border bg-input-background p-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" placeholder="Treść notatki wygeneruje AI albo wpisz ją ręcznie..." />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-border bg-card p-6">
          <h3 class="mb-3 font-semibold text-foreground">Zapisane notatki</h3>
          <div class="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            <div
              v-for="note in state.notes"
              :key="note.id"
              class="w-full rounded-xl border border-border bg-card p-3 text-left transition hover:bg-muted/40"
            >
              <div class="flex items-start justify-between gap-3">
                <button type="button" class="min-w-0 flex-1 text-left" @click="loadNote(note)">
                  <p class="truncate text-sm font-semibold text-foreground">{{ note.title }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">{{ note.subject }} • {{ note.classLevel || 'brak klasy' }}</p>
                </button>
                <button
                  type="button"
                  class="shrink-0 rounded-lg border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive transition hover:bg-destructive/20"
                  @click="handleDelete(note)"
                >
                  Usuń
                </button>
                <button
                  type="button"
                  class="shrink-0 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-muted/40"
                  @click="downloadNotePdf(note)"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>
          <p v-if="!state.notes.length" class="text-sm text-muted-foreground">Brak zapisanych notatek.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useLessonStore } from "../composables/useLessonStore";

let pdfMakeInstance = null;

async function getPdfMake() {
  if (pdfMakeInstance) return pdfMakeInstance;
  const [pdfMakeModule, pdfFontsModule] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;
  pdfMake.vfs = pdfFonts.vfs;
  pdfMakeInstance = pdfMake;
  return pdfMake;
}

const { state, generateTeacherNote, saveTeacherNote, deleteTeacherNote, fetchTeacherNotes } = useLessonStore();
const classOptions = [
  "1 Szkoła Podstawowa",
  "2 Szkoła Podstawowa",
  "3 Szkoła Podstawowa",
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
const classLevel = ref("1");
const content = ref("");
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const info = ref("");

onMounted(async () => {
  try {
    await fetchTeacherNotes();
  } catch (e) {
    error.value = e.message || "Nie udało się pobrać notatek.";
  }
});

async function handleGenerate() {
  try {
    loading.value = true;
    error.value = "";
    info.value = "";
    if (!subject.value || !title.value) {
      error.value = "Wpisz przedmiot i temat lekcji.";
      return;
    }
    content.value = await generateTeacherNote({
      subject: subject.value,
      topic: title.value,
      classLevel: classLevel.value
    });
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
    if (!subject.value || !title.value || !content.value.trim()) {
      error.value = "Uzupełnij przedmiot, temat i treść notatki.";
      return;
    }
    await saveTeacherNote({
      title: title.value,
      subject: subject.value,
      classLevel: classLevel.value,
      content: content.value,
      source: "ai"
    });
    info.value = "Notatka zapisana.";
  } catch (e) {
    error.value = e.message || "Nie udało się zapisać notatki.";
  } finally {
    saving.value = false;
  }
}

async function handleDelete(note) {
  const confirmed = window.confirm(`Usunąć notatkę \"${note.title}\"?`);
  if (!confirmed) return;
  try {
    saving.value = true;
    error.value = "";
    info.value = "";
    await deleteTeacherNote(note.id);
    if (title.value === note.title && subject.value === note.subject && content.value === note.content) {
      title.value = "";
      subject.value = "";
      content.value = "";
    }
    info.value = "Notatka usunięta.";
  } catch (e) {
    error.value = e.message || "Nie udało się usunąć notatki.";
  } finally {
    saving.value = false;
  }
}

function loadNote(note) {
  title.value = String(note.title || "");
  subject.value = String(note.subject || "");
  classLevel.value = String(note.classLevel || "1");
  content.value = String(note.content || "");
  error.value = "";
  info.value = "Załadowano zapisaną notatkę.";
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

function expandSelectOnMobile(event) {
  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  if (!isMobile) return;
  event.target.size = 8;
}

function collapseSelect(event) {
  event.target.size = 1;
}

async function downloadNotePdf(note = null) {
  const noteTitle = String(note?.title || title.value || "Notatka").trim();
  const noteSubject = String(note?.subject || subject.value || "").trim();
  const noteClass = String(note?.classLevel || classLevel.value || "").trim();
  const noteContent = String(note?.content || content.value || "").trim();

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
      title: {
        fontSize: 18,
        bold: true,
        lineHeight: 1.15
      },
      meta: {
        fontSize: 10,
        color: "#374151"
      },
      paragraph: {
        fontSize: 11,
        lineHeight: 1.35,
        margin: [0, 0, 0, 8]
      }
    },
    defaultStyle: {
      font: "Roboto"
    },
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
    pdfMake.createPdf(docDefinition).download(fileName);
  } catch (e) {
    error.value = e?.message || "Nie udało się przygotować pliku PDF.";
  }
}
</script>
