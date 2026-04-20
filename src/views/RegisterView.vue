<template>
  <div class="grid min-h-[calc(100vh-3.5rem)] bg-[linear-gradient(160deg,#f4fcff_0%,#d9eeff_34%,#bfd8ff_70%,#ffd8b0_100%)] dark:bg-[linear-gradient(160deg,#1f2937_0%,#111827_45%,#0b1220_100%)] lg:bg-none lg:grid-cols-2">
    <div
      class="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-card via-sidebar to-background p-10 text-foreground lg:flex"
    >
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,oklch(0.74_0.12_195/0.15),transparent_55%)]" />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-primary">CoTeach</p>
        <h2 class="mt-4 max-w-sm text-3xl font-bold leading-tight">Załóż konto i od razu planuj lekcje.</h2>
      </div>
      <p class="relative text-sm text-muted-foreground">Ten sam układ: panel nawigacji po lewej po zalogowaniu.</p>
    </div>

    <div class="flex items-center justify-center px-4 py-12 sm:px-8">
      <div class="w-full max-w-md">
        <div class="mb-10 text-center lg:hidden">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-primary">CoTeach</p>
          <h1 class="mt-2 text-4xl font-bold text-foreground">Rejestracja</h1>
        </div>
        <div class="mb-8 hidden lg:block">
          <h1 class="text-2xl font-bold text-foreground">Rejestracja</h1>
          <p class="mt-1 text-sm text-muted-foreground">Formularz po prawej — lewa kolumna to tylko podgląd marki.</p>
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
            Konto organizacji
          </button>
        </div>

        <form v-if="accountMode === 'individual'" @submit.prevent="handleRegister" class="space-y-5">
          <label class="block text-sm font-semibold text-foreground">
            Imię i nazwisko
            <input
              v-model="name"
              type="text"
              required
              class="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="Jan Kowalski"
            />
          </label>
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
            Zarejestruj się
          </button>
        </form>

        <form v-else @submit.prevent="handleBusinessRegister" class="space-y-5">
          <label class="block text-sm font-semibold text-foreground">
            Organizacja
            <input
              v-model="businessOrganization"
              type="text"
              required
              class="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="np. Szkoła Podstawowa nr 1"
            />
          </label>
          <label class="block text-sm font-semibold text-foreground">
            Twoja nazwa/login organizacyjny
            <input
              v-model="businessLogin"
              type="text"
              required
              class="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="np. jan.kowalski"
            />
          </label>
          <label class="block text-sm font-semibold text-foreground">
            Imię i nazwisko
            <input
              v-model="name"
              type="text"
              required
              class="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="Jan Kowalski"
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
          <p class="text-xs text-muted-foreground">
            Konto będzie utworzone jako: <span class="font-semibold text-foreground">{{ businessPreviewEmail || "—" }}</span>
          </p>
          <button
            type="submit"
            class="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Zarejestruj konto organizacji
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
            Zarejestruj się przez Google
          </button>
        </template>

        <div v-if="errorMessage" class="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {{ errorMessage }}
        </div>
        <div v-if="infoMessage" class="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
          {{ infoMessage }}
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

const PENDING_PROFILE_SEED_KEY = "pendingProfileSeed";
const GOOGLE_AUTH_INTENT_KEY = "googleAuthIntent";
const DEFAULT_BUSINESS_EMAIL_DOMAIN = "sluzbowe.coteach.local";

const router = useRouter();
const accountMode = ref("individual");
const name = ref("");
const email = ref("");
const password = ref("");
const businessLogin = ref("");
const businessOrganization = ref("");
const businessEmailDomain = ref(DEFAULT_BUSINESS_EMAIL_DOMAIN);
const errorMessage = ref("");
const infoMessage = ref("");
const businessPreviewEmail = computed(() => {
  const login = String(businessLogin.value || "").trim().toLowerCase();
  if (!login) return "";
  if (login.includes("@")) return login;
  return `${login}@${businessEmailDomain.value}`;
});

async function upsertProfileRow({ id, email, fullName, schoolId }) {
  if (!id) return;
  const teacherId = `teacher-${crypto.randomUUID()}`;
  await supabase.from("profiles").upsert(
    {
      id,
      email: email || null,
      full_name: fullName || null,
      school_id: schoolId || null,
      teacher_id: teacherId,
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
  const schoolId = null;

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
        fullName,
        schoolId
      });
      localStorage.removeItem(PENDING_PROFILE_SEED_KEY);
    } catch {
      // Keep registration successful even if profile upsert is temporarily unavailable.
    }
    router.push("/dashboard");
    return;
  }

  if (data?.user) {
    localStorage.setItem(
      PENDING_PROFILE_SEED_KEY,
      JSON.stringify({ email: normalizedEmail, full_name: fullName, school_id: schoolId, created_at: Date.now() })
    );
    infoMessage.value =
      "Konto utworzone. Jeśli projekt wymaga potwierdzenia e-mail, sprawdź skrzynkę i dopiero wtedy zaloguj się.";
  }
}

async function handleBusinessRegister() {
  errorMessage.value = "";
  infoMessage.value = "";

  const fullName = String(name.value || "").trim();
  const organizationName = String(businessOrganization.value || "").trim();
  const schoolId = null;
  const normalizedLogin = String(businessLogin.value || "").trim().toLowerCase();
  const normalizedEmail = normalizedLogin.includes("@") ? normalizedLogin : `${normalizedLogin}@${businessEmailDomain.value}`;

  if (!organizationName) {
    errorMessage.value = "Podaj nazwę organizacji.";
    return;
  }
  if (!/^[a-z0-9._-]{3,64}(@[a-z0-9.-]+\.[a-z]{2,})?$/i.test(normalizedLogin)) {
    errorMessage.value = "Podaj poprawną nazwę/login organizacyjny (3-64 znaki).";
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: password.value,
    options: {
      data: {
        full_name: fullName,
        account_type: "business",
        business_login: normalizedLogin.replace(/@.*$/, ""),
        organization_name: organizationName
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
        fullName,
        schoolId
      });
      localStorage.removeItem(PENDING_PROFILE_SEED_KEY);
    } catch {
      // Keep registration successful even if profile upsert is temporarily unavailable.
    }
    router.push("/dashboard");
    return;
  }

  if (data?.user) {
    localStorage.setItem(
      PENDING_PROFILE_SEED_KEY,
      JSON.stringify({ email: normalizedEmail, full_name: fullName, school_id: schoolId, created_at: Date.now() })
    );
    infoMessage.value =
      "Konto organizacji utworzone. Jeśli projekt wymaga potwierdzenia e-mail, sprawdź skrzynkę i dopiero wtedy zaloguj się.";
  }
}

async function handleGoogleAuth() {
  errorMessage.value = "";
  infoMessage.value = "";

  const fullName = String(name.value || "").trim();
  const fallbackEmail = String(email.value || "").trim().toLowerCase();
  const schoolId = null;

  if (fullName || fallbackEmail) {
    localStorage.setItem(
      PENDING_PROFILE_SEED_KEY,
      JSON.stringify({ email: fallbackEmail, full_name: fullName, school_id: schoolId, created_at: Date.now() })
    );
  }

  localStorage.setItem(GOOGLE_AUTH_INTENT_KEY, "register");
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

onMounted(() => {
  void (async () => {
    try {
      const apiBase = String(import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");
      const response = await fetch(`${apiBase}/api/public/business-login-config`);
      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.businessEmailDomain) {
        businessEmailDomain.value = String(data.businessEmailDomain).trim().toLowerCase();
      }
    } catch {
      // Keep default domain when API is unavailable.
    }
  })();
});
</script>
