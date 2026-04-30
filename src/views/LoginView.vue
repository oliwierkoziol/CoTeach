<template>
  <div class="min-h-[calc(100vh-64px)] w-full overflow-x-hidden relative grid lg:grid-cols-2 bg-gradient-to-br from-sidebar via-background to-card">
    <!-- Background Decoration -->
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0" />

    <!-- Branding Side -->
    <div class="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card/70 p-10 lg:flex z-10">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,oklch(0.74_0.12_195/0.15),transparent_55%)]" />
      <div class="relative">
        <h2 class="font-['Plus_Jakarta_Sans'] mt-4 max-w-sm text-4xl font-extrabold leading-tight text-foreground tracking-tight">
          Lekcje, plan i archiwum w jednym panelu.
        </h2>
      </div>
      <p class="relative font-['Plus_Jakarta_Sans'] text-sm font-medium text-muted-foreground">Zaloguj się, żeby wrócić do pracy.</p>
    </div>

    <!-- Login Side -->
    <div class="flex items-center justify-center px-4 py-12 sm:px-8 relative z-10">
      <div class="w-full max-w-md">
        <header class="mb-8 lg:text-left text-center">
          <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-foreground text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
            Logowanie
          </h1>
          <p class="font-['Plus_Jakarta_Sans'] text-muted-foreground text-[18px] leading-[28px]">
            Wprowadź dane, aby uzyskać dostęp do konta.
          </p>
        </header>

        <div class="rounded-xl border border-border bg-card p-8 shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)]">
          <div class="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              class="rounded-md px-3 py-2 text-sm font-bold transition-all"
              :class="accountMode === 'individual' ? 'bg-card text-primary shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:bg-background/70'"
              @click="accountMode = 'individual'"
            >
              Indywidualne
            </button>
            <button
              type="button"
              class="rounded-md px-3 py-2 text-sm font-bold transition-all"
              :class="accountMode === 'business' ? 'bg-card text-primary shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:bg-background/70'"
              @click="accountMode = 'business'"
            >
              Służbowe
            </button>
          </div>

          <form v-if="accountMode === 'individual'" @submit.prevent="handleLogin" class="space-y-5">
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-muted-foreground text-[14px]">Email</label>
              <div class="bg-input-background border border-border h-[48px] rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-primary/30">
                <input
                  v-model="email"
                  type="email"
                  required
                  class="bg-transparent border-none outline-none w-full text-[16px] text-foreground placeholder:text-muted-foreground font-['Plus_Jakarta_Sans']"
                  placeholder="twoj@email.com"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-muted-foreground text-[14px]">Hasło</label>
              <div class="bg-input-background border border-border h-[48px] rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-primary/30">
                <input
                  v-model="password"
                  type="password"
                  required
                  class="bg-transparent border-none outline-none w-full text-[16px] text-foreground placeholder:text-muted-foreground font-['Plus_Jakarta_Sans']"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)]"
            >
              Zaloguj się
            </button>
            <button
              type="button"
              class="w-full text-sm font-bold text-primary hover:underline transition"
              @click="handlePasswordReset"
            >
              Nie pamiętasz hasła?
            </button>
          </form>

          <template v-if="accountMode === 'individual'">
            <div class="my-6 flex items-center gap-3">
              <span class="h-px flex-1 bg-border"></span>
              <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">lub</span>
              <span class="h-px flex-1 bg-border"></span>
            </div>

            <button
              type="button"
              @click="handleGoogleAuth"
              class="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              Kontynuuj przez Google
            </button>
          </template>

          <form v-else @submit.prevent="handleBusinessLogin" class="space-y-5">
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-muted-foreground text-[14px]">Login służbowy</label>
              <div class="bg-input-background border border-border h-[48px] rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-primary/30">
                <input
                  v-model="businessLogin"
                  type="text"
                  required
                  class="bg-transparent border-none outline-none w-full text-[16px] text-foreground placeholder:text-muted-foreground font-['Plus_Jakarta_Sans']"
                  placeholder="np. jan.kowalski"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-muted-foreground text-[14px]">Hasło</label>
              <div class="bg-input-background border border-border h-[48px] rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-primary/30">
                <input
                  v-model="businessPassword"
                  type="password"
                  required
                  class="bg-transparent border-none outline-none w-full text-[16px] text-foreground placeholder:text-muted-foreground font-['Plus_Jakarta_Sans']"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)]"
            >
              Zaloguj konto służbowe
            </button>
          </form>
        </div>

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
import blockedSoundUrl from "../../xd.mp3";

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
let blockedSound = null;
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
  tryPlayBlockedSound();
}

function tryPlayBlockedSound() {
  try {
    if (!blockedSound) {
      blockedSound = new Audio(blockedSoundUrl);
      blockedSound.preload = "auto";
    }
    blockedSound.currentTime = 0;
    const playPromise = blockedSound.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Browser may block autoplay without a direct user gesture.
      });
    }
  } catch {
    // Ignore audio errors; login flow should still continue.
  }
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
      organisation: parsed.organisation === true,
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
  const metadataOrganisation = user.user_metadata?.account_type === "business" || user.user_metadata?.organisation === true;
  const fullName =
    pendingMatchesUser && pending?.full_name ? pending.full_name : metadataName;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("teacher_id, school_id, organisation")
    .eq("id", user.id)
    .maybeSingle();

  const teacherId = String(existingProfile?.teacher_id || "").trim() || `teacher-${crypto.randomUUID()}`;
  const schoolId =
    String(existingProfile?.school_id || "").trim() ||
    (pendingMatchesUser ? String(pending?.school_id || "").trim() : "") ||
    null;
  const organisation =
    existingProfile?.organisation === true ||
    (pendingMatchesUser ? pending?.organisation === true : false) ||
    metadataOrganisation === true;

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: authEmail || null,
      full_name: fullName || null,
      avatar_url: metadataAvatar || null,
      school_id: schoolId,
      organisation: organisation === true,
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
    .select("blocked, email, organisation")
    .eq("id", data.session.user.id)
    .maybeSingle();

  if (!profileError && profile?.blocked === true) {
    await supabase.auth.signOut({ scope: "local" });
    setBlockedError();
    return;
  }

  if (profile?.organisation !== true) {
    await supabase.auth.signOut({ scope: "local" });
    errorMessage.value = "To nie jest konto organizacji. Użyj logowania dla konta indywidualnego.";
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
