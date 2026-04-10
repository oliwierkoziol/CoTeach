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
              class="pointer-events-none absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
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
            <div class="text-lg text-slate-900 border-b-2 border-slate-200 pb-2">
              {{ userProfile.full_name || "Brak danych" }}
            </div>
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

        <div class="mt-8">
          <RouterLink
            to="/"
            class="inline-block rounded-2xl bg-slate-900 px-6 py-3 text-white font-semibold hover:bg-slate-800 transition"
          >
            Wróć do Dashboardu
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

const router = useRouter();

const userProfile = ref({
  full_name: "",
  email: "",
  created_at: "",
  avatar_url: ""
});

const avatarUrl = ref("");
const isUploading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const fileInput = ref(null);

const userInitials = computed(() => {
  if (!userProfile.value.full_name) return "U";
  const parts = userProfile.value.full_name.split(" ").filter(Boolean);
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
});

function formatDate(dateString) {
  if (!dateString) return "Brak danych";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Brak danych";
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function openFilePicker() {
  fileInput.value?.click();
}

async function loadUserProfile() {
  errorMessage.value = "";
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) {
    router.push({ path: "/login", query: { redirect: "/profile" } });
    return;
  }

  const meta = user.user_metadata || {};
  userProfile.value = {
    full_name: meta.full_name || user.email?.split("@")[0] || "",
    email: user.email || "",
    created_at: user.created_at || "",
    avatar_url: meta.avatar_url || ""
  };
  avatarUrl.value = userProfile.value.avatar_url || "";

  const { data: row, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (error) {
    return;
  }

  if (row) {
    userProfile.value = {
      ...userProfile.value,
      full_name: row.full_name || userProfile.value.full_name,
      email: row.email || userProfile.value.email,
      avatar_url: row.avatar_url || userProfile.value.avatar_url
    };
    if (row.avatar_url) {
      avatarUrl.value = row.avatar_url;
    }
    return;
  }

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

async function handleAvatarUpload(event) {
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

  isUploading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) {
      throw new Error("Użytkownik nie zalogowany");
    }

    const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 8) || "jpg";
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
      upsert: true,
      contentType: file.type || "image/jpeg"
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) {
      throw new Error("Nie można uzyskać adresu zdjęcia");
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: sessionData.session.user.email,
          full_name: userProfile.value.full_name,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );

    if (updateError) {
      throw new Error(updateError.message);
    }

    avatarUrl.value = publicUrl;
    userProfile.value.avatar_url = publicUrl;
    successMessage.value = "Zdjęcie profilowe zostało zaktualizowane.";
  } catch (err) {
    errorMessage.value = err?.message || "Błąd podczas przesyłania";
  } finally {
    isUploading.value = false;
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
}

onMounted(loadUserProfile);
</script>
