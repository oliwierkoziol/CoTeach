import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../supabase.js";
import DashboardView from "../views/DashboardView.vue";
import PreparationView from "../views/PreparationView.vue";
import LiveLessonView from "../views/LiveLessonView.vue";
import PresentationView from "../views/PresentationView.vue";
import ArchiveView from "../views/ArchiveView.vue";
import AdminView from "../views/AdminView.vue";
import SpecialAdminView from "../views/SpecialAdminView.vue";
import ShareView from "../views/ShareView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import ProfileView from "../views/ProfileView.vue";
import NotesView from "../views/NotesView.vue";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0, left: 0, behavior: "auto" };
  },
  routes: [
    { path: "/", component: DashboardView },
    { path: "/profile", component: ProfileView },
    { path: "/preparation", component: PreparationView },
    { path: "/notes", component: NotesView },
    { path: "/live-lesson/:lessonId?", component: LiveLessonView },
    { path: "/presentation/:lessonId", component: PresentationView },
    { path: "/archive", component: ArchiveView },
    { path: "/admin", component: AdminView },
    { path: "/admin/users", component: SpecialAdminView },
    { path: "/login", component: LoginView },
    { path: "/register", component: RegisterView },
    { path: "/share/:noteId", component: ShareView }
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
    return { path: "/" };
  }

  return true;
});

export default router;
