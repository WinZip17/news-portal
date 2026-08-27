import { useApi } from '~/composables/useApi.ts';

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated && useApi().accessToken.value) {
    await authStore.checkAuth();
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }

  // Проверка ролей для админки
  if (to.path.startsWith('/admin')) {
    if (!authStore.isModerator) {
      return navigateTo('/');
    }

    if (to.path.includes('/admin/users') && !authStore.isAdmin) {
      return navigateTo('/admin');
    }

    if (to.path.includes('/admin/ai-generate') && !authStore.isSuperAdmin) {
      return navigateTo('/admin');
    }
  }
});
