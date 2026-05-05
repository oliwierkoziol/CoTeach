<template>
  <!-- Main layout container -->
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-4rem)] relative overflow-x-hidden p-8 md:p-12 pb-14 w-full">
    <!-- Background Decoration -->
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <!-- Welcome Header -->
    <header class="mb-7 relative z-10 w-full">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-4xl tracking-tight leading-10 mb-2">
            Witaj, {{ displayName }}
          </h2>
          <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-7">
            Rozpocznij nową lekcję używając przycisku po lewej.
          </p>
        </div>

        <!-- Class Selector -->
        
      </div>
    </header>

    <!-- Tutorial -->
    <DashboardTutorial />

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-full relative z-10">
      <!-- Card 1 -->
      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-[#1381161a] border)] text-[#138116ff]">
            <img :src="iconOne" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-[#1381161a] text-[#138116ff]">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Liczba</span>
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-['Inter'] font-medium text-[#454652] text-[14px] leading-5">Liczba lekcji</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] text-[24px] leading-8">{{ filteredLessons.length }} lekcji</p>
          <p class="font-['Inter'] font-medium text-[#454652] text-[12px] leading-5">{{ lessonsGrowthLabel }}</p>
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
          <p class="font-['Manrope'] font-bold text-[#191c1e] text-[24px] leading-8">{{ averageLessonLength }} min.</p>
          <p class="font-['Inter'] font-medium text-[#454652] text-[12px] leading-5">Czas ostatniej lekcji: {{ lastLessonLength }}min.</p>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-[#a842001a] text-[#a84200ff]">
            <img :src="iconThree" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-[#a842001a] text-[#a84200ff]">
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
              class="h-full rounded-full bg-[#a84200] transition-all duration-500 w-0"
              :style="{ width: `${Math.min(100, completionRate)}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 col-span-full">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-[#7c00c71a] border)] text-[#7c00c7ff]">
            <img :src="iconFour" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-[#7c00c71a] text-[#7c00c7ff]">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Powtórka</span>
          </div>
        </div>

        <div v-if="previousLiveLesson" class="space-y-3">
          <p class="font-['Inter'] font-medium text-[#454652] text-[14px] leading-5">Poprzednia lekcja na żywo</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] text-[24px] leading-7 line-clamp-2">
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
            class="inline-flex items-center gap-2 rounded-lg bg-[#0053db] px-[20px] sm:px-[32px] py-[10px] mt-2 font-['Plus Jakarta Sans'] font-semibold text-[16px] text-white transition-colors hover:bg-[#0046b8] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            @click="handleGoToPresentation"
          >
            Wygeneruj prezentację AI
            <img :src="sparklesIcon" alt="" class="h-4 w-4" />
          </button>
          <p v-if="summaryError" class="text-sm font-medium text-red-600">{{ summaryError }}</p>
        </div>
        <div v-else class="space-y-3">
          <p class="font-['Inter'] font-medium text-[#454652] text-[14px] leading-5">Poprzednia lekcja na żywo</p>
          <p class="font-['Inter'] font-medium text-[#454652] text-[13px] leading-5">
            Brak zakończonych lekcji do powtórki.
          </p>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-[#0053db] px-[20px] sm:px-[32px] py-[10px] mt-2 font-['Plus Jakarta Sans'] font-semibold text-[16px] text-white transition-colors hover:bg-[#0046b8] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled
          >
          Wygeneruj prezentację AI
          <img :src="sparklesIcon" alt="" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import { supabase } from "../supabase";
import DashboardTutorial from "../components/DashboardTutorial.vue";
import iconOne from "../assets/1.svg";
import iconTwo from "../assets/2.svg";
import iconThree from "../assets/3.svg";
import iconFour from "../assets/4.svg";
import sparklesIcon from "../assets/sparkles.svg";

const route = useRoute();
const router = useRouter();
const { state, fetchLessons, fetchUserClasses } = useLessonStore();

const displayName = ref("użytkowniku");
const summaryError = ref("");

const userClasses = ref([]);

async function loadUserData() {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) {
    displayName.value = "użytkowniku";
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const profileName = String(profile?.full_name || "").trim();
  const metaName = String(user.user_metadata?.full_name || "").trim();
  const fullName = profileName || metaName || user.email?.split("@")[0] || "użytkowniku";

  displayName.value = fullName.split(/\s+/)[0];
}

onMounted(async () => {
  await Promise.allSettled([
    fetchLessons(),
    loadUserData(),
    fetchUserClasses()
  ]);
});

watch(
  () => route.path,
  (path) => {
    if (path === "/dashboard") {
      loadUserData();
    }
  }
);

// Keep local userClasses in sync with the store
watch(() => state.userClasses, (newClasses) => {
  userClasses.value = newClasses;
}, { immediate: true });


const filteredLessons = computed(() => {
  if (!state.selectedClass) return state.lessons;
  return state.lessons.filter(l => l.class_name === state.selectedClassName);
});

const lessonsCount = computed(() => filteredLessons.value.length);

const lessonsGrowthLabel = computed(() => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  let currentCount = 0;
  let prevCount = 0;

  filteredLessons.value.forEach((lesson) => {
    const ts = resolveLessonTimestamp(lesson);
    if (ts === 0) return;
    
    if (ts >= startOfCurrentMonth) {
      currentCount++;
    } else if (ts >= startOfPrevMonth && ts < startOfCurrentMonth) {
      prevCount++;
    }
  });

  const diff = currentCount - prevCount;
  const prefix = diff >= 0 ? "+" : "";
  return `${prefix}${diff} od ostatniego miesiąca`;
});

const averageLessonLength = computed(() => {
  if (!filteredLessons.value.length) return 0;
  const totalLength = filteredLessons.value.reduce((sum, lesson) => sum + (lesson.length || 0), 0);
  return Math.round(totalLength / filteredLessons.value.length);
});

const lastLessonLength = computed(() => {
  if (!previousLiveLesson.value) return 0;
  return previousLiveLesson.value.length || 0;
});


const previousLiveLesson = computed(() => {
  const finishedLessons = filteredLessons.value
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
  if (!filteredLessons.value.length) return 0;
  const values = filteredLessons.value.map((lesson) => {
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

function handleGoToPresentation() {
  summaryError.value = "";
  if (!previousLiveLesson.value?.id) {
    summaryError.value = "Brak lekcji do wygenerowania prezentacji.";
    return;
  }
  router.push({
    path: `/presentation/${previousLiveLesson.value.id}`,
    query: { generate: "1", present: "1", scope: "full" }
  });
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
