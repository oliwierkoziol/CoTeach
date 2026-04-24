<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] w-full overflow-x-hidden relative grid lg:grid-cols-2">
    <!-- Background Decoration -->
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0" />

    <!-- Branding Side -->
    <div class="relative hidden flex-col justify-between overflow-hidden bg-[#f8fafc] p-10 lg:flex z-10 border-r border-[#cfd5db]">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,oklch(0.74_0.12_195/0.15),transparent_55%)]" />
      <div class="relative">
        <h2 class="font-['Plus_Jakarta_Sans'] mt-4 max-w-sm text-4xl font-extrabold leading-tight text-[#191c1e] tracking-tight">
          Załóż konto i od razu planuj lekcje.
        </h2>
      </div>
      <p class="relative font-['Plus_Jakarta_Sans'] text-sm font-medium text-[#454652]">Ten sam układ: panel nawigacji po lewej po zalogowaniu.</p>
    </div>

    <div class="flex items-center justify-center px-4 py-12 sm:px-8 relative z-10">
      <div class="w-full max-w-md">
        <header class="mb-8 lg:text-left text-center">
          <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
            Rejestracja
          </h1>
          <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[18px] leading-[28px]">
            Dołącz do CoTeach i zacznij uczyć efektywniej.
          </p>
        </header>

        <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 border border-white">
          <div class="mb-6 grid grid-cols-2 gap-2 bg-[#f2f4f7] rounded-lg p-1">
            <button
              type="button"
              class="rounded-md px-3 py-2 text-sm font-bold transition-all"
              :class="accountMode === 'individual' ? 'bg-white text-[#0c3dfe] shadow-sm' : 'text-[#454652] hover:bg-[#e7e8ee]'"
              @click="accountMode = 'individual'"
            >
              Indywidualne
            </button>
            <button
              type="button"
              class="rounded-md px-3 py-2 text-sm font-bold transition-all"
              :class="accountMode === 'business' ? 'bg-white text-[#0c3dfe] shadow-sm' : 'text-[#454652] hover:bg-[#e7e8ee]'"
              @click="accountMode = 'business'"
            >
              Organizacji
            </button>
          </div>

          <form v-if="accountMode === 'individual'" @submit.prevent="handleRegister" class="space-y-5">
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Imię i nazwisko</label>
              <div class="bg-[#e0e3e6] h-[48px] rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                <input
                  v-model="name"
                  type="text"
                  required
                  class="bg-transparent border-none outline-none w-full text-[16px] text-[#191c1e] placeholder-[#767683] font-['Plus_Jakarta_Sans']"
                  placeholder="Jan Kowalski"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Email</label>
              <div class="bg-[#e0e3e6] h-[48px] rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                <input
                  v-model="email"
                  type="email"
                  required
                  class="bg-transparent border-none outline-none w-full text-[16px] text-[#191c1e] placeholder-[#767683] font-['Plus_Jakarta_Sans']"
                  placeholder="twoj@email.com"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Hasło</label>
              <div class="bg-[#e0e3e6] h-[48px] rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                <input
                  v-model="password"
                  type="password"
                  required
                  class="bg-transparent border-none outline-none w-full text-[16px] text-[#191c1e] placeholder-[#767683] font-['Plus_Jakarta_Sans']"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-[#0c3dfe] py-3.5 text-sm font-bold text-white transition hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)]"
            >
              Zarejestruj się
            </button>
          </form>

          <form v-else @submit.prevent="handleBusinessRegister" class="space-y-5">
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Organizacja</label>
              <div class="bg-[#e0e3e6] h-[48px] rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                <input
                  v-model="businessOrganization"
                  type="text"
                  required
                  class="bg-transparent border-none outline-none w-full text-[16px] text-[#191c1e] placeholder-[#767683] font-['Plus_Jakarta_Sans']"
                  placeholder="np. Szkoła Podstawowa nr 1"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">E-mail organizacyjny</label>
              <div class="bg-[#e0e3e6] h-[48px] rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                <input
                  v-model="businessEmail"
                  type="email"
                  required
                  class="bg-transparent border-none outline-none w-full text-[16px] text-[#191c1e] placeholder-[#767683] font-['Plus_Jakarta_Sans']"
                  placeholder="np. biuro@twoja-firma.pl"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Imię i nazwisko</label>
              <div class="bg-[#e0e3e6] h-[48px] rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                <input
                  v-model="name"
                  type="text"
                  required
                  class="bg-transparent border-none outline-none w-full text-[16px] text-[#191c1e] placeholder-[#767683] font-['Plus_Jakarta_Sans']"
                  placeholder="Jan Kowalski"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px]">Hasło</label>
              <div class="bg-[#e0e3e6] h-[48px] rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                <input
                  v-model="password"
                  type="password"
                  required
                  class="bg-transparent border-none outline-none w-full text-[16px] text-[#191c1e] placeholder-[#767683] font-['Plus_Jakarta_Sans']"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-[#0c3dfe] py-3.5 text-sm font-bold text-white transition hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)]"
            >
              Zarejestruj konto organizacji
            </button>
          </form>

          <template v-if="accountMode === 'individual'">
            <div class="my-6 flex items-center gap-3">
              <span class="h-px flex-1 bg-gray-100"></span>
              <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">lub</span>
              <span class="h-px flex-1 bg-gray-100"></span>
            </div>

            <button
              type="button"
              @click="handleGoogleAuth"
              class="w-full rounded-lg border-2 border-[#e0e3e6] bg-white px-4 py-3 text-sm font-bold text-[#191c1e] transition hover:bg-[#f2f4f7]"
            >
              Zarejestruj się przez Google
            </button>
          </template>
        </div>

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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

const PENDING_PROFILE_SEED_KEY = "pendingProfileSeed";
const GOOGLE_AUTH_INTENT_KEY = "googleAuthIntent";

const router = useRouter();
const accountMode = ref("individual");
const name = ref("");
const email = ref("");
const password = ref("");
const businessEmail = ref("");
const businessOrganization = ref("");
const errorMessage = ref("");
const infoMessage = ref("");

async function upsertProfileRow({ id, email, fullName, schoolId, organisation = false }) {
  if (!id) return;
  const teacherId = `teacher-${crypto.randomUUID()}`;
  await supabase.from("profiles").upsert(
    {
      id,
      email: email || null,
      full_name: fullName || null,
      school_id: schoolId || null,
      organisation: organisation === true,
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
  const emailConfirmRedirect = `${window.location.origin}/login`;

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: password.value,
    options: {
      emailRedirectTo: emailConfirmRedirect,
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
        schoolId,
        organisation: false
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
      JSON.stringify({ email: normalizedEmail, full_name: fullName, school_id: schoolId, organisation: false, created_at: Date.now() })
    );
    infoMessage.value =
      "Konto utworzone. Wysłaliśmy e-mail potwierdzający - sprawdź skrzynkę (także Spam) i kliknij link.";
  }
}

async function handleBusinessRegister() {
  errorMessage.value = "";
  infoMessage.value = "";

  const fullName = String(name.value || "").trim();
  const organizationName = String(businessOrganization.value || "").trim();
  const schoolId = null;
  const normalizedEmail = String(businessEmail.value || "").trim().toLowerCase();
  const emailConfirmRedirect = `${window.location.origin}/login`;

  if (!organizationName) {
    errorMessage.value = "Podaj nazwę organizacji.";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errorMessage.value = "Podaj poprawny adres e-mail.";
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: password.value,
    options: {
      emailRedirectTo: emailConfirmRedirect,
      data: {
        full_name: fullName,
        account_type: "business",
        business_login: normalizedEmail.split("@")[0] || "",
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
        schoolId,
        organisation: true
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
      JSON.stringify({ email: normalizedEmail, full_name: fullName, school_id: schoolId, organisation: true, created_at: Date.now() })
    );
    infoMessage.value =
      "Konto organizacji utworzone. Wysłaliśmy e-mail potwierdzający - sprawdź skrzynkę (także Spam) i kliknij link.";
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
</script>
