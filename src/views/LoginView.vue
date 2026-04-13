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

        <form @submit.prevent="handleLogin" class="space-y-5">
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

onMounted(() => {
  if (String(route.query.blocked || "") === "1") {
    setBlockedError();
  }
});
</script>
