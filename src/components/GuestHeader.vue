<template>
  <header
    class="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md sm:h-[4.5rem] sm:px-6"
  >
    <RouterLink to="/" class="flex items-center gap-2 font-semibold text-foreground no-underline sm:gap-3">
      <div class="flex h-12 items-center">
        <img src="../assets/logo.svg" alt="Logo" class="max-h-11 w-auto object-contain logo" />
      </div>
      <span class="text-base font-semibold tracking-tight">CoTeach</span>
    </RouterLink>
    <div v-if="showActions" class="flex items-center gap-2 text-sm">
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:bg-muted/60"
        :title="isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'"
        :aria-label="isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'"
        @click="toggleTheme"
      >
        <svg
          v-if="isDark"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
        <svg
          v-else
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a7 7 0 1 0 9 9a9 9 0 1 1 -9 -9" />
        </svg>
      </button>
      <RouterLink
        v-if="route.path === '/register'"
        to="/login"
        class="rounded-lg px-3 py-2 font-medium text-muted-foreground transition hover:text-foreground"
      >
        Logowanie
      </RouterLink>
      <RouterLink
        v-if="route.path === '/login'"
        to="/register"
        class="rounded-lg bg-primary px-3 py-2 font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Rejestracja
      </RouterLink>
      <RouterLink
        v-if="isLanding"
        to="/login"
        class="rounded-lg px-3 py-2 font-medium text-muted-foreground transition hover:text-foreground"
      >
        Logowanie
      </RouterLink>
      <RouterLink
        v-if="isLanding"
        to="/register"
        class="rounded-lg bg-primary px-3 py-2 font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Rejestracja
      </RouterLink>
    </div>
    <RouterLink
      v-else-if="isShare"
      to="/login"
      class="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/50"
    >
      Zaloguj się
    </RouterLink>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useTheme } from "../composables/useTheme";

const route = useRoute();
const { isDark, toggleTheme } = useTheme();
const isAuthPage = computed(() => route.path === "/login" || route.path === "/register");
const isLanding = computed(() => route.path === "/");
const showActions = computed(() => isAuthPage.value || isLanding.value);
const isShare = computed(() => route.path.startsWith("/share/"));
</script>
