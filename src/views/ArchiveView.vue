<template>
  <div class="min-h-full px-4 py-8 sm:px-6 lg:px-10">
    <div class="mx-auto max-w-7xl">
      <header class="mb-8">
        <p class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Moduł</p>
        <h1 class="text-3xl font-bold text-foreground">Archiwum lekcji</h1>
        <p class="mt-1 text-sm text-muted-foreground">Archiwizacja i dystrybucja notatek</p>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <div class="rounded-2xl border border-border bg-card p-4">
            <input
              v-model="searchQuery"
              class="w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="Szukaj według przedmiotu lub tytułu..."
            />
          </div>

          <div v-if="!filteredLessons.length" class="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
            Brak zarchiwizowanych lekcji.
          </div>

          <div v-for="lesson in filteredLessons" :key="lesson.id" class="bg-white rounded-xl border p-4 cursor-pointer hover:border-orange-300" @click="selectLesson(lesson)">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-medium text-foreground">{{ lesson.title }}</h3>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ lesson.subject }} • {{ lesson.date }} • {{ discussed(lesson) }}/{{ lesson.plan?.length || 0 }} punktów
                </p>
              </div>
              <span class="shrink-0 rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">{{ lesson.month }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="rounded-2xl border border-border bg-card p-6">
            <h3 class="mb-2 font-semibold text-foreground">Moduły archiwum</h3>
            <ul class="space-y-1 text-sm text-muted-foreground">
              <li>Generator złotej notatki</li>
              <li>Cloud storage i QR</li>
              <li>Struktura przedmiot / miesiąc</li>
              <li>Archiwizacja ZIP</li>
            </ul>
          </div>

          <div v-if="selected?.finalNote" class="bg-white rounded-xl border p-6 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-semibold">Złota Notatka</h3>
              <button class="px-3 py-2 rounded-lg border border-red-300 text-red-700 bg-red-50 text-sm" @click="handleDeleteFinalNote" :disabled="saving">
                Usuń notatkę
              </button>
            </div>

            <div>
              <label class="text-sm text-gray-600 block mb-1">Nazwa notatki</label>
              <input v-model="editTitle" class="w-full border rounded-lg px-3 py-2" placeholder="Tytuł notatki" />
            </div>

            <div>
              <label class="text-sm text-gray-600 block mb-1">Temat</label>
              <input v-model="editSubject" class="w-full border rounded-lg px-3 py-2" placeholder="Przedmiot" />
            </div>

            <div>
              <label class="text-sm text-gray-600 block mb-1">Data</label>
              <input v-model="editDate" type="date" class="w-full border rounded-lg px-3 py-2" />
            </div>

            <button class="w-full px-3 py-2 rounded-lg bg-orange-600 text-white text-sm" :disabled="saving" @click="handleSaveFinalNote">
              {{ saving ? "Zapisywanie..." : "Zapisz zmiany" }}
            </button>

            <div class="flex justify-center">
              <button
                type="button"
                class="rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40"
                @click="openQrModal"
              >
                <img :src="qrCodeUrl" alt="QR" width="220" height="220" class="mx-auto" />
              </button>
            </div>

            <button class="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm" @click="openFinalNote">
              Przenieś do notatki
            </button>
          </div>

          <div v-else-if="selected" class="bg-white rounded-xl border p-6 text-sm text-gray-600">
            Dla tej lekcji nie ma jeszcze notatki końcowej.
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="qr-modal">
        <div
          v-if="isQrModalOpen && qrCodeUrl"
          class="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
          @click="closeQrModal"
        >
          <div class="rounded-3xl bg-white p-5 shadow-2xl" @click.stop>
            <img :src="qrCodeUrl" alt="QR" width="320" height="320" class="mx-auto h-auto w-full max-w-[320px]" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useLessonStore } from "../composables/useLessonStore";

const { state, fetchLessons, updateFinalNote, deleteFinalNote } = useLessonStore();
const searchQuery = ref("");
const selected = ref(null);
const saving = ref(false);
const editTitle = ref("");
const editSubject = ref("");
const editDate = ref("");
const isQrModalOpen = ref(false);

onMounted(async () => {
  await fetchLessons();
  if (state.lessons.length) selectLesson(state.lessons[0]);
});

const filteredLessons = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return state.lessons;
  return state.lessons.filter((l) => `${l.title} ${l.subject} ${l.month}`.toLowerCase().includes(q));
});

const qrCodeUrl = computed(() => {
  const shareUrl = selected.value?.finalNote?.shareUrl;
  if (!shareUrl) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(shareUrl)}`;
});

function discussed(lesson) {
  return (lesson.plan || []).filter((p) => p.status === "discussed").length;
}

function selectLesson(lesson) {
  isQrModalOpen.value = false;
  selected.value = lesson;
  editTitle.value = String(lesson?.finalNote?.title || "");
  editSubject.value = String(lesson?.finalNote?.subject || "");
  editDate.value = String(lesson?.finalNote?.date || "");
}

async function handleSaveFinalNote() {
  if (!selected.value?.id || !selected.value?.finalNote) return;
  try {
    saving.value = true;
    const lesson = await updateFinalNote(selected.value.id, {
      title: editTitle.value,
      subject: editSubject.value,
      date: editDate.value
    });
    selectLesson(lesson);
  } finally {
    saving.value = false;
  }
}

async function handleDeleteFinalNote() {
  if (!selected.value?.id || !selected.value?.finalNote) return;
  const confirmed = window.confirm("Na pewno usunąć notatkę końcową dla tej lekcji?");
  if (!confirmed) return;
  try {
    saving.value = true;
    const lesson = await deleteFinalNote(selected.value.id);
    selectLesson(lesson);
  } finally {
    saving.value = false;
  }
}

function openFinalNote() {
  if (!selected.value?.finalNote?.shareUrl) return;
  window.open(selected.value.finalNote.shareUrl, "_blank", "noopener,noreferrer");
}

function openQrModal() {
  if (!qrCodeUrl.value) return;
  isQrModalOpen.value = true;
}

function closeQrModal() {
  isQrModalOpen.value = false;
}
</script>

<style scoped>
.qr-modal-enter-active,
.qr-modal-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.qr-modal-enter-from,
.qr-modal-leave-to {
  opacity: 0;
}

.qr-modal-enter-from > div,
.qr-modal-leave-to > div {
  transform: scale(0.92);
}

.qr-modal-enter-to > div,
.qr-modal-leave-from > div {
  transform: scale(1);
}
</style>
