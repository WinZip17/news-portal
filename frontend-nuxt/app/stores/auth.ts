import { defineStore } from 'pinia';
import type { LoginDto, RegisterDto, UserResponse } from '~/types';
import { useAuthService } from '~/services/auth.service.ts';

export const useAuthStore = defineStore('auth', () => {
  const uiStore = useUIStore();
  const user = ref<UserResponse | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const authService = useAuthService();
  const { accessToken } = useApi();

  async function checkAuth(): Promise<void> {
    if (!accessToken.value) {
      isAuthenticated.value = false;
      user.value = null;
      return;
    }

    try {
      isLoading.value = true;
      user.value = await authService.getCurrentUser();
      if (user.value?.preferences?.theme && user.value.preferences.theme !== uiStore.theme) {
        uiStore.setTheme(user.value.preferences.theme);
      }
      isAuthenticated.value = true;
    } catch {
      isAuthenticated.value = false;
      user.value = null;
      accessToken.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  async function login(data: LoginDto): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await authService.login(data);
      user.value = response.user;
      isAuthenticated.value = true;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(data: RegisterDto): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await authService.register(data);
      user.value = response.user;
      isAuthenticated.value = true;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    await authService.logout();
    user.value = null;
    isAuthenticated.value = false;
    navigateTo('/');
  }

  const isAdmin = computed(() => {
    return user.value?.role === 'admin' || user.value?.role === 'super_admin';
  });

  const isModerator = computed(() => {
    return user.value?.role === 'moderator' || isAdmin.value;
  });

  const isSuperAdmin = computed(() => {
    return user.value?.role === 'super_admin';
  });
  async function sendSaveTheme(theme: 'light' | 'dark'): Promise<void> {
    if (isAuthenticated.value) {
      try {
        await authService.updatePreferences({ theme });
      } catch {
        console.warn('Не удалось синхронизировать тему с сервером');
      }
    }
  }
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isModerator,
    isSuperAdmin,
    checkAuth,
    login,
    register,
    logout,
    sendSaveTheme,
  };
});
