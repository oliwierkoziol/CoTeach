<template>
  <div class="px-4 py-6 sm:px-5">
    <div class="mx-auto max-w-none">
      <header class="mb-5">
        <h1 class="text-[44px] font-bold tracking-tight text-[#1a1b22]">
          Witaj, {{ displayName }}
        </h1>
        <p class="mt-1 text-[22px] text-slate-500">
          Aby utworzyć nową lekcję, kliknij przycisk po lewej.
        </p>
      </header>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded-xl border border-[#eceef5] bg-white p-6 shadow-sm md:min-h-[260px]">
          <div class="flex items-start justify-between gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-md bg-[#eef2ff] text-[#2d56d8]" aria-hidden="true">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <span class="rounded-md border border-[#d8e3ff] bg-[#f3f6ff] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2d56d8]">Aktualne</span>
          </div>
          <p class="mt-5 text-[16px] font-semibold uppercase tracking-wide text-slate-500">Lekcje</p>
          <p class="mt-2 text-[32px] font-bold leading-none text-[#1f2026]">{{ lessonsCount }}</p>
        </div>

        <div class="rounded-xl border border-[#eceef5] bg-white p-6 shadow-sm md:min-h-[260px]">
          <div class="flex items-start justify-between gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-md bg-[#eef2ff] text-[#2d56d8]" aria-hidden="true">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span class="rounded-md border border-[#d8e3ff] bg-[#f3f6ff] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2d56d8]">Estymacja</span>
          </div>
          <p class="mt-5 text-[16px] font-semibold uppercase tracking-wide text-slate-500">Średni czas</p>
          <p class="mt-2 text-[32px] font-bold leading-none text-[#1f2026]">42 min</p>
        </div>

        <div class="rounded-xl border border-[#eceef5] bg-white p-6 shadow-sm md:min-h-[260px]">
          <div class="flex items-start justify-between gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-md bg-[#fff3e8] text-[#7e4d2f]" aria-hidden="true">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <span class="rounded-md border border-[#eadfdb] bg-[#fbf6f3] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7e4d2f]">Postęp</span>
          </div>
          <p class="mt-5 text-[16px] font-semibold uppercase tracking-wide text-slate-500">Realizacja planu</p>
          <p class="mt-2 text-[32px] font-bold leading-none text-[#1f2026]">{{ completionRate }}%</p>
          <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-[#e1e4ec] transition-all duration-500"
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
    if (path === "/") loadDisplayName();
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
