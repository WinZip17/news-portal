<template>
  <v-app>
    <MainLayout>
      <RouterView />
    </MainLayout>
  </v-app>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';

import { watch } from 'vue';
import { useTheme } from 'vuetify';
import { useUIStore } from '@/stores/ui';

const vuetifyTheme = useTheme();
const uiStore = useUIStore();

vuetifyTheme.global.name.value = uiStore.theme;

watch(
  () => uiStore.theme,
  (newTheme) => {
    vuetifyTheme.global.name.value = newTheme;
  }
);
</script>
