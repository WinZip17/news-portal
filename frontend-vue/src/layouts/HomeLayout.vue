<script setup lang="ts">
import { computed, onMounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import NewspaperMasthead from '@/components/newspaper/NewspaperMasthead.vue';
import NewspaperNav from '@/components/newspaper/NewspaperNav.vue';
import { HOME_NEWS_KEY, useHomeNews } from '@/composables/useHomeNews';
import { useUIStore } from '@/stores/ui';
import { useHead } from '@unhead/vue';

const router = useRouter();
const uiStore = useUIStore();
const { isDark } = storeToRefs(uiStore);
const homeNews = useHomeNews();

const mastheadStats = computed(() => homeNews.stats.value);
const mastheadLoading = computed(() => homeNews.loading.value && homeNews.stats.value === null);

provide(HOME_NEWS_KEY, homeNews);

useHead({
  titleTemplate: '%s | Short News',
  meta: [{ name: 'description', content: 'Главный выпуск Short News — новости в формате газеты.' }],
});

onMounted(() => {
  void homeNews.fetchHomeNews();
});

function goToFeed() {
  router.push('/news');
}
</script>

<template>
  <div class="newspaper-layout" :class="{ 'newspaper-layout--watch': isDark }">
    <NewspaperMasthead :stats="mastheadStats" :loading="mastheadLoading" />
    <NewspaperNav />
    <main class="newspaper-main">
      <slot />
    </main>
    <footer class="newspaper-footer">
      Short News ©{{ new Date().getFullYear() }} —
      <button type="button" class="newspaper-footer__link newspaper-link" @click="goToFeed">полная лента новостей</button>
    </footer>
  </div>
</template>

<style src="@/assets/newspaper.css"></style>
