<template>
  <div class="min-h-[calc(100vh-3.5rem)] px-4 py-10 sm:px-6">
    <div class="mx-auto max-w-3xl">
      <h1 class="mb-6 text-2xl font-bold text-foreground">Udostępniona notatka</h1>
      <div v-if="html" class="rounded-2xl border border-border bg-card p-6 text-card-foreground [&_a]:text-primary" v-html="html" />
      <div v-else class="rounded-2xl border border-border bg-card p-6 text-muted-foreground">Notatka nie istnieje.</div>
      <RouterLink to="/login" class="mt-6 inline-block text-sm font-semibold text-primary hover:underline"> Zaloguj się do CoTeach </RouterLink>
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
