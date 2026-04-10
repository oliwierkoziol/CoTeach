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

          <div v-for="lesson in filteredLessons" :key="lesson.id" class="bg-white rounded-xl border p-4 cursor-pointer hover:border-orange-300" @click="selected = lesson">
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
            <h3 class="font-semibold">Złota Notatka</h3>
            <a class="text-blue-600 underline break-all" :href="selected.finalNote.shareUrl" target="_blank">{{ selected.finalNote.shareUrl }}</a>
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selected.finalNote.shareUrl)}`" alt="QR" width="220" height="220" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useLessonStore } from "../composables/useLessonStore";

const { state, fetchLessons } = useLessonStore();
const searchQuery = ref("");
const selected = ref(null);

onMounted(async () => {
  await fetchLessons();
  if (state.lessons.length) selected.value = state.lessons[0];
});

const filteredLessons = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return state.lessons;
  return state.lessons.filter((l) => `${l.title} ${l.subject} ${l.month}`.toLowerCase().includes(q));
});

function discussed(lesson) {
  return (lesson.plan || []).filter((p) => p.status === "discussed").length;
}
</script>
