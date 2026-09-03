<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from 'vuetify';
import { useUIStore } from '@/stores/ui';
import MainLayout from '@/layouts/MainLayout.vue';
import HomeLayout from '@/layouts/HomeLayout.vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const vuetifyTheme = useTheme();
const uiStore = useUIStore();

const isHomeRoute = computed(() => route.name === 'home');

/** На главной Vuetify всегда light — «часы» рисует newspaper-layout--watch */
function syncVuetifyTheme() {
  vuetifyTheme.change(isHomeRoute.value ? 'light' : uiStore.theme);
}

watch([isHomeRoute, () => uiStore.theme], syncVuetifyTheme, { immediate: true });

onMounted(() => {
  authStore.initialize();
});
</script>

<template>
  <v-app>
    <HomeLayout v-if="authStore.isInitialized && isHomeRoute">
      <RouterView />
    </HomeLayout>
    <MainLayout v-else-if="authStore.isInitialized">
      <RouterView />
    </MainLayout>
    <v-progress-circular v-else indeterminate />
  </v-app>
</template>
