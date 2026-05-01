<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] relative overflow-x-hidden p-8 md:p-12 pb-14 w-full">
    <!-- Background Decoration -->
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <div class="mx-auto max-w-[1568px] space-y-8 relative z-10">
      <header class="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px]">Kalkulator kosztów</h1>
          <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-[28px]">Szacowanie kosztu na podstawie liczby lekcji i długości lekcji.</p>
        </div>
        <RouterLink
          to="/admin/dashboard"
          class="rounded-lg bg-[#e6e8eb] px-6 py-2.5 font-['Plus_Jakarta_Sans'] text-[16px] font-semibold text-[#142588] transition hover:bg-[#d8dadd]"
        >
          Wróć do dashboardu
        </RouterLink>
      </header>

      <section class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <div class="rounded-lg bg-[#f2f4f7] border-l-4 border-[#0c3dfe] p-4 text-sm font-medium text-[#454652] mb-8">
          Kalkulator opiera się na aktualnych stawkach modeli, które używamy aby zapewnić najlepszą jakość.
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <label class="block font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">
            Liczba lekcji w całym okresie licencji
            <div class="bg-[#e0e3e6] h-[48px] relative rounded-[8px] mt-2">
              <input
                v-model.number="lessonsCount"
                type="number"
                min="0"
                class="w-full h-full bg-transparent px-4 border-none outline-none text-[#191c1e] text-[16px]"
              />
            </div>
            <span class="mt-2 block text-xs font-medium text-[#454652] opacity-70">
              Wpisz łączną liczbę lekcji, które mają odbyć się w czasie trwania licencji, a nie liczbę dzienną.
            </span>
          </label>
          <label class="block font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">
            Długość lekcji
            <div class="bg-[#e0e3e6] h-[48px] relative rounded-[8px] mt-2 flex items-center pr-4">
              <select
                v-model.number="lessonDurationMinutes"
                class="w-full h-full bg-transparent px-4 border-none outline-none text-[#191c1e] text-[16px] appearance-none cursor-pointer"
              >
                <option v-for="option in durationOptions" :key="option.minutes" :value="option.minutes">
                  {{ option.label }}
                </option>
              </select>
              <svg class="w-5 h-5 text-[#142588] opacity-40 pointer-events-none" fill="none" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </label>
        </div>

        <div class="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div class="bg-[#f8fafc] rounded-xl border border-gray-100 p-8">
            <p class="font-['Inter'] font-bold text-xs uppercase tracking-wider text-[#142588] opacity-70">Koszt 1 lekcji ({{ durationLabel }})</p>
            <p class="mt-2 font-['Manrope'] font-bold text-[#191c1e] text-[32px]">{{ currency(scaledLessonCost) }}</p>
          </div>
          <div class="bg-[#e8eefb] rounded-xl p-8">
            <p class="font-['Inter'] font-bold text-xs uppercase tracking-wider text-[#142588] opacity-70">Koszt łączny wybranych lekcji</p>
            <p class="mt-2 font-['Manrope'] font-bold text-[#0c3dfe] text-[32px]">{{ currency(selectedLessonsCost) }}</p>
          </div>
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
const usdToPln = 4.0;
const whisperUsdPerMinute = 0.006;
const openRouterInputUsdPerMillion = 0.214;
const openRouterOutputUsdPerMillion = 2.5;
const estimatedInputTokensPerLesson = 1500;
const estimatedOutputTokensPerLesson = 400;
const developerMarginPln = 0.71;

function currency(value) {
  return `~${Number(value || 0).toFixed(2)} zł`;
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

const selectedLessonsCost = computed(() => Number(lessonsCount.value || 0) * scaledLessonCost.value);
</script>
