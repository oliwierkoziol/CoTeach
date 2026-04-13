<template>
  <div class="min-h-full px-4 py-8 sm:px-6 lg:px-10">
    <div class="mx-auto max-w-6xl">
      <header class="mb-10">
        <p class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Panel</p>
        <h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Witaj, {{ displayName }}</h1>
        <p class="mt-2 max-w-2xl text-sm text-muted-foreground">
          Nawigacja jest po lewej — tutaj masz skróty i podsumowanie.
        </p>
      </header>

      <div class="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-border bg-card p-5">
          <p class="text-xs font-medium text-muted-foreground">Lekcje</p>
          <p class="mt-2 text-2xl font-bold text-primary">{{ lessonsCount }}</p>
          <p class="mt-1 text-xs text-muted-foreground">w aplikacji</p>
        </div>
        <div class="rounded-2xl border border-border bg-card p-5">
          <p class="text-xs font-medium text-muted-foreground">Średni czas</p>
          <p class="mt-2 text-2xl font-bold text-foreground">42 min</p>
          <p class="mt-1 text-xs text-muted-foreground">orientacyjnie</p>
        </div>
        <div class="rounded-2xl border border-border bg-card p-5">
          <p class="text-xs font-medium text-muted-foreground">Realizacja planu</p>
          <p class="mt-2 text-2xl font-bold text-primary">{{ completionRate }}%</p>
          <p class="mt-1 text-xs text-muted-foreground">średnio omówionych punktów</p>
        </div>
      </div>

      <div class="rounded-2xl border border-border border-primary/25 bg-primary/5 p-5">
        <h2 class="text-sm font-semibold text-foreground">Tryb demo</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
          Aplikacja może działać z symulowanymi odpowiedziami API. Produkcja: Deepgram, Gemini, storage na notatki.
        </p>
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
const isAdmin = ref(false);

async function loadDisplayName() {
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
    .select("full_name, admin")
    .eq("id", user.id)
    .maybeSingle();

  isAdmin.value = profile?.admin === true;

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

  displayName.value = "użytkowniku";
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
