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
          class="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800 transition"
        >
          Zaloguj się
        </RouterLink>

        <RouterLink
          v-if="!isAuthenticated"
          to="/register"
          class="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/10 border border-slate-200 hover:bg-slate-50 transition"
        >
          Zarejestruj się za darmo
        </RouterLink>

        <!-- Profile Dropdown -->
        <div v-if="isAuthenticated" class="relative">
          <button
            @click="toggleProfileMenu"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-slate-600 text-sm font-bold text-white shadow-lg hover:shadow-xl transition hover:from-blue-600 hover:to-slate-700"
            :title="userEmail"
          >
            {{ userInitials }}
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showProfileMenu"
            class="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-xl border border-slate-200 overflow-hidden z-10"
          >
            <div class="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <p class="text-sm font-semibold text-slate-900">{{ userEmail }}</p>
            </div>
            <RouterLink
              to="/profile"
              class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 transition"
              @click="showProfileMenu = false"
            >
              👤 Profil
            </RouterLink>
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-red-50 transition border-t border-slate-200"
            >
              🚪 Wyloguj
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

const router = useRouter();
const isAuthenticated = ref(false);
const userEmail = ref("");
const showProfileMenu = ref(false);

const userInitials = computed(() => {
  if (!userEmail.value) return "U";
  const parts = userEmail.value.split("@");
  const initials = parts[0]
    .split(".")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (initials || userEmail.value[0]).substring(0, 2);
});

const updateSession = async () => {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    isAuthenticated.value = true;
    userEmail.value = data.session.user?.email || "";
  } else {
    isAuthenticated.value = false;
    userEmail.value = "";
  }
};

onMounted(async () => {
  await updateSession();
  supabase.auth.onAuthStateChange((_event, session) => {
    isAuthenticated.value = !!session;
    userEmail.value = session?.user?.email || "";
  });
});

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
};

const handleLogout = async () => {
  showProfileMenu.value = false;
  await supabase.auth.signOut();
  router.push("/login");
};
</script>
