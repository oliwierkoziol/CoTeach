<template>
  <div class="app-shell min-h-screen overflow-x-clip bg-background text-foreground transition-colors">
    <header
      class="fixed inset-x-0 top-0 z-[56] flex h-16 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 text-foreground backdrop-blur-md sm:px-5"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2 ">
        <button
          type="button"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          aria-label="Menu"
          @click="open = true"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <RouterLink to="/dashboard" class="flex min-w-0 items-center no-underline">
          <div class="flex h-10 w-[124px] items-center overflow-hidden sm:h-12 sm:w-[130px] m">
            <img src="/logo.svg" alt="Logo" class="h-10 w-full object-cover object-left logo sm:h-12" />
          </div>
        </RouterLink>

        <!-- Moja Klasa Dropdown -->
        <div class="flex items-center hidden sm:flex w-[240px]">
          <div class="w-full bg-white dark:bg-card h-[40px] relative rounded-xl flex items-center transition-all border border-border/40 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40">
            <select v-model="selectedClass" class="bg-transparent border-none outline-none w-full h-full pl-5 pr-10 appearance-none text-[14px] font-medium text-foreground dark:text-foreground font-['Plus_Jakarta_Sans'] cursor-pointer">
              <option value="" class="dark:bg-card dark:text-foreground">Wszystkie klasy</option>
              <option value="add-new" class="dark:bg-card dark:text-foreground">+ Dodaj swoją klasę</option>
              <option v-for="classItem in state.userClasses" :key="classItem.id" :value="classItem.id" class="dark:bg-card dark:text-foreground">{{ classItem.class_name }}</option>
            </select>
            <div class="absolute right-[16px] flex pointer-events-none items-center text-muted-foreground/60">
              <svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:bg-muted/60"
          :title="isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'"
          :aria-label="isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'"
          @click="toggleTheme"
        >
          <svg
            v-if="isDark"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3a7 7 0 1 0 9 9a9 9 0 1 1 -9 -9" />
          </svg>
        </button>
        <RouterLink
          to="/profile"
            class="flex items-center rounded-full p-0.5 text-foreground ring-2 ring-transparent transition hover:ring-border"
          :title="displayName || 'Profil'"
        >
          <span
              class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground"
          >
            <img v-if="avatarUrl" :src="avatarUrl" alt="" class="h-full w-full object-cover" />
            <span v-else>{{ userInitials }}</span>
          </span>
        </RouterLink>
      </div>
    </header>

    <div
      v-if="open"
      class="fixed inset-0 z-[54] bg-black/40 backdrop-blur-sm md:hidden"
      aria-hidden="true"
      @click="open = false"
    />

    <aside
      :class="[
        'fixed left-0 top-[64px] z-[55] flex h-[calc(100vh-64px)] w-[256px] flex-col border-r border-border bg-[#f8fafc] transition-transform duration-200 ease-out md:translate-x-0',
open ? 'translate-x-0 shadow-xl md:shadow-none' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <div class="flex flex-1 flex-col overflow-y-auto p-4 pt-7 space-y-4">

        <!-- Start Lesson Button -->
        <RouterLink
          :to="startLessonCta.to"
          custom
          v-slot="{ href, navigate }"
        >
          <a
            :href="href"
            :class="[
              'mb-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors',
              startLessonCta.isLive
                ? 'bg-primary/10 text-primary hover:bg-primary/15'
                : ['justify-center bg-primary text-primary-foreground hover:opacity-90', showSoundWave ? 'sound-wave-btn' : '']
            ]"
            @click="navigate(); open = false;"
          >
            <template v-if="startLessonCta.isLive">
              <img :src="screenIcon" alt="" class="h-[18px] w-[20px] shrink-0" />
              <span class="font-['Plus_Jakarta_Sans'] text-sm font-semibold leading-5 text-primary">
                {{ startLessonCta.label }}
              </span>
            </template>
            <template v-else>
              <svg class="h-[10px] w-[10px]" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1V13M1 7H13" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span class="font-['Plus_Jakarta_Sans'] text-sm font-semibold leading-5 text-primary-foreground">
                Rozpocznij lekcję
              </span>
            </template>
          </a>
        </RouterLink>

        <!-- Divider + nav links -->
        <div class="flex-1 space-y-1 border-t border-border pt-4">

          <!-- Panel startowy -->
          <RouterLink to="/dashboard" custom v-slot="{ href, navigate, isExactActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors', isExactActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground']" @click="navigate(); open = false;">
              <svg class="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 18 18">
                <path d="M10 6V0H18V6H10ZM0 10V0H8V10H0ZM10 18V8H18V18H10ZM0 18V12H8V18H0ZM2 8H6V2H2V8ZM12 16H16V10H12V16ZM12 4H16V2H12V4ZM2 16H6V14H2V16Z" fill="currentColor"/>
              </svg>
              <p :class="['text-[14px] font-semibold', isExactActive ? 'text-primary' : 'text-inherit']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Panel startowy</p>
            </a>
          </RouterLink>

          <!-- Dodaj materiały -->
          <RouterLink to="/notes" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground']" @click="navigate(); open = false;">
              <svg class="h-5 w-4 shrink-0" fill="none" viewBox="0 0 16 20">
                <path d="M7 17H9V12.825L10.6 14.425L12 13L8 9L4 13L5.425 14.4L7 12.825V17ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H10L16 6V18C16 18.55 15.8042 19.0208 15.4125 19.4125C15.0208 19.8042 14.55 20 14 20H2ZM9 7V2H2V18H14V7H9ZM2 2V7V2V7V18V2Z" fill="currentColor"/>
              </svg>
              <p :class="['text-[14px] font-semibold', isActive ? 'text-primary' : 'text-inherit']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Dodaj materiały</p>
            </a>
          </RouterLink>

          <!-- <RouterLink to="/notes" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 hover:bg-black/5', isActive ? 'bg-black/5' : '']" @click="onNav(navigate)">
            <svg class="h-[18px] w-[18px] shrink-0" fill="none" stroke="#566166" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="14" rx="2" />
              <path d="M12 8v6 M9 11l3-3 3 3" />
            </svg>
            <p class="text-[14px] font-semibold text-[#475569]" style="font-family: 'Plus Jakarta Sans', sans-serif;">Notatki</p>
          </a>
        </RouterLink> -->

          <!-- Prezentacja -->
          <RouterLink :to="presentationHref" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground']" @click="navigate(); open = false;">
              <svg class="h-4 w-5 shrink-0" fill="none" viewBox="0 0 20 16">
                <path d="M9 12H11V7.85L12.6 9.425L14.025 8L10 4L6 8L7.425 9.4L9 7.825V12ZM2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16H2ZM2 14H18V2H2V14ZM2 14V2V14Z" fill="currentColor"/>
              </svg>
              <p :class="['text-[14px] font-semibold', isActive ? 'text-primary' : 'text-inherit']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Prezentacja</p>
            </a>
          </RouterLink>

          <!-- Sprawdziany -->
          <!-- <RouterLink to="/quiz" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground']" @click="navigate(); open = false;">
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p :class="['text-[14px] font-semibold', isActive ? 'text-primary' : 'text-inherit']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Sprawdziany</p>
            </a>
          </RouterLink> -->

          <!-- Archiwum -->
          <RouterLink to="/archive" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground']" @click="navigate(); open = false;">
              <svg class="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 20 20">
                <path d="M8 12H12V10H8V12ZM8 9H16V7H8V9ZM8 6H16V4H8V6ZM6 16C5.45 16 4.97917 15.8042 4.5875 15.4125C4.19583 15.0208 4 14.55 4 14V2C4 1.45 4.19583 0.979167 4.5875 0.5875C4.97917 0.195833 5.45 0 6 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16H6ZM6 14H18V2H6V14ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4H2V18H16V20H2ZM6 2V14V2Z" fill="currentColor"/>
              </svg>
              <p :class="['text-[14px] font-semibold', isActive ? 'text-primary' : 'text-inherit']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Archiwum</p>
            </a>
          </RouterLink>
          
          <!-- Organizacja -->
          <RouterLink v-if="isOrganization" to="/organization" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground']" @click="navigate(); open = false;">
              <img :src="organisationIcon" alt="" class="h-[18px] w-[18px] shrink-0" />
              <p :class="['text-[14px] font-semibold', isActive ? 'text-primary' : 'text-inherit']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Organizacja</p>
            </a>
          </RouterLink>
          <!-- Panel admina -->
          <RouterLink v-if="isAdmin" to="/admin/dashboard" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground']" @click="navigate(); open = false;">
              <svg class="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 20 20">
                <path d="M3 20V15.7C2.05 14.8333 1.3125 13.8208 0.7875 12.6625C0.2625 11.5042 0 10.2833 0 9C0 6.5 0.875 4.375 2.625 2.625C4.375 0.875 6.5 0 9 0C11.0833 0 12.9292 0.6125 14.5375 1.8375C16.1458 3.0625 17.1917 4.65833 17.675 6.625L18.975 11.75C19.0583 12.0667 19 12.3542 18.8 12.6125C18.6 12.8708 18.3333 13 18 13H16V16C16 16.55 15.8042 17.0208 15.4125 17.4125C15.0208 17.8042 14.55 18 14 18H12V20H10V16H14V16V16V11H16.7L15.75 7.125C15.3667 5.60833 14.55 4.375 13.3 3.425C12.05 2.475 10.6167 2 9 2C7.06667 2 5.41667 2.675 4.05 4.025C2.68333 5.375 2 7.01667 2 8.95C2 9.95 2.20417 10.9 2.6125 11.8C3.02083 12.7 3.6 13.5 4.35 14.2L5 14.8V20H3V20M9.35 11V11V11V11V11V11V11V11V11V11V11V11V11V11V11V11V11V11M8 13H10L10.15 11.75C10.2833 11.7 10.4042 11.6417 10.5125 11.575C10.6208 11.5083 10.7167 11.4333 10.8 11.35L11.95 11.85L12.95 10.15L11.95 9.4C11.9833 9.26667 12 9.13333 12 9C12 8.86667 11.9833 8.73333 11.95 8.6L12.95 7.85L11.95 6.15L10.8 6.65C10.7167 6.56667 10.6208 6.49167 10.5125 6.425C10.4042 6.35833 10.2833 6.3 10.15 6.25L10 5H8L7.85 6.25C7.71667 6.3 7.59583 6.35833 7.4875 6.425C7.37917 6.49167 7.28333 6.56667 7.2 6.65L6.05 6.15L5.05 7.85L6.05 8.6C6.01667 8.73333 6 8.86667 6 9C6 9.13333 6.01667 9.26667 6.05 9.4L5.05 10.15L6.05 11.85L7.2 11.35C7.28333 11.4333 7.37917 11.5083 7.4875 11.575C7.59583 11.6417 7.71667 11.7 7.85 11.75L8 13V13M9 10.5C8.58333 10.5 8.22917 10.3542 7.9375 10.0625C7.64583 9.77083 7.5 9.41667 7.5 9C7.5 8.58333 7.64583 8.22917 7.9375 7.9375C8.22917 7.64583 8.58333 7.5 9 7.5C9.41667 7.5 9.77083 7.64583 10.0625 7.9375C10.3542 8.22917 10.5 8.58333 10.5 9C10.5 9.41667 10.3542 9.77083 10.0625 10.0625C9.77083 10.3542 9.41667 10.5 9 10.5V10.5" fill="currentColor"/>
              </svg>
              <p :class="['text-[14px] font-semibold', isActive ? 'text-primary' : 'text-inherit']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Panel admina</p>
            </a>
          </RouterLink>

         

        </div>
      </div>
    </aside>

    <!-- Modal dodawania nowej klasy -->
    <div v-if="showAddClassModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div class="bg-white rounded-[12px] shadow-lg p-[24px] max-w-[400px] w-full">
        <h3 class="font-['Manrope'] font-extrabold text-[#191c1e] text-[18px] leading-[28px] mb-[16px]">Dodaj nową klasę</h3>
        <div class="flex flex-col gap-[12px] mb-[20px]">
          <label class="font-['Plus_Jakarta_Sans'] font-semibold text-[#454652] text-[14px] leading-[20px]">Nazwa klasy</label>
          <div class="bg-[#e0e3e6] dark:bg-input-background h-[48px] relative rounded-[8px] w-full flex items-center transition-colors focus-within:ring-2 focus-within:ring-[#0c3dfe]/50">
            <input 
              v-model="newClassName" 
              @keyup.enter="handleAddClass"
              class="bg-transparent border-none outline-none w-full h-full px-4 text-[16px] text-[#191c1e] dark:text-foreground placeholder-[#767683] font-['Plus_Jakarta_Sans']" 
              placeholder="np. 3A, 5B, Liceum 1..."
              autofocus
            />
          </div>
        </div>
        <div v-if="classError" class="text-sm text-red-500 font-['Plus_Jakarta_Sans'] font-semibold mb-[16px]">
          {{ classError }}
        </div>
        <div class="flex gap-[12px] justify-end">
          <button 
            type="button" 
            @click="closeAddClassModal"
            class="bg-muted border border-border content-stretch flex items-center justify-center px-[24px] py-[10px] rounded-[8px] hover:bg-background/70 transition-colors"
          >
            <span class="font-['Plus_Jakarta_Sans'] font-semibold text-muted-foreground text-[16px] leading-[24px]">Anuluj</span>
          </button>
          <button 
            type="button" 
            @click="handleAddClass"
            :disabled="addingClass || !newClassName.trim()"
            class="bg-[#0c3dfe] content-stretch flex items-center justify-center px-[24px] py-[10px] rounded-[8px] hover:bg-[#0a34d4] transition-colors disabled:opacity-50"
          >
            <span class="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-white leading-[24px]">{{ addingClass ? 'Dodawanie...' : 'Dodaj klasę' }}</span>
          </button>
        </div>
      </div>
    </div>

    <main class="flex min-h-screen min-w-0 flex-col overflow-x-clip pt-16 md:pl-[256px]">
      <div v-if="licenseWarning" class="shrink-0 px-4 pt-4 sm:px-6 lg:px-10">
        <div class="rounded-xl mt-5 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          Do Twojego konta nie jest przypisana żadna licencja.
        </div>
      </div>
      <div class="flex-1">
        <slot />
      </div>
      
      <!-- Stopka CoTeach z prawami autorskimi -->
      <footer class="mt-auto shrink-0 border-t border-border/40 bg-background/50 px-4 py-3 text-center text-[10px] sm:text-xs text-muted-foreground z-10 flex flex-col items-center gap-1">
        <div>
          &copy; Copyright CoTeach {{ new Date().getFullYear() }}. Wszelkie prawa zastrzeżone. Kopiowanie i rozpowszechnianie projektu zabronione.
        </div>
        <div class="flex gap-4 font-medium">
          <router-link to="/legal?tab=terms" class="hover:text-primary transition-colors">Regulamin</router-link>
          <router-link to="/legal?tab=privacy" class="hover:text-primary transition-colors">RODO</router-link>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { computed, h, mergeProps, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../supabase";
import { useLessonStore } from "../composables/useLessonStore";
import { useTheme } from "../composables/useTheme";
import organisationIcon from "../assets/organisation.svg";
import screenIcon from "../assets/screen.svg";

defineProps({
  licenseWarning: {
    type: Boolean,
    default: false
  }
});

function createStrokeIcon(name, childrenFn) {
  return {
    name,
    inheritAttrs: false,
    setup(_, { attrs }) {
      return () =>
        h(
          "svg",
          mergeProps(
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              "aria-hidden": "true"
            },
            attrs
          ),
          childrenFn()
        );
    },
  };
}

const IconGrid = createStrokeIcon("IconGrid", () => [
  h("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1.5" }),
  h("rect", { x: "14", y: "3", width: "7", height: "9", rx: "1.5" }),
  h("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1.5" }),
  h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1.5" }),
]);

const IconFileUp = createStrokeIcon("IconFileUp", () => [
  h("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
  h("path", { d: "M14 2v6h6" }),
  h("path", { d: "M12 18V11" }),
  h("path", { d: "m9 14 3-3 3 3" }),
]);

const IconMonitorPlay = createStrokeIcon("IconMonitorPlay", () => [
  h("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2" }),
  h("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
  h("line", { x1: "12", y1: "17", x2: "12", y2: "21" }),
  h("polygon", { points: "10 8 16 11 10 14 10 8" }),
]);

const IconScreenUp = createStrokeIcon("IconScreenUp", () => [
  h("rect", { x: "3", y: "4", width: "18", height: "14", rx: "2" }),
  h("path", { d: "M12 17V10" }),
  h("path", { d: "m9 12 3-3 3 3" }),
]);

const IconChart = createStrokeIcon("IconChart", () => [
  h("path", { d: "M3 17l5-4 4 2 9-8" }),
  h("line", { x1: "4", y1: "21", x2: "4", y2: "15" }),
  h("line", { x1: "9", y1: "21", x2: "9", y2: "17" }),
  h("line", { x1: "14", y1: "21", x2: "14", y2: "13" }),
  h("line", { x1: "19", y1: "21", x2: "19", y2: "10" }),
]);

const IconSparkles = createStrokeIcon("IconSparkles", () => [
  h("path", { d: "M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6" }),
]);

const IconShield = createStrokeIcon("IconShield", () => [
  h("path", { d: "M12 3l7 3v6c0 5-3.5 8-7 9c-3.5-1-7-4-7-9V6z" }),
  h("path", { d: "M9.5 12.5l1.8 1.8 3.2-3.2" }),
]);

const route = useRoute();
const router = useRouter();
const open = ref(false);
const { state, fetchLessons, fetchUserClasses, addUserClass, setSelectedClass } = useLessonStore();
const { isDark, toggleTheme } = useTheme();

const SELECTED_CLASS_STORAGE_KEY = "coteach_selected_class_v1";

const displayName = ref("");
const avatarUrl = ref("");
const isAdmin = ref(false);
const isOrganization = ref(false);

// Class selection state - use local ref for v-model binding, but sync with store
const selectedClass = ref("");
const showAddClassModal = ref(false);
const newClassName = ref("");
const classError = ref("");
const addingClass = ref(false);

const presentationHref = computed(() => {
  const id = state.lesson?.id || state.lessons[0]?.id;
  if (id) return `/presentation/${id}`;
  return "/presentation";
});

const isPresentationActive = computed(() => route.path === "/presentation" || route.path.startsWith("/presentation/"));

const currentLiveLesson = computed(() => {
  const lessons = Array.isArray(state.lessons) ? [...state.lessons] : [];
  // Include the active lesson object if it's not already in the list
  if (state.lesson && !lessons.find(l => l.id === state.lesson.id)) {
    lessons.push(state.lesson);
  }

  return lessons
    .filter((lesson) => lesson?.status === "live" && (!state.selectedClassName || lesson.class_name === state.selectedClassName))
    .sort((a, b) => new Date(b?.startedAt || 0).getTime() - new Date(a?.startedAt || 0).getTime())[0] || null;
});

const startLessonCta = computed(() => {
  const liveLesson = currentLiveLesson.value;
  if (!liveLesson) {
    return {
      isLive: false,
      to: "/preparation",
      label: "Rozpocznij lekcję"
    };
  }
  return {
    isLive: true,
    to: `/live-lesson/${liveLesson.id}`,
    label: `Lekcja: ${liveLesson.title || "Lekcja"}`
  };
});

const showSoundWave = computed(() => {
  if (!state.isInitialLoadDone) return false;
  const hasNoLessons = !state.lessons || state.lessons.length <= 0;
  const isNotPreparation = route.path !== "/preparation";
  const isNotNotes = route.path !== "/notes";
  return !startLessonCta.value.isLive && hasNoLessons && isNotPreparation && isNotNotes;
});

const activeLessonLink = computed(() => {
  const lesson = state.lesson || state.lessons?.[0];
  if (!lesson) return null;
  return {
    to: `/live-lesson/${lesson.id}`,
    label: `Lekcja: ${lesson.title || "Lekcja"}`,
  };
});

const userInitials = computed(() => {
  const n = displayName.value || "";
  if (!n) return "U";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return n.substring(0, 2).toUpperCase();
});

function navRowClass(item, isActive, isExactActive) {
  const on = item.exact ? isExactActive : isActive;
  return [
    "flex w-full min-w-0 items-center gap-3 rounded-xl py-1.5 pl-1 pr-2 text-left transition-colors",
      on ? "bg-muted/80" : "hover:bg-muted/50",
  ];  
}

function navIconBoxClass(item, isActive, isExactActive) {
  const on = item.exact ? isExactActive : isActive;
  return [
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors",
      on ? "bg-primary/10 text-primary" : "",
  ];
}

function navLabelClass(item, isActive, isExactActive) {
  const on = item.exact ? isExactActive : isActive;
  return [
    "min-w-0 flex-1 text-sm leading-snug",
      on ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
  ];
}

function goPresentation() {
  open.value = false;
  router.push(presentationHref.value);
}

async function loadHeaderUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) {
    displayName.value = "";
    avatarUrl.value = "";
    isAdmin.value = false;
    selectedClass.value = "";
    return;
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url, admin, organization").eq("id", user.id).maybeSingle();

  const name = String(profile?.full_name || user.user_metadata?.full_name || "").trim();
  displayName.value = name || user.email?.split("@")[0] || "Użytkownik";
  avatarUrl.value = profile?.avatar_url || "";
  isAdmin.value = profile?.admin === true;
  isOrganization.value = profile?.organization === true;
}

function loadSelectedClassFromStorage() {
  if (typeof window === "undefined") return "";
  try {
    const stored = window.localStorage.getItem(SELECTED_CLASS_STORAGE_KEY);
    return stored || "";
  } catch {
    return "";
  }
}

function saveSelectedClassToStorage(classId) {
  if (typeof window === "undefined") return;
  try {
    if (classId) {
      window.localStorage.setItem(SELECTED_CLASS_STORAGE_KEY, classId);
    } else {
      window.localStorage.removeItem(SELECTED_CLASS_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors (private mode/quota).
  }
}

let authSub = null;

onMounted(async () => {
  // Load previously selected class
  selectedClass.value = loadSelectedClassFromStorage();
  
  await Promise.allSettled([fetchLessons(), loadHeaderUser(), fetchUserClasses()]);
  const { data } = supabase.auth.onAuthStateChange(() => {
    void loadHeaderUser();
    void fetchUserClasses();
  });
  authSub = data.subscription;
});

onUnmounted(() => {
  authSub?.unsubscribe();
});

// Watcher na zmianę wybranej klasy
watch(selectedClass, (newValue) => {
  if (newValue === "add-new") {
    showAddClassModal.value = true;
    selectedClass.value = "";
  } else {
    // Update store and localStorage
    setSelectedClass(newValue);
    saveSelectedClassToStorage(newValue);
  }
});

watch(showAddClassModal, (isOpen) => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }
});

// Watcher na zmianę userClasses - ensure selectedClassName is set when classes load
watch(
  () => state.userClasses,
  () => {
    if (selectedClass.value && state.userClasses.length > 0) {
      // Re-trigger setSelectedClass to ensure selectedClassName is properly set
      setSelectedClass(selectedClass.value);
    }
  }
);

watch(
  () => route.path,
  () => {
    if (route.path === "/dashboard" || route.path === "/profile") void loadHeaderUser();
  }
);

function closeAddClassModal() {
  showAddClassModal.value = false;
  newClassName.value = "";
  classError.value = "";
}

async function handleAddClass() {
  try {
    classError.value = "";
    if (!newClassName.value.trim()) {
      classError.value = "Wpisz nazwę klasy";
      return;
    }

    addingClass.value = true;
    const newClass = await addUserClass(newClassName.value);
    selectedClass.value = newClass.id;
    closeAddClassModal();
  } catch (err) {
    classError.value = err.message || "Nie udało się dodać klasy";
  } finally {
    addingClass.value = false;
  }
}
</script>
