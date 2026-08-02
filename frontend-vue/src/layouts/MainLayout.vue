<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import FrameworkSwitcher from '@/components/common/FrameworkSwitcher.vue';
import { useDisplay } from 'vuetify';
import { storeToRefs } from 'pinia';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUIStore();
const { isDark } = storeToRefs(uiStore);
const { toggleTheme } = uiStore;
const { smAndDown } = useDisplay();

const drawer = ref(false);
const rail = ref(false);

const navItems = computed(() => {
  const items = [
    { title: 'Главная', icon: 'mdi-home', to: '/' },
    { title: 'Новости', icon: 'mdi-newspaper', to: '/news' }
  ];
  if (authStore.isAuthenticated) {
    items.push({ title: 'Профиль', icon: 'mdi-account', to: '/profile' });
  }
  if (authStore.isAdmin || authStore.isModerator) {
    items.push({ title: 'Админ-панель', icon: 'mdi-shield-account', to: '/admin' });
  }
  return items;
});

const title = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Главная',
    '/news': 'Новости',
    '/profile': 'Профиль',
    '/admin': 'Админ-панель',
    '/login': 'Вход',
    '/register': 'Регистрация'
  };
  return titles[route.path] || '';
});

function handleLogout() {
  authStore.logout();
  router.push('/login');
}

function goTo(path: string) {
  router.push(path);
  if (smAndDown) drawer.value = false;
}
</script>

<template>
  <v-layout>
    <!-- Десктопный сайдбар -->
    <v-navigation-drawer v-if="!smAndDown" permanent :rail="rail" @update:rail="rail = $event">
      <v-list-item title="📰 News Portal" @click="goTo('/')" class="cursor-pointer" />

      <v-list nav density="compact">
        <v-list-item v-for="item in navItems" :key="item.to" :title="item.title" :prepend-icon="item.icon" :active="route.path === item.to" @click="goTo(item.to)" />
      </v-list>
    </v-navigation-drawer>

    <!-- Мобильное меню -->
    <v-navigation-drawer v-if="smAndDown" v-model="drawer" temporary>
      <v-list-item title="📰 News Portal" @click="goTo('/')" class="cursor-pointer" />
      <v-list nav>
        <v-list-item v-for="item in navItems" :key="item.to" :title="item.title" :prepend-icon="item.icon" :active="route.path === item.to" @click="goTo(item.to)" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar elevation="1">
      <v-app-bar-nav-icon v-if="smAndDown" @click="drawer = !drawer" />

      <v-app-bar-title>{{ title }}</v-app-bar-title>

      <div class="d-none d-sm-flex">
        <FrameworkSwitcher current="vue" />
      </div>

      <v-spacer />

      <v-btn :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" @click="toggleTheme" />

      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" :icon="authStore.isAuthenticated ? 'mdi-account-circle' : 'mdi-login'" />
        </template>
        <v-list v-if="authStore.isAuthenticated">
          <v-list-item title="Профиль" prepend-icon="mdi-account" @click="goTo('/profile')" />
          <v-list-item title="Выйти" prepend-icon="mdi-logout" @click="handleLogout" />
        </v-list>
        <v-list v-else>
          <v-list-item title="Войти" prepend-icon="mdi-login" @click="goTo('/login')" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>

    <v-footer app class="text-center text-caption"> News Portal ©{{ new Date().getFullYear() }} - Создано с ❤️ и AI </v-footer>
  </v-layout>
</template>
