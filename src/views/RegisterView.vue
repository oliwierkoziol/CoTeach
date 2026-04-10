<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Rejestracja</h1>
        <p class="mt-2 text-slate-500">Utwórz konto i rozpocznij pracę z CoTeach.</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <label class="block text-sm font-medium text-slate-700">
          Imię i nazwisko
          <input v-model="name" type="text" required class="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Jan Kowalski" />
        </label>

        <label class="block text-sm font-medium text-slate-700">
          Email
          <input v-model="email" type="email" required class="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="twoj@email.com" />
        </label>

        <label class="block text-sm font-medium text-slate-700">
          Hasło
          <input v-model="password" type="password" required class="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="••••••••" />
        </label>

        <button type="submit" class="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-700 transition">Zarejestruj się</button>
      </form>

      <div v-if="errorMessage" class="mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {{ errorMessage }}
      </div>

      <div v-if="infoMessage" class="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
        {{ infoMessage }}
      </div>

      <div class="mt-6 text-center text-sm text-slate-600">
        Masz już konto? <RouterLink to="/login" class="font-semibold text-indigo-600 hover:underline">Zaloguj się</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

const PENDING_PROFILE_SEED_KEY = "pendingProfileSeed";

const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const infoMessage = ref("");

async function upsertProfileRow({ id, email, fullName }) {
  if (!id) return;
  await supabase.from("profiles").upsert(
    {
      id,
      email: email || null,
      full_name: fullName || null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );
}

async function handleRegister() {
  errorMessage.value = "";
  infoMessage.value = "";

  const fullName = String(name.value || "").trim();
  const normalizedEmail = String(email.value || "").trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: password.value,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    errorMessage.value = error.message;
    return;
  }

  const userId = data?.user?.id || "";
  const session = data?.session;

  if (session && userId) {
    try {
      await upsertProfileRow({
        id: userId,
        email: normalizedEmail,
        fullName
      });
      localStorage.removeItem(PENDING_PROFILE_SEED_KEY);
    } catch {
      // Keep registration successful even if profile upsert is temporarily unavailable.
    }
    router.push("/");
    return;
  }

  if (data?.user) {
    localStorage.setItem(
      PENDING_PROFILE_SEED_KEY,
      JSON.stringify({ email: normalizedEmail, full_name: fullName, created_at: Date.now() })
    );
    infoMessage.value =
      "Konto utworzone. Jeśli projekt wymaga potwierdzenia e-mail, sprawdź skrzynkę i dopiero wtedy zaloguj się.";
  }
}
</script>
