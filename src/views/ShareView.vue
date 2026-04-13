<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-2xl font-bold mb-4">Udostępniona Notatka</h1>
      <div v-if="html" class="bg-white rounded-xl border p-6" v-html="html" />
      <div v-else class="bg-white rounded-xl border p-6 text-gray-500">Notatka nie istnieje.</div>
      <RouterLink to="/" class="inline-block mt-4 text-blue-600 underline">Powrót do dashboardu</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";

const route = useRoute();
const { fetchSharedNote } = useLessonStore();
const html = ref("");

onMounted(async () => {
  try {
    const data = await fetchSharedNote(route.params.noteId);
    html.value = data.finalNote?.html || "";
  } catch {
    html.value = "";
  }
});
</script>
