<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useHead } from '@unhead/vue';
import { useRouter } from 'vue-router';
import { useNewsStore } from '@/stores/news';
import { useAuthStore } from '@/stores/auth';
import NewsCard from '@/components/news/NewsCard.vue';
import NewsDetailModal from '@/components/news/NewsDetailModal.vue';
import { getCategoryLabel } from '@/utils/getCategoryLabel';
import { getCategoryColor } from '@/utils/getCategoryColor';
import { formatDate } from '@/utils/formatDate';
import type { News } from '@/types';
import { storeToRefs } from 'pinia';

const router = useRouter();
const newsStore = useNewsStore();
const authStore = useAuthStore();
const { news, stats, initialLoading } = storeToRefs(newsStore);

const selectedNews = ref<News | null>(null);
const modalVisible = ref(false);

useHead({ title: 'Главная' });

onMounted(async () => {
  await Promise.all([newsStore.fetchNews(), newsStore.fetchStats()]);
});

function openNews(item: News) {
  selectedNews.value = item;
  modalVisible.value = true;
}
</script>

<template>
  <div>
    <!-- Hero -->
    <v-sheet class="text-center pa-8 pa-md-12 mb-8 rounded-xl text-white" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
      <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">📰 News Portal</h1>
      <p class="text-h6 text-md-h5 mb-6 mx-auto" style="max-width: 600px; opacity: 0.9">Актуальные новости с AI-рерайтом из проверенных источников.</p>
      <div class="d-flex gap-2 justify-center flex-wrap">
        <template v-if="!authStore.isAuthenticated">
          <v-btn size="large" color="white" variant="flat" prepend-icon="mdi-rocket" class="text-purple" @click="router.push('/register')"> Начать бесплатно </v-btn>
          <v-btn size="large" variant="outlined" class="text-white" @click="router.push('/login')"> Войти </v-btn>
        </template>
        <v-btn v-else size="large" color="white" variant="flat" prepend-icon="mdi-newspaper" class="text-purple" @click="router.push('/news')"> Читать новости </v-btn>
      </div>
    </v-sheet>

    <!-- Статистика -->
    <v-row class="mb-8">
      <v-col
        cols="6"
        sm="4"
        md="4"
        lg="4"
        xl="2"
        v-for="stat in [
          { icon: 'mdi-newspaper', label: 'Сегодня', value: stats?.newsToday || 0 },
          { icon: 'mdi-account-group', label: 'Пользователей', value: stats?.totalUsers || 0 },
          { icon: 'mdi-robot', label: 'AI-рерайт', value: stats?.totalAiNews || 0 },
          { icon: 'mdi-newspaper-variant', label: 'Всего', value: stats?.totalNews || 0 },
          { icon: 'mdi-eye', label: 'Просмотров', value: stats?.totalViews || 0 },
          { icon: 'mdi-clock-outline', label: 'На модерации', value: stats?.pendingNews || 0 }
        ]"
        :key="stat.label"
      >
        <v-card variant="flat" class="text-center pa-2 h-100">
          <v-icon :icon="stat.icon" color="primary" class="mb-1" />
          <div class="text-h6 font-weight-bold">{{ stat.value }}</div>
          <div class="text-caption text-medium-emphasis text-wrap">{{ stat.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Последние новости -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h4">Последние новости</h2>
      <v-btn variant="text" append-icon="mdi-arrow-right" @click="router.push('/news')"> Все новости </v-btn>
    </div>

    <v-row v-if="initialLoading">
      <v-col cols="12" sm="6" lg="4" v-for="i in 6" :key="i">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <v-row v-else-if="news.length">
      <v-col cols="12" sm="6" lg="4" v-for="item in news.slice(0, 6)" :key="item.id">
        <NewsCard
          :item="item"
          :category-color="getCategoryColor(item.category)"
          :category-label="getCategoryLabel(item.category)"
          :formatted-date="formatDate(item.publishedAt ?? item.createdAt, 'relative')"
          @click="openNews(item)"
        />
      </v-col>
    </v-row>

    <v-card v-else class="pa-8 text-center">
      <v-card-text>Новости пока не загружены</v-card-text>
    </v-card>

    <!-- Модалка -->
    <v-dialog v-model="modalVisible" max-width="900">
      <NewsDetailModal v-if="selectedNews" :news="selectedNews" @close="modalVisible = false" />
    </v-dialog>
  </div>
</template>
