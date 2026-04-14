<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground antialiased">
    <div class="flex-1">
      <template v-if="minimalChrome">
        <GuestHeader />
        <RouterView />
      </template>
      <template v-else-if="presentationMode">
        <div
          v-if="showLicenseWarning"
          class="mx-4 mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300 sm:mx-5"
        >
          Do Twojego konta nie jest przypisana żadna licencja. Skontaktuj się ze swoją organizacją.
        </div>
        <RouterView />
      </template>
      <AppLayout v-else :license-warning="showLicenseWarning">
        <RouterView />
      </AppLayout>
    </div>
    <footer class="border-t border-border bg-card/70 px-4 py-3 text-center text-xs text-muted-foreground">
      &copy; LeanMate 2026
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppLayout from "./components/AppLayout.vue";
import GuestHeader from "./components/GuestHeader.vue";
import { initTheme } from "./composables/useTheme";
import { supabase } from "./supabase";

const route = useRoute();
const router = useRouter();
const showLicenseWarning = ref(false);

function normalizeBaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "http://localhost:3001";
const minimalChrome = computed(() => {
  const p = route.path;
  return p === "/" || p === "/login" || p === "/register" || p === "/reset-password" || p.startsWith("/share/");
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

async function refreshLicenseWarning() {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) {
    showLicenseWarning.value = false;
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/account/license-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      showLicenseWarning.value = false;
      return;
    }
    showLicenseWarning.value = data?.hasActiveLicense !== true;
  } catch {
    showLicenseWarning.value = false;
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
  void refreshLicenseWarning();

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      setActivityCookie();
      void refreshLicenseWarning();
      return;
    }
    clearActivityCookie();
    showLicenseWarning.value = false;
  });
  authSubscription = data.subscription;
});

watch(
  () => route.fullPath,
  () => {
    void refreshLicenseWarning();
  }
);

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
