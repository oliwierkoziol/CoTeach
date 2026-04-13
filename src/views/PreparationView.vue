<template>
  <div class="min-h-full px-4 py-8 sm:px-6 lg:px-10">
    <div class="mx-auto max-w-6xl">
      <header class="mb-8">
        <p class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Moduł</p>
        <h1 class="text-3xl font-bold text-foreground">Przygotowanie materiałów</h1>
        <p class="mt-1 text-sm text-muted-foreground">Ingestia danych i generator planu lekcji</p>
      </header>

      <div v-if="error" class="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {{ error }}
      </div>
      <div v-if="info" class="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
        {{ info }}
      </div>

      <div v-if="!lesson || !lesson.plan?.length" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <div class="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 class="text-lg font-semibold text-foreground">Podstawowe informacje</h2>
            <div>
              <label class="text-sm text-muted-foreground">Przedmiot</label>
              <input v-model="subject" class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" placeholder="np. Biologia" />
            </div>
            <div>
              <label class="text-sm text-muted-foreground">Tytuł lekcji</label>
              <input v-model="title" class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" placeholder="np. Fotosynteza" />
            </div>
            <div>
              <label class="text-sm text-muted-foreground">Miesiąc</label>
              <input v-model="month" class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" placeholder="np. Kwiecień" />
            </div>
          </div>

          <div class="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 class="text-lg font-semibold text-foreground">Materiały źródłowe</h2>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-xl border px-4 py-2 text-sm font-medium transition"
                :class="uploadMethod === 'text' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-muted/50'"
                @click="uploadMethod = 'text'"
              >
                Tekst
              </button>
              <button
                type="button"
                class="rounded-xl border px-4 py-2 text-sm font-medium transition"
                :class="uploadMethod === 'file' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-muted/50'"
                @click="uploadMethod = 'file'"
              >
                Plik
              </button>
            </div>

            <div v-if="uploadMethod === 'text'">
              <textarea
                v-model="rawText"
                class="min-h-[260px] w-full rounded-xl border border-border bg-input-background p-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                placeholder="Wklej notatki..."
              />
            </div>
            <div v-else class="rounded-xl border-2 border-dashed border-border p-8 text-center">
              <input type="file" accept=".txt,.pdf,.jpg,.jpeg,.png" @change="onFile" />
              <p class="mt-2 text-sm text-muted-foreground">Obsługiwane formaty: TXT, PDF, JPG, PNG</p>
              <p v-if="selectedFile" class="mt-2 text-sm font-medium text-foreground">{{ selectedFile.name }}</p>
            </div>

            <button
              type="button"
              class="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              :disabled="isGenerating"
              @click="handleGenerate"
            >
              {{ isGenerating ? "Przetwarzam..." : "Generuj plan lekcji z AI" }}
            </button>
          </div>
        </div>

        <div class="rounded-2xl border border-border bg-card/80 p-6">
          <h3 class="mb-3 font-semibold text-foreground">Jak to działa?</h3>
          <ol class="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
            <li>Wklej tekst lub prześlij plik.</li>
            <li>OCR odczyta treść (PDF/JPG/PNG).</li>
            <li>AI wygeneruje plan lekcji.</li>
            <li>Popraw punkty przed lekcją na żywo.</li>
          </ol>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-foreground">Edytor planu lekcji</h2>
            <p class="text-sm text-muted-foreground">Korekta przed startem lekcji</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50" @click="resetPlan">
              Wróć
            </button>
            <button
              type="button"
              class="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              :disabled="isSaving"
              @click="saveAndStart"
            >
              {{ isSaving ? "Zapisywanie..." : "Zapisz i rozpocznij lekcję" }}
            </button>
          </div>
        </div>

        <div class="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div v-for="(point, idx) in lesson.plan" :key="point.id" class="rounded-xl border border-border p-4">
            <div class="mb-2 flex items-center gap-2">
              <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted-foreground">{{ idx + 1 }}</span>
              <input v-model="point.title" class="flex-1 rounded-lg border border-border bg-input-background px-3 py-2 text-foreground" placeholder="Tytuł punktu" />
            </div>
            <input
              :value="point.keywords.join(', ')"
              class="mb-2 w-full rounded-lg border border-border bg-input-background px-3 py-2 text-foreground"
              placeholder="Słowa kluczowe"
              @input="setKeywords(idx, $event.target.value)"
            />
            <textarea v-model="point.description" class="min-h-[80px] w-full rounded-lg border border-border bg-input-background p-3 text-foreground" />
            <button type="button" class="mt-2 text-sm text-destructive hover:underline" @click="removePoint(point.id)">Usuń punkt</button>
          </div>
          <button type="button" class="w-full rounded-xl border-2 border-dashed border-border py-2 text-sm text-muted-foreground hover:bg-muted/30" @click="addPoint">
            + Dodaj punkt
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";

const router = useRouter();
const { state, createLesson, uploadLessonMaterial, savePlan } = useLessonStore();
const lesson = computed(() => state.lesson);

const subject = ref("");
const title = ref("");
const month = ref(new Date().toLocaleString("pl-PL", { month: "long" }));
const rawText = ref("");
const uploadMethod = ref("text");
const selectedFile = ref(null);
const isGenerating = ref(false);
const isSaving = ref(false);

const error = ref("");
const info = ref("");

function onFile(event) {
  selectedFile.value = event.target.files?.[0] || null;
}

async function handleGenerate() {
  try {
    isGenerating.value = true;
    error.value = "";
    info.value = "";
    if (!subject.value || !title.value) {
      error.value = "Wypełnij nazwę przedmiotu i tytuł lekcji.";
      return;
    }
    const created = await createLesson({
      subject: subject.value,
      title: title.value,
      month: month.value,
      rawText: uploadMethod.value === "text" ? rawText.value : ""
    });
    await uploadLessonMaterial(created.id, {
      rawText: uploadMethod.value === "text" ? rawText.value : "",
      file: uploadMethod.value === "file" ? selectedFile.value : null
    });
    info.value = state.info;
  } catch (e) {
    error.value = e.message;
  } finally {
    isGenerating.value = false;
  }
}

function setKeywords(index, text) {
  state.lesson.plan[index].keywords = text.split(",").map((x) => x.trim()).filter(Boolean);
}

function addPoint() {
  state.lesson.plan.push({
    id: `point-${Date.now()}`,
    title: "Nowy punkt",
    keywords: [],
    description: "",
    status: "pending"
  });
}

function removePoint(id) {
  state.lesson.plan = state.lesson.plan.filter((p) => p.id !== id);
}

function resetPlan() {
  state.lesson = null;
}

async function saveAndStart() {
  try {
    isSaving.value = true;
    error.value = "";
    info.value = "";
    if (!state.lesson?.id) {
      error.value = "Brak lekcji do zapisania. Najpierw wygeneruj plan.";
      return;
    }
    if (!Array.isArray(state.lesson.plan) || !state.lesson.plan.length) {
      error.value = "Plan lekcji jest pusty. Dodaj przynajmniej jeden punkt.";
      return;
    }
    await savePlan(state.lesson.id, state.lesson.plan);
    info.value = "Plan zapisany. Przechodzę do lekcji na żywo...";
    await router.push(`/live-lesson/${state.lesson.id}`);
  } catch (e) {
    error.value = e.message || "Nie udało się zapisać planu.";
  } finally {
    isSaving.value = false;
  }
}
</script>
