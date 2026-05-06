<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground antialiased">
    <div class="flex-1">
      <template v-if="minimalChrome">
        <GuestHeader />
        <div class="flex-1 flex flex-col min-h-[calc(100vh-64px)]">
          <RouterView class="flex-1" />
          <footer class="mt-auto z-50 w-full border-t border-white/10 bg-background/80 backdrop-blur-md px-4 py-3 text-center text-[10px] sm:text-xs text-muted-foreground">
            &copy; Copyright CoTeach {{ new Date().getFullYear() }}. Wszelkie prawa zastrzeżone. Kopiowanie i rozpowszechnianie projektu zabronione.
          </footer>
        </div>
      </template>
      <AppLayout v-else :license-warning="showLicenseWarning">
        <RouterView />
      </AppLayout>
    </div>
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

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "";
const minimalChrome = computed(() => {
  const p = route.path;
  return p === "/" || p === "/login" || p === "/register" || p === "/reset-password" || p.startsWith("/share/");
});

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
