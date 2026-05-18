<template>
  <Teleport to="body">
    <div v-if="isVisible" class="fixed inset-0 z-[9999] pointer-events-none">
      <!-- Dark overlay -->
      <div 
        class="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity duration-300"
        @click="dismiss"
      ></div>

      <!-- Tooltip -->
      <div 
        ref="tooltipRef"
        class="tooltip-card bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(220,38,38,0.15)] pointer-events-auto transition-all duration-300 ease-in-out border-l-8 border-red-600 pulse-red"
        :style="tooltipStyle"
      >
        <!-- Icon & Header -->
        <div class="flex items-start gap-4 mb-5">
          <div class="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0 border border-red-200/60 shadow-sm">
            <!-- Dynamic icon based on step -->
            <svg v-if="currentStepData?.icon === 'bell'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="flex-1 pt-0.5">
            <div class="flex justify-between items-start gap-2">
              <h3 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-xl sm:text-2xl leading-snug tracking-tight">
                {{ currentStepData?.title }}
              </h3>
              <button 
                @click="dismiss" 
                class="text-xs font-extrabold text-red-600 hover:text-red-700 uppercase tracking-widest transition-colors pt-1 px-2 py-1 rounded-lg hover:bg-red-50"
              >
                Pomiń
              </button>
            </div>
          </div>
        </div>

        <!-- Content description -->
        <p class="font-['Inter'] text-[#3a3b45] text-base sm:text-[17px] leading-relaxed mb-6 font-medium">
          {{ currentStepData?.content }}
        </p>

        <!-- Controls -->
        <div class="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <div class="text-xs font-black text-red-600/80 tracking-widest uppercase bg-red-50 px-2.5 py-1 rounded-full">
            Krok {{ currentStepIndex + 1 }} z {{ steps.length }}
          </div>
          <div class="flex gap-2">
            <button 
              v-if="currentStepIndex > 0"
              @click="prevStep"
              class="px-4 py-2 text-sm sm:text-base font-bold text-[#454652] hover:text-[#191c1e] transition-colors rounded-xl hover:bg-gray-50"
            >
              Cofnij
            </button>
            <button 
              @click="nextStep"
              class="px-5 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base font-extrabold rounded-xl transition-all shadow-lg shadow-red-600/25 hover:shadow-red-600/35 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {{ currentStepIndex === steps.length - 1 ? 'Zakończ' : 'Dalej' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../supabase';

const route = useRoute();
const isVisible = ref(false);
const currentStepIndex = ref(0);
const tooltipRef = ref(null);
const targetRect = ref(null);
const isMobile = ref(false);

const steps = [
  {
    target: '#tour-class-selector',
    title: 'Wybór klasy',
    content: 'Zarządzaj swoimi materiałami efektywniej przypisując je do konkretnych klas.',
    placement: 'bottom'
  },
  {
    target: '#tour-start-lesson',
    title: 'Nowa lekcja',
    content: 'Tutaj możesz rozpocząć nową lekcję i zaplanować jej przebieg z pomocą naszego AI.',
    placement: 'right'
  },
  {
    target: '#tour-add-notes',
    title: 'Dodaj materiały',
    content: 'W tej zakładce dodasz swoje notatki, pliki PDF oraz inne materiały potrzebne do lekcji.',
    placement: 'right'
  },
  {
    target: '#tour-presentations',
    title: 'Prezentacje',
    content: 'Generuj prezentacje ze swoich notatek jednym kliknięciem z pomocą sztucznej inteligencji.',
    placement: 'right'
  },
  {
    target: '#tour-quizzes',
    title: 'Sprawdziany',
    content: 'Szybko przygotowuj sprawdziany i kartkówki ze zgromadzonych materiałów.',
    placement: 'right'
  },
  {
    target: '#tour-archive',
    title: 'Archiwum notatek',
    content: 'Wszystkie przeprowadzone lekcje i wygenerowane materiały trafiają prosto do Twojego archiwum.',
    placement: 'right'
  },
  {
    target: '#tour-previous-lesson',
    title: 'Podsumowanie lekcji',
    content: 'Po każdej lekcji możesz w tym miejscu wygenerować inteligentną prezentację powtórkową z najważniejszymi zagadnieniami dla uczniów.',
    placement: 'top'
  }
];

const currentStepData = computed(() => steps[currentStepIndex.value]);

const tooltipStyle = computed(() => {
  if (isMobile.value) {
    return {
      bottom: 'max(12vh, 90px)',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '420px',
      position: 'fixed',
      zIndex: '9999'
    };
  }

  if (!targetRect.value) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '420px',
      position: 'fixed',
      zIndex: '9999'
    };
  }

  const rect = targetRect.value;
  const padding = 20;
  const placement = currentStepData.value?.placement || 'right';
  
  if (placement === 'top') {
    return {
      top: `${rect.top - padding}px`,
      left: `${rect.left + (rect.width / 2)}px`,
      transform: 'translate(-50%, -100%)',
      width: '420px',
      position: 'absolute',
      zIndex: '9999'
    };
  }

  if (placement === 'bottom') {
    return {
      top: `${rect.bottom + padding}px`,
      left: `${rect.left + (rect.width / 2)}px`,
      transform: 'translateX(-50%)',
      width: '420px',
      position: 'absolute',
      zIndex: '9999'
    };
  }

  // default to right
  return {
    top: `${rect.top - 10}px`, // Slight negative offset to align beautifully with the top of the target
    left: `${rect.right + padding}px`,
    width: '420px',
    position: 'absolute',
    zIndex: '9999'
  };
});

function updatePosition() {
  if (!isVisible.value || !currentStepData.value) return;
  
  const targetEl = document.querySelector(currentStepData.value.target);
  if (targetEl) {
    targetRect.value = targetEl.getBoundingClientRect();
    
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetEl.classList.add('tour-target-highlight');
  } else {
    targetRect.value = null;
  }
}

function clearTargetStyles() {
  steps.forEach(step => {
    const el = document.querySelector(step.target);
    if (el) {
      el.classList.remove('tour-target-highlight');
    }
  });
}

function handleResize() {
  isMobile.value = window.innerWidth < 768;
  updatePosition();
}

async function startTour() {
  if (route.path !== '/dashboard') return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return;

  const STORAGE_KEY = `coteach_product_tour_${session.user.id}`;
  if (localStorage.getItem(STORAGE_KEY)) return;

  isVisible.value = true;
  currentStepIndex.value = 0;
  isMobile.value = window.innerWidth < 768;
  
  if (isMobile.value) {
    const menuBtn = document.querySelector('button[aria-label="Menu"]');
    if (menuBtn) menuBtn.click();
  }
  
  await nextTick();
  setTimeout(updatePosition, 500);
}

function nextStep() {
  clearTargetStyles();
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++;
    nextTick(() => setTimeout(updatePosition, 300));
  } else {
    dismiss();
  }
}

function prevStep() {
  clearTargetStyles();
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
    nextTick(() => setTimeout(updatePosition, 300));
  }
}

function dismiss() {
  clearTargetStyles();
  isVisible.value = false;
  
  if (isMobile.value) {
    const backdrop = document.getElementById('mobile-menu-backdrop');
    if (backdrop) backdrop.click();
  }
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user?.id) {
      const STORAGE_KEY = `coteach_product_tour_${session.user.id}`;
      localStorage.setItem(STORAGE_KEY, "true");
    }
  });
}

async function forceStartTour() {
  isVisible.value = true;
  currentStepIndex.value = 0;
  isMobile.value = window.innerWidth < 768;
  
  if (isMobile.value) {
    const menuBtn = document.querySelector('button[aria-label="Menu"]');
    if (menuBtn) menuBtn.click();
  }
  
  await nextTick();
  setTimeout(updatePosition, 500);
}

onMounted(() => {
  window.ShowTutorial = forceStartTour;
  isMobile.value = window.innerWidth < 768;
  if (route.path === '/dashboard') {
    startTour();
  }
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  delete window.ShowTutorial;
  clearTargetStyles();
  window.removeEventListener('resize', handleResize);
});

// Start tour if user navigates to dashboard and hasn't seen it
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/dashboard') {
      startTour();
    }
  }
);

// Re-position when step changes
watch(currentStepIndex, () => {
  if (isVisible.value) {
    nextTick(() => {
      setTimeout(updatePosition, 100);
    });
  }
});
</script>

<style>
/* 
  Global Styles (No scoped tag for these because we inject class onto other DOM nodes)
*/
@keyframes target-pulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.4), 0 0 20px rgba(220, 38, 38, 0.1);
    border-color: rgba(220, 38, 38, 0.5) !important;
  }
  50% {
    box-shadow: 0 0 0 10px rgba(220, 38, 38, 0.7), 0 0 30px rgba(220, 38, 38, 0.2);
    border-color: rgba(220, 38, 38, 0.9) !important;
  }
}

.tour-target-highlight {
  position: relative !important;
  z-index: 10000 !important;
  animation: target-pulse 1.8s infinite ease-in-out !important;
  transition: all 0.3s ease !important;
  background-color: white !important;
}

.dark .tour-target-highlight {
  background-color: var(--card) !important;
}
</style>

<style scoped>
@keyframes pulse-red-glow {
  0%, 100% {
    box-shadow: 0 10px 25px -5px rgba(220, 38, 38, 0.15), 0 8px 10px -6px rgba(220, 38, 38, 0.15), 0 0 0 1px rgba(220, 38, 38, 0.2);
  }
  50% {
    box-shadow: 0 25px 40px -5px rgba(220, 38, 38, 0.3), 0 16px 20px -6px rgba(220, 38, 38, 0.3), 0 0 0 5px rgba(220, 38, 38, 0.35);
  }
}

.pulse-red {
  animation: pulse-red-glow 2.2s infinite ease-in-out;
}
</style>
