<template>
  <v-app>
    <MainLayout v-if="authStore.isInitialized">
      <RouterView />
    </MainLayout>
    <v-progress-circular v-else indeterminate />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useTheme } from 'vuetify';
import { useUIStore } from '@/stores/ui';
import MainLayout from '@/layouts/MainLayout.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const vuetifyTheme = useTheme();
const uiStore = useUIStore();

vuetifyTheme.global.name.value = uiStore.theme;

watch(
  () => uiStore.theme,
  (newTheme) => {
    vuetifyTheme.global.name.value = newTheme;
  }
);

onMounted(() => {
  authStore.initialize();
});
</script>
