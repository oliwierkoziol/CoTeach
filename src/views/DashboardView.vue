<template>
  <!-- Main layout container -->
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-4rem)] relative overflow-x-hidden p-8 md:p-12 pb-14 w-full">
    <!-- Background Decoration -->
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <!-- Welcome Header -->
    <header class="max-w-[1024px] mb-7 relative z-10">
      <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-4xl tracking-tight leading-10 mb-2">
        Witaj, {{ displayName }}
      </h2>
      <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-7">
        Rozpocznij nową lekcję używając przycisku po lewej.
      </p>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-full relative z-10">
      <!-- Card 1 -->
      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(20,37,136,0.1)] text-[#142588]">
            <img :src="iconOne" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-[rgba(20,37,136,0.05)] text-[#142588]">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Liczba</span>
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-['Inter'] font-medium text-[#454652] text-[14px] leading-5">Liczba lekcji</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] text-[24px] leading-8">{{ lessonsCount }} lekcji</p>
          <p class="font-['Inter'] font-medium text-[#454652] text-[12px] leading-5">+3 od ostatniego miesiąca</p>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(0,89,187,0.1)] text-[#0059bb]">
            <img :src="iconTwo" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-[rgba(0,89,187,0.05)] text-[#0059bb]">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Estymacja</span>
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-['Inter'] font-medium text-[#454652] text-[14px] leading-5">Średni czas</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] text-[24px] leading-8">48 min.</p>
          <p class="font-['Inter'] font-medium text-[#454652] text-[12px] leading-5">Czas ostatniej lekcji: 52min.</p>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(88,35,0,0.1)] text-[#582300]">
            <img :src="iconThree" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-[rgba(88,35,0,0.05)] text-[#582300]">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Postęp</span>
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-['Inter'] font-medium text-[#454652] text-[14px] leading-5">Realizacja planu</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] text-[24px] leading-8">{{ completionRate }}% średnio</p>
        </div>
        <!-- Progress Bar -->
        <div class="mt-6">
          <div class="bg-[#e6e8eb] h-2 w-full rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-[#582300] transition-all duration-500 w-0"
              :style="{ width: `${Math.min(100, completionRate)}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 col-span-full">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(0,83,219,0.08)] text-[#0053db]">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V18.5C20 19.33 19.33 20 18.5 20H5.5C4.67 20 4 19.33 4 18.5V5.5Z"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path d="M8 9H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M8 13H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M8 17H11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </div>
          <div class="px-2 py-1 rounded bg-[rgba(0,83,219,0.05)] text-[#0053db]">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Powtórka</span>
          </div>
        </div>

        <div v-if="previousLiveLesson" class="space-y-4">
          <p class="font-['Inter'] font-medium text-[#454652] text-[14px] leading-5">Poprzednia lekcja live</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] text-[20px] leading-7 line-clamp-2">
            {{ previousLiveLessonTitle }}
          </p>
          <p class="font-['Inter'] font-medium text-[#454652] text-[12px] leading-5">
            {{ previousLiveLessonMeta }}
          </p>
          <div class="pt-1">
            <p class="font-['Inter'] font-semibold text-[#0053db] text-[12px] leading-5">
              Omówiono: {{ previousLiveLessonDiscussed }}/{{ previousLiveLessonPoints }} punktów
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-[#0053db] px-5 py-2.5 font-['Inter'] font-semibold text-[14px] text-white transition-colors hover:bg-[#0046b8] cursor-pointer"
          >
            <img :src="sparklesIcon" alt="" class="h-4 w-4" />
            Wygeneruj podsumowanie
          </button>
        </div>
        <div v-else class="space-y-4">
          <p class="font-['Inter'] font-medium text-[#454652] text-[14px] leading-5">Poprzednia lekcja live</p>
          <p class="font-['Inter'] font-medium text-[#454652] text-[13px] leading-5">
            Brak zakończonych lekcji do powtórki.
          </p>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-[#0053db] px-5 py-2.5 font-['Inter'] font-semibold text-[14px] text-white transition-colors hover:bg-[#0046b8] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled
          >
            <img :src="sparklesIcon" alt="" class="h-4 w-4" />
            Wygeneruj podsumowanie
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import { supabase } from "../supabase";
import iconOne from "../assets/1.svg";
import iconTwo from "../assets/2.svg";
import iconThree from "../assets/3.svg";
import sparklesIcon from "../assets/sparkles.svg";

const route = useRoute();
const { state, fetchLessons } = useLessonStore();

const displayName = ref("użytkowniku");

async function loadDisplayName() {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) {
    displayName.value = "użytkowniku";
    return;
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();

  const profileName = String(profile?.full_name || "").trim();
  if (profileName) {
    displayName.value = profileName;
    return;
  }

  const metaName = String(user.user_metadata?.full_name || "").trim();
  if (metaName) {
    displayName.value = metaName;
    return;
  }

  displayName.value = user.email?.split("@")[0] || "użytkowniku";
}

onMounted(async () => {
  await Promise.allSettled([fetchLessons(), loadDisplayName()]);
});

watch(
  () => route.path,
  (path) => {
    if (path === "/dashboard") {
      loadDisplayName();
    }
  }
);

const lessonsCount = computed(() => state.lessons.length);
const previousLiveLesson = computed(() => {
  const finishedLessons = state.lessons
    .filter((lesson) => lesson?.status === "finished")
    .map((lesson) => ({
      lesson,
      sortTimestamp: resolveLessonTimestamp(lesson)
    }))
    .sort((a, b) => b.sortTimestamp - a.sortTimestamp);

  return finishedLessons[0]?.lesson || null;
});

const previousLiveLessonTitle = computed(() => {
  if (!previousLiveLesson.value) return "";
  return (
    String(previousLiveLesson.value.finalNote?.title || "").trim() ||
    String(previousLiveLesson.value.title || "").trim() ||
    "Bez tytułu"
  );
});

const previousLiveLessonMeta = computed(() => {
  if (!previousLiveLesson.value) return "";
  const subject = String(
    previousLiveLesson.value.finalNote?.subject || previousLiveLesson.value.subject || "Bez przedmiotu"
  ).trim();
  const date = formatLessonDate(previousLiveLesson.value);
  return `${subject} • ${date}`;
});

const previousLiveLessonPoints = computed(() => {
  if (!previousLiveLesson.value?.plan?.length) return 0;
  return previousLiveLesson.value.plan.length;
});

const previousLiveLessonDiscussed = computed(() => {
  if (!previousLiveLesson.value?.plan?.length) return 0;
  return previousLiveLesson.value.plan.filter((point) => point?.status === "discussed").length;
});

const completionRate = computed(() => {
  if (!state.lessons.length) return 0;
  const values = state.lessons.map((lesson) => {
    if (!lesson.plan?.length) return 0;
    const discussed = lesson.plan.filter((p) => p.status === "discussed").length;
    return Math.round((discussed / lesson.plan.length) * 100);
  });
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
});

function resolveLessonTimestamp(lesson) {
  const candidates = [
    lesson?.finishedAt,
    lesson?.updatedAt,
    lesson?.startedAt,
    lesson?.date
  ];

  for (const candidate of candidates) {
    const parsed = Date.parse(String(candidate || ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function formatLessonDate(lesson) {
  const dateCandidate =
    lesson?.finalNote?.date ||
    lesson?.date ||
    lesson?.finishedAt ||
    lesson?.startedAt;
  const parsedDate = Date.parse(String(dateCandidate || ""));
  if (!Number.isFinite(parsedDate)) return "brak daty";
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(parsedDate)
  );
}
</script>
