<template>
  <div class="min-h-full px-4 py-8 text-foreground sm:px-6 lg:px-10">
    <div class="mx-auto max-w-6xl space-y-6">
      <header>
        <p class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Administracja</p>
        <h1 class="text-3xl font-bold text-foreground">Organizacja</h1>
        <p class="mt-1 text-sm text-muted-foreground">Ustawienia szkoły, konta służbowe i koszty AI.</p>
      </header>

      <div v-if="organizationError" class="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {{ organizationError }}
      </div>
      <div v-if="successMessage" class="rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm text-foreground">
        {{ successMessage }}
      </div>

      <section class="rounded-2xl border border-border bg-card p-6">
        <h2 class="text-lg font-semibold text-foreground">Ustawienia szkoły</h2>
        <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label class="block text-sm text-muted-foreground">
            Nazwa szkoły
            <input
              v-model.trim="orgSchoolName"
              type="text"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="Np. Szkoła Podstawowa nr 1"
            />
          </label>
          <label class="block text-sm text-muted-foreground">
            Końcówka maili służbowych
            <input
              v-model.trim="orgBusinessEmailDomain"
              type="text"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="np. szkola.edu.pl"
            />
          </label>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            type="button"
            class="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 disabled:opacity-40"
            :disabled="isSavingOrgSettings"
            @click="saveOrganizationSettings"
          >
            {{ isSavingOrgSettings ? "Zapisywanie..." : "Zapisz ustawienia szkoły" }}
          </button>
        </div>
      </section>

      <section class="rounded-2xl border border-border bg-card p-6">
        <h2 class="text-lg font-semibold text-foreground">Utwórz konto służbowe</h2>
        <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label class="block text-sm text-muted-foreground">
            Imię i nazwisko
            <input
              v-model.trim="orgBusinessFullName"
              type="text"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="Jan Kowalski"
            />
          </label>
          <label class="block text-sm text-muted-foreground">
            Login służbowy
            <input
              v-model.trim="orgBusinessLogin"
              type="text"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="jan.kowalski"
            />
          </label>
          <label class="block text-sm text-muted-foreground">
            Hasło
            <div class="mt-1 flex gap-2">
              <input
                v-model="orgBusinessPassword"
                :type="showOrgBusinessPassword ? 'text' : 'password'"
                class="w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                placeholder="Minimum 8 znaków"
              />
              <button
                type="button"
                class="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/40"
                @click="showOrgBusinessPassword = !showOrgBusinessPassword"
              >
                {{ showOrgBusinessPassword ? "Ukryj" : "Pokaż" }}
              </button>
            </div>
          </label>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            type="button"
            class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            :disabled="isCreatingOrgBusinessUser"
            @click="createOrganizationBusinessUser"
          >
            {{ isCreatingOrgBusinessUser ? "Tworzenie..." : "Utwórz konto służbowe" }}
          </button>
        </div>
      </section>

      <section class="rounded-2xl border border-border bg-card p-6">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-foreground">Zużycie pieniędzy na nauczyciela</h2>
          <button
            type="button"
            class="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/40 disabled:opacity-40"
            :disabled="isLoadingOrgTeacherCosts"
            @click="loadOrganizationTeacherCosts"
          >
            {{ isLoadingOrgTeacherCosts ? "Ładowanie..." : "Odśwież koszty" }}
          </button>
        </div>
        <div v-if="!orgTeacherCosts.length" class="text-sm text-muted-foreground">Brak danych kosztów nauczycieli.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th class="px-3 py-2 font-medium">Nauczyciel</th>
                <th class="px-3 py-2 font-medium">Koszt dostawcy</th>
                <th class="px-3 py-2 font-medium">Koszt platformy</th>
                <th class="px-3 py-2 font-medium">Razem</th>
                <th class="px-3 py-2 font-medium text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in orgTeacherCosts" :key="row.teacherId" class="border-b border-border/60">
                <td class="px-3 py-3">
                  <div class="font-medium text-foreground">{{ row.fullName || "Brak nazwy" }}</div>
                  <div class="text-xs text-muted-foreground">{{ row.email || row.teacherId }}</div>
                </td>
                <td class="px-3 py-3 text-muted-foreground">{{ formatCurrencyPLN(row.base) }}</td>
                <td class="px-3 py-3 text-muted-foreground">{{ formatCurrencyPLN(row.margin) }}</td>
                <td class="px-3 py-3 font-semibold text-foreground">{{ formatCurrencyPLN(row.total) }}</td>
                <td class="px-3 py-3 text-right">
                  <button
                    type="button"
                    class="rounded-xl px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-900/20"
                    :disabled="isDeletingTeacher"
                    @click="deleteOrganizationTeacher(row)"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { supabase } from "../supabase";

function normalizeBaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "";

const organizationError = ref("");
const successMessage = ref("");
const orgSchoolName = ref("");
const orgBusinessEmailDomain = ref("");
const isSavingOrgSettings = ref(false);
const orgBusinessFullName = ref("");
const orgBusinessLogin = ref("");
const orgBusinessPassword = ref("");
const showOrgBusinessPassword = ref(false);
const isCreatingOrgBusinessUser = ref(false);
const orgTeacherCosts = ref([]);
const isLoadingOrgTeacherCosts = ref(false);
const isDeletingTeacher = ref(false);

function formatCurrencyPLN(value) {
  return `${Number(value || 0).toFixed(2)} PLN`;
}

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

async function loadOrganizationPanelData() {
  organizationError.value = "";
  try {
    const headers = await getAuthHeader();
    const dashboardRes = await fetch(`${API_BASE}/api/admin/dashboard`, { headers });
    const dashboardData = await readApiPayload(dashboardRes);
    if (!dashboardRes.ok) throw new Error(dashboardData.error || "Brak dostępu do danych organizacji.");
    orgSchoolName.value = String(dashboardData.schoolSettings?.schoolName || "");
    orgBusinessEmailDomain.value = String(dashboardData.schoolSettings?.businessEmailDomain || "");
    await loadOrganizationTeacherCosts();
  } catch (error) {
    organizationError.value = error.message || "Nie udało się wczytać panelu organizacji.";
  }
}

async function saveOrganizationSettings() {
  isSavingOrgSettings.value = true;
  organizationError.value = "";
  successMessage.value = "";
  try {
    const headers = await getAuthHeader();
    headers["Content-Type"] = "application/json";
    const res = await fetch(`${API_BASE}/api/admin/school-settings`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        schoolName: String(orgSchoolName.value || "").trim(),
        businessEmailDomain: String(orgBusinessEmailDomain.value || "").trim().toLowerCase()
      })
    });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się zapisać ustawień szkoły.");
    orgSchoolName.value = String(data.schoolSettings?.schoolName || orgSchoolName.value);
    orgBusinessEmailDomain.value = String(data.schoolSettings?.businessEmailDomain || orgBusinessEmailDomain.value);
    successMessage.value = "Zapisano ustawienia szkoły.";
  } catch (error) {
    organizationError.value = error.message || "Nie udało się zapisać ustawień szkoły.";
  } finally {
    isSavingOrgSettings.value = false;
  }
}

async function createOrganizationBusinessUser() {
  isCreatingOrgBusinessUser.value = true;
  organizationError.value = "";
  successMessage.value = "";
  try {
    const headers = await getAuthHeader();
    headers["Content-Type"] = "application/json";
    const res = await fetch(`${API_BASE}/api/admin/users/special-account`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        fullName: String(orgBusinessFullName.value || "").trim(),
        login: String(orgBusinessLogin.value || "").trim().toLowerCase(),
        password: String(orgBusinessPassword.value || "")
      })
    });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się utworzyć konta służbowego.");
    orgBusinessFullName.value = "";
    orgBusinessLogin.value = "";
    orgBusinessPassword.value = "";
    showOrgBusinessPassword.value = false;
    successMessage.value = "Utworzono konto służbowe.";
  } catch (error) {
    organizationError.value = error.message || "Nie udało się utworzyć konta służbowego.";
  } finally {
    isCreatingOrgBusinessUser.value = false;
  }
}

async function loadOrganizationTeacherCosts() {
  isLoadingOrgTeacherCosts.value = true;
  organizationError.value = "";
  try {
    const headers = await getAuthHeader();
    const params = new URLSearchParams({ sortBy: "total", direction: "desc" });
    const res = await fetch(`${API_BASE}/api/admin/teacher-costs?${params.toString()}`, { headers });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się pobrać kosztów nauczycieli.");
    orgTeacherCosts.value = Array.isArray(data.rows) ? data.rows : [];
  } catch (error) {
    organizationError.value = error.message || "Nie udało się pobrać kosztów nauczycieli.";
  } finally {
    isLoadingOrgTeacherCosts.value = false;
  }
}

async function deleteOrganizationTeacher(teacher) {
  if (!teacher.userId) {
    organizationError.value = "Konto nie ma przypisanego User ID i nie może być usunięte.";
    return;
  }

  const confirmed = window.confirm(`Czy na pewno chcesz trwale usunąć konto użytkownika ${teacher.fullName || teacher.email || 'Nieznany'}? Ta akcja jest nieodwracalna.`);
  if (!confirmed) return;

  isDeletingTeacher.value = true;
  organizationError.value = "";
  successMessage.value = "";

  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/api/admin/users/${teacher.userId}`, {
      method: "DELETE",
      headers,
    });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udało się usunąć użytkownika.");
    
    successMessage.value = "Pomyślnie usunięto konto nauczyciela.";
    await loadOrganizationTeacherCosts();
  } catch (error) {
    organizationError.value = error.message || "Nie udało się usunąć konta.";
  } finally {
    isDeletingTeacher.value = false;
  }
}

onMounted(() => {
  void loadOrganizationPanelData();
});
</script>
