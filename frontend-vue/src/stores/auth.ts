import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.service';
import type { User, LoginCredentials, RegisterData } from '@/types/auth';
import { useUIStore } from '@/stores/ui';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isAuthenticated = computed(() => !!accessToken.value);
  const isInitialized = ref(false);
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'super_admin');
  const isModerator = computed(() => user.value?.role === 'moderator');

  async function initialize() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await fetchCurrentUser();
      } catch {}
    }
    isInitialized.value = true;
  }

  async function login(credentials: LoginCredentials) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.login(credentials);
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      await fetchCurrentUser();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Ошибка входа';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(data: RegisterData) {
    isLoading.value = true;
    error.value = null;
    try {
      await authService.register(data);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Ошибка регистрации';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCurrentUser() {
    try {
      const userData = await authService.getMe();
      user.value = userData;
      if (userData.preferences?.theme) {
        const uiStore = useUIStore();
        uiStore.setTheme(userData.preferences.theme);
      }
    } catch {
      logout();
    }
  }

  function logout() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  function clearError() {
    error.value = null;
  }
  async function updateProfile(data: Partial<Pick<User, 'firstName' | 'lastName' | 'avatar'>>) {
    const updated = await authService.updateProfile(data);
    user.value = updated;
  }

  async function updatePreferences(preferences: Partial<User['preferences']>) {
    const updated = await authService.updatePreferences(preferences);
    user.value = updated;
  }

  async function changePassword(data: { currentPassword: string; newPassword: string }) {
    await authService.changePassword(data);
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isModerator,
    login,
    register,
    fetchCurrentUser,
    logout,
    clearError,
    updateProfile,
    updatePreferences,
    changePassword,
    isInitialized,
    initialize
  };
});
