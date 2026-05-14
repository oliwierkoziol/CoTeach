<template>
  <Teleport to="body">
    <div v-if="isVisible" class="fixed inset-0 z-[9999] pointer-events-none">
      <!-- Dark overlay -->
      <div 
        class="absolute inset-0 bg-black/40 pointer-events-auto transition-opacity duration-300"
        @click="dismiss"
      ></div>

      <!-- Highlight cutout (optional, but we'll just put the popup above everything) -->
      
      <!-- Tooltip -->
      <div 
        ref="tooltipRef"
        class="absolute bg-white rounded-2xl p-6 shadow-2xl pointer-events-auto w-[320px] transition-all duration-300 ease-in-out border border-[#0053db]/10"
        :style="tooltipStyle"
      >
        <!-- Icon & Header -->
        <div class="flex items-start gap-4 mb-4">
          <div class="w-10 h-10 rounded-xl bg-[rgba(0,83,219,0.1)] flex items-center justify-center text-[#0053db] shrink-0">
            <!-- Dynamic icon based on step, or standard icon -->
            <svg v-if="currentStepData?.icon === 'bell'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="flex-1 pt-1">
            <div class="flex justify-between items-center mb-1">
              <h3 class="font-['Plus_Jakarta_Sans'] font-bold text-[#191c1e] text-lg leading-tight">{{ currentStepData?.title }}</h3>
              <button @click="dismiss" class="text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider">Skip</button>
            </div>
          </div>
        </div>

        <p class="font-['Inter'] text-[#454652] text-sm leading-relaxed mb-6">
          {{ currentStepData?.content }}
        </p>

        <!-- Controls -->
        <div class="flex items-center justify-between mt-auto">
          <div class="text-xs font-semibold text-[#454652] tracking-wider uppercase">
            {{ currentStepIndex + 1 }} / {{ steps.length }}
          </div>
          <div class="flex gap-2">
            <button 
              v-if="currentStepIndex > 0"
              @click="prevStep"
              class="px-4 py-2 text-sm font-semibold text-[#454652] hover:text-[#191c1e] transition-colors"
            >
              Cofnij
            </button>
            <button 
              @click="nextStep"
              class="px-5 py-2 bg-[#0053db] hover:bg-[#0046b8] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#0053db]/20"
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
  }
];

const currentStepData = computed(() => steps[currentStepIndex.value]);

const tooltipStyle = computed(() => {
  if (!targetRect.value) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  }

  const rect = targetRect.value;
  const padding = 16;
  const placement = currentStepData.value?.placement || 'right';
  
  if (placement === 'bottom') {
    return {
      top: `${rect.bottom + padding}px`,
      left: `${rect.left + (rect.width / 2)}px`,
      transform: 'translateX(-50%)'
    };
  }

  // default to right
  return {
    top: `${rect.top}px`,
    left: `${rect.right + padding}px`
  };
});

function updatePosition() {
  if (!isVisible.value || !currentStepData.value) return;
  
  const targetEl = document.querySelector(currentStepData.value.target);
  if (targetEl) {
    targetRect.value = targetEl.getBoundingClientRect();
    // Also scroll element into view if needed
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add relative positioning and high z-index to target
    targetEl.classList.add('relative', 'z-[10000]', 'ring-4', 'ring-[#0053db]/30', 'bg-card', 'rounded-xl');
  } else {
    targetRect.value = null;
  }
}

function clearTargetStyles() {
  steps.forEach(step => {
    const el = document.querySelector(step.target);
    if (el) {
      el.classList.remove('relative', 'z-[10000]', 'ring-4', 'ring-[#0053db]/30', 'bg-card', 'rounded-xl');
    }
  });
}

async function startTour() {
  if (route.path !== '/dashboard') return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return;

  const STORAGE_KEY = `coteach_product_tour_${session.user.id}`;
  if (localStorage.getItem(STORAGE_KEY)) return;

  isVisible.value = true;
  currentStepIndex.value = 0;
  
  await nextTick();
  // Small delay to ensure DOM is fully rendered
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
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user?.id) {
      const STORAGE_KEY = `coteach_product_tour_${session.user.id}`;
      localStorage.setItem(STORAGE_KEY, "true");
    }
  });
}

onMounted(() => {
  if (route.path === '/dashboard') {
    startTour();
  }
  window.addEventListener('resize', updatePosition);
});

onBeforeUnmount(() => {
  clearTargetStyles();
  window.removeEventListener('resize', updatePosition);
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
