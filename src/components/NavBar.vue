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

        <RouterLink
          v-if="isAuthenticated"
          to="/profile"
          class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-gradient-to-br from-indigo-500 to-slate-600 text-xs font-bold uppercase tracking-tight text-white shadow-sm ring-2 ring-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          aria-label="Profil"
        >
          <img v-if="avatarUrl" :src="avatarUrl" alt="" class="h-full w-full object-cover" />
          <span v-else class="select-none">{{ initials }}</span>
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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { supabase } from "../supabase";

const router = useRouter();
const route = useRoute();
const isAuthenticated = ref(false);
const avatarUrl = ref("");
const nameForInitials = ref("");

const initials = computed(() => {
  const raw = nameForInitials.value.trim();
  if (!raw) return "U";
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return raw.slice(0, 2).toUpperCase();
});

const updateSession = async () => {
  const { data } = await supabase.auth.getSession();
  isAuthenticated.value = !!data.session;
};

async function loadProfileChip() {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) {
    avatarUrl.value = "";
    nameForInitials.value = "";
    return;
  }
  const meta = user.user_metadata || {};
  nameForInitials.value = meta.full_name || user.email?.split("@")[0] || "";
  avatarUrl.value = meta.avatar_url || "";

  const { data: row, error } = await supabase
    .from("profiles")
    .select("full_name,avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  if (!error && row) {
    if (row.full_name) nameForInitials.value = row.full_name;
    if (row.avatar_url) avatarUrl.value = row.avatar_url;
  }
}

onMounted(async () => {
  await updateSession();
  await loadProfileChip();
  supabase.auth.onAuthStateChange(async (_event, session) => {
    isAuthenticated.value = !!session;
    if (session) await loadProfileChip();
    else {
      avatarUrl.value = "";
      nameForInitials.value = "";
    }
  });
});

watch(
  () => route.path,
  async (_path, oldPath) => {
    if (!isAuthenticated.value || oldPath !== "/profile") return;
    await loadProfileChip();
  }
);

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push("/login");
};
</script>
