<template>
  <div class="fixed inset-x-0 top-0 z-[56] h-16 border-b border-sidebar-border bg-sidebar px-4">
    <div class="flex h-full items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex h-40 items-center">
          <img src="/logo.svg" alt="Logo" class="h-40 w-auto object-contain opacity-95 logo" />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar text-sidebar-foreground transition hover:bg-sidebar-accent/60"
          :title="isDark ? 'Tryb dzienny' : 'Tryb nocny'"
          :aria-label="isDark ? 'Tryb dzienny' : 'Tryb nocny'"
          @click="toggleTheme"
        >
          <svg
            v-if="isDark"
            class="h-5 w-5"
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
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3c.35 0 .69.02 1.03.07a7 7 0 0 0 8.76 8.72c.01.34 0 .67 0 1z"></path>
          </svg>
        </button>
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
            <span class="truncate">{{ userDisplayName }}</span>
          </a>
        </RouterLink>
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
      'fixed inset-y-0 left-0 z-[55] flex w-[260px] flex-col border-r border-sidebar-border bg-sidebar pt-16 text-sidebar-foreground shadow-xl transition-transform duration-200 ease-out md:translate-x-0 md:shadow-none',
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
<<<<<<< Updated upstream
    </nav>
    <div class="p-3 pt-2">
      <button
        type="button"
        class="flex w-full items-center justify-center rounded-xl border border-destructive/50 bg-destructive/10 px-3 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/20"
        @click="handleLogout"
      >
        Wyloguj
      </button>
=======

      <!-- Divider + nav links -->
      <div class="flex-1 space-y-1 border-t border-black/10 pt-4">

        <!-- Panel startowy -->
        <RouterLink to="/" custom v-slot="{ href, navigate, isActive, isExactActive }">
          <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 hover:bg-black/5', isExactActive ? 'bg-black/5' : '']" @click="onNav(navigate)">
            <svg class="h-[18px] w-[18px] shrink-0" fill="none" stroke="#566166" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <p class="text-[14px] font-semibold text-[#475569]" style="font-family: 'Plus Jakarta Sans', sans-serif;">Panel startowy</p>
          </a>
        </RouterLink>

        <!-- Dodaj materiały -->
        <RouterLink to="/preparation" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 hover:bg-black/5', isActive ? 'bg-black/5' : '']" @click="onNav(navigate)">
            <svg class="h-[18px] w-[18px] shrink-0" fill="none" stroke="#566166" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M12 18v-6" />
              <path d="M9 15l3-3 3 3" />
            </svg>
            <p class="text-[14px] font-semibold text-[#475569]" style="font-family: 'Plus Jakarta Sans', sans-serif;">Dodaj materiały</p>
          </a>
        </RouterLink>

         <RouterLink to="/notes" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 hover:bg-black/5', isActive ? 'bg-black/5' : '']" @click="onNav(navigate)">
            <svg class="h-[18px] w-[18px] shrink-0" fill="none" stroke="#566166" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="14" rx="2" />
              <path d="M12 8v6 M9 11l3-3 3 3" />
            </svg>
            <p class="text-[14px] font-semibold text-[#475569]" style="font-family: 'Plus Jakarta Sans', sans-serif;">Notatki</p>
          </a>
        </RouterLink>

        <!-- Prezentacja -->
        <RouterLink :to="presentationLink" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 hover:bg-black/5', isActive ? 'bg-black/5' : '']" @click="onNav(navigate)">
            <svg class="h-[18px] w-[18px] shrink-0" fill="none" stroke="#566166" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="14" rx="2" />
              <path d="M12 8v6 M9 11l3-3 3 3" />
            </svg>
            <p class="text-[14px] font-semibold text-[#475569]" style="font-family: 'Plus Jakarta Sans', sans-serif;">Prezentacja</p>
          </a>
        </RouterLink>

        <!-- Archiwum -->
        <RouterLink to="/archive" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 hover:bg-black/5', isActive ? 'bg-black/5' : '']" @click="onNav(navigate)">
            <svg class="h-[18px] w-[18px] shrink-0" fill="none" stroke="#566166" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
              <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
              <path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" />
            </svg>
            <p class="text-[14px] font-semibold text-[#475569]" style="font-family: 'Plus Jakarta Sans', sans-serif;">Archiwum</p>
          </a>
        </RouterLink>

        <!-- Monitoring -->
        <RouterLink to="/monitoring" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 hover:bg-black/5', isActive ? 'bg-black/5' : '']" @click="onNav(navigate)">
            <svg class="h-[18px] w-[18px] shrink-0" fill="none" stroke="#566166" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
            <p class="text-[14px] font-semibold text-[#475569]" style="font-family: 'Plus Jakarta Sans', sans-serif;">Monitoring</p>
          </a>
        </RouterLink>

        <!-- Admin -->
        <RouterLink to="/admin" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 hover:bg-black/5', isActive ? 'bg-black/5' : '']" @click="onNav(navigate)">
            <svg class="h-[18px] w-[18px] shrink-0" fill="none" stroke="#566166" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <p class="text-[14px] font-semibold text-[#475569]" style="font-family: 'Plus Jakarta Sans', sans-serif;">Panel admina</p>
          </a>
        </RouterLink>
      </div>

>>>>>>> Stashed changes
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../supabase";
import { useLessonStore } from "../composables/useLessonStore";
import { useTheme } from "../composables/useTheme";

const route = useRoute();
const router = useRouter();
const open = ref(false);
const { isDark, toggleTheme } = useTheme();

const { state, fetchLessons } = useLessonStore();

const userEmail = ref("");
const userAvatarUrl = ref("");
const userFullName = ref("");
const isAdmin = ref(false);
const sessionUserId = ref("");

function hasAdminFlag(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function hasAdminRole(roles) {
  if (!Array.isArray(roles)) return false;
  return roles.some((role) => String(role || "").toLowerCase() === "admin");
}

function detectAdminFromSession(session) {
  return (
    hasAdminFlag(session?.user?.user_metadata?.admin) ||
    hasAdminFlag(session?.user?.app_metadata?.admin) ||
    hasAdminRole(session?.user?.user_metadata?.roles) ||
    hasAdminRole(session?.user?.app_metadata?.roles)
  );
}

let authListener = null;
let authDebounceTimer = null;
let routeDebounceTimer = null;

const presentationLink = computed(() => {
  const id = state.lesson?.id || state.lessons[0]?.id || "demo";
  return `/presentation/${id}`;
});

const items = computed(() => {
  const baseItems = [
    { to: "/", label: "Start", short: "◆", exact: true },
    { to: "/preparation", label: "Przygotowanie", short: "1", exact: false },
    { to: "/live-lesson", label: "Lekcja na żywo", short: "2", exact: false },
    { to: presentationLink.value, label: "Prezentacja", short: "3", exact: false },
    { to: "/archive", label: "Archiwum", short: "4", exact: false },
  ];

  if (isAdmin.value) {
    baseItems.push({ to: "/admin/users", label: "Panel sterowania admina", short: "A", exact: false });
  }

  return baseItems;
});

const userInitials = computed(() => {
  if (!userEmail.value) return "U";
  const local = userEmail.value.split("@")[0];
  const parts = local.split(/[.\s_-]+/).filter(Boolean);
  const initials = parts.map((p) => p[0]).join("").toUpperCase();
  return (initials || userEmail.value[0]).substring(0, 2);
});

const userDisplayName = computed(() => {
  const fullName = String(userFullName.value || "").trim();
  if (fullName) return fullName;
  return "Profil";
});

async function loadUserProfile(userId) {
  if (!userId) {
    userAvatarUrl.value = "";
    userFullName.value = "";
    isAdmin.value = false;
    return;
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url, full_name, admin")
    .eq("id", userId)
    .maybeSingle();
  userAvatarUrl.value = profile?.avatar_url || "";
  userFullName.value = String(profile?.full_name || "").trim();
  const profileAdmin = hasAdminFlag(profile?.admin);
  isAdmin.value = profileAdmin || isAdmin.value;
}

function applySession(session) {
  if (session?.user) {
    userEmail.value = session.user.email || "";
    userFullName.value = String(session.user.user_metadata?.full_name || "").trim();
    sessionUserId.value = session.user.id;
    isAdmin.value = detectAdminFromSession(session);
    return loadUserProfile(session.user.id);
  }
  userEmail.value = "";
  userAvatarUrl.value = "";
  userFullName.value = "";
  isAdmin.value = false;
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
      void loadUserProfile(sessionUserId.value).catch(console.error);
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

async function handleLogout() {
  await supabase.auth.signOut();
  open.value = false;
  await router.push("/login");
}
</script>
