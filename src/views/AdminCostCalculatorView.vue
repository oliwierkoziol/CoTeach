<template>
  <div class="min-h-full px-4 py-8 sm:px-6 lg:px-10">
    <div class="mx-auto max-w-5xl space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Panel admina</p>
          <h1 class="text-3xl font-bold text-foreground">Kalkulator kosztów licencji</h1>
          <p class="mt-1 text-sm text-muted-foreground">Szacowanie kosztu na podstawie liczby lekcji i czasu licencji.</p>
        </div>
        <RouterLink
          to="/admin/dashboard"
          class="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40"
        >
          Wróć do dashboardu
        </RouterLink>
      </header>

      <section class="rounded-2xl border border-border bg-card p-6">
        <div class="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          Kalkulator opiera się na aktualnych stawkach modeli, które używamy aby zapewnić najlepszą jakość.
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label class="block text-sm text-muted-foreground">
            Liczba lekcji w całym okresie licencji
            <input
              v-model.number="lessonsCount"
              type="number"
              min="0"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
            <span class="mt-1 block text-xs text-muted-foreground">
              Wpisz łączną liczbę lekcji, które mają odbyć się w czasie trwania licencji, a nie liczbę dzienną.
            </span>
          </label>
          <label class="block text-sm text-muted-foreground">
            Długość lekcji
            <select
              v-model.number="lessonDurationMinutes"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            >
              <option v-for="option in durationOptions" :key="option.minutes" :value="option.minutes">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label class="block text-sm text-muted-foreground">
            Czas licencji (dni)
            <input
              v-model.number="licenseDays"
              type="number"
              min="1"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
          </label>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div class="rounded-xl border border-border bg-muted/20 p-4">
            <p class="text-xs uppercase tracking-[0.16em] text-muted-foreground">Koszt 1 lekcji {{ durationLabel }}</p>
            <p class="mt-2 text-2xl font-black text-foreground">{{ currency(scaledLessonCost) }}</p>
          </div>
          <div class="rounded-xl border border-border bg-muted/20 p-4">
            <p class="text-xs uppercase tracking-[0.16em] text-muted-foreground">Lekcje w czasie licencji</p>
            <p class="mt-2 text-2xl font-black text-foreground">{{ lessonsInWindow }}</p>
          </div>
          <div class="rounded-xl border border-border bg-muted/20 p-4">
            <p class="text-xs uppercase tracking-[0.16em] text-muted-foreground">Koszt wybranych lekcji</p>
            <p class="mt-2 text-2xl font-black text-foreground">{{ currency(selectedLessonsCost) }}</p>
          </div>
          <div class="rounded-xl border border-border bg-muted/20 p-4">
            <p class="text-xs uppercase tracking-[0.16em] text-muted-foreground">Koszt okresu licencji</p>
            <p class="mt-2 text-2xl font-black text-foreground">{{ currency(licenseWindowCost) }}</p>
          </div>
        </div>

        <div class="mt-4 rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          Kalkulator liczy koszt także wtedy, gdy podana liczba lekcji wykracza poza zakres licencji. To tylko punkt odniesienia do szacowania kosztu.
        </div>

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Whisper 45 min: <span class="font-semibold text-foreground">{{ currency(whisperCost45MinPln) }}</span>
          </div>
          <div class="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Modele / API: <span class="font-semibold text-foreground">{{ currency(modelApiCost45MinPln) }}</span>
          </div>
          <div class="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Marża devów: <span class="font-semibold text-foreground">{{ currency(developerMarginPln) }}</span>
          </div>
        </div>

        <div class="mt-6 rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          Przy długości lekcji {{ durationLabel }} i licencji na {{ licenseDays }} dni mieści się około
          <span class="font-semibold text-foreground">{{ lessonsInWindow }}</span> lekcji.
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const durationOptions = [
  { label: "45 min", minutes: 45 },
  { label: "1h 30 min", minutes: 90 },
  { label: "2h", minutes: 120 },
  { label: "2h 15 min", minutes: 135 },
  { label: "3h", minutes: 180 }
];

const lessonsCount = ref(10);
const lessonDurationMinutes = ref(45);
const licenseDays = ref(30);
const usdToPln = 4.0;
const whisperUsdPerMinute = 0.006;
const openRouterInputUsdPerMillion = 0.214;
const openRouterOutputUsdPerMillion = 2.5;
const estimatedInputTokensPerLesson = 1500;
const estimatedOutputTokensPerLesson = 400;
const developerMarginPln = 0.71;

function currency(value) {
  return `${Number(value || 0).toFixed(2)} zł`;
}

const durationLabel = computed(() => {
  const minutes = Number(lessonDurationMinutes.value || 45);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder} min`;
});

const durationMultiplier = computed(() => Number(lessonDurationMinutes.value || 45) / 45);
const whisperCost45MinPln = computed(() => 45 * whisperUsdPerMinute * usdToPln);
const modelApiCost45MinPln = computed(() => {
  const inputCostUsd = (estimatedInputTokensPerLesson / 1_000_000) * openRouterInputUsdPerMillion;
  const outputCostUsd = (estimatedOutputTokensPerLesson / 1_000_000) * openRouterOutputUsdPerMillion;
  return (inputCostUsd + outputCostUsd) * usdToPln;
});
const baseLessonCost45MinPln = computed(() =>
  Number((whisperCost45MinPln.value + modelApiCost45MinPln.value + developerMarginPln).toFixed(2))
);
const scaledLessonCost = computed(() => baseLessonCost45MinPln.value * durationMultiplier.value);

const lessonsInWindow = computed(() => {
  const minutesPerLesson = Number(lessonDurationMinutes.value || 45);
  return Math.floor((Number(licenseDays.value || 0) * 24 * 60) / minutesPerLesson);
});

const selectedLessonsCost = computed(() => Number(lessonsCount.value || 0) * scaledLessonCost.value);
const licenseWindowCost = computed(() => lessonsInWindow.value * scaledLessonCost.value);
</script>
