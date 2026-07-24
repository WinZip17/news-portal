import { defineStore } from 'pinia';
import { useStorage, usePreferredDark } from '@vueuse/core';
import { useAuthService } from '~/services/auth.service.ts';

export const useUIStore = defineStore('ui', () => {
  const theme = useStorage<'light' | 'dark'>('theme', 'light');
  const preferredDark = usePreferredDark();

  function initTheme(): void {
    if (!localStorage.getItem('theme')) {
      theme.value = preferredDark.value ? 'dark' : 'light';
    }
    applyTheme();
  }

  function toggleTheme(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    applyTheme();
    syncThemeWithServer();
  }

  function setTheme(newTheme: 'light' | 'dark'): void {
    theme.value = newTheme;
    applyTheme();
    syncThemeWithServer();
  }

  function applyTheme(): void {
    if (import.meta.client) {
      const root = document.documentElement;
      // PrimeVue 4 использует классы для переключения тем
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
