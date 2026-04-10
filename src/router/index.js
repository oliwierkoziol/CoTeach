import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import PreparationView from "../views/PreparationView.vue";
import LiveLessonView from "../views/LiveLessonView.vue";
import PresentationView from "../views/PresentationView.vue";
import ArchiveView from "../views/ArchiveView.vue";
import AdminView from "../views/AdminView.vue";
import ShareView from "../views/ShareView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import ProfileView from "../views/ProfileView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: DashboardView },
    { path: "/preparation", component: PreparationView },
    { path: "/live-lesson/:lessonId?", component: LiveLessonView },
    { path: "/presentation/:lessonId", component: PresentationView },
    { path: "/archive", component: ArchiveView },
    { path: "/admin", component: AdminView },
    { path: "/login", component: LoginView },
    { path: "/register", component: RegisterView },
    { path: "/profile", component: ProfileView },
    { path: "/share/:noteId", component: ShareView }
  ]
});

export default router;
