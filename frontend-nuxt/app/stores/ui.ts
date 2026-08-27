import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', () => {
  const theme = ref<'light' | 'dark'>('light');
  const isServerInit = ref(false);

  const themeCookie = useCookie('theme', {
    default: () => 'light',
    watch: true,
    maxAge: 60 * 60 * 24 * 365, // 1 год
  });

  function setThemeCookie(value: string): void {
    if (import.meta.client) {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `theme=${value};path=/;expires=${expires.toUTCString()};SameSite=Lax`;
    }
  }

  function initTheme(): void {
    if (import.meta.client && !isServerInit.value) {
      const saved = themeCookie.value;
      if (saved === 'dark' || saved === 'light') {
        theme.value = saved;
      }
      setThemeCookie(theme.value);
      applyTheme();
    }
  }

  function toggleTheme(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    setThemeCookie(theme.value);
    applyTheme();
  }

  function setTheme(newTheme: 'light' | 'dark'): void {
    theme.value = newTheme;
    setThemeCookie(theme.value);
    applyTheme();
  }

  function applyTheme(): void {
    if (import.meta.client) {
      const root = document.documentElement;
      if (theme.value === 'dark') {
        root.classList.add('p-dark');
      } else {
        root.classList.remove('p-dark');
      }
    }
  }

  function setServerTheme(initTheme: string) {
    if (initTheme === 'light' || initTheme === 'dark') {
      isServerInit.value = true;
      theme.value = initTheme;
    }
  }

  return { theme, initTheme, toggleTheme, setTheme, setServerTheme };
});
