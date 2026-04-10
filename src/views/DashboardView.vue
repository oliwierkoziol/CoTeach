<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8">
        <div class="text-center sm:text-left">
          <h1 class="text-5xl font-bold text-gray-900 mb-4">CoTeach</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto sm:mx-0">
            System Wspomagania Nauczyciela - Inteligentne zarządzanie lekcjami z pomocą AI
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white/80 backdrop-blur border border-blue-200 rounded-xl p-6">
          <div class="text-sm text-gray-600 flex items-center justify-between">
            <span>Lekcje w tym miesiącu</span>
            <span class="text-blue-600">◍</span>
          </div>
          <div class="text-3xl font-bold text-blue-600 mt-2">{{ lessonsCountThisMonth }}</div>
          <p class="text-xs text-gray-500 mt-1">Wszystkie zapisane: {{ lessonsTotal }}</p>
        </div>
        <div class="bg-white/80 backdrop-blur border border-green-200 rounded-xl p-6">
          <div class="text-sm text-gray-600 flex items-center justify-between">
            <span>Średni czas lekcji</span>
            <span class="text-green-600">◌</span>
          </div>
          <div class="text-3xl font-bold text-green-600 mt-2">{{ averageLessonMinutes }} min</div>
          <p class="text-xs text-gray-500 mt-1">Na podstawie zakończonych lekcji</p>
        </div>
        <div class="bg-white/80 backdrop-blur border border-purple-200 rounded-xl p-6">
          <div class="text-sm text-gray-600 flex items-center justify-between">
            <span>Pokrycie materiału</span>
            <span class="text-purple-600">⌁</span>
          </div>
          <div class="text-3xl font-bold text-purple-600 mt-2">{{ materialCoverageRate }}%</div>
          <p class="text-xs text-gray-500 mt-1">Punktów planu omówionych</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <RouterLink to="/preparation" class="block">
          <div class="rounded-2xl p-6 h-full text-white bg-gradient-to-br from-blue-500 to-indigo-600 hover:shadow-xl transition-all">
            <div class="text-4xl mb-4">📤</div>
            <h3 class="text-2xl font-bold mb-2">Przygotuj Materiały</h3>
            <p class="text-blue-100 mb-4">Upload plików, OCR pisma odręcznego, generowanie planu lekcji z AI</p>
            <button class="w-full bg-white/90 text-black text-sm font-medium py-2 rounded-md">Rozpocznij Przygotowanie</button>
          </div>
        </RouterLink>
        <RouterLink to="/live-lesson" class="block">
          <div class="rounded-2xl p-6 h-full text-white bg-gradient-to-br from-green-500 to-emerald-600 hover:shadow-xl transition-all">
            <div class="text-4xl mb-4">📡</div>
            <h3 class="text-2xl font-bold mb-2">Lekcja na Żywo</h3>
            <p class="text-green-100 mb-4">Monitoring w czasie rzeczywistym, transkrypcja audio, śledzenie postępu</p>
            <button class="w-full bg-white/90 text-black text-sm font-medium py-2 rounded-md">Rozpocznij Lekcję</button>
          </div>
        </RouterLink>
        <RouterLink :to="presentationLink" class="block">
          <div class="rounded-2xl p-6 h-full text-white bg-gradient-to-br from-purple-500 to-pink-600 hover:shadow-xl transition-all">
            <div class="text-4xl mb-4">🖥️</div>
            <h3 class="text-2xl font-bold mb-2">Koło Ratunkowe</h3>
            <p class="text-purple-100 mb-4">Auto-prezentacja nieomówionych tematów z grafikami AI</p>
            <button class="w-full bg-white/90 text-black text-sm font-medium py-2 rounded-md">Generuj Prezentację</button>
          </div>
        </RouterLink>
        <RouterLink to="/archive" class="block">
          <div class="rounded-2xl p-6 h-full text-white bg-gradient-to-br from-orange-500 to-red-600 hover:shadow-xl transition-all">
            <div class="text-4xl mb-4">🗂️</div>
            <h3 class="text-2xl font-bold mb-2">Archiwum</h3>
            <p class="text-orange-100 mb-4">Złote notatki, kody QR, organizacja według przedmiot/miesiąc</p>
            <button class="w-full bg-white/90 text-black text-sm font-medium py-2 rounded-md">Przeglądaj Archiwum</button>
          </div>
        </RouterLink>
        <RouterLink to="/admin" class="block">
          <div class="rounded-2xl p-6 h-full text-white bg-gradient-to-br from-gray-700 to-gray-900 hover:shadow-xl transition-all">
            <div class="text-4xl mb-4">⚙️</div>
            <h3 class="text-2xl font-bold mb-2">Administracja</h3>
            <p class="text-gray-300 mb-4">Licencje, monitoring kosztów API, tryb demo</p>
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

function parseLessonDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return new Date(`${value}T00:00:00`);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const lessonsTotal = computed(() => state.lessons.length);

const lessonsCountThisMonth = computed(() => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return state.lessons.filter((lesson) => {
    const lessonDate = parseLessonDate(lesson.date);
    return lessonDate && lessonDate.getMonth() === month && lessonDate.getFullYear() === year;
  }).length;
});

const averageLessonMinutes = computed(() => {
  const durations = state.lessons
    .map((lesson) => {
      if (!lesson.startedAt || !lesson.finishedAt) return null;
      const start = new Date(lesson.startedAt).getTime();
      const end = new Date(lesson.finishedAt).getTime();
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
      return (end - start) / 60000;
    })
    .filter((value) => value !== null);

  if (!durations.length) return 0;
  const total = durations.reduce((acc, value) => acc + value, 0);
  return Math.round(total / durations.length);
});

const materialCoverageRate = computed(() => {
  let totalPoints = 0;
  let discussedPoints = 0;

  for (const lesson of state.lessons) {
    const plan = Array.isArray(lesson.plan) ? lesson.plan : [];
    totalPoints += plan.length;
    discussedPoints += plan.filter((point) => point.status === "discussed").length;
  }

  if (!totalPoints) return 0;
  return Math.round((discussedPoints / totalPoints) * 100);
});

const presentationLink = computed(() => {
  const id = state.lesson?.id || state.lessons[0]?.id || "demo";
  return `/presentation/${id}`;
});
</script>
