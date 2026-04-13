<template>
  <div class="fixed inset-x-0 top-0 z-[56] h-14 border-b border-sidebar-border bg-sidebar px-4">
    <div class="flex h-full items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <img src="../assets/logo.svg" alt="Logo" class="h-7 w-auto object-contain opacity-95 logo" />
        <span class="truncate text-base font-semibold tracking-tight text-sidebar-foreground">CoTeach</span>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink
          to="/profile"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <a
            :href="href"
            :class="[
              'flex min-w-0 items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
            ]"
            @click="onNav(navigate)"
          >
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/60 text-xs font-bold text-primary-foreground"
            >
              <img v-if="userAvatarUrl" :src="userAvatarUrl" alt="" class="h-full w-full object-cover" />
              <span v-else>{{ userInitials }}</span>
            </span>
            <span class="truncate">Profil</span>
          </a>
        </RouterLink>
        <button
          type="button"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border text-sidebar-foreground/80 transition hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          :title="isDark ? 'Tryb dzienny' : 'Tryb nocny'"
          @click="toggleTheme"
        >
          <svg
            v-if="isDark"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4"></circle>
            <path stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
          </svg>
          <svg
            v-else
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3c.35 0 .69.02 1.03.07a7 7 0 0 0 8.76 8.72c.01.34 0 .67 0 1z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <button
    type="button"
    class="fixed left-3 top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-lg md:hidden"
    aria-label="Otwórz menu"
    @click="open = true"
  >
    <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>

  <div
    v-if="open"
    class="fixed inset-0 z-[54] bg-black/50 backdrop-blur-sm md:hidden"
    aria-hidden="true"
    @click="open = false"
  />

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-[55] flex w-[260px] flex-col border-r border-sidebar-border bg-sidebar pt-14 text-sidebar-foreground shadow-xl transition-transform duration-200 ease-out md:static md:translate-x-0 md:shadow-none',
      open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    ]"
  >
    <nav class="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Nawigacja główna">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        custom
        v-slot="{ href, navigate, isActive, isExactActive }"
      >
        <a
          :href="href"
          :class="[
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            (item.exact ? isExactActive : isActive)
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
          ]"
          @click="onNav(navigate)"
        >
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/40 text-xs font-bold text-primary">
            {{ item.short }}
          </span>
          {{ item.label }}
        </a>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "../supabase";
import { useLessonStore } from "../composables/useLessonStore";
import { useTheme } from "../composables/useTheme";

const route = useRoute();
const open = ref(false);
const { isDark, toggleTheme } = useTheme();

const { state, fetchLessons } = useLessonStore();

const userEmail = ref("");
const userAvatarUrl = ref("");
const sessionUserId = ref("");

let authListener = null;
let authDebounceTimer = null;
let routeDebounceTimer = null;

const presentationLink = computed(() => {
  const id = state.lesson?.id || state.lessons[0]?.id || "demo";
  return `/presentation/${id}`;
});

const items = computed(() => [
  { to: "/", label: "Start", short: "◆", exact: true },
  { to: "/preparation", label: "Przygotowanie", short: "1", exact: false },
  { to: "/live-lesson", label: "Lekcja na żywo", short: "2", exact: false },
  { to: presentationLink.value, label: "Prezentacja", short: "3", exact: false },
  { to: "/archive", label: "Archiwum", short: "4", exact: false },
  { to: "/admin", label: "Administracja", short: "5", exact: false },
]);

const userInitials = computed(() => {
  if (!userEmail.value) return "U";
  const local = userEmail.value.split("@")[0];
  const parts = local.split(/[.\s_-]+/).filter(Boolean);
  const initials = parts.map((p) => p[0]).join("").toUpperCase();
  return (initials || userEmail.value[0]).substring(0, 2);
});

async function loadUserAvatar(userId) {
  if (!userId) {
    userAvatarUrl.value = "";
    return;
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle();
  userAvatarUrl.value = profile?.avatar_url || "";
}

function applySession(session) {
  if (session?.user) {
    userEmail.value = session.user.email || "";
    sessionUserId.value = session.user.id;
    return loadUserAvatar(session.user.id);
  }
  userEmail.value = "";
  userAvatarUrl.value = "";
  sessionUserId.value = "";
  return Promise.resolve();
}

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  await applySession(data.session);
  void fetchLessons().catch(() => {});

  const sub = supabase.auth.onAuthStateChange((_e, session) => {
    clearTimeout(authDebounceTimer);
    authDebounceTimer = setTimeout(() => {
      void applySession(session).catch(console.error);
    }, 200);
  });
  authListener = sub.data.subscription;
});

watch(
  () => route.path,
  () => {
    open.value = false;
    if (!sessionUserId.value) return;
    clearTimeout(routeDebounceTimer);
    routeDebounceTimer = setTimeout(() => {
      void loadUserAvatar(sessionUserId.value).catch(console.error);
    }, 250);
  }
);

onUnmounted(() => {
  clearTimeout(authDebounceTimer);
  clearTimeout(routeDebounceTimer);
  authListener?.unsubscribe();
});

function onNav(navigate) {
  open.value = false;
  navigate();
}
</script>
