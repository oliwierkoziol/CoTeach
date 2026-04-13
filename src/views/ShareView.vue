<template>
  <div class="min-h-[calc(100vh-3.5rem)] px-4 py-10 sm:px-6">
    <div class="mx-auto max-w-5xl">
      <h1 class="mb-6 text-2xl font-bold text-foreground">Udostępniona notatka</h1>
      <div
        v-if="html"
        class="rounded-2xl border border-border bg-card p-8 text-card-foreground [&_a]:text-primary [&_h1]:mb-5 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-4 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-3 [&_li]:leading-7"
        v-html="html"
      />
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
