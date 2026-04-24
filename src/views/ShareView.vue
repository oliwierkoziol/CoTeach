<template>
  <div class="bg-[#f7f9fc] min-h-screen w-full overflow-x-hidden relative">
    <!-- Background Decor -->
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0" />

    <div class="p-6 md:p-12 pt-16 w-full max-w-[1568px] relative z-10 mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="size-12 border-4 border-[#0c3dfe]/10 border-t-[#0c3dfe] rounded-full animate-spin mb-4"></div>
        <p class="font-['Plus_Jakarta_Sans'] font-medium text-[#454652]">Pobieranie notatki...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-xl shadow-[0px_12_32px_0px_rgba(25,28,30,0.06)] p-12 text-center">
        <div class="size-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[24px] mb-2">Wystąpił błąd</h2>
        <p class="font-['Plus_Jakarta_Sans'] text-[#454652] mb-8">{{ error }}</p>
        <button @click="$router.push('/')" class="bg-[#0c3dfe] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0a34d4] transition-colors">
          Wróć do strony głównej
        </button>
      </div>  

      <!-- Note Content -->
      <div v-else-if="note" class="space-y-8 pb-20">
        <!-- Brand Header & Controls -->
        <div class="flex flex-col gap-4">
          <div>
            <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] md:text-[42px] tracking-[-0.9px] leading-tight mb-3">
              {{ note.title }}
            </h1>
            <div class="flex items-center gap-4 text-[#767683] font-['Plus_Jakarta_Sans'] font-medium">
              <span class="flex items-center gap-1.5">
                <svg class="size-4 opacity-40" fill="currentColor" viewBox="0 0 22 18"><path d="M11 0L0 5L11 10L22 5L11 0ZM11 12.5L2.3 8.5L0 9.5L11 14.5L22 9.5L19.7 8.5L11 12.5Z" /></svg>
                {{ note.subject }}
              </span>
              <span class="size-1 bg-gray-300 rounded-full"></span>
              <span class="flex items-center gap-1.5">
                <svg class="size-4 opacity-40" fill="currentColor" viewBox="0 0 18 20"><path d="M4 2H14V0H16V2H18V20H0V2H2V0H4V2ZM16 18V6H2V18H16ZM14 10H4V8H14V10ZM14 14H4V12H14V14Z" /></svg>
                {{ formatDate(note.date) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Main Rendered Note Card -->
        <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8 md:p-12 overflow-hidden border border-white">
          <div class="note-render-area" v-html="note.html"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useLessonStore } from '../composables/useLessonStore';

const route = useRoute();
const { fetchSharedNote } = useLessonStore();

const note = ref(null);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    const noteId = route.params.noteId;
    if (!noteId) throw new Error("Nieprawidłowy odnośnik.");
    const data = await fetchSharedNote(noteId);
    if (!data?.finalNote) throw new Error("Notatka już nie istnieje.");
    note.value = data.finalNote;
  } catch (e) {
    error.value = e.message || "Błąd pobierania notatki.";
  } finally {
    loading.value = false;
  }
});

function formatDate(val) {
  if (!val) return "";
  return new Date(val).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}
</script>

<style scoped>
@reference "../styles/index.css";
.note-render-area :deep(article) { @apply max-w-none; }
.note-render-area :deep(h1) { @apply font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[32px] mb-8 pb-4 border-b border-gray-100; }
.note-render-area :deep(h2) { @apply font-['Manrope'] font-extrabold text-[#191c1e] text-[20px] mt-10 mb-4; }
.note-render-area :deep(p) { @apply font-['Plus_Jakarta_Sans'] text-[#454652] text-[17px] leading-[28px] mb-6; }
.note-render-area :deep(ul) { @apply list-disc ml-6 mb-6 space-y-3 text-[#454652]; }
.note-render-area :deep(li) { @apply font-['Plus_Jakarta_Sans'] text-[17px] leading-[26px]; }
.note-render-area :deep(b), .note-render-area :deep(strong) { @apply text-[#191c1e] font-bold; }
</style>