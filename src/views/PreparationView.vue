<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="border rounded-lg px-3 py-2 bg-white">←</RouterLink>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Przygotowanie Materiałów</h1>
            <p class="text-gray-600 mt-1">Ingestia danych i generator planu lekcji</p>
          </div>
        </div>
      </div>

      <div v-if="error" class="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 p-4">{{ error }}</div>
      <div v-if="info" class="mb-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 p-4">{{ info }}</div>

      <div v-if="!lesson || !lesson.plan?.length" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl border p-6 space-y-4">
            <h2 class="text-xl font-semibold">Podstawowe Informacje</h2>
            <div>
              <label class="text-sm">Przedmiot</label>
              <input v-model="subject" class="w-full border rounded-lg px-3 py-2 mt-1" placeholder="np. Biologia" />
            </div>
            <div>
              <label class="text-sm">Tytuł Lekcji</label>
              <input v-model="title" class="w-full border rounded-lg px-3 py-2 mt-1" placeholder="np. Fotosynteza" />
            </div>
            <div>
              <label class="text-sm">Miesiąc</label>
              <input v-model="month" class="w-full border rounded-lg px-3 py-2 mt-1" placeholder="np. Kwiecień" />
            </div>
          </div>

          <div class="bg-white rounded-xl border p-6 space-y-4">
            <h2 class="text-xl font-semibold">Materiały Źródłowe</h2>
            <div class="flex gap-2">
              <button class="px-4 py-2 rounded-lg border" :class="uploadMethod === 'text' ? 'bg-blue-600 text-white' : 'bg-white'" @click="uploadMethod = 'text'">Tekst</button>
              <button class="px-4 py-2 rounded-lg border" :class="uploadMethod === 'file' ? 'bg-blue-600 text-white' : 'bg-white'" @click="uploadMethod = 'file'">Plik</button>
            </div>

            <div v-if="uploadMethod === 'text'">
              <textarea v-model="rawText" class="w-full min-h-[260px] border rounded-lg p-3" placeholder="Wklej notatki..." />
            </div>
            <div v-else class="border-2 border-dashed rounded-lg p-8 text-center">
              <input type="file" accept=".txt,.pdf,.jpg,.jpeg,.png" @change="onFile" />
              <p class="text-sm text-gray-500 mt-2">Obsługiwane formaty: TXT, PDF, JPG, PNG</p>
              <p v-if="selectedFile" class="text-sm mt-2 font-medium">{{ selectedFile.name }}</p>
            </div>

            <button
              class="w-full py-3 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-60"
              :disabled="isGenerating"
              @click="handleGenerate"
            >
              {{ isGenerating ? "Przetwarzam..." : "Generuj Plan Lekcji z AI" }}
            </button>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 class="font-semibold mb-3">Jak to działa?</h3>
            <ol class="space-y-2 text-sm text-gray-700 list-decimal pl-4">
              <li>Wklej tekst lub prześlij plik.</li>
              <li>OCR odczyta treść (dla PDF/JPG/PNG).</li>
              <li>AI wygeneruje plan lekcji.</li>
              <li>Ręcznie popraw punkty przed live.</li>
            </ol>
          </div>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Edytor Planu Lekcji</h2>
            <p class="text-gray-600">Ręczna korekta przed startem lekcji</p>
          </div>
          <div class="flex gap-2">
            <button class="border rounded-lg px-4 py-2 bg-white" @click="resetPlan">Wróć</button>
            <button
              class="rounded-lg px-4 py-2 bg-green-600 text-white disabled:opacity-60"
              :disabled="isSaving"
              @click="saveAndStart"
            >
              {{ isSaving ? "Zapisywanie..." : "Zapisz i Rozpocznij Lekcję" }}
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl border p-6 space-y-4">
          <div v-for="(point, idx) in lesson.plan" :key="point.id" class="border-2 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs">{{ idx + 1 }}</span>
              <input v-model="point.title" class="flex-1 border rounded-lg px-3 py-2" placeholder="Tytuł punktu" />
            </div>
            <input :value="point.keywords.join(', ')" @input="setKeywords(idx, $event.target.value)" class="w-full border rounded-lg px-3 py-2 mb-2" placeholder="Słowa kluczowe" />
            <textarea v-model="point.description" class="w-full min-h-[80px] border rounded-lg p-3" />
            <button class="mt-2 text-red-600 text-sm" @click="removePoint(point.id)">Usuń punkt</button>
          </div>
          <button class="w-full border-2 border-dashed rounded-lg py-2" @click="addPoint">+ Dodaj Punkt</button>
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
