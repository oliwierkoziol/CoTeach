<template>
  <div class="app-shell min-h-screen overflow-x-clip bg-background text-foreground transition-colors">
    <header
      class="fixed inset-x-0 top-0 z-[56] flex h-16 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 text-foreground backdrop-blur-md sm:px-5"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2">
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
          <div class="flex h-10 w-[124px] items-center overflow-hidden sm:h-12 sm:w-[220px]">
            <img src="/logo.svg" alt="Logo" class="h-10 w-full object-cover object-left logo sm:h-12" />
          </div>
        </RouterLink>
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
        'fixed left-0 top-[64px] z-[55] flex h-[calc(100vh-64px)] w-[256px] flex-col border-r border-black/30 bg-[#f8fafc] transition-transform duration-200 ease-out md:translate-x-0',
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
              'mb-4 flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors',
              startLessonCta.isLive
                ? 'bg-[rgba(12,61,254,0.08)] hover:bg-[rgba(12,61,254,0.14)]'
                : 'justify-center bg-[#0c3dfe] hover:bg-[#0a34d4]'
            ]"
            @click="navigate(); open = false;"
          >
            <template v-if="startLessonCta.isLive">
              <img :src="screenIcon" alt="" class="h-[18px] w-[20px] shrink-0" />
              <span class="font-['Plus_Jakarta_Sans'] text-sm font-semibold leading-5 text-[#0c3dfe]">
                {{ startLessonCta.label }}
              </span>
            </template>
            <template v-else>
              <svg class="h-[10px] w-[10px]" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1V13M1 7H13" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span class="font-['Plus_Jakarta_Sans'] text-sm font-semibold leading-5 text-white">
                Rozpocznij lekcję
              </span>
            </template>
          </a>
        </RouterLink>

        <!-- Divider + nav links -->
        <div class="flex-1 space-y-1 border-t border-black/30 pt-4">

          <!-- Panel startowy -->
          <RouterLink to="/dashboard" custom v-slot="{ href, navigate, isExactActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors', isExactActive ? 'bg-[rgba(12,61,254,0.08)]' : 'hover:bg-black/5']" @click="navigate(); open = false;">
              <svg class="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 18 18">
                <path d="M10 6V0H18V6H10ZM0 10V0H8V10H0ZM10 18V8H18V18H10ZM0 18V12H8V18H0ZM2 8H6V2H2V8ZM12 16H16V10H12V16ZM12 4H16V2H12V4ZM2 16H6V14H2V16Z" fill="#566166"/>
              </svg>
              <p :class="['text-[14px] font-semibold', isExactActive ? 'text-[#0c3dfe]' : 'text-[#475569]']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Panel startowy</p>
            </a>
          </RouterLink>

          <!-- Dodaj materiały -->
          <RouterLink to="/notes" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors', isActive ? 'bg-[rgba(12,61,254,0.08)]' : 'hover:bg-black/5']" @click="navigate(); open = false;">
              <svg class="h-5 w-4 shrink-0" fill="none" viewBox="0 0 16 20">
                <path d="M7 17H9V12.825L10.6 14.425L12 13L8 9L4 13L5.425 14.4L7 12.825V17ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H10L16 6V18C16 18.55 15.8042 19.0208 15.4125 19.4125C15.0208 19.8042 14.55 20 14 20H2ZM9 7V2H2V18H14V7H9ZM2 2V7V2V7V18V2Z" fill="#566166"/>
              </svg>
              <p :class="['text-[14px] font-semibold', isActive ? 'text-[#0c3dfe]' : 'text-[#475569]']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Dodaj materiały</p>
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
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors', isActive ? 'bg-[rgba(12,61,254,0.08)]' : 'hover:bg-black/5']" @click="navigate(); open = false;">
              <svg class="h-4 w-5 shrink-0" fill="none" viewBox="0 0 20 16">
                <path d="M9 12H11V7.85L12.6 9.425L14.025 8L10 4L6 8L7.425 9.4L9 7.825V12ZM2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16H2ZM2 14H18V2H2V14ZM2 14V2V14Z" fill="#566166"/>
              </svg>
              <p :class="['text-[14px] font-semibold', isActive ? 'text-[#0c3dfe]' : 'text-[#475569]']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Prezentacja</p>
            </a>
          </RouterLink>

          <!-- Archiwum -->
          <RouterLink to="/archive" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors', isActive ? 'bg-[rgba(12,61,254,0.08)]' : 'hover:bg-black/5']" @click="navigate(); open = false;">
              <svg class="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 20 20">
                <path d="M8 12H12V10H8V12ZM8 9H16V7H8V9ZM8 6H16V4H8V6ZM6 16C5.45 16 4.97917 15.8042 4.5875 15.4125C4.19583 15.0208 4 14.55 4 14V2C4 1.45 4.19583 0.979167 4.5875 0.5875C4.97917 0.195833 5.45 0 6 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16H6ZM6 14H18V2H6V14ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4H2V18H16V20H2ZM6 2V14V2Z" fill="#566166"/>
              </svg>
              <p :class="['text-[14px] font-semibold', isActive ? 'text-[#0c3dfe]' : 'text-[#475569]']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Archiwum</p>
            </a>
          </RouterLink>
          
          <!-- Organizacja -->
          <RouterLink v-if="isAdmin" to="/organization" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors', isActive ? 'bg-[rgba(12,61,254,0.08)]' : 'hover:bg-black/5']" @click="navigate(); open = false;">
              <img :src="adminIcon" alt="" class="h-[18px] w-[18px] shrink-0" />
              <p :class="['text-[14px] font-semibold', isActive ? 'text-[#0c3dfe]' : 'text-[#475569]']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Organizacja</p>
            </a>
          
          </RouterLink>
          <!-- Panel admina -->
          <RouterLink v-if="isAdmin" to="/admin/dashboard" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="['flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors', isActive ? 'bg-[rgba(12,61,254,0.08)]' : 'hover:bg-black/5']" @click="navigate(); open = false;">
              <img :src="adminIcon" alt="" class="h-[18px] w-[18px] shrink-0" />
              <p :class="['text-[14px] font-semibold', isActive ? 'text-[#0c3dfe]' : 'text-[#475569]']" style="font-family: 'Plus Jakarta Sans', sans-serif;">Panel admina</p>
            </a>
          </RouterLink>

         

        </div>
      </div>
    </aside>

    <main class="min-h-screen min-w-0 overflow-x-clip pt-16 md:pl-[256px]">
      <div v-if="licenseWarning" class="px-4 pt-4 sm:px-6 lg:px-10">
        <div class="rounded-xl mt-5 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          Do Twojego konta nie jest przypisana żadna licencja.
        </div>
      </div>
      <div class="min-h-[calc(100vh-4rem)]">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, h, mergeProps, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../supabase";
import { useLessonStore } from "../composables/useLessonStore";
import { useTheme } from "../composables/useTheme";
import adminIcon from "../assets/admin.svg";
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
const { state, fetchLessons } = useLessonStore();
const { isDark, toggleTheme } = useTheme();

const displayName = ref("");
const avatarUrl = ref("");
const isAdmin = ref(false);

const presentationHref = computed(() => {
  const id = state.lesson?.id || state.lessons[0]?.id || "demo";
  return `/presentation/${id}`;
});

const isPresentationActive = computed(() => route.path.startsWith("/presentation/"));

const currentLiveLesson = computed(() => {
  const lessons = Array.isArray(state.lessons) ? state.lessons : [];
  const liveFromList =
    lessons
    .filter((lesson) => lesson?.status === "live")
    .sort((a, b) => new Date(b?.startedAt || 0).getTime() - new Date(a?.startedAt || 0).getTime())[0] || null;
  if (liveFromList) return liveFromList;
  return state.lesson?.status === "live" ? state.lesson : null;
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
    return;
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url, admin").eq("id", user.id).maybeSingle();

  const name = String(profile?.full_name || user.user_metadata?.full_name || "").trim();
  displayName.value = name || user.email?.split("@")[0] || "Użytkownik";
  avatarUrl.value = profile?.avatar_url || "";
  isAdmin.value = profile?.admin === true;
}

let authSub = null;

onMounted(async () => {
  await Promise.allSettled([fetchLessons(), loadHeaderUser()]);
  const { data } = supabase.auth.onAuthStateChange(() => {
    void loadHeaderUser();
  });
  authSub = data.subscription;
});

onUnmounted(() => {
  authSub?.unsubscribe();
});

watch(
  () => route.path,
  () => {
    if (route.path === "/dashboard" || route.path === "/profile") void loadHeaderUser();
  }
);
</script>
