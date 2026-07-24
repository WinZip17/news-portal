<!-- app/app.vue -->
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
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useAuthStore } from '@/app/stores/auth';
import { useUIStore } from '@/app/stores/ui';

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
