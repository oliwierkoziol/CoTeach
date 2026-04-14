<template>

    <!-- Welcome Header -->
    <header class="max-w-[1024px] mb-7 relative z-10">
      <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-4xl tracking-tight leading-10 mb-2">
        Witaj, {{ displayName }}
      </h2>
      <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-7">
        Rozpocznij nowÄ… lekcjÄ™ uĹĽywajÄ…c przycisku po lewej.
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

        <div class="rounded-xl border border-border bg-card p-6 shadow-sm md:min-h-[260px]">
          <div class="flex items-start justify-between gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden="true">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span class="rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estymacja</span>
  <!-- Main layout container -->
  <div class="bg-[#f7f9fc] dark:bg-background min-h-[calc(100vh-4rem)] relative overflow-x-hidden p-8 md:p-12 pb-14 w-full">
    <!-- Background Decoration -->
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <!-- Welcome Header -->
    <header class="max-w-[1024px] mb-7 relative z-10">
      <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] dark:text-foreground text-4xl tracking-tight leading-10 mb-2">
        Witaj, {{ displayName }}
      </h2>
      <p class="font-['Plus_Jakarta_Sans'] text-[#454652] dark:text-muted-foreground text-[18px] leading-7">
        Rozpocznij nowÄ… lekcjÄ™ uĹĽywajÄ…c przycisku po lewej.
      </p>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-full relative z-10">
      <!-- Card 1 -->
      <div class="bg-white dark:bg-card border border-transparent dark:border-border rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(20,37,136,0.1)] text-[#142588]">
            <img :src="iconOne" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-[rgba(20,37,136,0.05)] text-[#142588]">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Liczba</span>
          </div>
          <p class="mt-5 text-[16px] font-semibold uppercase tracking-wide text-muted-foreground">Ĺšredni czas</p>
          <p class="mt-2 text-[32px] font-bold leading-none text-foreground">42 min</p>
        </div>

      <!-- Card 2 -->
      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(0,89,187,0.1)] text-[#0059bb]">
            <img :src="iconTwo" alt="" class="h-5 w-5" />
          </div>
          <p class="mt-5 text-[16px] font-semibold uppercase tracking-wide text-muted-foreground">Realizacja planu</p>
          <p class="mt-2 text-[32px] font-bold leading-none text-foreground">{{ completionRate }}%</p>
          <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div class="space-y-1">
          <p class="font-['Inter'] font-medium text-[#454652] dark:text-muted-foreground text-[14px] leading-5">Liczba lekcji</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] dark:text-foreground text-[24px] leading-8">{{ lessonsCount }} lekcji</p>
          <p class="font-['Inter'] font-medium text-[#454652] dark:text-muted-foreground text-[12px] leading-5">+3 od ostatniego miesiÄ…ca</p>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="bg-white dark:bg-card border border-transparent dark:border-border rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(0,89,187,0.1)] text-[#0059bb]">
            <img :src="iconTwo" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-[rgba(0,89,187,0.05)] text-[#0059bb]">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">Estymacja</span>
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-['Inter'] font-medium text-[#454652] dark:text-muted-foreground text-[14px] leading-5">Ĺšredni czas</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] dark:text-foreground text-[24px] leading-8">48 min.</p>
          <p class="font-['Inter'] font-medium text-[#454652] dark:text-muted-foreground text-[12px] leading-5">Czas ostatniej lekcji: 52min.</p>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="bg-white dark:bg-card border border-transparent dark:border-border rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(88,35,0,0.1)] text-[#582300]">
            <img :src="iconThree" alt="" class="h-5 w-5" />
          </div>
          <div class="px-2 py-1 rounded bg-[rgba(88,35,0,0.05)] text-[#582300]">
            <span class="font-['Inter'] font-bold text-xs uppercase leading-4 text-inherit">PostÄ™p</span>
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-['Inter'] font-medium text-[#454652] dark:text-muted-foreground text-[14px] leading-5">Realizacja planu</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] dark:text-foreground text-[24px] leading-8">{{ completionRate }}% Ĺ›rednio</p>
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

const route = useRoute();
const { state, fetchLessons } = useLessonStore();

const displayName = ref("uĹĽytkowniku");

async function loadDisplayName() {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) {
    displayName.value = "uĹĽytkowniku";
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

  displayName.value = user.email?.split("@")[0] || "uĹĽytkowniku";
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
const completionRate = computed(() => {
  if (!state.lessons.length) return 0;
  const values = state.lessons.map((lesson) => {
    if (!lesson.plan?.length) return 0;
    const discussed = lesson.plan.filter((p) => p.status === "discussed").length;
    return Math.round((discussed / lesson.plan.length) * 100);
  });
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
});
</script>
