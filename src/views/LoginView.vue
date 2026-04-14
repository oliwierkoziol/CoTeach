<template>
  <div class="grid min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-sidebar via-background to-card lg:bg-none lg:grid-cols-2">
    <div
      class="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-sidebar via-background to-card p-10 text-foreground lg:flex"
    >
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.74_0.12_195/0.18),transparent_50%)]" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-primary">CoTeach</p>
        <h2 class="mt-4 max-w-sm text-3xl font-bold leading-tight">Lekcje, plan i archiwum w jednym panelu.</h2>
      </div>
      <p class="relative text-sm text-muted-foreground">Zaloguj się, żeby wrócić do pracy.</p>
    </div>

    <div class="flex items-center justify-center px-4 py-12 sm:px-8">
      <div class="w-full max-w-md">
        <div class="mb-10 text-center lg:hidden">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-primary">CoTeach</p>
          <h1 class="mt-2 text-4xl font-bold text-foreground">Logowanie</h1>
        </div>
        <div class="mb-8 hidden lg:block">
          <h1 class="text-2xl font-bold text-foreground">Logowanie</h1>
          <p class="mt-1 text-sm text-muted-foreground">Kontynuuj w panelu po prawej stronie layoutu.</p>
        </div>

        <div class="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/30 p-1">
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-semibold transition"
            :class="accountMode === 'individual' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            @click="accountMode = 'individual'"
          >
            Konto indywidualne
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-semibold transition"
            :class="accountMode === 'business' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
            @click="accountMode = 'business'"
          >
            Konto służbowe
          </button>
        </div>

        <form v-if="accountMode === 'individual'" @submit.prevent="handleLogin" class="space-y-5">
          <label class="block text-sm font-semibold text-foreground">
            Email
            <input
              v-model="email"
              type="email"
              required
              class="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="twoj@email.com"
            />
          </label>
          <label class="block text-sm font-semibold text-foreground">
            Hasło
            <input
              v-model="password"
              type="password"
              required
              class="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            class="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Zaloguj się
          </button>
        </form>

        <template v-if="accountMode === 'individual'">
          <div class="my-5 flex items-center gap-3">
            <span class="h-px flex-1 bg-border"></span>
            <span class="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">lub</span>
            <span class="h-px flex-1 bg-border"></span>
          </div>

          <button
            type="button"
            @click="handleGoogleAuth"
            class="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            Kontynuuj przez Google
          </button>
        </template>

        <form v-else @submit.prevent="handleBusinessLogin" class="space-y-5">
          <label class="block text-sm font-semibold text-foreground">
            Login służbowy
            <input
              v-model="businessLogin"
              type="text"
              required
              class="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="np. jan.kowalski"
            />
          </label>
          <label class="block text-sm font-semibold text-foreground">
            Hasło
            <input
              v-model="businessPassword"
              type="password"
              required
              class="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            class="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Zaloguj konto służbowe
          </button>
        </form>

        <div v-if="errorMessage" class="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {{ errorMessage }}
        </div>

        <div v-if="shouldShowBlockedImage" class="mt-4 flex justify-center">
          <img
            :src="blockedImage"
            alt="Konto zablokowane"
            class="h-40 w-40 object-contain"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "../supabase";

import blockedImage from "../assets/czarek.jpg";

const PENDING_PROFILE_SEED_KEY = "pendingProfileSeed";
const GOOGLE_AUTH_INTENT_KEY = "googleAuthIntent";
const route = useRoute();

const accountMode = ref("individual");
const email = ref("");
const password = ref("");
const businessLogin = ref("");
const businessPassword = ref("");
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
  const metadataAvatar = String(
    user.user_metadata?.avatar_url || user.user_metadata?.picture || user.user_metadata?.photo_url || ""
  ).trim();
  const fullName =
    pending && pending.email === authEmail && pending.full_name ? pending.full_name : metadataName;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("teacher_id")
    .eq("id", user.id)
    .maybeSingle();

  const teacherId = String(existingProfile?.teacher_id || "").trim() || `teacher-${crypto.randomUUID()}`;

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: authEmail || null,
      full_name: fullName || null,
      avatar_url: metadataAvatar || null,
      teacher_id: teacherId,
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

  window.location.assign("/dashboard");
}

function toBusinessEmail(loginValue) {
  const normalized = String(loginValue || "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized.includes("@")) return normalized;
  return `${normalized}@sluzbowe.coteach.local`;
}

async function handleBusinessLogin() {
  errorMessage.value = "";
  const emailFromLogin = toBusinessEmail(businessLogin.value);

  if (!emailFromLogin) {
    errorMessage.value = "Podaj login służbowy.";
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailFromLogin,
    password: businessPassword.value
  });

  if (error) {
    errorMessage.value = "Nieprawidłowy login służbowy lub hasło.";
    return;
  }

  if (!data.session) {
    errorMessage.value = "Brak sesji po logowaniu.";
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("blocked, email")
    .eq("id", data.session.user.id)
    .maybeSingle();

  if (!profileError && profile?.blocked === true) {
    await supabase.auth.signOut({ scope: "local" });
    setBlockedError();
    return;
  }

  const profileEmail = String(profile?.email || "").toLowerCase();
  if (!profileEmail.endsWith("@sluzbowe.coteach.local")) {
    await supabase.auth.signOut({ scope: "local" });
    errorMessage.value = "To nie jest konto służbowe. Użyj logowania dla konta indywidualnego.";
    return;
  }

  try {
    await syncProfileAfterLogin(data.session);
  } catch {
    // Login should still succeed even if profile sync fails transiently.
  }
  window.location.assign("/dashboard");
}

async function handleGoogleAuth() {
  errorMessage.value = "";

  localStorage.setItem(GOOGLE_AUTH_INTENT_KEY, "login");
  const redirectTo = `${window.location.origin}/login`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo
    }
  });

  if (error) {
    localStorage.removeItem(GOOGLE_AUTH_INTENT_KEY);
    errorMessage.value = error.message;
  }
}

async function handleGoogleIntentAfterRedirect() {
  const intent = String(localStorage.getItem(GOOGLE_AUTH_INTENT_KEY) || "").trim();
  if (!intent) return;

  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session?.user?.id) return;

  const provider = String(session.user?.app_metadata?.provider || "").toLowerCase();
  if (provider !== "google") {
    localStorage.removeItem(GOOGLE_AUTH_INTENT_KEY);
    return;
  }

  if (intent === "login") {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, blocked")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profileError && profile?.blocked === true) {
      await supabase.auth.signOut({ scope: "local" });
      localStorage.removeItem(GOOGLE_AUTH_INTENT_KEY);
      setBlockedError();
      return;
    }

    if (!profile || profileError) {
      await supabase.auth.signOut({ scope: "local" });
      localStorage.removeItem(GOOGLE_AUTH_INTENT_KEY);
      errorMessage.value = "To konto nie jest zarejestrowane przez Google. Użyj najpierw rejestracji.";
      return;
    }
  }

  if (intent === "register") {
    try {
      await syncProfileAfterLogin(session);
    } catch {
      // Keep OAuth flow working even if profile sync fails transiently.
    }
  }

  localStorage.removeItem(GOOGLE_AUTH_INTENT_KEY);
  window.location.assign("/dashboard");
}

onMounted(async () => {
  if (String(route.query.blocked || "") === "1") {
    setBlockedError();
  }
  await handleGoogleIntentAfterRedirect();
});
</script>
