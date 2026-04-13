<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="border rounded-lg px-3 py-2 bg-white">←</RouterLink>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Panel Administracyjny</h1>
            <p class="text-gray-600">Licencjonowanie i budżet</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl border p-6">
            <h3 class="font-semibold mb-4">Aktualna Licencja</h3>
            <div v-if="licenses[0]" class="grid grid-cols-2 gap-4 text-sm">
              <div><span class="text-gray-500">Klucz:</span> {{ licenses[0].key }}</div>
              <div><span class="text-gray-500">Wygasa:</span> {{ new Date(licenses[0].expiresAt).toLocaleDateString() }}</div>
              <div><span class="text-gray-500">Demo:</span> {{ licenses[0].demoMode ? "tak" : "nie" }}</div>
              <div><span class="text-gray-500">Max users:</span> {{ licenses[0].maxActiveUsers }}</div>
            </div>
          </div>

          <div class="bg-white rounded-xl border p-6 space-y-4">
            <h3 class="font-semibold">Monitor Kosztów API (symulacja)</h3>
            <div class="text-sm text-gray-600">Bieżąca sesja</div>
            <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-3 bg-blue-600" :style="{ width: `${Math.min(100, budgetPercentage)}%` }" />
            </div>
            <p class="text-sm">{{ currentSessionCost.toFixed(2) }} / {{ sessionBudget.toFixed(2) }} PLN</p>
            <input type="number" step="0.5" v-model.number="sessionBudget" class="border rounded-lg px-3 py-2 w-full" />
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-6">
            <h3 class="font-semibold mb-2">Moduły administracji</h3>
            <ul class="text-sm space-y-1">
              <li>Licencjonowanie placówek</li>
              <li>Monitor kosztów API</li>
              <li>Tryb demo</li>
            </ul>
          </div>

          <div class="bg-white rounded-xl border p-6">
            <h3 class="font-semibold mb-3">Użytkownicy</h3>
            <ul class="text-sm space-y-2">
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
