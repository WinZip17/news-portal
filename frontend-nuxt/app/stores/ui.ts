import { defineStore } from 'pinia';
import { usePreferredDark } from '@vueuse/core';
import { useAuthService } from '~/services/auth.service.ts';

export const useUIStore = defineStore('ui', () => {
  const preferredDark = usePreferredDark();
  const theme = ref<'light' | 'dark'>('light');

  function initTheme(): void {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        theme.value = saved;
      } else {
        theme.value = preferredDark.value ? 'dark' : 'light';
        localStorage.setItem('theme', theme.value);
      }
      applyTheme();
    }
  }

  function toggleTheme(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme.value);
    applyTheme();
    syncThemeWithServer();
  }

  function setTheme(newTheme: 'light' | 'dark'): void {
    theme.value = newTheme;
    localStorage.setItem('theme', theme.value);
    applyTheme();
    syncThemeWithServer();
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

  async function syncThemeWithServer(): Promise<void> {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated) {
      try {
        const authService = useAuthService();
        await authService.updatePreferences({ theme: theme.value });
      } catch {
        console.warn('Не удалось синхронизировать тему с сервером');
      }
    }
  }

  return {
    theme,
    initTheme,
    toggleTheme,
    setTheme,
    syncThemeWithServer,
  };
});
