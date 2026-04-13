<template>
  <div class="min-h-screen bg-background text-foreground antialiased">
    <template v-if="minimalChrome">
      <GuestHeader />
      <RouterView />
    </template>
    <RouterView v-else-if="presentationMode" />
    <AppLayout v-else>
      <RouterView />
    </AppLayout>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppLayout from "./components/AppLayout.vue";
import GuestHeader from "./components/GuestHeader.vue";
import { initTheme } from "./composables/useTheme";
import { supabase } from "./supabase";

const route = useRoute();
const router = useRouter();
const minimalChrome = computed(() => {
  const p = route.path;
  return p === "/" || p === "/login" || p === "/register" || p.startsWith("/share/");
});

/** Pełny ekran — bez lewego panelu (nakładka fixed ma sensowny układ). */
const presentationMode = computed(() => route.path.startsWith("/presentation/"));

const INACTIVITY_COOKIE = "coteach_last_activity";
const INACTIVITY_LIMIT_MS = 60 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

let inactivityTimer = null;
let authSubscription = null;
let lastCookieWrite = 0;

function setActivityCookie(timestamp = Date.now()) {
  document.cookie = `${INACTIVITY_COOKIE}=${timestamp}; path=/; max-age=3600; samesite=lax`;
}

function clearActivityCookie() {
  document.cookie = `${INACTIVITY_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

function getActivityCookie() {
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${INACTIVITY_COOKIE}=`));
  if (!cookie) return 0;
  const value = Number(cookie.split("=")[1]);
  return Number.isFinite(value) ? value : 0;
}

function markActivity() {
  const now = Date.now();
  if (now - lastCookieWrite < 5000) return;
  lastCookieWrite = now;
  setActivityCookie(now);
}

async function checkInactivityLogout() {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    clearActivityCookie();
    return;
  }

  const lastActivity = getActivityCookie();
  if (!lastActivity) {
    setActivityCookie();
    return;
  }

  if (Date.now() - lastActivity < INACTIVITY_LIMIT_MS) return;

  await supabase.auth.signOut();
  clearActivityCookie();
  if (route.path !== "/login") {
    await router.push("/login");
  }
}

onMounted(() => {
  initTheme();

  ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, markActivity, { passive: true });
  });

  inactivityTimer = window.setInterval(() => {
    void checkInactivityLogout();
  }, 60000);

  void checkInactivityLogout();

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      setActivityCookie();
      return;
    }
    clearActivityCookie();
  });
  authSubscription = data.subscription;
});

onUnmounted(() => {
  ACTIVITY_EVENTS.forEach((eventName) => {
    window.removeEventListener(eventName, markActivity);
  });
  if (inactivityTimer) {
    window.clearInterval(inactivityTimer);
  }
  authSubscription?.unsubscribe();
});
</script>
