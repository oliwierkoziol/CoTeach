<template>
  <div class="bg-[#f7f9fc] min-h-[calc(100vh-64px)] relative overflow-x-hidden p-8 md:p-12 pb-14 w-full">
    <!-- Background Decoration -->
    <div class="fixed bottom-0 right-0 h-[384px] w-[384px] rounded-full bg-[rgba(20,37,136,0.05)] blur-[60px] pointer-events-none" />

    <div class="mx-auto max-w-full relative z-10">
      <header class="mb-8 text-left">
        <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
          Mój profil
        </h1>
          <div class="content-stretch flex flex-col items-start relative shrink-0 w-full">
          <p class="font-['Plus_Jakarta_Sans'] font-normal text-[#454652] text-[18px] leading-[28px]">Zarządzaj swoimi danymi, ustawieniami bezpieczeństwa i rozliczeniami w jednym miejscu.</p>
        </div>
      </header>

      <div class="bg-white rounded-xl shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)] p-6 sm:p-8">
        <div class="mb-10 flex justify-center">
          <div class="group relative">
            <div
              class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/50 shadow-lg"
            >
              <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="h-full w-full object-cover" />
              <span v-else class="text-5xl font-bold text-primary-foreground">
                {{ userInitials }}
              </span>
            </div>
            
            <div
              class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-black/65"
            >
              <span class="px-2 text-center text-sm font-semibold text-white">Zmień zdjęcie</span>
            </div>
            
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />

            <button
              type="button"
              class="absolute inset-0 h-full w-full cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Zmień zdjęcie profilowe"
              @click="openFilePicker"
            ></button>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside class="rounded-xl bg-[#f2f4f7] p-3 self-start">
            <p class="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#767683]">Ustawienia</p>
            <div class="space-y-1">
              <button
                type="button"
                class="w-full rounded-lg px-3 py-2 text-left text-sm font-bold transition-all"
                :class="activeProfileSection === 'account' ? 'bg-white text-[#0c3dfe] shadow-sm' : 'text-[#454652] hover:bg-[#e7e8ee]'"
                @click="activeProfileSection = 'account'"
              >
                Informacje o koncie
              </button>
              <button
                type="button"
                class="w-full rounded-lg px-3 py-2 text-left text-sm font-bold transition-all"
                :class="activeProfileSection === 'billing' ? 'bg-white text-[#0c3dfe] shadow-sm' : 'text-[#454652] hover:bg-[#e7e8ee]'"
                @click="activeProfileSection = 'billing'"
              >
                Rozliczenia
              </button>
              <button
                type="button"
                class="w-full rounded-lg px-3 py-2 text-left text-sm font-bold transition-all"
                :class="activeProfileSection === 'security' ? 'bg-white text-[#0c3dfe] shadow-sm' : 'text-[#454652] hover:bg-[#e7e8ee]'"
                @click="activeProfileSection = 'security'"
              >
                Bezpieczeństwo
              </button>
              <button
                v-if="userProfile.admin"
                type="button"
                class="w-full rounded-lg px-3 py-2 text-left text-sm font-bold transition-all"
                :class="activeProfileSection === 'organization' ? 'bg-white text-[#0c3dfe] shadow-sm' : 'text-[#454652] hover:bg-[#e7e8ee]'"
                @click="openOrganizationPanel"
              >
                Organizacja
              </button>
            </div>
          </aside>

          <div class="space-y-6">
          <section v-show="activeProfileSection === 'account'" class="rounded-xl border border-[#e0e3e6] bg-[#fbfcfd] p-6">
            <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[18px]">Informacje o koncie</h2>
            <p class="mt-1 text-sm text-[#454652]">Dane profilu i podstawowe informacje.</p>
            <div class="mt-5 space-y-6">
          <div>
            <label class="mb-2 block text-sm font-semibold text-[#454652]">Imię i nazwisko</label>
            <div class="flex flex-col gap-2 sm:flex-row">
              <div class="bg-[#e0e3e6] h-[48px] relative rounded-lg flex-1 flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                <input
                  v-model.trim="userProfile.full_name"
                  type="text"
                  autocomplete="name"
                  class="bg-transparent border-none outline-none w-full text-[16px] text-[#191c1e] font-['Plus_Jakarta_Sans']"
                  placeholder="Jan Kowalski"
                />
              </div>
              <button
                type="button"
                class="w-full shrink-0 rounded-lg bg-[#0c3dfe] px-6 h-[48px] font-bold text-white transition hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50 sm:w-auto"
                :disabled="isSavingName"
                @click.prevent="saveFullName"
              >
                {{ isSavingName ? "Zapisywanie…" : "Zapisz zmiany" }}
              </button>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-[#454652]">Adres e-mail</label>
            <div class="flex items-center justify-between gap-3 border-b border-[#e0e3e6] pb-1 text-lg text-[#191c1e] font-['Plus_Jakarta_Sans']">
              <div class="flex items-center gap-2 min-w-0">
                <span class="truncate">{{ displayEmail }}</span>
                <button
                  v-if="userProfile.email"
                  type="button"
                  class="text-xs font-bold text-[#0c3dfe] hover:underline"
                  @click="showEmailValue = !showEmailValue"
                >
                  {{ showEmailValue ? "Ukryj" : "Pokaż" }}
                </button>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg border-2 border-[#e0e3e6] px-4 py-1.5 text-xs font-bold text-[#454652] transition hover:bg-gray-50"
                :disabled="isSavingEmail"
                @click="toggleEmailEdit"
              >
                {{ showEmailEditor ? "Anuluj" : "Edytuj" }}
              </button>
            </div>
            <div v-if="showEmailEditor" class="mt-3">
              <div class="bg-[#e0e3e6] h-[48px] relative rounded-lg w-full flex items-center px-4 transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
                <input
                  v-model.trim="newEmail"
                  type="email"
                  autocomplete="email"
                  class="bg-transparent border-none outline-none w-full text-[16px] text-[#191c1e] font-['Plus_Jakarta_Sans']"
                  placeholder="Nowy adres e-mail"
                />
              </div>
              <button
                type="button"
                class="mt-3 w-full sm:w-auto rounded-lg bg-[#0c3dfe] px-6 h-[48px] font-bold text-white transition hover:bg-[#0a34d4] shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)] disabled:opacity-50"
                :disabled="isSavingEmail"
                @click.prevent="saveEmail"
              >
                Potwierdź zmianę e-mail
              </button>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-foreground">Hasło</label>
            <div class="flex items-center justify-between gap-3 border-b border-border pb-1 text-lg text-foreground">
              <span class="select-none tracking-widest text-muted-foreground">••••••••••</span>
              <button
                type="button" 
                class="shrink-0 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/50"
                @click="showPasswordModal = true"
              >
                Edytuj
              </button>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-foreground">Data utworzenia konta</label>
            <div class="border-b border-border pb-2 text-lg text-foreground">
              {{ formatDate(userProfile.created_at) }}
            </div>
          </div>
            </div>
          </section>

          <section v-show="activeProfileSection === 'billing'" class="rounded-xl border border-[#e0e3e6] bg-[#fbfcfd] p-6">
            <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[18px]">Rozliczenia</h2>
            <p class="mt-1 text-sm text-[#454652]">Licencja, płatności i wykorzystanie kosztów.</p>

            <div class="mt-6 space-y-6">
          <div>
            <label class="mb-2 block text-sm font-semibold text-foreground">Licencja</label>
            <div class="border-b border-border pb-2 text-lg text-foreground">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
                  :class="licenseStatus?.hasActiveLicense ? 'bg-primary/15 text-primary' : 'bg-destructive/10 text-destructive'"
                >
                  {{ licenseStatus?.hasActiveLicense ? "Aktywna" : "Brak aktywnej" }}
                </span>
                <span v-if="licenseStatus?.license?.expiresAt" class="text-sm text-muted-foreground">
                  Wygasa: {{ formatDate(licenseStatus.license.expiresAt) }}
                </span>
              </div>

              <div v-if="licenseStatus" class="mt-2 text-sm text-muted-foreground">
                Limit uploadów: {{ licenseStatus.uploadPolicy?.maxUploads ?? "—" }} ·
                Wykorzystane: {{ licenseStatus.uploadsUsed ?? "—" }}
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  :disabled="grantingLoading"
                  @click="handleGrantLicense"
                >
                  {{ grantingLoading ? "Przetwarzanie..." : "Aktywuj 30 dni (Test)" }}
                </button>
                <p v-if="grantingError" class="mt-2 text-xs text-destructive font-medium">{{ grantingError }}</p>
                <p v-if="grantingSuccess" class="mt-2 text-xs text-emerald-500 font-medium">{{ grantingSuccess }}</p>
              </div>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-foreground">Metoda płatności</label>
            <div class="border-b border-border pb-2 text-lg text-foreground">
              {{ billingSummary?.paymentMethod || "Brak przypisanej metody płatności" }}
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-foreground">Zużycie pieniędzy</label>
            <div class="border-b border-border pb-2 text-lg text-foreground">
              {{ formatCurrencyPLN(billingSummary?.totalSpentPLN) }}
            </div>
            <div class="mt-2 text-sm text-muted-foreground">
              Koszt dostawcy: {{ formatCurrencyPLN(billingSummary?.providerCostPLN) }} ·
              Marża platformy: {{ formatCurrencyPLN(billingSummary?.marginPLN) }}
            </div>
          </div>
            </div>
          </section>

          <section v-show="activeProfileSection === 'security'" class="rounded-xl border border-[#e0e3e6] bg-[#fbfcfd] p-6">
            <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[18px]">Bezpieczeństwo</h2>
            <p class="mt-1 text-sm text-[#454652]">Ustawienia krytyczne konta.</p>
            <div class="mt-6 space-y-6">
              <div class="rounded-2xl border border-amber-300/70 bg-amber-50/80 p-4">
                <label class="block text-sm font-semibold text-amber-900 mb-2">Zablokuj moje konto</label>
                <p class="text-sm text-amber-800">
                  Po zablokowaniu nie zalogujesz się ponownie, dopóki administrator nie odblokuje konta.
                </p>
                <button
                  type="button"
                  class="mt-3 w-full sm:w-auto rounded-2xl bg-amber-600 px-6 py-3 text-white font-semibold hover:bg-amber-700 transition disabled:opacity-50"
                  :disabled="isBlockingAccount"
                  @click="handleSelfBlockAccount"
                >
                  {{ isBlockingAccount ? "Blokowanie konta..." : "Zablokuj moje konto" }}
                </button>
              </div>

              <div class="rounded-2xl border border-red-200 bg-red-50/70 p-4">
                <label class="block text-sm font-semibold text-red-800 mb-2">Usuń konto</label>
                <p class="text-sm text-red-700">
                  Usunięcie konta jest trwałe i nie można go cofnąć.
                </p>
                <button
                  type="button"
                  class="mt-3 w-full sm:w-auto rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  :disabled="isDeletingAccount"
                  @click="toggleDeleteConfirm"
                >
                  {{ showDeleteConfirm ? "Anuluj usuwanie" : "Usuń konto" }}
                </button>

                <div v-if="showDeleteConfirm" class="mt-4 rounded-2xl border border-red-200 bg-card p-4">
                  <p class="text-sm text-red-700">
                    Wpisz hasło, aby potwierdzić usunięcie konta.
                  </p>
                  <input
                    v-model="deletePassword"
                    type="password"
                    autocomplete="current-password"
                    class="mt-3 w-full rounded-2xl border border-red-200 bg-background px-4 py-3 text-foreground outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    placeholder="Podaj hasło"
                  />
                  <div class="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      class="rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
                      :disabled="isDeletingAccount || !deletePassword.trim()"
                      @click="handleDeleteAccount"
                    >
                      {{ isDeletingAccount ? "Usuwanie konta..." : "Potwierdź usunięcie" }}
                    </button>
                    <button
                      type="button"
                      class="rounded-2xl border border-border bg-card px-6 py-3 font-semibold text-foreground transition hover:bg-muted/50"
                      :disabled="isDeletingAccount"
                      @click="cancelDeleteConfirm"
                    >
                      Cofnij
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section v-show="activeProfileSection === 'organization'" class="rounded-xl border border-[#e0e3e6] bg-[#fbfcfd] p-6">
            <h2 class="font-['Plus_Jakarta_Sans'] font-extrabold text-[#191c1e] text-[18px]">Organizacja</h2>
            <p class="mt-1 text-sm text-[#454652]">Ustawienia szkoły, konta służbowe i koszty AI.</p>

            <div v-if="organizationError" class="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {{ organizationError }}
            </div>

            <div class="mt-5 space-y-6">
              <section class="rounded-2xl border border-border bg-card p-4">
                <h3 class="text-base font-semibold text-foreground">Ustawienia szkoły</h3>
                <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
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

              <section class="rounded-2xl border border-border bg-card p-4">
                <h3 class="text-base font-semibold text-foreground">Utwórz konto służbowe</h3>
                <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
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

              <section class="rounded-2xl border border-border bg-card p-4">
                <div class="mb-3 flex items-center justify-between gap-3">
                  <h3 class="text-base font-semibold text-foreground">Zużycie pieniędzy na nauczyciela</h3>
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
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </section>
          </div>
        </div>

        <div v-if="isUploading" class="mt-8 rounded-xl border border-primary/30 bg-primary/10 p-4 text-center">
          <p class="font-semibold text-foreground">Przesyłanie zdjęcia...</p>
        </div>

        <div v-if="errorMessage" class="mt-8 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <p class="text-destructive">{{ errorMessage }}</p>
        </div>

        <div v-if="successMessage" class="mt-8 rounded-xl border border-primary/25 bg-primary/10 p-4">
          <p class="text-foreground">{{ successMessage }}</p>
        </div>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <RouterLink
            to="/dashboard"
            class="inline-block rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/50"
          >
            Start
          </RouterLink>
          <button
            type="button"
            class="inline-block rounded-xl border border-destructive/50 px-6 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
            @click="handleLogout"
          >
            Wyloguj się
          </button>
        </div>

        <!-- Password change modal -->
        <Teleport to="body">
          <Transition name="pw-modal">
          <div
            v-if="showPasswordModal"
            class="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4 pw-modal-overlay"
            @mousedown.self="closePasswordModal"
          >
            <div class="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl pw-modal-card">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h2 class="text-xl font-bold text-foreground">Zaktualizuj hasło</h2>
                  <p class="mt-1 text-sm text-muted-foreground">Wprowadź swoje obecne hasło i nowe hasło.</p>
                </div>
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground text-2xl leading-none"
                  @click="closePasswordModal"
                  aria-label="Zamknij"
                >&times;</button>
              </div>

              <div class="space-y-4 mt-4">
                <div>
                  <label class="mb-1 block text-sm font-semibold text-foreground">Bieżące hasło <span class="text-red-500">*</span></label>
                  <input
                    v-model="pwCurrent"
                    type="password"
                    autocomplete="current-password"
                    class="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-semibold text-foreground">Nowe hasło <span class="text-red-500">*</span></label>
                  <input
                    v-model="pwNew"
                    type="password"
                    autocomplete="new-password"
                    class="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-semibold text-foreground">Potwierdź nowe hasło <span class="text-red-500">*</span></label>
                  <input
                    v-model="pwConfirm"
                    type="password"
                    autocomplete="new-password"
                    class="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div v-if="pwError" class="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{{ pwError }}</div>
              <div v-if="pwSuccess" class="mt-3 rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">{{ pwSuccess }}</div>

              <div class="mt-5 flex gap-3">
                <button
                  type="button"
                  class="flex-1 rounded-xl border border-border bg-card px-4 py-3 font-semibold text-foreground transition hover:bg-muted/50"
                  :disabled="isSavingPassword"
                  @click="closePasswordModal"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                  :disabled="isSavingPassword"
                  @click="savePassword"
                >
                  {{ isSavingPassword ? 'Zapisywanie...' : 'Gotowe' }}
                </button>
              </div>
            </div>
          </div>
          </Transition>
        </Teleport>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { createTemporarySupabaseClient, supabase } from "../supabase";
import { clearLessonStoreAuthCache } from "../composables/useLessonStore";

const router = useRouter();
const route = useRoute();

const userProfile = ref({
  full_name: "",
  email: "",
  created_at: "",
  avatar_url: ""
});

const authUserId = ref("");
const authEmail = ref("");

const avatarUrl = ref("");
const isUploading = ref(false);
const isSavingName = ref(false);
const isSavingEmail = ref(false);
const isDeletingAccount = ref(false);
const isBlockingAccount = ref(false);
const showEmailEditor = ref(false);
const showEmailValue = ref(false);
const showDeleteConfirm = ref(false);
const deletePassword = ref("");
const newEmail = ref("");
const showPasswordModal = ref(false);
const pwCurrent = ref("");
const pwNew = ref("");
const pwConfirm = ref("");
const isSavingPassword = ref(false);
const pwError = ref("");
const pwSuccess = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const fileInput = ref(null);
const licenseStatus = ref(null);
const grantingLoading = ref(false);
const grantingSuccess = ref("");
const grantingError = ref("");
const billingSummary = ref(null);
const activeProfileSection = ref("account");
const organizationError = ref("");
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

function normalizeBaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "";

const userInitials = computed(() => {
  if (!userProfile.value.full_name) return "U";
  const parts = userProfile.value.full_name.split(/\s+/).filter(Boolean);
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
});

const displayEmail = computed(() => {
  const email = String(userProfile.value.email || "").trim();
  if (!email) return "Brak danych";
  if (showEmailValue.value) return email;

  const at = email.indexOf("@");
  if (at <= 0) return "********";

  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 2) return `${local[0] || "*"}***${domain}`;

  return `${local[0]}${"*".repeat(Math.max(3, local.length - 1))}${domain}`;
});

function formatDate(dateString) {
  if (!dateString) return "Brak danych";
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatCurrencyPLN(value) {
  const amount = Number(value || 0);
  return `${amount.toFixed(2)} PLN`;
}

function openFilePicker() {
  fileInput.value?.click();
}

const loadUserProfile = async () => {
  errorMessage.value = "";
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  const token = sessionData?.session?.access_token || "";
  if (!user?.id) {
    router.push({ path: "/login", query: { redirect: "/profile" } });
    return;
  }

  userProfile.value.email = user.email || "";
  userProfile.value.created_at = user.created_at || "";
  authUserId.value = user.id;
  authEmail.value = user.email || "";
  newEmail.value = user.email || "";

  void loadLicenseStatus(token);
  void loadBillingSummary(token);

  const { data: row, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (error) {
    errorMessage.value = "Błąd wczytywania profilu: " + error.message;
    return;
  }

  if (row) {
    const effectiveEmail = row.email || user.email || "";
    const effectiveName = row.full_name || user.user_metadata?.full_name || "";
    userProfile.value.email = effectiveEmail;
    authEmail.value = effectiveEmail;
    newEmail.value = effectiveEmail;
    userProfile.value.full_name = effectiveName;
    userProfile.value.avatar_url = row.avatar_url || "";
    if (row.avatar_url) avatarUrl.value = row.avatar_url;
    else avatarUrl.value = "";

    // Backfill missing full_name in profiles when we only have it in auth metadata.
    if (!row.full_name && effectiveName) {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: effectiveEmail,
          full_name: effectiveName,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );
    }
  } else {
    userProfile.value.full_name = user.user_metadata?.full_name || "";
    userProfile.value.avatar_url = "";
    avatarUrl.value = user.user_metadata?.avatar_url || "";
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: userProfile.value.full_name,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );
  }
};

async function loadLicenseStatus(token) {
  licenseStatus.value = null;
  if (!token) return;
  try {
    const response = await fetch(`${API_BASE}/api/account/license-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      licenseStatus.value = null;
      return;
    }
    licenseStatus.value = data;
  } catch {
    licenseStatus.value = null;
  }
}

async function loadBillingSummary(token) {
  billingSummary.value = null;
  if (!token) return;
  try {
    const response = await fetch(`${API_BASE}/api/account/billing-summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      billingSummary.value = null;
      return;
    }
    billingSummary.value = data;
  } catch {
    billingSummary.value = null;
  }
}

async function handleGrantLicense() {
  try {
    grantingLoading.value = true;
    grantingError.value = "";
    grantingSuccess.value = "";
    successMessage.value = "";

    const { data: { user } } = await supabase.auth.getUser();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!user || !token) throw new Error("Błąd sesji użytkownika.");

    const response = await fetch(`${API_BASE}/api/account/grant-license`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Nie udało się nadać licencji.");

    // Odśwież status licencji w widoku
    await loadLicenseStatus(token);
    grantingSuccess.value = "Sukces! Przyznano licencję na 30 dni.";
    successMessage.value = "Sukces! Przyznano licencję na 30 dni.";
  } catch (err) {
    grantingError.value = err.message;
  } finally {
    grantingLoading.value = false;
  }
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

function openOrganizationPanel() {
  activeProfileSection.value = "organization";
  void loadOrganizationPanelData();
}

function applySectionFromRoute() {
  const requestedSection = String(route.query.section || "").trim().toLowerCase();
  if (requestedSection === "organization") {
    openOrganizationPanel();
    return;
  }
  if (["account", "billing", "security"].includes(requestedSection)) {
    activeProfileSection.value = requestedSection;
  }
}

async function saveOrganizationSettings() {
  isSavingOrgSettings.value = true;
  organizationError.value = "";
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

const SAVE_NAME_TIMEOUT_MS = 15000;

async function saveFullName() {
  const name = String(userProfile.value.full_name || "").trim();
  if (!name) {
    errorMessage.value = "Podaj imię i nazwisko.";
    return;
  }

  if (isSavingName.value) return;
  isSavingName.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    let userId = authUserId.value;
    let email = authEmail.value || userProfile.value.email;

    if (!userId || !email) {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Brak aktywnej sesji.");
      userId = session.user.id;
      email = session.user.email || "";
      authUserId.value = userId;
      authEmail.value = email;
      if (!userProfile.value.email) userProfile.value.email = email;
    }

    const pending = supabase.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: name,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );

    const { error: pErr } = await Promise.race([
      pending,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("REQUEST_TIMEOUT")), SAVE_NAME_TIMEOUT_MS)
      )
    ]);

    if (pErr) throw new Error(pErr.message);

    await supabase.auth.updateUser({
      data: {
        full_name: name
      }
    });

    userProfile.value.full_name = name;
    successMessage.value = "Zapisano imię i nazwisko.";
    await nextTick();
    setTimeout(() => {
      successMessage.value = "";
    }, 5000);
  } catch (e) {
    if (e?.message === "REQUEST_TIMEOUT") {
      errorMessage.value =
        "Zapis trwa zbyt długo lub sieć nie odpowiada. Sprawdź połączenie i ustawienia RLS tabeli profiles w Supabase. Możesz odświeżyć stronę i zobaczyć, czy dane się zapisały.";
    } else {
      errorMessage.value = e?.message || "Nie udało się zapisać.";
    }
  } finally {
    isSavingName.value = false;
  }
}

async function saveEmail() {
  const email = String(newEmail.value || "").trim().toLowerCase();
  const currentEmail = String(userProfile.value.email || "").trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!email) {
    errorMessage.value = "Podaj nowy adres e-mail.";
    return;
  }

  if (!emailPattern.test(email)) {
    errorMessage.value = "Podaj poprawny adres e-mail (np. nazwa@domena.pl).";
    return;
  }

  if (email === currentEmail) {
    errorMessage.value = "Nowy adres e-mail musi być inny niż obecny.";
    return;
  }

  if (isSavingEmail.value) return;
  isSavingEmail.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      throw new Error("Brak aktywnej sesji. Zaloguj się ponownie i spróbuj jeszcze raz.");
    }

    const response = await fetch(`${API_BASE}/api/account/email`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result?.error || "Nie udało się zmienić adresu e-mail.");
    }

    const effectiveEmail = String(result?.email || email).trim().toLowerCase();
    userProfile.value.email = effectiveEmail;
    authEmail.value = effectiveEmail;
    newEmail.value = effectiveEmail;
    showEmailEditor.value = false;
    showEmailValue.value = false;

    successMessage.value = "Adres e-mail został zmieniony.";
    await nextTick();
    setTimeout(() => {
      successMessage.value = "";
    }, 5000);
  } catch (error) {
    errorMessage.value = error?.message || "Nie udało się zmienić adresu e-mail.";
  } finally {
    isSavingEmail.value = false;
  }
}

function closePasswordModal() {
  if (isSavingPassword.value) return;
  showPasswordModal.value = false;
  pwCurrent.value = "";
  pwNew.value = "";
  pwConfirm.value = "";
  pwError.value = "";
  pwSuccess.value = "";
}

async function savePassword() {
  pwError.value = "";
  pwSuccess.value = "";

  if (!pwCurrent.value) {
    pwError.value = "Podaj bieżące hasło.";
    return;
  }
  if (!pwNew.value) {
    pwError.value = "Podaj nowe hasło.";
    return;
  }
  if (pwNew.value.length < 6) {
    pwError.value = "Nowe hasło musi mieć co najmniej 6 znaków.";
    return;
  }
  if (pwNew.value !== pwConfirm.value) {
    pwError.value = "Hasła nie są identyczne.";
    return;
  }

  isSavingPassword.value = true;
  try {
    const email = userProfile.value.email;
    if (!email) throw new Error("Brak aktywnej sesji. Zaloguj się ponownie.");

    // Verify current password using temporary client
    const tempClient = createTemporarySupabaseClient();
    const { error: verifyError } = await tempClient.auth.signInWithPassword({
      email,
      password: pwCurrent.value
    });
    await tempClient.auth.signOut();
    if (verifyError) throw new Error("Bieżące hasło jest nieprawidłowe.");

    const { error: updateError } = await supabase.auth.updateUser({
      password: pwNew.value
    });
    if (updateError) throw new Error(updateError.message);

    pwSuccess.value = "Hasło zostało zmienione.";
    pwCurrent.value = "";
    pwNew.value = "";
    pwConfirm.value = "";
    setTimeout(() => {
      closePasswordModal();
    }, 1500);
  } catch (e) {
    pwError.value = e?.message || "Nie udało się zmienić hasła.";
  } finally {
    isSavingPassword.value = false;
  }
}

function toggleEmailEdit() {
  if (isSavingEmail.value) return;
  showEmailEditor.value = !showEmailEditor.value;
  if (!showEmailEditor.value) {
    newEmail.value = userProfile.value.email || "";
  }
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    errorMessage.value = "Proszę wybrać plik obrazu";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = "Plik nie może być większy niż 5 MB";
    return;
  }

  try {
    isUploading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      throw new Error("Użytkownik nie zalogowany");
    }

    const ext = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}-${Math.random()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
      upsert: true
    });

    if (uploadError) {
      throw new Error("Błąd przesyłania: " + uploadError.message);
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Nie można uzyskać URL zdjęcia");
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      throw new Error("Błąd aktualizacji profilu: " + updateError.message);
    }

    avatarUrl.value = urlData.publicUrl;
    userProfile.value.avatar_url = urlData.publicUrl;
    successMessage.value = "Zdjęcie profilowe zostało zaktualizowane!";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    errorMessage.value = error.message || "Nieznany błąd podczas przesyłania";
  } finally {
    isUploading.value = false;
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};

async function handleLogout() {
  await supabase.auth.signOut({ scope: "local" });
  clearLessonStoreAuthCache();
  router.push("/login");
}

async function handleSelfBlockAccount() {
  if (isBlockingAccount.value) return;
  const confirmed = window.confirm(
    "Na pewno chcesz zablokować swoje konto? Po tej operacji tylko administrator będzie mógł je odblokować."
  );
  if (!confirmed) return;

  isBlockingAccount.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Brak aktywnej sesji. Zaloguj się ponownie.");

    const response = await fetch(`${API_BASE}/api/account/block`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ blocked: true })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || "Nie udało się zablokować konta.");

    await supabase.auth.signOut({ scope: "local" });
    clearLessonStoreAuthCache();
    await router.replace({ path: "/login", query: { blocked: "1" } });
  } catch (error) {
    errorMessage.value = error?.message || "Nie udało się zablokować konta.";
  } finally {
    isBlockingAccount.value = false;
  }
}

function cancelDeleteConfirm() {
  if (isDeletingAccount.value) return;
  showDeleteConfirm.value = false;
  deletePassword.value = "";
}

function toggleDeleteConfirm() {
  if (isDeletingAccount.value) return;
  if (showDeleteConfirm.value) {
    cancelDeleteConfirm();
    return;
  }
  errorMessage.value = "";
  successMessage.value = "";
  showDeleteConfirm.value = true;
}

async function handleDeleteAccount() {
  if (isDeletingAccount.value) return;

  const password = String(deletePassword.value || "").trim();
  if (!password) {
    errorMessage.value = "Podaj hasło, aby usunąć konto.";
    return;
  }

  const confirmed = window.confirm(
    "Czy na pewno chcesz usunąć konto? Ta operacja usunie profil i dane konta bez możliwości cofnięcia."
  );
  if (!confirmed) return;

  isDeletingAccount.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    const email = userProfile.value.email || session?.user?.email || "";
    if (!email) {
      throw new Error("Brak aktywnej sesji. Zaloguj się ponownie i spróbuj jeszcze raz.");
    }

    const tempClient = createTemporarySupabaseClient();
    const { data: verificationData, error: passwordError } = await tempClient.auth.signInWithPassword({
      email,
      password
    });

    if (passwordError) {
      await tempClient.auth.signOut();
      throw new Error("Nieprawidłowe hasło.");
    }

    const verifiedToken = verificationData?.session?.access_token;
    if (!verifiedToken) {
      await tempClient.auth.signOut();
      throw new Error("Nie udało się potwierdzić sesji. Zaloguj się ponownie i spróbuj jeszcze raz.");
    }

    const response = await fetch(`${API_BASE}/api/account`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${verifiedToken}`
      }
    });

    const body = await response.json().catch(() => ({}));
    await tempClient.auth.signOut();
    if (!response.ok) {
      throw new Error(body?.error || "Nie udało się usunąć konta.");
    }

    await supabase.auth.signOut({ scope: "local" });
    deletePassword.value = "";
    showDeleteConfirm.value = false;
    router.replace({ path: "/register", query: { deleted: "1" } });
  } catch (error) {
    errorMessage.value = error?.message || "Wystąpił błąd podczas usuwania konta.";
  } finally {
    isDeletingAccount.value = false;
  }
}

onMounted(async () => {
  await loadUserProfile();
  applySectionFromRoute();
});

watch(
  () => route.query.section,
  () => {
    applySectionFromRoute();
  }
);
</script>

<style scoped>
.pw-modal-enter-active,
.pw-modal-leave-active {
  transition: opacity 0.18s ease;
}

.pw-modal-enter-from,
.pw-modal-leave-to {
  opacity: 0;
}

.pw-modal-enter-active .pw-modal-overlay,
.pw-modal-leave-active .pw-modal-overlay {
  transition: background-color 0.18s ease;
}

.pw-modal-enter-from .pw-modal-overlay,
.pw-modal-leave-to .pw-modal-overlay {
  background-color: rgb(0 0 0 / 0%);
}

.pw-modal-enter-active .pw-modal-card,
.pw-modal-leave-active .pw-modal-card {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.pw-modal-enter-from .pw-modal-card,
.pw-modal-leave-to .pw-modal-card {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}
</style>

<style scoped>
/* overlay fade */
.pw-modal-enter-active,
.pw-modal-leave-active {
  transition: opacity 0.15s ease;
}
.pw-modal-enter-from,
.pw-modal-leave-to {
  opacity: 0;
}

/* card scale */
.pw-modal-enter-active .pw-modal-card {
  animation: pwScaleIn 0.15s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}
.pw-modal-leave-active .pw-modal-card {
  animation: pwScaleOut 0.12s ease-in both;
}

@keyframes pwScaleIn {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
@keyframes pwScaleOut {
  from { transform: scale(1);   opacity: 1; }
  to   { transform: scale(0.6); opacity: 0; }
}
</style>
