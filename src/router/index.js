import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../supabase.js";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0, left: 0, behavior: "auto" };
  },
  routes: [
    { path: "/", component: () => import("../views/LandingView.vue") },
    { path: "/dashboard", component: () => import("../views/DashboardView.vue") },
    { path: "/profile", component: () => import("../views/ProfileView.vue") },
    { path: "/preparation", component: () => import("../views/PreparationView.vue") },
    { path: "/notes", component: () => import("../views/NotesView.vue") },
    { path: "/live-lesson/:lessonId?", component: () => import("../views/LiveLessonView.vue") },
    { path: "/presentation/:lessonId", component: () => import("../views/PresentationView.vue") },
    { path: "/archive", component: () => import("../views/ArchiveView.vue") },
    { path: "/admin", component: () => import("../views/AdminView.vue") },
    { path: "/admin/dashboard", component: () => import("../views/SpecialAdminView.vue") },
    { path: "/admin/cost-calculator", component: () => import("../views/AdminCostCalculatorView.vue") },
    { path: "/admin/users", component: () => import("../views/SpecialAdminView.vue") },
    { path: "/login", component: () => import("../views/LoginView.vue") },
    { path: "/register", component: () => import("../views/RegisterView.vue") },
    { path: "/share/:noteId", component: () => import("../views/ShareView.vue") }
  ]
});

const supabaseConfigured =
  Boolean(String(import.meta.env.VITE_SUPABASE_URL || "").trim()) &&
  Boolean(
    String(
      import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
    ).trim()
  );

const AUTH_GUARD_TIMEOUT_MS = 4000;

async function getSessionWithTimeout() {
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve({ timedOut: true, session: null }), AUTH_GUARD_TIMEOUT_MS);
  });

  const sessionPromise = supabase.auth
    .getSession()
    .then(({ data }) => ({ timedOut: false, session: data.session }))
    .catch(() => ({ timedOut: true, session: null }));

  return Promise.race([sessionPromise, timeoutPromise]);
}

router.beforeEach(async (to) => {
  if (!supabaseConfigured) return true;
  if (to.path === "/") return true;
  if (to.path.startsWith("/share/")) return true;
  if (to.path === "/login" || to.path === "/register") return true;

  const { timedOut, session } = await getSessionWithTimeout();
  if (timedOut) return true;
  if (!session) return { path: "/login", query: { redirect: to.fullPath } };

  const { data: profile, error: blockedCheckError } = await supabase
    .from("profiles")
    .select("blocked, admin")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!blockedCheckError && profile?.blocked === true) {
    await supabase.auth.signOut({ scope: "local" });
    return { path: "/login", query: { blocked: "1" } };
  }

  if (to.path.startsWith("/admin") && profile?.admin !== true) {
    return { path: "/dashboard" };
  }

  return true;
});

export default router;
