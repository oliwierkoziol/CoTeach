<template>
  <div class="min-h-screen bg-background text-foreground antialiased">
    <template v-if="minimalChrome">
      <GuestHeader />
      <RouterView />
    </template>
    <RouterView v-else-if="presentationMode" />
    <div v-else class="flex min-h-screen">
      <AppSidebar />
      <main class="min-h-screen min-w-0 flex-1 overflow-x-hidden pt-[4.5rem] md:ml-[260px]">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "./components/AppSidebar.vue";
import GuestHeader from "./components/GuestHeader.vue";
import { initTheme } from "./composables/useTheme";

const route = useRoute();
const minimalChrome = computed(() => {
  const p = route.path;
  return p === "/login" || p === "/register" || p.startsWith("/share/");
});

/** Pełny ekran — bez lewego panelu (nakładka fixed ma sensowny układ). */
const presentationMode = computed(() => route.path.startsWith("/presentation/"));

onMounted(() => {
  initTheme();
});
</script>
