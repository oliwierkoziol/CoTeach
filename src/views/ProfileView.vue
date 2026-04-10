<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-3xl shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-slate-900">Mój Profil</h1>
        </div>

        <!-- Avatar Section -->
        <div class="flex justify-center mb-8">
          <div class="relative group">
            <div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center shadow-lg overflow-hidden">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="Avatar"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-5xl font-bold text-white">
                {{ userInitials }}
              </span>
            </div>
            
            <!-- Hover overlay with upload hint -->
            <div class="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <span class="text-white text-sm font-semibold text-center px-2">Zmień zdjęcie</span>
            </div>
            
            <!-- Hidden file input -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleAvatarUpload"
              class="hidden"
            />
            
            <!-- Click handler for avatar -->
            <button
              @click="$refs.fileInput?.click()"
              class="absolute inset-0 rounded-full w-full h-full cursor-pointer focus:outline-none"
              type="button"
            ></button>
          </div>
        </div>

        <!-- Profile Info -->
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

        <!-- Loading state -->
        <div v-if="isUploading" class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center">
          <p class="text-blue-700 font-semibold">Przesyłanie zdjęcia...</p>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="mt-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="mt-8 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <p class="text-green-700">{{ successMessage }}</p>
        </div>

        <!-- Back button -->
        <div class="mt-8">
          <RouterLink to="/" class="inline-block rounded-2xl bg-slate-900 px-6 py-3 text-white font-semibold hover:bg-slate-800 transition">
            Wróć do Dashboardu
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "../supabase";

const userProfile = ref({
  full_name: "",
  email: "",
  created_at: "",
  avatar_url: "",
});

const avatarUrl = ref("");
const isUploading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const fileInput = ref(null);

const userInitials = computed(() => {
  if (!userProfile.value.full_name) return "U";
  const parts = userProfile.value.full_name.split(" ");
  return parts.map((p) => p[0]).join("").toUpperCase().substring(0, 2);
});

const formatDate = (dateString) => {
  if (!dateString) return "Brak danych";
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const loadUserProfile = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session?.user?.id) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", sessionData.session.user.id)
    .single();

  if (error) {
    errorMessage.value = "Błąd wczytywania profilu: " + error.message;
    return;
  }

  if (data) {
    userProfile.value = data;
    if (data.avatar_url) {
      avatarUrl.value = data.avatar_url;
    }
  }
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file type and size
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

    // Upload file to Supabase Storage
    const { error: uploadError, data } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error("Błąd przesyłania: " + uploadError.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Nie można uzyskać URL zdjęcia");
    }

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
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

onMounted(loadUserProfile);
</script>
