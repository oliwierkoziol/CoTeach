<template>
  <div class="min-h-screen bg-background py-8 text-foreground">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center gap-4 mb-8">
        <RouterLink to="/dashboard" class="rounded-lg border border-border bg-card px-3 py-2">←</RouterLink>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Zarządzanie użytkownikami</h1>
          <p class="text-gray-600">Panel sterowania admina</p>
        </div>
      </div>

      <!-- Users table -->
      <div class="rounded-xl border border-border bg-card">
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h2 class="font-semibold text-foreground">Użytkownicy ({{ users.length }})</h2>
          <button
            @click="loadUsers"
            :disabled="isLoading"
            class="text-sm text-primary hover:opacity-80 disabled:opacity-40"
          >
            Odśwież
          </button>
        </div>

        <div v-if="isLoading" class="px-6 py-12 text-center text-muted-foreground text-sm">Ładowanie…</div>
        <div v-else-if="loadError" class="px-6 py-12 text-center text-destructive text-sm">{{ loadError }}</div>
        <div v-else-if="users.length === 0" class="px-6 py-12 text-center text-muted-foreground text-sm">Brak użytkowników.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-muted text-muted-foreground uppercase text-xs">
                <th class="px-6 py-3 text-left font-medium">Imię i nazwisko</th>
                <th class="px-6 py-3 text-left font-medium">E-mail</th>
                <th class="px-6 py-3 text-left font-medium">Data rejestracji</th>
                <th class="px-6 py-3 text-left font-medium">Admin</th>
                <th class="px-6 py-3 text-left font-medium">Status</th>
                <th class="px-6 py-3 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="user in users" :key="user.id" class="hover:bg-muted/40">
                <td class="px-6 py-4 font-medium text-foreground">
                  {{ user.full_name || "—" }}
                </td>
                <td class="px-6 py-4 text-muted-foreground">{{ user.email || "—" }}</td>
                <td class="px-6 py-4 text-muted-foreground">
                  {{ user.created_at ? new Date(user.created_at).toLocaleDateString("pl-PL") : "—" }}
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="user.admin ? 'bg-green-500/10 text-green-700 dark:text-green-300' : 'bg-muted text-muted-foreground'"
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ user.admin ? "Tak" : "Nie" }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="user.blocked ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'"
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ user.blocked ? "Zablokowane" : "Aktywne" }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap space-x-3">
                  <button
                    @click="toggleBlock(user, !user.blocked)"
                    :disabled="actionUserId === user.id"
                    class="text-amber-600 hover:text-amber-700 text-sm font-medium disabled:opacity-40"
                  >
                    {{ user.blocked ? "Odblokuj" : "Zablokuj" }}
                  </button>
                  <button
                    @click="confirmDelete(user)"
                    :disabled="actionUserId === user.id"
                    class="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="actionError" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ actionError }}
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <Transition name="del-modal">
        <div
          v-if="userToDelete"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          @click.self="userToDelete = null"
        >
          <div class="rounded-2xl bg-card p-8 shadow-xl w-full max-w-sm mx-4">
            <h3 class="mb-2 text-lg font-semibold text-foreground">Usuń użytkownika</h3>
            <p class="mb-1 text-sm text-muted-foreground">
              Czy na pewno chcesz usunąć konto użytkownika:
            </p>
            <p class="mb-1 text-sm font-semibold text-foreground">
              {{ userToDelete.full_name || "—" }}
            </p>
            <p class="mb-6 text-sm text-muted-foreground">{{ userToDelete.email }}</p>
            <p class="mb-6 text-xs text-destructive">Ta operacja jest nieodwracalna. Wszystkie dane konta zostaną usunięte.</p>

            <div v-if="deleteError" class="text-red-500 text-sm mb-4">{{ deleteError }}</div>

            <div class="flex gap-3 justify-end">
              <button
                @click="userToDelete = null"
                :disabled="isDeleting"
                class="rounded-lg border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted/50 disabled:opacity-40"
              >
                Anuluj
              </button>
              <button
                @click="executeDelete"
                :disabled="isDeleting"
                class="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {{ isDeleting ? "Usuwanie…" : "Usuń konto" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { supabase } from "../supabase";

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/$/, "");
}
const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "http://localhost:3001";

async function getAuthHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const users = ref([]);
const isLoading = ref(false);
const loadError = ref("");

const userToDelete = ref(null);
const isDeleting = ref(false);
const deleteError = ref("");
const actionUserId = ref("");
const actionError = ref("");

async function readApiPayload(res) {
  const contentType = String(res.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    return await res.json().catch(() => ({}));
  }
  const text = await res.text();
  return { error: text?.slice(0, 180) || "Serwer zwrócił nieprawidłową odpowiedź." };
}

async function loadUsers() {
  isLoading.value = true;
  loadError.value = "";
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/api/admin/users`, { headers });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się pobrać użytkowników.");
    users.value = data.users || [];
  } catch (e) {
    loadError.value = e.message;
  } finally {
    isLoading.value = false;
  }
}

function confirmDelete(user) {
  userToDelete.value = user;
  deleteError.value = "";
}

async function executeDelete() {
  if (!userToDelete.value) return;
  isDeleting.value = true;
  deleteError.value = "";
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/api/admin/users/${userToDelete.value.id}`, {
      method: "DELETE",
      headers
    });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się usunąć użytkownika.");
    users.value = users.value.filter((u) => u.id !== userToDelete.value.id);
    userToDelete.value = null;
  } catch (e) {
    deleteError.value = e.message;
  } finally {
    isDeleting.value = false;
  }
}

async function toggleBlock(user, blocked) {
  actionUserId.value = user.id;
  actionError.value = "";

  try {
    const headers = await getAuthHeader();
    headers["Content-Type"] = "application/json";

    const res = await fetch(`${API_BASE}/api/admin/users/${user.id}/block`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ blocked })
    });

    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się zmienić statusu konta.");

    users.value = users.value.map((u) => (u.id === user.id ? { ...u, blocked } : u));
  } catch (error) {
    actionError.value = error.message;
  } finally {
    actionUserId.value = "";
  }
}

onMounted(loadUsers);
</script>

<style scoped>
.del-modal-enter-active {
  animation: delFadeIn 150ms ease;
}
.del-modal-leave-active {
  animation: delFadeOut 120ms ease;
}
@keyframes delFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes delFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
