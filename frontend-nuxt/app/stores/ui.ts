import { defineStore } from 'pinia';
import { usePreferredDark, useStorage } from '@vueuse/core';
import { useAuthStore } from '@/app/stores/auth';
import { useAuthService } from '@/app/services/auth.service';

export const useUIStore = defineStore('ui', () => {
  const theme = useStorage<'light' | 'dark'>('theme', 'light');
  const preferredDark = usePreferredDark();

  function initTheme(): void {
    // Если тема не установлена, используем системные настройки
    if (!localStorage.getItem('theme')) {
      theme.value = preferredDark.value ? 'dark' : 'light';
    }
    applyTheme();
  }

  function toggleTheme(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    applyTheme();

    // Синхронизация с бекендом, если пользователь авторизован
    syncThemeWithServer();
  }

  function setTheme(newTheme: 'light' | 'dark'): void {
    theme.value = newTheme;
    applyTheme();
  }

  function applyTheme(): void {
    if (import.meta.client) {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme.value);
    }
  }

  async function syncThemeWithServer(): Promise<void> {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated) {
      try {
        const authService = useAuthService();
        await authService.updatePreferences({ theme: theme.value });
      } catch {
        // Не критично, если не удалось синхронизировать
      }
    }
  }

  return {
    theme,
    initTheme,
    toggleTheme,
    setTheme,
    applyTheme,
  };
});
