import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../supabase";
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

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0, left: 0, behavior: "auto" };
  },
  routes: [
    { path: "/", component: DashboardView },
    { path: "/profile", component: ProfileView },
    { path: "/preparation", component: PreparationView },
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
  Boolean(String(import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim());

router.beforeEach(async (to) => {
  if (!supabaseConfigured) return true;
  if (to.path.startsWith("/share/")) return true;
  if (to.path === "/login" || to.path === "/register") return true;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { path: "/login", query: { redirect: to.fullPath } };

  if (to.path.startsWith("/admin")) return true;

  const {
    data: profile,
    error: blockedCheckError
  } = await supabase
    .from("profiles")
    .select("blocked")
    .eq("id", data.session.user.id)
    .maybeSingle();

  if (!blockedCheckError && profile?.blocked === true) {
    await supabase.auth.signOut();
    return { path: "/login", query: { blocked: "1" } };
  }

  return true;
});

export default router;
