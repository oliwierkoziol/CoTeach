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
    <div v-if="isAuthPage" class="flex items-center gap-2 text-sm">
      <button
        type="button"
        class="rounded-lg border border-border px-3 py-2 font-medium text-foreground transition hover:bg-muted/50"
        @click="toggleTheme"
      >
        {{ isDark ? "Dzienny" : "Nocny" }}
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
const isShare = computed(() => route.path.startsWith("/share/"));
</script>
