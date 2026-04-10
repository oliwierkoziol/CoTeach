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

      <div class="mt-6 text-center text-sm text-slate-600">
        Nie masz konta? <RouterLink to="/register" class="font-semibold text-blue-600 hover:underline">Zarejestruj się</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

const router = useRouter();
const email = ref("");
const password = ref("");
const errorMessage = ref("");

async function handleLogin() {
  errorMessage.value = "";

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    errorMessage.value = error.message;
    return;
  }

  router.push("/");
}
</script>
