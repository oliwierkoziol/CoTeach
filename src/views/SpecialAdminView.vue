<template>
  <div class="min-h-full px-4 py-8 sm:px-6 lg:px-10">
    <div class="mx-auto max-w-7xl space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Panel admina</p>
          <h1 class="text-3xl font-bold text-foreground">Dashboard admina</h1>
          <p class="mt-1 text-sm text-muted-foreground">Statystyki lekcji, pokrycie i zarzÄ…dzanie kontami.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <RouterLink
            to="/admin/cost-calculator"
            class="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40"
          >
            Kalkulator kosztĂłw
          </RouterLink>
          <button
            type="button"
            class="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 disabled:opacity-40"
            :disabled="isLoading"
            @click="loadDashboard"
          >
            {{ isLoading ? "OdĹ›wieĹĽanie..." : "OdĹ›wieĹĽ" }}
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
          <p class="text-xs uppercase tracking-[0.16em] text-muted-foreground">Konta uĹĽytkownikĂłw</p>
          <p class="mt-2 text-3xl font-black text-foreground">{{ stats.usersCount }}</p>
        </article>
      </section>

      <section class="rounded-2xl border border-border bg-card p-6">
        <h2 class="mb-4 text-lg font-semibold text-foreground">Pokrycie wedĹ‚ug przedmiotĂłw</h2>
        <div v-if="!coverageBySubject.length" class="text-sm text-muted-foreground">Brak danych pokrycia.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th class="px-3 py-2 font-medium">Przedmiot</th>
                <th class="px-3 py-2 font-medium">Lekcje</th>
                <th class="px-3 py-2 font-medium">OmĂłwione / Wszystkie</th>
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
              <option value="total">Sortuj: koszt caĹ‚kowity</option>
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
              <option value="desc">MalejÄ…co</option>
              <option value="asc">RosnÄ…co</option>
            </select>

            <button
              type="button"
              class="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/40 disabled:opacity-40"
              :disabled="isLoadingCosts"
              @click="loadTeacherCosts"
            >
              {{ isLoadingCosts ? "Ĺadowanie..." : "OdĹ›wieĹĽ koszty" }}
            </button>
          </div>
        </div>

        <div v-if="!teacherCosts.length" class="text-sm text-muted-foreground">Brak danych kosztĂłw nauczycieli.</div>
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
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/10">
                      <img
                        v-if="row.avatar_url"
                        :src="row.avatar_url"
                        :alt="row.fullName || 'Avatar'"
                        class="h-full w-full object-cover"
                      />
                      <div v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-primary">
                        {{ getInitials(row.fullName) }}
                      </div>
                    </div>
                    <div>
                      <div class="font-medium text-foreground">{{ row.fullName || "Brak nazwy" }}</div>
                      <div class="text-xs text-muted-foreground">{{ row.email || row.teacherId }}</div>
                    </div>
                  </div>
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
          <h2 class="text-lg font-semibold text-foreground">Konta uĹĽytkownikĂłw ({{ users.length }})</h2>
        </div>

        <div v-if="!users.length" class="px-6 py-10 text-sm text-muted-foreground">Brak kont.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <th class="px-6 py-3 font-medium">ImiÄ™ i nazwisko</th>
                <th class="px-6 py-3 font-medium">E-mail</th>
                <th class="px-6 py-3 font-medium">Status</th>
                <th class="px-6 py-3 font-medium">Licencja</th>
                <th class="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="user in users" :key="user.id" class="hover:bg-muted/30">
                <td class="px-6 py-4 font-medium text-foreground">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/10">
                      <img
                        v-if="user.avatar_url"
                        :src="user.avatar_url"
                        :alt="user.full_name || 'Avatar'"
                        class="h-full w-full object-cover"
                      />
                      <div v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-primary">
                        {{ getInitials(user.full_name) }}
                      </div>
                    </div>
                    <span>{{ user.full_name || "â€”" }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-muted-foreground">{{ user.email || "â€”" }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="user.blocked ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'"
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  >
                    {{ user.blocked ? "Zablokowane" : "Aktywne" }}
                  </span>
                </td>
                <td class="px-6 py-4 text-muted-foreground">
                  <div v-if="user.license" class="space-y-1">
                    <div>do {{ formatDate(user.license.expiresAt) }}</div>
                    <div class="text-xs">
                      Typ:
                      <span
                        :class="user.license.demoMode ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'"
                        class="font-semibold"
                      >
                        {{ user.license.demoMode ? "Demo" : "Standard" }}
                      </span>
                    </div>
                  </div>
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
        <h2 class="text-lg font-semibold text-foreground">Ustawienia szkoĹ‚y</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Ustaw nazwÄ™ szkoĹ‚y i koĹ„cĂłwkÄ™ maili sĹ‚uĹĽbowych dla kont tworzonych przez administratora.
        </p>

        <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label class="block text-sm text-muted-foreground">
            Nazwa szkoĹ‚y
            <input
              v-model.trim="schoolName"
              type="text"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="Np. SzkoĹ‚a Podstawowa nr 1"
            />
          </label>
          <label class="block text-sm text-muted-foreground">
            KoĹ„cĂłwka maili sĹ‚uĹĽbowych
            <input
              v-model.trim="businessEmailDomain"
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
            :disabled="isSavingSchoolSettings"
            @click="saveSchoolSettings"
          >
            {{ isSavingSchoolSettings ? "Zapisywanie..." : "Zapisz ustawienia szkoĹ‚y" }}
          </button>
        </div>
      </section>

      <section class="rounded-2xl border border-border bg-card p-6">
        <h2 class="text-lg font-semibold text-foreground">UtwĂłrz konto sĹ‚uĹĽbowe</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Administrator moĹĽe utworzyÄ‡ konto ze specjalnym loginem i hasĹ‚em.
        </p>

        <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label class="block text-sm text-muted-foreground">
            ImiÄ™ i nazwisko
            <input
              v-model.trim="newBusinessFullName"
              type="text"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="Jan Kowalski"
            />
          </label>
          <label class="block text-sm text-muted-foreground">
            Login sĹ‚uĹĽbowy
            <input
              v-model.trim="newBusinessLogin"
              type="text"
              class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="jan.kowalski"
            />
          </label>
          <label class="block text-sm text-muted-foreground">
            HasĹ‚o
            <div class="mt-1 flex gap-2">
              <input
                v-model="newBusinessPassword"
                :type="showNewBusinessPassword ? 'text' : 'password'"
                class="w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                placeholder="Minimum 8 znakĂłw"
              />
              <button
                type="button"
                class="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/40"
                @click="showNewBusinessPassword = !showNewBusinessPassword"
              >
                {{ showNewBusinessPassword ? "Ukryj" : "PokaĹĽ" }}
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
            {{ isCreatingBusinessUser ? "Tworzenie..." : "UtwĂłrz konto sĹ‚uĹĽbowe" }}
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
        <form
          class="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
          @submit.prevent="saveAllChanges"
          @keydown.enter="handleEditFormEnter"
        >
          <h3 class="text-xl font-bold text-foreground">Modyfikuj konto</h3>
          <p class="mt-1 text-sm text-muted-foreground">{{ editUser.full_name || editUser.email || editUser.id }}</p>

          <div class="mt-5 space-y-4">
            <label class="block text-sm text-muted-foreground">
              Organizacja
              <select
                v-model="editSchoolId"
                class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              >
                <option v-for="org in organizations" :key="org.id" :value="org.id">
                  {{ org.name }}
                </option>
              </select>
            </label>

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
              Nowe hasĹ‚o
              <div class="mt-1 flex gap-2">
                <input
                  v-model="editPassword"
                  :type="showEditPassword ? 'text' : 'password'"
                  class="w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                  placeholder="Pozostaw puste, aby nie zmieniaÄ‡"
                />
                <button
                  type="button"
                  class="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/40"
                  @click="showEditPassword = !showEditPassword"
                >
                  {{ showEditPassword ? "Ukryj" : "PokaĹĽ" }}
                </button>
              </div>
            </label>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label class="block text-sm text-muted-foreground">
                Licencja (dni)
                <input
                  v-model.number="licenseDays"
                  type="number"
                  min="0"
                  class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                />
                <p class="mt-1 text-xs text-muted-foreground">Wpisz 0, aby odebraÄ‡ licencjÄ™.</p>
              </label>
              <label class="block text-sm text-muted-foreground">
                Limit aktywnych uĹĽytkownikĂłw
                <input
                  v-model.number="licenseMaxUsers"
                  type="number"
                  min="1"
                  class="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                />
              </label>
            </div>

            <label class="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                v-model="licenseDemoMode"
                type="checkbox"
                class="h-4 w-4 rounded border-border bg-input-background text-primary focus:ring-primary/40"
              />
              Tryb demo (ograniczenia: krĂłtsza lekcja live, mniejsze limity i watermark)
            </label>
          </div>

          <div class="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-500/20 disabled:opacity-40 dark:text-red-300"
              :disabled="isSubmitting"
              @click="deleteUserAccount"
            >
              {{ isSubmitting ? "Usuwanie..." : "UsuĹ„ konto" }}
            </button>
            <button
              type="button"
              class="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40"
              @click="closeModify"
            >
              Zamknij
            </button>
            <button
              type="submit"
              class="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/40 disabled:opacity-40"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Zapisywanie..." : "Zapisz zmiany" }}
            </button>
          </div>
        </form>
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
const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "";
const BUSINESS_DOMAIN_CACHE_KEY = "businessEmailDomainCache";

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
  return { error: text?.slice(0, 180) || "Serwer zwrĂłciĹ‚ nieprawidĹ‚owÄ… odpowiedĹş." };
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
const editSchoolId = ref("");
const showEditPassword = ref(false);
const licenseDays = ref(30);
const licenseMaxUsers = ref(1);
const licenseDemoMode = ref(false);
const isSubmitting = ref(false);
const newBusinessFullName = ref("");
const newBusinessLogin = ref("");
const newBusinessPassword = ref("");
const showNewBusinessPassword = ref(false);
const isCreatingBusinessUser = ref(false);
const schoolName = ref("");
const businessEmailDomain = ref("");
const isSavingSchoolSettings = ref(false);
const organizations = ref([]);

async function loadOrganizations() {
  try {
    const res = await fetch(`${API_BASE}/api/public/organizations`);
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udaĹ‚o siÄ™ pobraÄ‡ organizacji.");
    organizations.value = Array.isArray(data.organizations) ? data.organizations : [];
  } catch (e) {
    actionError.value = e.message;
  }
}

function formatDate(value) {
  if (!value) return "â€”";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "â€”";
  return date.toLocaleDateString("pl-PL");
}

function currency(value) {
  return `${Number(value || 0).toFixed(2)} PLN`;
}

function getInitials(fullName) {
  if (!fullName) return "?";
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0]?.substring(0, 2).toUpperCase() || "?";
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
    if (!res.ok) throw new Error(data.error || "Nie udaĹ‚o siÄ™ pobraÄ‡ kosztĂłw nauczycieli.");
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
    if (!res.ok) throw new Error(data.error || "Nie udaĹ‚o siÄ™ pobraÄ‡ danych dashboardu.");
    stats.value = data.stats || { totalLessons: 0, finishedLessons: 0, usersCount: 0 };
    coverageBySubject.value = data.coverageBySubject || [];
    users.value = data.users || [];
    schoolName.value = String(data.schoolSettings?.schoolName || "");
    businessEmailDomain.value = String(data.schoolSettings?.businessEmailDomain || "");
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
      ? `Na pewno chcesz zablokowaÄ‡ konto ${user.email || user.full_name || user.id}?`
      : `Na pewno chcesz odblokowaÄ‡ konto ${user.email || user.full_name || user.id}?`
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
    if (!res.ok) throw new Error(data.error || "Nie udaĹ‚o siÄ™ zmieniÄ‡ statusu konta.");
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
  editSchoolId.value = String(user.school_id || "");
  editPassword.value = "";
  showEditPassword.value = false;
  const expiresAtMs = new Date(user.license?.expiresAt || "").getTime();
  const daysLeft = Number.isFinite(expiresAtMs)
    ? Math.max(0, Math.ceil((expiresAtMs - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;
  licenseDays.value = daysLeft;
  licenseMaxUsers.value = Number(user.license?.maxActiveUsers || 1);
  licenseDemoMode.value = user.license?.demoMode === true;
  actionError.value = "";
}

function closeModify() {
  editUser.value = null;
  editEmail.value = "";
  editSchoolId.value = "";
  editPassword.value = "";
  showEditPassword.value = false;
}

function handleEditFormEnter(event) {
  const target = event?.target;
  const tagName = String(target?.tagName || "").toLowerCase();
  const inputType = String(target?.type || "").toLowerCase();

  if (tagName === "textarea" || inputType === "button") return;
  if (isSubmitting.value) return;

  event.preventDefault();
  void saveAllChanges();
}

async function saveAllChanges() {
  if (!editUser.value) return;
  isSubmitting.value = true;
  actionError.value = "";
  try {
    const headers = await getAuthHeader();
    headers["Content-Type"] = "application/json";

    const accountPayload = {
      email: String(editEmail.value || "").trim(),
      password: String(editPassword.value || "").trim(),
      schoolId: String(editSchoolId.value || "").trim()
    };

    const accountRes = await fetch(`${API_BASE}/api/admin/users/${editUser.value.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(accountPayload)
    });
    const accountData = await readApiPayload(accountRes);
    if (!accountRes.ok) throw new Error(accountData.error || "Nie udaĹ‚o siÄ™ zapisaÄ‡ zmian konta.");

    const licenseRes = await fetch(`${API_BASE}/api/admin/users/${editUser.value.id}/license`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        days: Number(licenseDays.value ?? 0),
        maxActiveUsers: Number(licenseMaxUsers.value || 1),
        demoMode: licenseDemoMode.value === true
      })
    });
    const licenseData = await readApiPayload(licenseRes);
    if (!licenseRes.ok) throw new Error(licenseData.error || "Nie udaĹ‚o siÄ™ zapisaÄ‡ zmian licencji.");

    await loadDashboard();
    closeModify();
  } catch (e) {
    actionError.value = e.message;
  } finally {
    isSubmitting.value = false;
  }
}

async function deleteUserAccount() {
  if (!editUser.value) return;

  const label = editUser.value.email || editUser.value.full_name || editUser.value.id;
  const shouldDelete = window.confirm(`Na pewno chcesz usunÄ…Ä‡ konto ${label}? Tej operacji nie moĹĽna cofnÄ…Ä‡.`);
  if (!shouldDelete) return;

  isSubmitting.value = true;
  actionError.value = "";
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/api/admin/users/${editUser.value.id}`, {
      method: "DELETE",
      headers
    });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udaĹ‚o siÄ™ usunÄ…Ä‡ konta.");

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
    if (!res.ok) throw new Error(data.error || "Nie udaĹ‚o siÄ™ utworzyÄ‡ konta sĹ‚uĹĽbowego.");

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

async function saveSchoolSettings() {
  isSavingSchoolSettings.value = true;
  actionError.value = "";
  try {
    const headers = await getAuthHeader();
    headers["Content-Type"] = "application/json";
    const res = await fetch(`${API_BASE}/api/admin/school-settings`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        schoolName: String(schoolName.value || "").trim(),
        businessEmailDomain: String(businessEmailDomain.value || "").trim().toLowerCase()
      })
    });
    const data = await readApiPayload(res);
    if (!res.ok) throw new Error(data.error || "Nie udaĹ‚o siÄ™ zapisaÄ‡ ustawieĹ„ szkoĹ‚y.");
    schoolName.value = String(data.schoolSettings?.schoolName || schoolName.value);
    businessEmailDomain.value = String(data.schoolSettings?.businessEmailDomain || businessEmailDomain.value);
    try {
      localStorage.setItem(BUSINESS_DOMAIN_CACHE_KEY, businessEmailDomain.value);
    } catch {
      // Ignore storage errors.
    }
  } catch (e) {
    actionError.value = e.message;
  } finally {
    isSavingSchoolSettings.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadDashboard(), loadOrganizations()]);
});
</script>
