<template>
  <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
      <RouterLink to="/" class="flex items-center no-underline">
        <img src="../assets/logo.png" alt="CoTeach logo" class="h-2 w-16 rounded-2xl object-contain logo" />
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
