<template>
  <div class="grid min-h-[calc(100vh-3.5rem)] bg-[linear-gradient(160deg,#f4fcff_0%,#d9eeff_34%,#bfd8ff_70%,#ffd8b0_100%)] dark:bg-[linear-gradient(160deg,#1f2937_0%,#111827_45%,#0b1220_100%)] lg:bg-none lg:grid-cols-2">
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
          <button
            type="button"
            class="w-full text-sm font-medium text-primary transition hover:opacity-80"
            @click="handlePasswordReset"
          >
            Nie pamiętasz hasła?
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

        <div v-if="infoMessage" class="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {{ infoMessage }}
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../supabase";

import blockedImage from "../assets/czarek.jpg";

const PENDING_PROFILE_SEED_KEY = "pendingProfileSeed";
const GOOGLE_AUTH_INTENT_KEY = "googleAuthIntent";
const BUSINESS_DOMAIN_CACHE_KEY = "businessEmailDomainCache";
const DEFAULT_BUSINESS_EMAIL_DOMAIN = "sluzbowe.coteach.local";
const route = useRoute();
const router = useRouter();
const API_BASE = String(import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");

const accountMode = ref("individual");
const email = ref("");
const password = ref("");
const businessLogin = ref("");
const businessPassword = ref("");
function readCachedBusinessDomain() {
  try {
    return String(localStorage.getItem(BUSINESS_DOMAIN_CACHE_KEY) || "")
      .trim()
      .toLowerCase();
  } catch {
    return "";
  }
}

function storeCachedBusinessDomain(domain) {
  const normalized = String(domain || "").trim().toLowerCase();
  if (!normalized) return;
  try {
    localStorage.setItem(BUSINESS_DOMAIN_CACHE_KEY, normalized);
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}

const businessEmailDomain = ref(readCachedBusinessDomain() || DEFAULT_BUSINESS_EMAIL_DOMAIN);
const errorMessage = ref("");
const infoMessage = ref("");
let googleAuthSubscription = null;
const shouldShowBlockedImage = computed(() =>
  String(errorMessage.value || "").toLowerCase().includes("zablokowane")
);

function resolvePostLoginPath() {
  const redirect = String(route.query.redirect || "").trim();
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) return "/dashboard";
  if (redirect === "/login" || redirect === "/register" || redirect === "/reset-password") return "/dashboard";
  return redirect;
}

function setBlockedError() {
  errorMessage.value = "To konto jest obecnie zablokowane.";
}

function mapLoginErrorMessage(error, mode = "individual") {
  const raw = String(error?.message || "").toLowerCase();
  const status = Number(error?.status || 0);

  if (raw.includes("email not confirmed") || raw.includes("email_not_confirmed")) {
    return "Konto nie zostało jeszcze potwierdzone. Sprawdź skrzynkę e-mail i kliknij link aktywacyjny.";
  }

  if (raw.includes("invalid login credentials") || raw.includes("invalid_credentials") || status === 400) {
    return mode === "business"
      ? "Nieprawidłowy login służbowy lub hasło."
      : "Nieprawidłowy email lub hasło.";
  }

  if (status === 429 || raw.includes("too many requests")) {
    return "Zbyt wiele prób logowania. Spróbuj ponownie za chwilę.";
  }

  if (raw.includes("failed to fetch") || raw.includes("network") || status >= 500) {
    return "Nie udało się połączyć z usługą logowania. Sprawdź połączenie i spróbuj ponownie.";
  }

  return mode === "business"
    ? "Logowanie kontem służbowym nie powiodło się. Spróbuj ponownie."
    : "Logowanie nie powiodło się. Spróbuj ponownie.";
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
      school_id: String(parsed.school_id || "").trim(),
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
  const pendingMatchesUser = Boolean(pending && (!pending.email || pending.email === authEmail));
  const metadataName = String(user.user_metadata?.full_name || "").trim();
  const metadataAvatar = String(
    user.user_metadata?.avatar_url || user.user_metadata?.picture || user.user_metadata?.photo_url || ""
  ).trim();
  const fullName =
    pendingMatchesUser && pending?.full_name ? pending.full_name : metadataName;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("teacher_id, school_id")
    .eq("id", user.id)
    .maybeSingle();

  const teacherId = String(existingProfile?.teacher_id || "").trim() || `teacher-${crypto.randomUUID()}`;
  const schoolId =
    String(existingProfile?.school_id || "").trim() ||
    (pendingMatchesUser ? String(pending?.school_id || "").trim() : "") ||
    null;

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: authEmail || null,
      full_name: fullName || null,
      avatar_url: metadataAvatar || null,
      school_id: schoolId,
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
  infoMessage.value = "";

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });

  if (error) {
    errorMessage.value = mapLoginErrorMessage(error, "individual");
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

  await router.replace(resolvePostLoginPath());
}

function toBusinessEmail(loginValue) {
  const normalized = String(loginValue || "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized.includes("@")) return normalized;
  return `${normalized}@${businessEmailDomain.value}`;
}

function isBusinessEmail(emailValue) {
  const normalized = String(emailValue || "").trim().toLowerCase();
  return normalized.endsWith(`@${String(businessEmailDomain.value || "").toLowerCase()}`);
}

async function handleBusinessLogin() {
  errorMessage.value = "";
  infoMessage.value = "";
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
    errorMessage.value = mapLoginErrorMessage(error, "business");
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
  if (!isBusinessEmail(profileEmail)) {
    await supabase.auth.signOut({ scope: "local" });
    errorMessage.value = "To nie jest konto służbowe. Użyj logowania dla konta indywidualnego.";
    return;
  }

  try {
    await syncProfileAfterLogin(data.session);
  } catch {
    // Login should still succeed even if profile sync fails transiently.
  }
  await router.replace(resolvePostLoginPath());
}

async function handleGoogleAuth() {
  errorMessage.value = "";
  infoMessage.value = "";

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

async function handlePasswordReset() {
  errorMessage.value = "";
  infoMessage.value = "";

  const normalizedEmail = String(email.value || "").trim().toLowerCase();
  if (!normalizedEmail) {
    errorMessage.value = "Podaj email w polu logowania, aby zresetować hasło.";
    return;
  }

  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
  if (error) {
    errorMessage.value = mapLoginErrorMessage(error, "individual");
    return;
  }

  infoMessage.value = "Wysłaliśmy link do resetu hasła. Sprawdź skrzynkę e-mail.";
}

async function handleGoogleIntentAfterRedirect() {
  const intent = String(localStorage.getItem(GOOGLE_AUTH_INTENT_KEY) || "").trim();
  if (!intent) return;

  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session?.user?.id) {
    infoMessage.value = "Finalizuję logowanie Google...";
    return;
  }

  const provider = String(session.user?.app_metadata?.provider || "").toLowerCase();
  if (provider !== "google") {
    localStorage.removeItem(GOOGLE_AUTH_INTENT_KEY);
    infoMessage.value = "";
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
  infoMessage.value = "";
  await router.replace(resolvePostLoginPath());
}

onMounted(async () => {
  const requestedMode = String(route.query.mode || "").trim().toLowerCase();
  if (requestedMode === "business" || requestedMode === "organizacja" || requestedMode === "organization") {
    accountMode.value = "business";
  }

  try {
    const response = await fetch(`${API_BASE}/api/public/business-login-config`);
    const data = await response.json().catch(() => null);
    if (response.ok && data?.businessEmailDomain) {
      businessEmailDomain.value = String(data.businessEmailDomain).trim().toLowerCase();
      storeCachedBusinessDomain(businessEmailDomain.value);
    }
  } catch {
    // Keep cached/default business domain when API is unavailable.
  }

  if (String(route.query.blocked || "") === "1") {
    setBlockedError();
  }

  const { data: authData } = supabase.auth.onAuthStateChange((event, session) => {
    if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user?.id) {
      void handleGoogleIntentAfterRedirect();
    }
  });
  googleAuthSubscription = authData.subscription;

  await handleGoogleIntentAfterRedirect();
});

onUnmounted(() => {
  googleAuthSubscription?.unsubscribe?.();
});
</script>
