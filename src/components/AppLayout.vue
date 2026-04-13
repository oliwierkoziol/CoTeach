<template>
  <div class="min-h-screen bg-[#f6f7fb] text-slate-900">
    <header
      class="fixed inset-x-0 top-0 z-[56] flex h-[4.2rem] items-center justify-between gap-3 border-b border-[#d8dbe5] bg-white px-4 sm:px-5"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
          aria-label="Menu"
          @click="open = true"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <RouterLink to="/" class="flex min-w-0 items-center gap-2 no-underline">
          <span class="truncate text-[20px] font-semibold tracking-tight text-[#2c5edb]">CoTeach</span>
        </RouterLink>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <RouterLink
          to="/profile"
          class="flex items-center rounded-full p-0.5 text-slate-700 ring-2 ring-transparent transition hover:ring-slate-200"
          :title="displayName || 'Profil'"
        >
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white"
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
        'fixed bottom-0 left-0 top-[4.2rem] z-[55] flex w-[min(17.5rem,calc(100vw-3rem))] flex-col border-r border-[#d8dbe5] bg-white px-3 py-4 transition-transform duration-200 md:w-[220px] md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <RouterLink
        to="/preparation"
        class="mb-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#0055ff] px-4 py-3 text-sm font-semibold tracking-tight text-white shadow-sm no-underline transition hover:bg-[#0047e6] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0055ff]"
        @click="open = false"
      >
        <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.25" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" d="M12 5v14M5 12h14" />
        </svg>
        <span>Nowa Lekcja</span>
      </RouterLink>

      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Nawigacja">
        <template v-for="item in navItems" :key="item.key">
          <RouterLink
            v-if="item.kind === 'link'"
            :to="item.to"
            custom
            v-slot="{ href, navigate, isActive, isExactActive }"
          >
            <a
              :href="href"
              :class="navRowClass(item, isActive, isExactActive)"
              @click.prevent="
                navigate();
                open = false;
              "
            >
              <span :class="navIconBoxClass(item, isActive, isExactActive)">
                <component v-if="typeof item.icon !== 'string'" :is="item.icon" class="h-6 w-6" />
                <img v-else :src="item.icon" alt="" class="h-6 w-6" />
              </span>
              <span :class="navLabelClass(item, isActive, isExactActive)">{{ item.label }}</span>
            </a>
          </RouterLink>
          <a
            v-else-if="item.kind === 'presentation'"
            href="#"
            :class="navRowClass({ exact: false }, isPresentationActive, false)"
            @click.prevent="goPresentation"
          >
            <span :class="navIconBoxClass({ exact: false }, isPresentationActive, false)">
              <IconScreenUp class="h-6 w-6" />
            </span>
            <span :class="navLabelClass({ exact: false }, isPresentationActive, false)">Prezentacja</span>
          </a>
        </template>
      </nav>
    </aside>

    <main class="min-h-screen min-w-0 pt-[4.2rem] md:pl-[220px]">
      <div class="min-h-[calc(100vh-4.2rem)]">
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

const route = useRoute();
const router = useRouter();
const open = ref(false);
const { state, fetchLessons } = useLessonStore();

const displayName = ref("");
const avatarUrl = ref("");

const presentationHref = computed(() => {
  const id = state.lesson?.id || state.lessons[0]?.id || "demo";
  return `/presentation/${id}`;
});

const isPresentationActive = computed(() => route.path.startsWith("/presentation/"));

const liveLessonTo = computed(() => {
  const id = state.lesson?.id;
  return id ? `/live-lesson/${id}` : "/live-lesson";
});

const navItems = computed(() => [
  { kind: "link", key: "start", to: "/", label: "Panel startowy", icon: IconGrid, exact: true },
  { kind: "link", key: "prep", to: "/preparation", label: "Materiały do lekcji", icon: IconFileUp, exact: false },
  { kind: "link", key: "notes", to: "/notes", label: "Generator notatek", icon: IconSparkles, exact: false },
  { kind: "link", key: "live", to: liveLessonTo.value, label: "Lekcja na żywo", icon: IconMonitorPlay, exact: false },
  { kind: "presentation", key: "pres" },
  { kind: "link", key: "monitoring", to: "/archive", label: "Monitoring", icon: IconChart, exact: false },
]);

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
    on ? "bg-slate-50/80" : "hover:bg-slate-50",
  ];
}

function navIconBoxClass(item, isActive, isExactActive) {
  const on = item.exact ? isExactActive : isActive;
  return [
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#4a5568] transition-colors",
    on ? "bg-[#ebf0ff]" : "",
  ];
}

function navLabelClass(item, isActive, isExactActive) {
  const on = item.exact ? isExactActive : isActive;
  return [
    "min-w-0 flex-1 text-sm leading-snug",
    on ? "font-semibold text-slate-900" : "font-medium text-slate-600",
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
    return;
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle();

  const name = String(profile?.full_name || user.user_metadata?.full_name || "").trim();
  displayName.value = name || user.email?.split("@")[0] || "Użytkownik";
  avatarUrl.value = profile?.avatar_url || "";
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
    if (route.path === "/" || route.path === "/profile") void loadHeaderUser();
  }
);
</script>
