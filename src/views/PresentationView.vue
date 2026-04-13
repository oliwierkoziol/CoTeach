<template>
  <div v-if="isGenerating" class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900 text-white">
    <div class="text-center text-white">
      <h2 class="text-3xl font-bold mb-2">Generuję Koło Ratunkowe...</h2>
      <p class="text-purple-200">Tworzę slajdy z nieomówionych punktów.</p>
    </div>
  </div>

  <div v-else-if="!slides.length" class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-900 to-emerald-900 text-white">
    <div class="text-center text-white max-w-md">
      <h2 class="text-3xl font-bold mb-4">Wszystko Omówione!</h2>
      <p class="text-green-200 mb-6">Nie ma nieomówionych punktów.</p>
      <button class="rounded-lg bg-white px-4 py-2 text-black" @click="$router.back()">Powrót do Lekcji</button>
    </div>
  </div>

  <div v-else class="fixed inset-0 bg-black text-white">
    <button class="absolute right-4 top-4 z-50 rounded-lg bg-white/20 px-3 py-2 text-white" @click="$router.back()">X</button>

    <div class="h-full flex flex-col">
      <div class="flex-1 flex items-center justify-center p-12">
        <div class="max-w-5xl w-full">
          <div class="rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 p-12 text-white shadow-2xl">
            <div class="mb-8">
              <h1 class="text-5xl font-bold mb-4">{{ current.point.title }}</h1>
              <div class="flex flex-wrap gap-2">
                <span v-for="k in current.point.keywords" :key="k" class="px-4 py-2 bg-white/20 rounded-full text-lg">{{ k }}</span>
              </div>
            </div>
            <p class="text-2xl leading-relaxed opacity-90 mb-8">{{ current.point.description }}</p>
            <div class="bg-white/10 rounded-2xl p-8 border-2 border-white/20">
              <div class="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <p class="text-xl opacity-70">[Grafika DALL-E 3]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-900 border-t border-gray-700 px-8 py-4">
        <div class="max-w-5xl mx-auto flex items-center justify-between text-white">
          <button :disabled="slideIndex === 0" @click="slideIndex -= 1" class="px-3 py-2 rounded border border-white/30 disabled:opacity-30">Poprzedni</button>
          <div>{{ slideIndex + 1 }} / {{ slides.length }}</div>
          <button :disabled="slideIndex === slides.length - 1" @click="slideIndex += 1" class="px-3 py-2 rounded border border-white/30 disabled:opacity-30">Następny</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";

const route = useRoute();
const { state, fetchLessons } = useLessonStore();

const isGenerating = ref(true);
const slides = ref([]);
const slideIndex = ref(0);

const current = computed(() => slides.value[slideIndex.value] || { point: { title: "", keywords: [], description: "" } });

onMounted(async () => {
  if (!state.lesson) {
    const lessons = await fetchLessons();
    state.lesson = lessons.find((l) => l.id === route.params.lessonId) || lessons[0] || null;
  }
  setTimeout(() => {
    const plan = state.lesson?.plan || [];
    slides.value = plan
      .filter((p) => p.status !== "discussed")
      .map((point) => ({ point, imageUrl: "" }));
    isGenerating.value = false;
  }, 900);
});
</script>
