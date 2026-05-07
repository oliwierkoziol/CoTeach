<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] w-full overflow-x-hidden relative">
    <!-- Background Decor -->
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0"></div>

    <div class="p-4 sm:p-6 md:p-12 pt-8 w-full max-w-[1664px] relative z-10 mx-auto space-y-8">
      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-7">
        <div>
          <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
            Dashboard admina
          </h2>
          <p class="font-['Plus_Jakarta_Sans'] font-normal text-[#454652] text-[18px] leading-[28px]">
            Przeglądaj statystyki lekcji, pokrycie tematów i zarządzaj kontami użytkowników.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <RouterLink
            to="/admin/cost-calculator"
            class="inline-flex h-11 items-center gap-2 rounded-xl bg-[#e7e8ee] px-6 text-[15px] font-bold text-[#4b5563] transition hover:bg-[#dde0e8]"
          >
            Kalkulator kosztów
          </RouterLink>
          <button
            type="button"
            class="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0c3dfe] px-6 text-[15px] font-bold text-white transition hover:bg-[#0a34d4] disabled:opacity-40"
            :disabled="isLoading"
            @click="loadDashboard"
          >
            <svg v-if="isLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ isLoading ? "Odświeżanie..." : "Odśwież dashboard" }}
          </button>
        </div>
      </header>

      <div v-if="loadError" class="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-medium text-red-700">
        {{ loadError }}
      </div>

      <!-- Stats Grid -->
      <section class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <article class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">

          <p class="font-['Inter'] font-medium text-[#454652] text-[14px] leading-5">Przeprowadzone lekcje</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] text-[32px] mt-1">{{ stats.finishedLessons }}</p>
        </article>

        <article class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
         
          <p class="font-['Inter'] font-medium text-[#454652] text-[14px] leading-5">Wszystkie lekcje</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] text-[32px] mt-1">{{ stats.totalLessons }}</p>
        </article>

        <article class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
          
          <p class="font-['Inter'] font-medium text-[#454652] text-[14px] leading-5">Konta użytkowników</p>
          <p class="font-['Manrope'] font-bold text-[#191c1e] text-[32px] mt-1">{{ stats.usersCount }}</p>
        </article>
      </section>

      <!-- Subject Coverage -->
      <section class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6">
        <h2 class="font-['Manrope'] font-extrabold text-[#191c1e] text-[18px] leading-[28px] mb-6">Pokrycie według przedmiotów</h2>
        <div v-if="!coverageBySubject.length" class="text-sm text-[#454652]">Brak danych pokrycia.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left font-['Plus_Jakarta_Sans']">
            <thead>
              <tr class="border-b border-[#e0e3e6] text-xs font-bold uppercase text-[#767683] tracking-wider">
                <th class="px-3 py-2 font-medium">Przedmiot</th>
                <th class="px-3 py-2 font-medium">Lekcje</th>
                <th class="px-3 py-2 font-medium">Omówione / Wszystkie</th>
                <th class="px-3 py-2 font-medium">Pokrycie</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#e0e3e6]">
              <tr v-for="item in coverageBySubject" :key="item.subject" class="hover:bg-[#f7f9fc]">
                <td class="px-3 py-4 font-bold text-[#191c1e]">{{ item.subject }}</td>
                <td class="px-3 py-4 text-[#454652]">{{ item.lessons }}</td>
                <td class="px-3 py-4 text-[#454652]">{{ item.discussedPoints }} / {{ item.totalPoints }}</td>
                <td class="px-3 py-3">
                  <span class="rounded-full bg-[#e8eefb] px-3 py-1 text-xs font-bold text-[#142588]">
                    {{ item.coveragePercent }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Teacher Costs -->
      <section class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="font-['Manrope'] font-extrabold text-[#191c1e] text-[18px] leading-[28px] mb-6">Koszty AI per nauczyciel</h2>
          <div class="flex flex-wrap items-center gap-2">
            <select
              v-model="costSortBy"
              class="rounded-lg border-none bg-[#e0e3e6] px-3 py-2 text-xs font-bold text-[#191c1e] focus:ring-2 focus:ring-[#0c3dfe]/50 outline-none"
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
              class="rounded-lg border-none bg-[#e0e3e6] px-3 py-2 text-xs font-bold text-[#191c1e] focus:ring-2 focus:ring-[#0c3dfe]/50 outline-none"
            >
              <option value="desc">Malejąco</option>
              <option value="asc">Rosnąco</option>
            </select>

            <button
              type="button"
              class="rounded-lg bg-[#e7e8ee] px-3 py-2 text-xs font-bold text-[#4b5563] transition hover:bg-[#dde0e8] disabled:opacity-40"
              :disabled="isLoadingCosts"
              @click="loadTeacherCosts"
            >
              {{ isLoadingCosts ? "Ładowanie..." : "Odśwież" }}
            </button>
          </div>
        </div>

        <div v-if="!teacherCosts.length" class="text-sm text-[#454652]">Brak danych kosztów nauczycieli.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left font-['Plus_Jakarta_Sans']">
            <thead class="bg-[#f7f9fc]">
              <tr class="border-b border-[#e0e3e6] text-xs font-bold uppercase text-[#767683] tracking-wider">
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
            <tbody class="divide-y divide-[#e0e3e6]">
              <tr v-for="row in teacherCosts" :key="row.teacherId" class="hover:bg-[#f7f9fc]">
                <td class="px-3 py-4">
                  <div class="font-bold text-[#191c1e]">{{ row.fullName || "Brak nazwy" }}</div>
                  <div class="text-[11px] text-[#767683]">{{ row.email || row.teacherId }}</div>
                </td>
                <td class="px-3 py-4 text-[#454652]">{{ currency(row.base) }}</td>
                <td class="px-3 py-4 text-[#454652]">{{ currency(row.margin) }}</td>
                <td class="px-3 py-4 font-bold text-[#142588]">{{ currency(row.total) }}</td>
                <td class="px-3 py-4 text-[#454652]">{{ currency(row.notes) }}</td>
                <td class="px-3 py-4 text-[#454652]">{{ currency(row.live) }}</td>
                <td class="px-3 py-4 text-[#454652]">{{ currency(row.presentation) }}</td>
                <td class="px-3 py-4 text-[#454652]">{{ currency(row.other) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- User Accounts -->
      <section class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] overflow-hidden">
        <div class="flex items-center justify-between border-b border-[#e0e3e6] px-6 py-4">
          <h2 class="font-['Manrope'] font-extrabold text-[#191c1e] text-[18px] leading-[28px] mb-2">Konta użytkowników ({{ users.length }})</h2>
        </div>

        <div v-if="!users.length" class="px-6 py-10 text-sm text-[#454652]">Brak kont.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left font-['Plus_Jakarta_Sans']">
            <thead>
              <tr class="bg-[#f7f9fc] text-xs font-bold uppercase text-[#767683] tracking-wider">
                <th class="px-6 py-3 font-medium">Imię i nazwisko</th>
                <th class="px-6 py-3 font-medium">E-mail</th>
                <th class="px-6 py-3 font-medium">Status</th>
                <th class="px-6 py-3 font-medium">Licencja</th>
                <th class="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#e0e3e6]">
              <tr v-for="user in users" :key="user.id" class="hover:bg-[#f7f9fc]">
                <td class="px-6 py-4 font-bold text-[#191c1e]">{{ user.full_name || "—" }}</td>
                <td class="px-6 py-4 text-[#454652]">{{ user.email || "—" }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="user.blocked ? 'bg-red-500/10 text-red-700' : 'bg-green-500/10 text-green-700'"
                    class="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                  >
                    {{ user.blocked ? "Zablokowane" : "Aktywne" }}
                  </span>
                </td>
                <td class="px-6 py-4 text-[#454652] text-sm">
                  <div v-if="user.license" class="space-y-1">
                    <div class="font-medium">do {{ formatDate(user.license.expiresAt) }}</div>
                    <div class="text-[11px] text-[#767683]">
                      Typ:
                      <span class="text-green-600 font-bold">
                        {{ "Standard" }}
                      </span>
                    </div>
                  </div>
                  <span v-else>Brak</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      class="rounded-lg bg-[#e7e8ee] px-4 py-2 text-xs font-bold text-[#4b5563] transition hover:bg-[#dde0e8] disabled:opacity-40"
                      :disabled="actionUserId === user.id"
                      @click="toggleBlock(user, !user.blocked)"
                    >
                      {{ user.blocked ? "Odblokuj" : "Zablokuj" }}
                    </button>
                    <button
                      type="button"
                      class="rounded-lg bg-[#0c3dfe] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0a34d4]"
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

      <!-- School Settings -->
      <section class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <h2 class="font-['Manrope'] font-extrabold text-[#191c1e] text-[18px] leading-[28px] mb-2">Ustawienia szkoły</h2>
        <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[14px] mb-8">
          Ustaw nazwę szkoły i końcówkę maili służbowych dla kont tworzonych przez administratora.
        </p>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label class="block">
            <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] leading-[20px] mb-2 block">Nazwa szkoły</span>
            <div class="bg-[#e0e3e6] h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input v-model.trim="schoolName" type="text" class="bg-transparent border-none outline-none w-full h-full px-4 text-[16px] text-[#191c1e] font-['Plus_Jakarta_Sans']" placeholder="Np. Szkoła Podstawowa nr 1" />
            </div>
          </label>
          <label class="block">
            <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] leading-[20px] mb-2 block">Końcówka maili służbowych</span>
            <div class="bg-[#e0e3e6] h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input v-model.trim="businessEmailDomain" type="text" class="bg-transparent border-none outline-none w-full h-full px-4 text-[16px] text-[#191c1e] font-['Plus_Jakarta_Sans']" placeholder="np. szkola.edu.pl" />
            </div>
          </label>
        </div>

        <div class="mt-8 flex justify-end">
          <button
            type="button"
            class="bg-[#0c3dfe] px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:bg-[#0a34d4] transition-all disabled:opacity-50"
            :disabled="isSavingSchoolSettings"
            @click="saveSchoolSettings"
          >
            {{ isSavingSchoolSettings ? "Zapisywanie..." : "Zapisz zmiany" }}
          </button>
        </div>
      </section>

      <!-- Create Business Account -->
      <section class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-8">
        <h2 class="font-['Manrope'] font-extrabold text-[#191c1e] text-[18px] leading-[28px] mb-1">Utwórz konto służbowe</h2>
        <p class="font-['Plus_Jakarta_Sans'] text-[#454652] text-[14px] mb-8">
          Administrator może utworzyć konto ze specjalnym loginem i hasłem.
        </p>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <label class="block">
            <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] mb-2 block">Imię i nazwisko</span>
            <div class="bg-[#e0e3e6] h-[48px] rounded-[8px] flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input v-model.trim="newBusinessFullName" type="text" class="bg-transparent border-none outline-none w-full px-4 text-[16px] text-[#191c1e] font-['Plus_Jakarta_Sans']" placeholder="Jan Kowalski" />
            </div>
          </label>
          <label class="block">
            <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] mb-2 block">Login służbowy</span>
            <div class="bg-[#e0e3e6] h-[48px] rounded-[8px] flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input v-model.trim="newBusinessLogin" type="text" class="bg-transparent border-none outline-none w-full px-4 text-[16px] text-[#191c1e] font-['Plus_Jakarta_Sans']" placeholder="jan.kowalski" />
            </div>
          </label>
          <label class="block">
            <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] mb-2 block">Hasło</span>
            <div class="bg-[#e0e3e6] h-[48px] rounded-[8px] flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
              <input v-model="newBusinessPassword" :type="showNewBusinessPassword ? 'text' : 'password'" class="bg-transparent border-none outline-none flex-1 px-4 text-[16px] text-[#191c1e] font-['Plus_Jakarta_Sans']" placeholder="Min. 8 znaków" />
              <button type="button" class="px-3 py-2 text-xs font-bold text-[#142588]" @click="showNewBusinessPassword = !showNewBusinessPassword">
                {{ showNewBusinessPassword ? "Ukryj" : "Pokaż" }}
              </button>
            </div>
          </label>
        </div>

        <div class="mt-8 flex justify-end">
          <button
            type="button"
            class="bg-[#0c3dfe] px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:bg-[#0a34d4] transition-all disabled:opacity-50"
            :disabled="isCreatingBusinessUser"
            @click="createBusinessUser"
          >
            {{ isCreatingBusinessUser ? "Tworzenie..." : "Utwórz konto" }}
          </button>
        </div>
      </section>

      <div v-if="actionError" class="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-medium text-red-700">
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
          class="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl space-y-6 font-['Plus_Jakarta_Sans']"
          @submit.prevent="saveAllChanges"
          @keydown.enter="handleEditFormEnter"
        >
          <div>
            <h3 class="text-2xl font-extrabold text-[#191c1e]">Modyfikuj konto</h3>
            <p class="text-[#454652] mt-1">{{ editUser.full_name || editUser.email || editUser.id }}</p>
          </div>

          <div class="space-y-4">
            <label class="block">
              <span class="font-semibold text-[#454652] text-[14px] mb-2 block">E-mail</span>
              <div class="bg-[#e0e3e6] h-[48px] rounded-[8px] flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                <input v-model="editEmail" type="email" class="bg-transparent border-none outline-none w-full px-4 text-[16px] text-[#191c1e]" placeholder="email@domena.pl" />
              </div>
            </label>

            <label class="block">
              <span class="font-semibold text-[#454652] text-[14px] mb-2 block">Nowe hasło</span>
              <div class="bg-[#e0e3e6] h-[48px] rounded-[8px] flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                <input v-model="editPassword" :type="showEditPassword ? 'text' : 'password'" class="bg-transparent border-none outline-none flex-1 px-4 text-[16px] text-[#191c1e]" placeholder="Pozostaw puste, aby nie zmieniać" />
                <button type="button" class="px-3 py-2 text-xs font-bold text-[#142588]" @click="showEditPassword = !showEditPassword">
                  {{ showEditPassword ? "Ukryj" : "Pokaż" }}
                </button>
              </div>
            </label>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="font-semibold text-[#454652] text-[14px] mb-2 block">Licencja (dni)</span>
                <div class="bg-[#e0e3e6] h-[48px] rounded-[8px] flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                  <input v-model.number="licenseDays" type="number" min="0" class="bg-transparent border-none outline-none w-full px-4 text-[16px] text-[#191c1e]" />
                </div>
                <p class="mt-1 text-xs text-[#767683]">Wpisz 0, aby odebrać licencję.</p>
              </label>
              <label class="block">
                <span class="font-semibold text-[#454652] text-[14px] mb-2 block">Limit użytkowników</span>
                <div class="bg-[#e0e3e6] h-[48px] rounded-[8px] flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                  <input v-model.number="licenseMaxUsers" type="number" min="1" class="bg-transparent border-none outline-none w-full px-4 text-[16px] text-[#191c1e]" />
                </div>
              </label>
            </div>


            <div v-if="actionError" class="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700">
              {{ actionError }}
            </div>
          </div>

          <div class="pt-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              class="order-last sm:order-first px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
              :disabled="isSubmitting"
              @click="deleteUserAccount"
            >
              {{ isSubmitting ? "Usuwanie..." : "Usuń konto" }}
            </button>
            <button
              type="button"
              class="px-6 py-3 rounded-xl bg-[#e7e8ee] text-[#4b5563] font-bold hover:bg-[#dde0e8] transition-colors"
              @click="closeModify"
            >
              Zamknij
            </button>
            <button
              type="submit"
              class="px-6 py-3 rounded-xl bg-[#0c3dfe] text-white font-bold hover:bg-[#0a34d4] transition-all shadow-lg disabled:opacity-50"
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
  const expiresAtMs = new Date(user.license?.expiresAt || "").getTime();
  const daysLeft = Number.isFinite(expiresAtMs)
    ? Math.max(0, Math.ceil((expiresAtMs - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;
  licenseDays.value = daysLeft;
  licenseMaxUsers.value = Number(user.license?.maxActiveUsers || 1);
  licenseDemoMode.value = false;
  actionError.value = "";
}

function closeModify() {
  editUser.value = null;
  editEmail.value = "";
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

    const normalizedEmail = String(editEmail.value || "").trim().toLowerCase();
    const originalEmail = String(editUser.value.email || "").trim().toLowerCase();
    const trimmedPassword = String(editPassword.value || "").trim();
    const shouldUpdateAccount = normalizedEmail !== originalEmail || Boolean(trimmedPassword);

    if (shouldUpdateAccount) {
      const accountPayload = {
        email: normalizedEmail,
        password: trimmedPassword
      };

      const accountRes = await fetch(`${API_BASE}/api/admin/users/${editUser.value.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(accountPayload)
      });
      const accountData = await readApiPayload(accountRes);
      if (!accountRes.ok) throw new Error(accountData.error || "Nie udało się zapisać zmian konta.");
    }

    const licenseRes = await fetch(`${API_BASE}/api/admin/users/${editUser.value.id}/license`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        days: Number(licenseDays.value ?? 0),
        maxActiveUsers: Number(licenseMaxUsers.value || 1),
        demoMode: false
      })
    });
    const licenseData = await readApiPayload(licenseRes);
    if (!licenseRes.ok) throw new Error(licenseData.error || "Nie udało się zapisać zmian licencji.");

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
  const shouldDelete = window.confirm(`Na pewno chcesz usunąć konto ${label}? Tej operacji nie można cofnąć.`);
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
    if (!res.ok) throw new Error(data.error || "Nie udało się usunąć konta.");

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
    if (!res.ok) throw new Error(data.error || "Nie udało się zapisać ustawień szkoły.");
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

onMounted(loadDashboard);
</script>
