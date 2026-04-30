<template>
  <div class="grid min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-sidebar via-background to-card px-4 py-10 sm:px-6">
    <div class="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
      <h1 class="text-2xl font-bold text-foreground">Ustaw nowe hasło</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Wprowadź nowe hasło dla swojego konta.
      </p>

      <div v-if="errorMessage" class="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
        {{ errorMessage }}
      </div>

      <div v-if="infoMessage" class="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-300">
        {{ infoMessage }}
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="handleResetPassword">
        <label class="block text-sm font-semibold text-foreground">
          Nowe hasło
          <input
            v-model="newPassword"
            type="password"
            required
            minlength="8"
            class="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            placeholder="Minimum 8 znaków"
          />
        </label>

        <label class="block text-sm font-semibold text-foreground">
          Powtórz hasło
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="8"
            class="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            placeholder="Powtórz hasło"
          />
        </label>

        <button
          type="submit"
          class="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          :disabled="isSubmitting || !canSubmit"
        >
          {{ isSubmitting ? "Zapisywanie..." : "Zapisz nowe hasło" }}
        </button>
      </form>

      <div class="mt-6 flex justify-end">
        <button
          type="button"
          class="text-sm font-semibold text-primary transition hover:opacity-80"
          @click="goToLogin"
        >
          Wróć do logowania
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

const router = useRouter();

const newPassword = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");
const infoMessage = ref("");
const isSubmitting = ref(false);

const canSubmit = computed(() => {
  return String(newPassword.value || "").length >= 8 && String(confirmPassword.value || "").length >= 8;
});

function goToLogin() {
  void router.push("/login");
}

function mapResetErrorMessage(error) {
  const raw = String(error?.message || "").toLowerCase();
  const status = Number(error?.status || 0);

  if (raw.includes("same password") || raw.includes("new password should be different")) {
    return "Nowe hasło musi różnić się od poprzedniego.";
  }
  if (raw.includes("invalid") || raw.includes("expired") || raw.includes("token") || status === 401) {
    return "Link do resetu jest nieprawidłowy lub wygasł. Poproś o nowy link resetujący.";
  }
  if (raw.includes("weak") || raw.includes("password") || status === 400) {
    return "Hasło jest zbyt słabe. Użyj minimum 8 znaków.";
  }
  if (status >= 500 || raw.includes("network") || raw.includes("failed to fetch")) {
    return "Nie udało się zapisać nowego hasła. Sprawdź połączenie i spróbuj ponownie.";
  }
  return "Nie udało się zresetować hasła. Spróbuj ponownie.";
}

async function handleResetPassword() {
  errorMessage.value = "";
  infoMessage.value = "";

  const password = String(newPassword.value || "");
  const confirm = String(confirmPassword.value || "");

  if (password.length < 8) {
    errorMessage.value = "Hasło musi mieć minimum 8 znaków.";
    return;
  }

  if (password !== confirm) {
    errorMessage.value = "Hasła nie są identyczne.";
    return;
  }

  isSubmitting.value = true;
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      errorMessage.value = mapResetErrorMessage(error);
      return;
    }

    infoMessage.value = "Hasło zostało zmienione. Możesz się teraz zalogować.";
    newPassword.value = "";
    confirmPassword.value = "";
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  if (!data?.session?.user?.id) {
    errorMessage.value = "Brak aktywnej sesji resetu. Otwórz link resetujący z e-maila ponownie.";
  }
});
</script>
