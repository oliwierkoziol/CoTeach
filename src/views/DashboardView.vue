<template>
  <!-- Main layout container -->
  <div class="bg-background min-h-[calc(100vh-4rem)] relative overflow-x-hidden p-8 md:p-12 pb-14 w-full">
    <!-- Background Decoration -->
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <!-- Welcome Header -->
    <header class="mb-7 relative z-10 w-full">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-foreground text-4xl tracking-tight leading-10 mb-2">
            Witaj, {{ displayName }}
          </h2>
          <p class="font-['Plus_Jakarta_Sans'] text-muted-foreground text-[18px] leading-7">
            Rozpocznij nową lekcję używając przycisku po lewej.
          </p>
        </div>

        <!-- Class Selector -->
        <div class="w-full md:w-64 space-y-2">
          <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Filtruj według klasy</label>
          <div class="bg-card rounded-xl shadow-sm border border-border px-4 py-2 relative">
            <select v-model="selectedClass" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="all">Wszystkie klasy</option>
              <option v-for="c in userClasses" :key="c" :value="c">{{ c }}</option>
            </select>
            <div class="flex items-center justify-between pointer-events-none">
              <span class="font-bold text-foreground text-sm">{{ selectedClass === 'all' ? 'Wszystkie klasy' : selectedClass }}</span>
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-full relative z-10">
      <!-- Card 1 -->
      <div class="bg-card rounded-xl shadow-lg border border-border/50 p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
            <img :src="iconOne" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-primary/5 text-primary">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Liczba</span>
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-['Inter'] font-medium text-muted-foreground text-[14px] leading-5">Liczba lekcji</p>
          <p class="font-['Manrope'] font-bold text-foreground text-[24px] leading-8">{{ filteredLessons.length }} lekcji</p>
          <p class="font-['Inter'] font-medium text-muted-foreground text-[12px] leading-5">+3 od ostatniego miesiąca</p>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="bg-card rounded-xl shadow-lg border border-border/50 p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
            <img :src="iconTwo" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-blue-500/5 text-blue-500">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Estymacja</span>
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-['Inter'] font-medium text-muted-foreground text-[14px] leading-5">Średni czas</p>
          <p class="font-['Manrope'] font-bold text-foreground text-[24px] leading-8">48 min.</p>
          <p class="font-['Inter'] font-medium text-muted-foreground text-[12px] leading-5">Czas ostatniej lekcji: 52min.</p>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="bg-card rounded-xl shadow-lg border border-border/50 p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-orange-500/10 text-orange-500">
            <img :src="iconThree" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-orange-500/5 text-orange-500">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Postęp</span>
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-['Inter'] font-medium text-muted-foreground text-[14px] leading-5">Realizacja planu</p>
          <p class="font-['Manrope'] font-bold text-foreground text-[24px] leading-8">{{ completionRate }}% średnio</p>
        </div>
        <!-- Progress Bar -->
        <div class="mt-6">
          <div class="bg-muted h-2 w-full rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-orange-500 transition-all duration-500 w-0"
              :style="{ width: `${Math.min(100, completionRate)}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="bg-card rounded-xl shadow-lg border border-border/50 p-8 col-span-full">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-500">
            <img :src="iconFour" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-purple-500/5 text-purple-500">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Powtórka</span>
          </div>
        </div>

        <div v-if="previousLiveLesson" class="space-y-3">
          <p class="font-['Inter'] font-medium text-muted-foreground text-[14px] leading-5">Poprzednia lekcja na żywo</p>
          <p class="font-['Manrope'] font-bold text-foreground text-[24px] leading-7 line-clamp-2">
            {{ previousLiveLessonTitle }}
          </p>
          <p class="font-['Inter'] font-medium text-muted-foreground text-[12px] leading-5">
            {{ previousLiveLessonMeta }}
          </p>
          <div class="pt-1">
            <p class="font-['Inter'] font-semibold text-primary text-[12px] leading-5">
              Omówiono: {{ previousLiveLessonDiscussed }}/{{ previousLiveLessonPoints }} punktów
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-[20px] sm:px-[32px] py-[10px] mt-2 font-['Plus Jakarta Sans'] font-semibold text-[16px] text-white transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-primary"
            :disabled="summaryLoading"
            @click="handleGenerateSummary"
          >
            Wygeneruj prezentację AI
            <img :src="sparklesIcon" alt="" class="h-4 w-4" />
          </button>
          <p v-if="summaryError" class="text-sm font-medium text-red-600">{{ summaryError }}</p>
        </div>
        <div v-else class="space-y-3">
          <p class="font-['Inter'] font-medium text-muted-foreground text-[14px] leading-5">Poprzednia lekcja na żywo</p>
          <p class="font-['Inter'] font-medium text-muted-foreground text-[13px] leading-5">
            Brak zakończonych lekcji do powtórki.
          </p>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-[20px] sm:px-[32px] py-[10px] mt-2 font-['Plus Jakarta Sans'] font-semibold text-[16px] text-white transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled
          >
          Wygeneruj prezentację AI
          <img :src="sparklesIcon" alt="" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="summaryModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
        @click.self="summaryModalOpen = false"
      >
        <div class="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 border border-border shadow-xl">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h3 class="font-['Plus_Jakarta_Sans'] text-lg font-bold text-foreground">Podsumowanie lekcji</h3>
            <button
              type="button"
              class="rounded-lg bg-muted px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              @click="summaryModalOpen = false"
            >
              Zamknij
            </button>
          </div>
          <pre class="whitespace-pre-wrap font-['Plus_Jakarta_Sans'] text-[14px] leading-relaxed text-foreground">{{ summaryText }}</pre>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLessonStore } from "../composables/useLessonStore";
import { supabase } from "../supabase";
import iconOne from "../assets/1.svg";
import iconTwo from "../assets/2.svg";
import iconThree from "../assets/3.svg";
import iconFour from "../assets/4.svg";
import sparklesIcon from "../assets/sparkles.svg";

const route = useRoute();
const router = useRouter();
const { state, fetchLessons } = useLessonStore();

const displayName = ref("użytkowniku");
const summaryError = ref("");

const userClasses = ref([]);
const selectedClass = ref("all");

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
    .select("full_name, classes")
    .eq("id", user.id)
    .maybeSingle();

  const profileName = String(profile?.full_name || "").trim();
  if (profileName) {
    displayName.value = profileName;
  } else {
    const metaName = String(user.user_metadata?.full_name || "").trim();
    displayName.value = metaName || user.email?.split("@")[0] || "użytkowniku";
  }

  if (profile?.classes && Array.isArray(profile.classes)) {
    userClasses.value = profile.classes;
  }
}

onMounted(async () => {
  await Promise.allSettled([fetchLessons(), loadUserData()]);
});

watch(
  () => route.path,
  (path) => {
    if (path === "/dashboard") {
      loadUserData();
    }
  }
);

const filteredLessons = computed(() => {
  if (selectedClass.value === "all") return state.lessons;
  return state.lessons.filter(l => l.classLevel === selectedClass.value);
});

const lessonsCount = computed(() => filteredLessons.value.length);

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
