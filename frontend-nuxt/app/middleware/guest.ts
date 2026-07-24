export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();

  // Если пользователь уже авторизован, редиректим на главную
  if (authStore.isAuthenticated) {
    return navigateTo('/');
  }
});
