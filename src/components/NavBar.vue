<template>
  <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
      <RouterLink to="/" class="flex items-center gap-3 no-underline">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">CT</div>
        <div>
          <p class="text-lg font-semibold text-slate-900">CoTeach</p>
          <p class="text-xs text-slate-500">Nauczanie wspomagane AI</p>
        </div>
      </RouterLink>

      <div class="flex items-center gap-3">
        <RouterLink
          v-if="!isAuthenticated"
          to="/login"
          class="rounded-md bg-black px-5 py-2 text-sm font-medium text-white"
        >
          Zaloguj się
        </RouterLink>

        <RouterLink
          v-if="!isAuthenticated"
          to="/register"
          class="rounded-md bg-black px-5 py-2 text-sm font-medium text-white"
        >
          Zarejestruj się za darmo
        </RouterLink>

        <button
          v-if="isAuthenticated"
          @click="handleLogout"
          class="rounded-md bg-black px-5 py-2 text-sm font-medium text-white"
        >
          Wyloguj
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

const router = useRouter();
const isAuthenticated = ref(false);

const updateSession = async () => {
  const { data } = await supabase.auth.getSession();
  isAuthenticated.value = !!data.session;
};

onMounted(async () => {
  await updateSession();
  supabase.auth.onAuthStateChange((_event, session) => {
    isAuthenticated.value = !!session;
  });
});

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push("/login");
};
</script>
