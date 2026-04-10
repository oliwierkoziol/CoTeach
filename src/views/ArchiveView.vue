<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="border rounded-lg px-3 py-2 bg-white interactive-control">←</RouterLink>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Archiwum Lekcji</h1>
            <p class="text-gray-600">Archiwizacja i dystrybucja notatek</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl border p-4">
            <input v-model="searchQuery" class="w-full border rounded-lg px-3 py-2 interactive-field" placeholder="Szukaj według przedmiotu lub tytułu..." />
          </div>

          <div v-if="!filteredLessons.length" class="bg-white rounded-xl border p-10 text-center text-gray-500">
            Brak zarchiwizowanych lekcji.
          </div>

          <div v-for="lesson in filteredLessons" :key="lesson.id" class="bg-white rounded-xl border p-4 cursor-pointer hover:border-orange-300 interactive-card" @click="selectLesson(lesson)">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-medium">{{ lesson.title }}</h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ lesson.subject }} • {{ lesson.date }} • {{ discussed(lesson) }}/{{ lesson.plan?.length || 0 }} punktów
                </p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <span class="text-xs px-2 py-1 rounded bg-gray-100">{{ lesson.date }}</span>
                <button class="text-xs px-2 py-1 rounded border bg-white hover:bg-red-50 text-red-700 interactive-control" @click.stop="removeLesson(lesson.id)">Usuń</button>
              </div>
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
            <h3 class="font-semibold">Złota Notatka</h3>
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selected.finalNote.shareUrl)}`" alt="QR" width="220" height="220" />
            <button
              class="w-full rounded-lg py-2 bg-blue-600 text-white interactive-control"
              @click="openSharedNote(selected.finalNote.shareUrl)"
            >
              Przejdź do notatki
            </button>
            <div class="pt-2 border-t space-y-3">
              <h4 class="font-medium">Edycja notatki</h4>
              <div>
                <label class="text-sm text-gray-600 block mb-1">Nazwa notatki</label>
                <input v-model="editTitle" class="w-full border rounded-lg px-3 py-2 interactive-field" placeholder="Nazwa notatki" />
              </div>
              <div>
                <label class="text-sm text-gray-600 block mb-1">Temat</label>
                <input v-model="editSubject" class="w-full border rounded-lg px-3 py-2 interactive-field" placeholder="Temat" />
              </div>
              <div class="flex gap-2">
                <button class="flex-1 border rounded-lg py-2 bg-white interactive-control" @click="resetEdit">Anuluj</button>
                <button class="flex-1 rounded-lg py-2 bg-blue-600 text-white disabled:opacity-60 interactive-control" :disabled="isSaving" @click="saveEdit">{{ isSaving ? "Zapisywanie..." : "Zapisz" }}</button>
              </div>
              <button class="w-full rounded-lg py-2 bg-red-600 text-white interactive-control" @click="removeLesson(selected.id)">Usuń notatkę</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useLessonStore } from "../composables/useLessonStore";

const { state, fetchLessons, updateLessonMeta, deleteLesson } = useLessonStore();
const searchQuery = ref("");
const selected = ref(null);
const editTitle = ref("");
const editSubject = ref("");
const isSaving = ref(false);

function syncEditorFromSelected() {
  editTitle.value = selected.value?.title || "";
  editSubject.value = selected.value?.subject || "";
}

onMounted(async () => {
  await fetchLessons();
  if (state.lessons.length) {
    selected.value = state.lessons[0];
    syncEditorFromSelected();
  }
});

const filteredLessons = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return state.lessons;
  return state.lessons.filter((l) => `${l.title} ${l.subject} ${l.date || ""}`.toLowerCase().includes(q));
});

function discussed(lesson) {
  return (lesson.plan || []).filter((p) => p.status === "discussed").length;
}

function selectLesson(lesson) {
  selected.value = lesson;
  syncEditorFromSelected();
}

function resetEdit() {
  syncEditorFromSelected();
}

async function saveEdit() {
  if (!selected.value?.id) return;
  const title = editTitle.value.trim();
  const subject = editSubject.value.trim();
  if (!title || !subject) return;

  isSaving.value = true;
  try {
    const updated = await updateLessonMeta(selected.value.id, {
      title,
      subject,
      date: selected.value.date
    });
    selected.value = updated;
    syncEditorFromSelected();
  } finally {
    isSaving.value = false;
  }
}

async function removeLesson(lessonId) {
  if (!lessonId) return;
  const ok = window.confirm("Czy na pewno chcesz usunąć notatkę i lekcję z archiwum?");
  if (!ok) return;

  await deleteLesson(lessonId);
  if (selected.value?.id === lessonId) {
    selected.value = state.lessons[0] || null;
    syncEditorFromSelected();
  }
}

function openSharedNote(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}
</script>

<style scoped>
.interactive-control {
  transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, border-color 180ms ease,
    color 180ms ease;
}

.interactive-control:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px -14px rgba(15, 23, 42, 0.6);
}

.interactive-control:active:not(:disabled) {
  transform: translateY(0);
}

.interactive-control:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.interactive-field {
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.interactive-field:hover {
  border-color: rgb(251 146 60 / 0.6);
}

.interactive-field:focus-visible {
  outline: none;
  border-color: rgb(249 115 22 / 0.9);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}

.interactive-card {
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
}

.interactive-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -22px rgba(15, 23, 42, 0.65);
}
</style>
