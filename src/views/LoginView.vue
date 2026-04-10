<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Logowanie</h1>
        <p class="mt-2 text-slate-500">Zaloguj się, aby kontynuować pracę z CoTeach.</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <label class="block text-sm font-medium text-slate-700">
          Email
          <input v-model="email" type="email" required class="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="twoj@email.com" />
        </label>

        <label class="block text-sm font-medium text-slate-700">
          Hasło
          <input v-model="password" type="password" required class="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="••••••••" />
        </label>

        <button type="submit" class="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition">Zaloguj się</button>
      </form>

      <div v-if="errorMessage" class="mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {{ errorMessage }}
      </div>

      <div v-if="shouldShowBlockedImage" class="mt-4 flex justify-center">
        <img
          :src="blockedImage"
          alt="Konto zablokowane"
          class="w-40 h-40 object-contain"
        />
      </div>

      <div class="mt-6 text-center text-sm text-slate-600">
        Nie masz konta? <RouterLink to="/register" class="font-semibold text-blue-600 hover:underline">Zarejestruj się</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "../supabase";
import blockedImage from "../assets/logo.png";

const PENDING_PROFILE_SEED_KEY = "pendingProfileSeed";
const route = useRoute();
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const shouldShowBlockedImage = computed(() =>
  String(errorMessage.value || "").toLowerCase().includes("zablokowane")
);

function setBlockedError() {
  errorMessage.value = "To konto jest obecnie zablokowane.";
}

function readPendingProfileSeed() {
  try {
    const raw = localStorage.getItem(PENDING_PROFILE_SEED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      email: String(parsed.email || "").trim().toLowerCase(),
      full_name: String(parsed.full_name || "").trim(),
      created_at: Number(parsed.created_at || 0)
    };
  } catch {
    return null;
  }
}

async function syncProfileAfterLogin(session) {
  const user = session?.user;
  if (!user?.id) return;

  const pending = readPendingProfileSeed();
  const authEmail = String(user.email || "").trim().toLowerCase();
  const metadataName = String(user.user_metadata?.full_name || "").trim();
  const fullName =
    pending && pending.email === authEmail && pending.full_name ? pending.full_name : metadataName;

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: authEmail || null,
      full_name: fullName || null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  if (fullName && fullName !== metadataName) {
    await supabase.auth.updateUser({
      data: {
        full_name: fullName
      }
    });
  }

  localStorage.removeItem(PENDING_PROFILE_SEED_KEY);
}

async function handleLogin() {
  errorMessage.value = "";

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });

  if (error) {
    errorMessage.value = error.message;
    return;
  }

  if (!data.session) {
    errorMessage.value =
      "Brak sesji po logowaniu. Jeśli konto wymaga potwierdzenia e-mail, użyj linku z wiadomości.";
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("blocked")
    .eq("id", data.session.user.id)
    .maybeSingle();

  if (!profileError && profile?.blocked === true) {
    await supabase.auth.signOut({ scope: "local" });
    setBlockedError();
    return;
  }

  try {
    await syncProfileAfterLogin(data.session);
  } catch {
    // Login should still succeed even if profile sync fails transiently.
  }

  window.location.assign("/");
}

onMounted(() => {
  if (String(route.query.blocked || "") === "1") {
    setBlockedError();
  }
});
</script>
