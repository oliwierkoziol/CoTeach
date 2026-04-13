<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="border rounded-lg px-3 py-2 bg-white">←</RouterLink>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Archiwum Lekcji</h1>
            <p class="text-gray-600">Archiwizacja i dystrybucja notatek</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl border p-4">
            <input v-model="searchQuery" class="w-full border rounded-lg px-3 py-2" placeholder="Szukaj według przedmiotu lub tytułu..." />
          </div>

          <div v-if="!filteredLessons.length" class="bg-white rounded-xl border p-10 text-center text-gray-500">
            Brak zarchiwizowanych lekcji.
          </div>

          <div v-for="lesson in filteredLessons" :key="lesson.id" class="bg-white rounded-xl border p-4 cursor-pointer hover:border-orange-300" @click="selectLesson(lesson)">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-medium">{{ lesson.title }}</h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ lesson.subject }} • {{ lesson.date }} • {{ discussed(lesson) }}/{{ lesson.plan?.length || 0 }} punktów
                </p>
              </div>
              <span class="text-xs px-2 py-1 rounded bg-gray-100">{{ lesson.month }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
            <h3 class="font-semibold mb-2">Moduły archiwum</h3>
            <ul class="text-sm space-y-1">
              <li>Generator złotej notatki</li>
              <li>Cloud storage i QR</li>
              <li>Struktura przedmiot/miesiąc</li>
              <li>Archiwizacja ZIP</li>
            </ul>
          </div>

          <div v-if="selected?.finalNote" class="bg-white rounded-xl border p-6 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-semibold">Złota Notatka</h3>
              <button class="px-3 py-2 rounded-lg border border-red-300 text-red-700 bg-red-50 text-sm" @click="handleDeleteFinalNote" :disabled="saving">
                Usuń notatkę
              </button>
            </div>

            <div>
              <label class="text-sm text-gray-600 block mb-1">Nazwa notatki</label>
              <input v-model="editTitle" class="w-full border rounded-lg px-3 py-2" placeholder="Tytuł notatki" />
            </div>

            <div>
              <label class="text-sm text-gray-600 block mb-1">Temat</label>
              <input v-model="editSubject" class="w-full border rounded-lg px-3 py-2" placeholder="Przedmiot" />
            </div>

            <div>
              <label class="text-sm text-gray-600 block mb-1">Data</label>
              <input v-model="editDate" type="date" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <button class="w-full px-3 py-2 rounded-lg bg-orange-600 text-white text-sm" :disabled="saving" @click="handleSaveFinalNote">
              {{ saving ? "Zapisywanie..." : "Zapisz zmiany" }}
            </button>

            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selected.finalNote.shareUrl)}`" alt="QR" width="220" height="220" />

            <button class="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm" @click="openFinalNote">
              Przenieś do notatki
            </button>
          </div>

          <div v-else-if="selected" class="bg-white rounded-xl border p-6 text-sm text-gray-600">
            Dla tej lekcji nie ma jeszcze notatki końcowej.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useLessonStore } from "../composables/useLessonStore";

const { state, fetchLessons, updateFinalNote, deleteFinalNote } = useLessonStore();
const searchQuery = ref("");
const selected = ref(null);
const saving = ref(false);
const editTitle = ref("");
const editSubject = ref("");
const editDate = ref("");

onMounted(async () => {
  await fetchLessons();
  if (state.lessons.length) selectLesson(state.lessons[0]);
});

const filteredLessons = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return state.lessons;
  return state.lessons.filter((l) => `${l.title} ${l.subject} ${l.month}`.toLowerCase().includes(q));
});

function discussed(lesson) {
  return (lesson.plan || []).filter((p) => p.status === "discussed").length;
}

function selectLesson(lesson) {
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

async function handleDeleteFinalNote() {
  if (!selected.value?.id || !selected.value?.finalNote) return;
  const confirmed = window.confirm("Na pewno usunąć notatkę końcową dla tej lekcji?");
  if (!confirmed) return;
  try {
    saving.value = true;
    const lesson = await deleteFinalNote(selected.value.id);
    selectLesson(lesson);
  } finally {
    saving.value = false;
  }
}

function openFinalNote() {
  if (!selected.value?.finalNote?.shareUrl) return;
  window.open(selected.value.finalNote.shareUrl, "_blank", "noopener,noreferrer");
}
</script>
