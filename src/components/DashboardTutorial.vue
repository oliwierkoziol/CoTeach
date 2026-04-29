<template>
  <transition name="slide-fade">
    <div v-if="!dismissed" class="relative z-20 mb-8">
      <!-- Tutorial Card -->
      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 border-l-4 border-[#0053db] overflow-hidden">
        <!-- Decorative elements -->
        <div class="absolute top-0 right-0 opacity-5">
          <div class="w-40 h-40 rounded-full bg-[#0053db] blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        </div>

        <div class="relative z-10">
          <!-- Header with close button -->
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 mt-1">
                <div class="flex items-center justify-center h-10 w-10 rounded-lg  text-[#0053db]">
                  <img src="/sygnet.svg" alt="Tutorial" class="w-8 h-8 object-contain" />
                </div>
              </div>
              <div>
                <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-xl mb-1">Witaj w CoTeach!</h3>
                <p class="font-['Inter'] text-sm text-[#454652]">Szybki poradnik - poznaj główne funkcje</p>
              </div>
            </div>
            <button
              @click="dismiss"
              class="flex-shrink-0 text-[#454652] hover:text-[#191c1e] transition-colors p-1"
              aria-label="Zamknij tutorial"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Tutorial steps -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <!-- Step 1 -->
            <div class="bg-[#f7f9fc] rounded-lg p-4 border border-[rgba(0,83,219,0.1)]">
              <div class="flex items-center gap-3 mb-2">
                <span class="flex items-center justify-center w-7 h-7 rounded-full bg-[rgba(0,83,219,0.1)] font-['Inter'] font-semibold text-sm text-[#0053db]">1</span>
                <h4 class="font-['Inter'] font-semibold text-md text-[#191c1e]">Dodaj materiały</h4>
              </div>
              <p class="font-['Inter'] text-sm text-[#454652]">
                Aby dodać materiały, naciśnij przycisk "Dodaj materiały" w lewym panelu.
              </p>
            </div>

            <!-- Step 2 -->
            <div class="bg-[#f7f9fc] rounded-lg p-4 border border-[rgba(0,83,219,0.1)]">
              <div class="flex items-center gap-3 mb-2">
                <span class="flex items-center justify-center w-7 h-7 rounded-full bg-[rgba(0,83,219,0.1)] font-['Inter'] font-semibold text-sm text-[#0053db]">2</span>
                <h4 class="font-['Inter'] font-semibold text-md text-[#191c1e]">Nowa lekcja</h4>
              </div>
              <p class="font-['Inter'] text-sm text-[#454652]">
                Twórz nowe lekcje i planuj ich przebieg z pomocą AI.
              </p>
            </div>

            <!-- Step 3 -->
            <div class="bg-[#f7f9fc] rounded-lg p-4 border border-[rgba(0,83,219,0.1)]">
              <div class="flex items-center gap-3 mb-2">
                <span class="flex items-center justify-center w-7 h-7 rounded-full bg-[rgba(0,83,219,0.1)] font-['Inter'] font-semibold text-sm text-[#0053db]">3</span>
                <h4 class="font-['Inter'] font-semibold text-md text-[#191c1e]">Archiwum notatek</h4>
              </div>
              <p class="font-['Inter'] text-sm text-[#454652]">
                Notatki ze swoich lekcji są przechowywane w archiwum.
              </p>
            </div>
          </div>

          <!-- CTA -->
          <div class="flex items-center justify-between">
           
            <button
              @click="dismiss"
              class="ml-4 px-4 py-2 rounded-lg bg-[#0053db] hover:bg-[#0046b8] transition-colors font-['Inter'] font-semibold text-sm text-white"
            >
              Rozumiem
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";

const dismissed = ref(true);

onMounted(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      dismissed.value = true;
      return;
    }

    // Klucz unikatowy dla każdego użytkownika
    const STORAGE_KEY = `coteach_tutorial_shown_${session.user.id}`;
    const tutorialShown = localStorage.getItem(STORAGE_KEY);
    
    // Pokaż tutorial tylko jeśli nie było pokazywane wcześniej dla tego użytkownika
    if (!tutorialShown) {
      dismissed.value = false;
    }
  } catch (error) {
    console.error("Błąd podczas ładowania tutoriala:", error);
    dismissed.value = true;
  }
});

function dismiss() {
  dismissed.value = true;
  
  // Zapisz флагę dla aktualnego użytkownika
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user?.id) {
      const STORAGE_KEY = `coteach_tutorial_shown_${session.user.id}`;
      localStorage.setItem(STORAGE_KEY, "true");
    }
  });
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
