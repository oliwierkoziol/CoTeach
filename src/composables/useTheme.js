import { computed, ref } from "vue";

const THEME_KEY = "coteach-theme";
const theme = ref("light");
let initialized = false;

function applyTheme(mode) {
  if (typeof document === "undefined") return;
  const isDark = mode === "dark";
  document.documentElement.classList.toggle("dark", isDark);
}

export function initTheme() {
  if (initialized) return;
  initialized = true;

  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      theme.value = saved;
    } else {
      // Default requested by user.
      theme.value = "light";
      window.localStorage.setItem(THEME_KEY, "light");
    }
  }

  applyTheme(theme.value);
}

export function useTheme() {
  function setTheme(mode) {
    theme.value = mode === "dark" ? "dark" : "light";
    applyTheme(theme.value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, theme.value);
    }
  }

  function toggleTheme() {
    setTheme(theme.value === "dark" ? "light" : "dark");
  }

  return {
    theme: computed(() => theme.value),
    isDark: computed(() => theme.value === "dark"),
    setTheme,
    toggleTheme
  };
}
