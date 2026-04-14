<template>
  <div class="min-h-full px-4 py-8 sm:px-6 lg:px-10">
    <div class="mx-auto max-w-7xl space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Panel admina</p>
          <h1 class="text-3xl font-bold text-foreground">Dashboard admina</h1>
          <p class="mt-1 text-sm text-muted-foreground">Statystyki lekcji, pokrycie i zarządzanie kontami.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <RouterLink
            to="/admin/cost-calculator"
            class="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40"
          >
            Kalkulator kosztów
          </RouterLink>
          <button
            type="button"
            class="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 disabled:opacity-40"
            :disabled="isLoading"
            @click="loadDashboard"
          >
            {{ isLoading ? "Odświeżanie..." : "Odśwież" }}
          </button>
        </div>
      </header>

      <div v-if="loadError" class="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {{ loadError }}
      </div>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article class="rounded-2xl border border-border bg-card p-5">
          <p class="text-xs uppercase tracking-[0.16em] text-muted-foreground">Przeprowadzone lekcje</p>
          <p class="mt-2 text-3xl font-black text-foreground">{{ stats.finishedLessons }}</p>
        </article>
        <article class="rounded-2xl border border-border bg-card p-5">
          <p class="text-xs uppercase tracking-[0.16em] text-muted-foreground">Wszystkie lekcje</p>
          <p class="mt-2 text-3xl font-black text-foreground">{{ stats.totalLessons }}</p>
        </article>
        <article class="rounded-2xl border border-border bg-card p-5">
          <p class="text-xs uppercase tracking-[0.16em] text-muted-foreground">Konta użytkowników</p>
          <p class="mt-2 text-3xl font-black text-foreground">{{ stats.usersCount }}</p>
        </article>
      </section>

      <section class="rounded-2xl border border-border bg-card p-6">
        <h2 class="mb-4 text-lg font-semibold text-foreground">Pokrycie według przedmiotów</h2>
        <div v-if="!coverageBySubject.length" class="text-sm text-muted-foreground">Brak danych pokrycia.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th class="px-3 py-2 font-medium">Przedmiot</th>
                <th class="px-3 py-2 font-medium">Lekcje</th>
                <th class="px-3 py-2 font-medium">Omówione / Wszystkie</th>
                <th class="px-3 py-2 font-medium">Pokrycie</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in coverageBySubject" :key="item.subject" class="border-b border-border/60">
                <td class="px-3 py-3 font-medium text-foreground">{{ item.subject }}</td>
                <td class="px-3 py-3 text-muted-foreground">{{ item.lessons }}</td>
                <td class="px-3 py-3 text-muted-foreground">{{ item.discussedPoints }} / {{ item.totalPoints }}</td>
                <td class="px-3 py-3">
                  <span class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {{ item.coveragePercent }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-2xl border border-border bg-card p-6">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-foreground">Koszty AI per nauczyciel</h2>
          <div class="flex flex-wrap items-center gap-2">
            <select
              v-model="costSortBy"
              class="rounded-lg border border-border bg-input-background px-3 py-2 text-xs font-semibold text-foreground"
            >
              <option value="total">Sortuj: koszt całkowity</option>
              <option value="teacher">Sortuj: nauczyciel</option>
              <option value="notes">Sortuj: notatki</option>
              <option value="live">Sortuj: lekcje live</option>
              <option value="presentation">Sortuj: prezentacje</option>
              <option value="other">Sortuj: inne</option>
            </select>

            <select
              v-model="costDirection"
              class="rounded-lg border border-border bg-input-background px-3 py-2 text-xs font-semibold text-foreground"
            >
              <option value="desc">Malejąco</option>
              <option value="asc">Rosnąco</option>
            </select>

            <button
              type="button"
              class="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/40 disabled:opacity-40"
              :disabled="isLoadingCosts"
              @click="loadTeacherCosts"
            >
              {{ isLoadingCosts ? "Ładowanie..." : "Odśwież koszty" }}
            </button>
          </div>
        </div>

        <div v-if="!teacherCosts.length" class="text-sm text-muted-foreground">Brak danych kosztów nauczycieli.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th class="px-3 py-2 font-medium">Nauczyciel</th>
                <th class="px-3 py-2 font-medium">Koszt dostawcy</th>
                <th class="px-3 py-2 font-medium">Koszt platformy</th>
                <th class="px-3 py-2 font-medium">Razem</th>
                <th class="px-3 py-2 font-medium">Notatki</th>
                <th class="px-3 py-2 font-medium">Lekcje live</th>
                <th class="px-3 py-2 font-medium">Prezentacje</th>
                <th class="px-3 py-2 font-medium">Inne</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in teacherCosts" :key="row.teacherId" class="border-b border-border/60">
                <td class="px-3 py-3">
                  <div class="font-medium text-foreground">{{ row.fullName || "Brak nazwy" }}</div>
                  <div class="text-xs text-muted-foreground">{{ row.email || row.teacherId }}</div>
                </td>
                <td class="px-3 py-3 text-muted-foreground">{{ currency(row.base) }}</td>
                <td class="px-3 py-3 text-muted-foreground">{{ currency(row.margin) }}</td>
                <td class="px-3 py-3 font-semibold text-foreground">{{ currency(row.total) }}</td>
                <td class="px-3 py-3 text-muted-foreground">{{ currency(row.notes) }}</td>
                <td class="px-3 py-3 text-muted-foreground">{{ currency(row.live) }}</td>
                <td class="px-3 py-3 text-muted-foreground">{{ currency(row.presentation) }}</td>
                <td class="px-3 py-3 text-muted-foreground">{{ currency(row.other) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-2xl border border-border bg-card">
        <div class="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 class="text-lg font-semibold text-foreground">Konta użytkowników ({{ users.length }})</h2>
        </div>

        <div v-if="!users.length" class="px-6 py-10 text-sm text-muted-foreground">Brak kont.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <th class="px-6 py-3 font-medium">Imię i nazwisko</th>
                <th class="px-6 py-3 font-medium">E-mail</th>
                <th class="px-6 py-3 font-medium">Status</th>
                <th class="px-6 py-3 font-medium">Licencja</th>
                <th class="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="user in users" :key="user.id" class="hover:bg-muted/30">
                <td class="px-6 py-4 font-medium text-foreground">{{ user.full_name || "—" }}</td>
                <td class="px-6 py-4 text-muted-foreground">{{ user.email || "—" }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="user.blocked ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'"
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  >
                    {{ user.blocked ? "Zablokowane" : "Aktywne" }}
                  </span>
                </td>
                <td class="px-6 py-4 text-muted-foreground">
                  <span v-if="user.license">do {{ formatDate(user.license.expiresAt) }}</span>
                  <span v-else>Brak</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      class="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted/40 disabled:opacity-40"
                      :disabled="actionUserId === user.id"
                      @click="toggleBlock(user, !user.blocked)"
                    >
                      {{ user.blocked ? "Odblokuj" : "Zablokuj" }}
                    </button>
                    <button
                      type="button"
                      class="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                      @click="openModify(user)"
                    >
                      Modyfikuj
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-2xl border border-border bg-card p-6">
        <h2 class="text-lg font-semibold text-foreground">Utwórz konto służbowe</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Administrator może utworzyć konto ze specjalnym loginem i hasłem.
        </p>

        <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label class="block text-sm text-muted-foreground">
            Imię i nazwisko
            <input
              v-model.trim="newBusinessFullName"
              type="text"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="Jan Kowalski"
            />
          </label>
          <label class="block text-sm text-muted-foreground">
            Login służbowy
            <input
              v-model.trim="newBusinessLogin"
              type="text"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="jan.kowalski"
            />
          </label>
          <label class="block text-sm text-muted-foreground">
            Hasło
            <div class="mt-1 flex gap-2">
              <input
                v-model="newBusinessPassword"
                :type="showNewBusinessPassword ? 'text' : 'password'"
                class="w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                placeholder="Minimum 8 znaków"
              />
              <button
                type="button"
                class="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/40"
                @click="showNewBusinessPassword = !showNewBusinessPassword"
              >
                {{ showNewBusinessPassword ? "Ukryj" : "Pokaż" }}
              </button>
            </div>
          </label>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            type="button"
            class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            :disabled="isCreatingBusinessUser"
            @click="createBusinessUser"
          >
            {{ isCreatingBusinessUser ? "Tworzenie..." : "Utwórz konto służbowe" }}
          </button>
        </div>
      </section>

      <div v-if="actionError" class="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {{ actionError }}
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="editUser"
        class="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
        @click.self="closeModify"
      >
        <div class="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <h3 class="text-xl font-bold text-foreground">Modyfikuj konto</h3>
          <p class="mt-1 text-sm text-muted-foreground">{{ editUser.full_name || editUser.email || editUser.id }}</p>

          <div class="mt-5 space-y-4">
            <label class="block text-sm text-muted-foreground">
              E-mail
              <input
                v-model="editEmail"
                type="email"
                class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                placeholder="email@domena.pl"
              />
            </label>

            <label class="block text-sm text-muted-foreground">
              Nowe hasło
              <div class="mt-1 flex gap-2">
                <input
                  v-model="editPassword"
                  :type="showEditPassword ? 'text' : 'password'"
                  class="w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                  placeholder="Pozostaw puste, aby nie zmieniać"
                />
                <button
                  type="button"
                  class="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/40"
                  @click="showEditPassword = !showEditPassword"
                >
                  {{ showEditPassword ? "Ukryj" : "Pokaż" }}
                </button>
              </div>
            </label>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label class="block text-sm text-muted-foreground">
                Licencja (dni)
                <input
                  v-model.number="licenseDays"
                  type="number"
                  min="1"
                  class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                />
              </label>
              <label class="block text-sm text-muted-foreground">
                Limit aktywnych użytkowników
                <input
                  v-model.number="licenseMaxUsers"
                  type="number"
                  min="1"
                  class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                />
              </label>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              class="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40"
              @click="closeModify"
            >
              Zamknij
            </button>
            <button
              type="button"
              class="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 disabled:opacity-40"
              :disabled="isSubmitting"
              @click="saveUserChanges"
            >
              {{ isSubmitting ? "Zapisywanie..." : "Zapisz konto" }}
            </button>
            <button
              type="button"
              class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              :disabled="isSubmitting"
              @click="grantLicense"
            >
              {{ isSubmitting ? "Nadawanie..." : "Przyznaj licencję" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
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

async function readApiPayload(res) {
  const contentType = String(res.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    return await res.json().catch(() => ({}));
  }
  const text = await res.text();
  return { error: text?.slice(0, 180) || "Serwer zwrócił nieprawidłową odpowiedź." };
}

const isLoading = ref(false);
const loadError = ref("");
const actionError = ref("");
const actionUserId = ref("");

const stats = ref({ totalLessons: 0, finishedLessons: 0, usersCount: 0 });
const coverageBySubject = ref([]);
const users = ref([]);
const teacherCosts = ref([]);
const isLoadingCosts = ref(false);
const costSortBy = ref("total");
const costDirection = ref("desc");

const editUser = ref(null);
const editEmail = ref("");
const editPassword = ref("");
const showEditPassword = ref(false);
const licenseDays = ref(30);
const licenseMaxUsers = ref(1);
const isSubmitting = ref(false);
const newBusinessFullName = ref("");
const newBusinessLogin = ref("");
const newBusinessPassword = ref("");
const showNewBusinessPassword = ref(false);
const isCreatingBusinessUser = ref(false);

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pl-PL");
}

function currency(value) {
  return `${Number(value || 0).toFixed(2)} PLN`;
}

async function loadTeacherCosts() {
  isLoadingCosts.value = true;
  try {
    const headers = await getAuthHeader();
    const params = new URLSearchParams({
      sortBy: String(costSortBy.value || "total"),
      direction: String(costDirection.value || "desc")
    });
    const res = await fetch(`${API_BASE}/api/admin/teacher-costs?${params.toString()}`, { headers });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się pobrać kosztów nauczycieli.");
    teacherCosts.value = data.rows || [];
  } catch (e) {
    actionError.value = e.message;
  } finally {
    isLoadingCosts.value = false;
  }
}

async function loadDashboard() {
  isLoading.value = true;
  loadError.value = "";
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/api/admin/dashboard`, { headers });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się pobrać danych dashboardu.");
    stats.value = data.stats || { totalLessons: 0, finishedLessons: 0, usersCount: 0 };
    coverageBySubject.value = data.coverageBySubject || [];
    users.value = data.users || [];
    await loadTeacherCosts();
  } catch (e) {
    loadError.value = e.message;
  } finally {
    isLoading.value = false;
  }
}

watch([costSortBy, costDirection], () => {
  void loadTeacherCosts();
});

async function toggleBlock(user, blocked) {
  const shouldProceed = window.confirm(
    blocked
      ? `Na pewno chcesz zablokować konto ${user.email || user.full_name || user.id}?`
      : `Na pewno chcesz odblokować konto ${user.email || user.full_name || user.id}?`
  );
  if (!shouldProceed) return;

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
    users.value = users.value.map((item) => (item.id === user.id ? { ...item, blocked } : item));
  } catch (e) {
    actionError.value = e.message;
  } finally {
    actionUserId.value = "";
  }
}

function openModify(user) {
  editUser.value = user;
  editEmail.value = String(user.email || "");
  editPassword.value = "";
  showEditPassword.value = false;
  licenseDays.value = 30;
  licenseMaxUsers.value = Number(user.license?.maxActiveUsers || 1);
  actionError.value = "";
}

function closeModify() {
  editUser.value = null;
  editEmail.value = "";
  editPassword.value = "";
  showEditPassword.value = false;
}

async function saveUserChanges() {
  if (!editUser.value) return;
  isSubmitting.value = true;
  actionError.value = "";
  try {
    const headers = await getAuthHeader();
    headers["Content-Type"] = "application/json";

    const payload = {
      email: String(editEmail.value || "").trim(),
      password: String(editPassword.value || "").trim()
    };

    const res = await fetch(`${API_BASE}/api/admin/users/${editUser.value.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload)
    });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się zapisać zmian konta.");

    await loadDashboard();
    closeModify();
  } catch (e) {
    actionError.value = e.message;
  } finally {
    isSubmitting.value = false;
  }
}

async function grantLicense() {
  if (!editUser.value) return;
  isSubmitting.value = true;
  actionError.value = "";
  try {
    const headers = await getAuthHeader();
    headers["Content-Type"] = "application/json";

    const res = await fetch(`${API_BASE}/api/admin/users/${editUser.value.id}/license`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        days: Number(licenseDays.value || 30),
        maxActiveUsers: Number(licenseMaxUsers.value || 1)
      })
    });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się przyznać licencji.");

    await loadDashboard();
    closeModify();
  } catch (e) {
    actionError.value = e.message;
  } finally {
    isSubmitting.value = false;
  }
}

async function createBusinessUser() {
  isCreatingBusinessUser.value = true;
  actionError.value = "";
  try {
    const headers = await getAuthHeader();
    headers["Content-Type"] = "application/json";
    const res = await fetch(`${API_BASE}/api/admin/users/special-account`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        fullName: String(newBusinessFullName.value || "").trim(),
        login: String(newBusinessLogin.value || "").trim().toLowerCase(),
        password: String(newBusinessPassword.value || "")
      })
    });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się utworzyć konta służbowego.");

    newBusinessFullName.value = "";
    newBusinessLogin.value = "";
    newBusinessPassword.value = "";
    showNewBusinessPassword.value = false;
    await loadDashboard();
  } catch (e) {
    actionError.value = e.message;
  } finally {
    isCreatingBusinessUser.value = false;
  }
}

onMounted(loadDashboard);
</script>
