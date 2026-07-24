// app/middleware/auth.ts
import { useApi } from '~/services/api.ts';

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // Проверяем авторизацию если еще не проверена
  if (!authStore.isAuthenticated && useApi().accessToken.value) {
    await authStore.checkAuth();
  }

  // Если не авторизован - на страницу логина
  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }

  // Проверка ролей для админки
  if (to.path.startsWith('/admin')) {
    if (!authStore.isModerator) {
      return navigateTo('/');
    }

    // Для страницы пользователей нужен админ
    if (to.path.includes('/admin/users') && !authStore.isAdmin) {
      return navigateTo('/admin');
    }

    // Для AI-генерации нужен супер-админ
    if (to.path.includes('/admin/ai-generate') && !authStore.isSuperAdmin) {
      return navigateTo('/admin');
    }
  }
});
