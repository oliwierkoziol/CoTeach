<template>
  <div class="min-h-full px-4 py-8 sm:px-6 lg:px-10">
    <div class="mx-auto max-w-7xl">
      <header class="mb-8">
        <p class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Moduł</p>
        <h1 class="text-3xl font-bold text-foreground">Panel administracyjny</h1>
        <p class="mt-1 text-sm text-muted-foreground">Licencjonowanie i budżet</p>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <div class="rounded-2xl border border-border bg-card p-6">
            <h3 class="mb-4 font-semibold text-foreground">Aktualna licencja</h3>
            <div v-if="licenses[0]" class="grid grid-cols-2 gap-4 text-sm text-foreground">
              <div><span class="text-muted-foreground">Klucz:</span> {{ licenses[0].key }}</div>
              <div><span class="text-muted-foreground">Wygasa:</span> {{ new Date(licenses[0].expiresAt).toLocaleDateString() }}</div>
              <div><span class="text-muted-foreground">Demo:</span> {{ licenses[0].demoMode ? "tak" : "nie" }}</div>
              <div><span class="text-muted-foreground">Max users:</span> {{ licenses[0].maxActiveUsers }}</div>
            </div>
          </div>

          <div class="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h3 class="font-semibold text-foreground">Monitor kosztów API (symulacja)</h3>
            <div class="text-sm text-muted-foreground">Bieżąca sesja</div>
            <div class="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div class="h-3 rounded-full bg-primary transition-all" :style="{ width: `${Math.min(100, budgetPercentage)}%` }" />
            </div>
            <p class="text-sm text-foreground">{{ currentSessionCost.toFixed(2) }} / {{ sessionBudget.toFixed(2) }} PLN</p>
            <input
              v-model.number="sessionBudget"
              type="number"
              step="0.5"
              class="w-full rounded-xl border border-border bg-input-background px-3 py-2 text-foreground"
            />
          </div>
        </div>

        <div class="space-y-6">
          <div class="rounded-2xl border border-border bg-card p-6">
            <h3 class="mb-2 font-semibold text-foreground">Moduły administracji</h3>
            <ul class="space-y-1 text-sm text-muted-foreground">
              <li>Licencjonowanie placówek</li>
              <li>Monitor kosztów API</li>
              <li>Tryb demo</li>
            </ul>
          </div>

          <div class="rounded-2xl border border-border bg-card p-6">
            <h3 class="mb-3 font-semibold text-foreground">Użytkownicy</h3>
            <ul class="space-y-2 text-sm text-foreground">
              <li v-for="u in users" :key="u.id">{{ u.name }} ({{ u.role }})</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useLessonStore } from "../composables/useLessonStore";

const { fetchAdmin } = useLessonStore();
const licenses = ref([]);
const users = ref([]);

const sessionBudget = ref(3.5);
const currentSessionCost = ref(1.85);
const budgetPercentage = computed(() => (currentSessionCost.value / sessionBudget.value) * 100);

onMounted(async () => {
  const admin = await fetchAdmin();
  licenses.value = admin.licenses || [];
  users.value = admin.users || [];
});
</script>
