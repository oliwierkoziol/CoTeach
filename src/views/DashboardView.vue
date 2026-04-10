<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8">
        <div class="text-center sm:text-left">
          <h1 class="text-5xl font-bold text-gray-900 mb-12 mt-6">Witaj, Jan</h1>

        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white/80 backdrop-blur border border-blue-200 rounded-xl p-6">
          <div class="text-sm text-gray-600 flex items-center justify-between">
            <span>Lekcje w tym miesiącu</span>
            <span class="text-blue-600">◍</span>
          </div>
          <div class="text-2xl font-bold text-blue-600 mt-2">{{ lessonsCount }}</div>
          <p class="text-xs text-gray-500 mt-1">+3 od ostatniego miesiąca</p>
        </div>
        <div class="bg-white/80 backdrop-blur border border-green-200 rounded-xl p-6">
          <div class="text-sm text-gray-600 flex items-center justify-between">
            <span>Średni czas lekcji</span>
            <span class="text-green-600">◌</span>
          </div>
          <div class="text-2xl font-bold text-green-600 mt-2">42 min</div>
          <p class="text-xs text-gray-500 mt-1">Optymalna długość</p>
        </div>
        <div class="bg-white/80 backdrop-blur border border-purple-200 rounded-xl p-6">
          <div class="text-sm text-gray-600 flex items-center justify-between">
            <span>Efektywność realizacji</span>
            <span class="text-purple-600">⌁</span>
          </div>
          <div class="text-3xl font-bold text-purple-600 mt-2">{{ completionRate }}%</div>
          <p class="text-xs text-gray-500 mt-1">Punktów planu omówionych</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <RouterLink to="/preparation" class="block">
          <div class="rounded-2xl p-6 h-full text-white bg-blue-600 hover:shadow-xl transition-all">
            <h3 class="text-1xl font-bold mb-2">Przygotuj Materiały</h3>
            <p class="text-blue-200 mb-4">Upload plików, OCR pisma odręcznego, generowanie planu lekcji z AI</p>
            <button class="w-full bg-white/90 text-black text-sm font-medium py-2 rounded-md">Rozpocznij Przygotowanie</button>
          </div>
        </RouterLink>
        <RouterLink to="/live-lesson" class="block">
          <div class="rounded-2xl p-6 h-full text-white bg-green-600 hover:shadow-xl transition-all">
            <h3 class="text-1xl font-bold mb-2">Lekcja na Żywo</h3>
            <p class="text-green-200 mb-4">Monitoring w czasie rzeczywistym, transkrypcja audio, śledzenie postępu</p>
            <button class="w-full bg-white/90 text-black text-sm font-medium py-2 rounded-md">Rozpocznij Lekcję</button>
          </div>
        </RouterLink>
        <RouterLink :to="presentationLink" class="block">
          <div class="rounded-2xl p-6 h-full text-white bg-purple-600 hover:shadow-xl transition-all">
            <h3 class="text-1xl font-bold mb-2">Koło Ratunkowe</h3>
            <p class="text-purple-200 mb-4">Auto-prezentacja nieomówionych tematów z grafikami AI</p>
            <button class="w-full bg-white/90 text-black text-sm font-medium py-2 rounded-md">Generuj Prezentację</button>
          </div>
        </RouterLink>
        <RouterLink to="/archive" class="block">
          <div class="rounded-2xl p-6 h-full text-white bg-orange-600 hover:shadow-xl transition-all">
            <h3 class="text-1xl font-bold mb-2">Archiwum</h3>
            <p class="text-orange-200 mb-4">Złote notatki, kody QR, organizacja według przedmiot/miesiąc</p>
            <button class="w-full bg-white/90 text-black text-sm font-medium py-2 rounded-md">Przeglądaj Archiwum</button>
          </div>
        </RouterLink>
        <RouterLink to="/admin" class="block">
          <div class="rounded-2xl p-6 h-full text-white bg-gray-800 hover:shadow-xl transition-all">
            <h3 class="text-1xl font-bold mb-2">Administracja</h3>
            <p class="text-gray-400 mb-4">Licencje, monitoring kosztów API, tryb demo</p>
            <button class="w-full bg-white/90 text-black text-sm font-medium py-2 rounded-md">Panel Administracyjny</button>
          </div>
        </RouterLink>
      </div>

      <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-300 rounded-xl p-6">
        <h3 class="text-yellow-900 font-semibold text-lg mb-2">💡 Tryb Demo - Wersja Prototypowa</h3>
        <p class="text-yellow-700 text-sm">
          Ta aplikacja działa w trybie frontend-only z symulowanymi odpowiedziami API. W wersji produkcyjnej wymagane
          będzie połączenie z Deepgram (transkrypcja), Gemini (OCR i analiza) oraz cloud storage dla notatek.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useLessonStore } from "../composables/useLessonStore";

const { state, fetchLessons } = useLessonStore();

onMounted(fetchLessons);

const lessonsCount = computed(() => state.lessons.length);
const completionRate = computed(() => {
  if (!state.lessons.length) return 0;
  const values = state.lessons.map((lesson) => {
    if (!lesson.plan?.length) return 0;
    const discussed = lesson.plan.filter((p) => p.status === "discussed").length;
    return Math.round((discussed / lesson.plan.length) * 100);
  });
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
});
const presentationLink = computed(() => {
  const id = state.lesson?.id || state.lessons[0]?.id || "demo";
  return `/presentation/${id}`;
});
</script>
