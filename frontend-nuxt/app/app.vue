<template>
  <div class="app-container">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toast position="bottom-right" />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const uiStore = useUIStore();

// Инициализация при старте
onMounted(async () => {
  uiStore.initTheme();
  await authStore.checkAuth();
});

// Синхронизация темы с бекендом при изменении
watch(
  () => uiStore.theme,
  () => {
    if (authStore.isAuthenticated) {
      uiStore.syncThemeWithServer();
    }
  },
);
</script>
