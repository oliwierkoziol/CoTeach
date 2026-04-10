<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-3xl shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-slate-900">Mój Profil</h1>
        </div>

        <div class="flex justify-center mb-8">
          <div class="relative group">
            <div
              class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center shadow-lg overflow-hidden"
            >
              <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
              <span v-else class="text-5xl font-bold text-white">
                {{ userInitials }}
              </span>
            </div>

            <div
              class="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
            >
              <span class="text-white text-sm font-semibold text-center px-2">Zmień zdjęcie</span>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarUpload"
            />

            <button
              type="button"
              class="absolute inset-0 rounded-full w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Zmień zdjęcie profilowe"
              @click="openFilePicker"
            ></button>
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Imię i nazwisko</label>
            <input
              v-model.trim="userProfile.full_name"
              type="text"
              autocomplete="name"
              class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Jan Kowalski"
            />
            <button
              type="button"
              class="mt-3 w-full sm:w-auto rounded-2xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              :disabled="isSavingName"
              @click.prevent="saveFullName"
            >
              {{ isSavingName ? "Zapisywanie…" : "Zapisz imię i nazwisko" }}
            </button>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <div class="text-lg text-slate-900 border-b-2 border-slate-200 pb-2">
              {{ userProfile.email || "Brak danych" }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Data utworzenia konta</label>
            <div class="text-lg text-slate-900 border-b-2 border-slate-200 pb-2">
              {{ formatDate(userProfile.created_at) }}
            </div>
          </div>
        </div>

        <div v-if="isUploading" class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center">
          <p class="text-blue-700 font-semibold">Przesyłanie zdjęcia...</p>
        </div>

        <div v-if="errorMessage" class="mt-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>

        <div v-if="successMessage" class="mt-8 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <p class="text-green-700">{{ successMessage }}</p>
        </div>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <RouterLink
            to="/"
            class="inline-block rounded-2xl bg-slate-900 px-6 py-3 text-white font-semibold hover:bg-slate-800 transition"
          >
            Wróć do Dashboardu
          </RouterLink>
          <button
            type="button"
            class="inline-block rounded-2xl border-2 border-slate-900 bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-50 transition"
            @click="handleLogout"
          >
            Wyloguj się
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

const router = useRouter();

const userProfile = ref({
  full_name: "",
  email: "",
  created_at: "",
  avatar_url: ""
});

const authUserId = ref("");
const authEmail = ref("");

const avatarUrl = ref("");
const isUploading = ref(false);
const isSavingName = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const fileInput = ref(null);

const userInitials = computed(() => {
  if (!userProfile.value.full_name) return "U";
  const parts = userProfile.value.full_name.split(/\s+/).filter(Boolean);
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
});

function formatDate(dateString) {
  if (!dateString) return "Brak danych";
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function openFilePicker() {
  fileInput.value?.click();
}

const loadUserProfile = async () => {
  errorMessage.value = "";
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user?.id) {
    router.push({ path: "/login", query: { redirect: "/profile" } });
    return;
  }

  userProfile.value.email = user.email || "";
  userProfile.value.created_at = user.created_at || "";
  authUserId.value = user.id;
  authEmail.value = user.email || "";

  const { data: row, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (error) {
    errorMessage.value = "Błąd wczytywania profilu: " + error.message;
    return;
  }

  if (row) {
    userProfile.value.full_name = row.full_name || user.user_metadata?.full_name || "";
    userProfile.value.avatar_url = row.avatar_url || "";
    if (row.avatar_url) avatarUrl.value = row.avatar_url;
    else avatarUrl.value = "";
  } else {
    userProfile.value.full_name = user.user_metadata?.full_name || "";
    userProfile.value.avatar_url = "";
    avatarUrl.value = user.user_metadata?.avatar_url || "";
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: userProfile.value.full_name,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );
  }
};

const SAVE_NAME_TIMEOUT_MS = 15000;

async function saveFullName() {
  const name = String(userProfile.value.full_name || "").trim();
  if (!name) {
    errorMessage.value = "Podaj imię i nazwisko.";
    return;
  }

  if (isSavingName.value) return;
  isSavingName.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    let userId = authUserId.value;
    let email = authEmail.value || userProfile.value.email;

    if (!userId || !email) {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Brak aktywnej sesji.");
      userId = session.user.id;
      email = session.user.email || "";
      authUserId.value = userId;
      authEmail.value = email;
      if (!userProfile.value.email) userProfile.value.email = email;
    }

    const pending = supabase.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: name,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );

    const { error: pErr } = await Promise.race([
      pending,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("REQUEST_TIMEOUT")), SAVE_NAME_TIMEOUT_MS)
      )
    ]);

    if (pErr) throw new Error(pErr.message);

    userProfile.value.full_name = name;
    successMessage.value = "Zapisano imię i nazwisko.";
    await nextTick();
    setTimeout(() => {
      successMessage.value = "";
    }, 5000);
  } catch (e) {
    if (e?.message === "REQUEST_TIMEOUT") {
      errorMessage.value =
        "Zapis trwa zbyt długo lub sieć nie odpowiada. Sprawdź połączenie i ustawienia RLS tabeli profiles w Supabase. Możesz odświeżyć stronę i zobaczyć, czy dane się zapisały.";
    } else {
      errorMessage.value = e?.message || "Nie udało się zapisać.";
    }
  } finally {
    isSavingName.value = false;
  }
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    errorMessage.value = "Proszę wybrać plik obrazu";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = "Plik nie może być większy niż 5 MB";
    return;
  }

  try {
    isUploading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      throw new Error("Użytkownik nie zalogowany");
    }

    const ext = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}-${Math.random()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
      upsert: true
    });

    if (uploadError) {
      throw new Error("Błąd przesyłania: " + uploadError.message);
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Nie można uzyskać URL zdjęcia");
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      throw new Error("Błąd aktualizacji profilu: " + updateError.message);
    }

    avatarUrl.value = urlData.publicUrl;
    userProfile.value.avatar_url = urlData.publicUrl;
    successMessage.value = "Zdjęcie profilowe zostało zaktualizowane!";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    errorMessage.value = error.message || "Nieznany błąd podczas przesyłania";
  } finally {
    isUploading.value = false;
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};

async function handleLogout() {
  await supabase.auth.signOut({ scope: "local" });
  router.push("/login");
}

onMounted(loadUserProfile);
</script>
