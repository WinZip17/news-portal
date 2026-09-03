<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

const accountLabel = computed(() => (authStore.isAuthenticated ? 'Профиль' : 'Войти'));
const accountTarget = computed(() => (authStore.isAuthenticated ? '/profile' : '/login'));

function go(path: string) {
  router.push(path);
}
</script>

<template>
  <nav class="newspaper-nav" aria-label="Навигация выпуска">
    <button type="button" class="newspaper-link" @click="go('/news')">Лента</button>
    <span class="newspaper-nav__sep" aria-hidden="true">|</span>
    <button type="button" class="newspaper-link" @click="go('/search')">Умный поиск</button>
    <span class="newspaper-nav__sep" aria-hidden="true">|</span>
    <button type="button" class="newspaper-link" @click="go(accountTarget)">{{ accountLabel }}</button>
    <span v-if="authStore.canAccessAdmin" class="newspaper-nav__sep" aria-hidden="true">|</span>
    <button v-if="authStore.canAccessAdmin" type="button" class="newspaper-link" @click="go('/admin')">Админ</button>

    <div class="newspaper-nav__cta">
      <button type="button" class="newspaper-link" @click="uiStore.toggleTheme()">
        {{ uiStore.isDark ? '☀ Светлая' : '☾ Тёмная' }}
      </button>
      <span class="newspaper-nav__sep" aria-hidden="true">|</span>
      <button v-if="!authStore.isAuthenticated" type="button" class="newspaper-link" @click="go('/register')">
        Регистрация
      </button>
      <button v-else type="button" class="newspaper-link" @click="go('/news')">Читать ленту →</button>
    </div>
  </nav>
</template>
