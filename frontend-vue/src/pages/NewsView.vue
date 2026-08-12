<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useNewsStore } from '@/stores/news';
import NewsCard from '@/components/news/NewsCard.vue';
import NewsDetailModal from '@/components/news/NewsDetailModal.vue';
import type { News } from '@/types';
import { storeToRefs } from 'pinia';
import { useHead } from '@unhead/vue';

const newsStore = useNewsStore();
const { news, page, totalPages, initialLoading } = storeToRefs(newsStore);

const search = ref('');
const category = ref('all');
const sortBy = ref('publishedAt');
const aiFilter = ref('all');
const selectedNews = ref<News | null>(null);
const modalVisible = ref(false);

onMounted(() => {
  if (!news.value.length) newsStore.fetchNews();
});

watch([category, sortBy, aiFilter], () => {
  newsStore.setPage(1);
  applyFilters();
});

function applyFilters() {
  const filters: Record<string, unknown> = {};
  if (category.value !== 'all') filters.category = category.value;
  if (search.value) filters.search = search.value;
  if (aiFilter.value !== 'all') filters.isAiGenerated = aiFilter.value === 'true';
  newsStore.setFilter(filters);
  newsStore.fetchNews();
}

function handleSearch() {
  newsStore.setPage(1);
  applyFilters();
}

function changePage(p: number) {
  newsStore.setPage(p);
  newsStore.fetchNews();
}

function openNews(item: News) {
  selectedNews.value = item;
  modalVisible.value = true;
}

function getCategoryColor(cat: string) {
  const colors: Record<string, string> = {
    politics: 'blue',
    economy: 'green',
    technology: 'purple',
    science: 'cyan',
    sports: 'orange',
    entertainment: 'pink',
    health: 'red',
    world: 'indigo'
  };
  return colors[cat] || 'grey';
}

function getCategoryLabel(cat: string) {
  const labels: Record<string, string> = {
    politics: 'Политика',
    economy: 'Экономика',
    technology: 'Технологии',
    science: 'Наука',
    sports: 'Спорт',
    entertainment: 'Развлечения',
    health: 'Здоровье',
    world: 'Мир'
  };
  return labels[cat] || cat;
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return 'только что';
  if (diff < 60) return `${diff} мин. назад`;
  if (diff < 1440) return `${Math.floor(diff / 60)} ч. назад`;
  return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
}

const categories = [
  { value: 'all', label: '📂 Все' },
  { value: 'politics', label: '🏛 Политика' },
  { value: 'economy', label: '💹 Экономика' },
  { value: 'technology', label: '💻 Технологии' },
  { value: 'science', label: '🔬 Наука' },
  { value: 'sports', label: '⚽ Спорт' },
  { value: 'entertainment', label: '🎬 Развлечения' },
  { value: 'health', label: '🏥 Здоровье' },
  { value: 'world', label: '🌍 Мир' }
];

useHead({
  title: 'Лента новостей',
  meta: [{ name: 'description', content: 'Актуальные новости с фильтрацией по категориям.' }]
});
</script>

<template>
  <div class="mx-auto" style="max-width: 960px">
    <h2 class="text-h4 mb-4">📰 Лента новостей</h2>

    <div class="d-flex flex-wrap gap-2 mb-4">
      <v-text-field
        v-model="search"
        label="Поиск..."
        density="compact"
        hide-details
        prepend-inner-icon="mdi-magnify"
        style="max-width: 200px"
        @keydown.enter="handleSearch"
        @click:clear="
          search = '';
          handleSearch();
        "
        clearable
      />
      <v-select v-model="category" :items="categories" itemValue="value" itemTitle="label" density="compact" hide-details style="max-width: 180px" />
      <v-select
        v-model="sortBy"
        :items="[
          { value: 'publishedAt', title: '🕒 По дате' },
          { value: 'views', title: '👁 По просмотрам' },
          { value: 'likes', title: '❤️ По лайкам' }
        ]"
        density="compact"
        hide-details
        style="max-width: 160px"
      />
      <v-select
        v-model="aiFilter"
        :items="[
          { value: 'all', title: '📋 Все' },
          { value: 'true', title: '🤖 AI-рерайт' },
          { value: 'false', title: '📄 Оригиналы' }
        ]"
        density="compact"
        hide-details
        style="max-width: 160px"
      />
      <v-btn
        v-if="category !== 'all' || aiFilter !== 'all' || search"
        variant="text"
        size="small"
        @click="
          category = 'all';
          aiFilter = 'all';
          search = '';
          handleSearch();
        "
      >
        Сбросить
      </v-btn>
    </div>

    <v-row v-if="initialLoading">
      <v-col cols="12" v-for="i in 6" :key="i">
        <v-skeleton-loader type="article" />
      </v-col>
    </v-row>

    <v-row v-else-if="news.length">
      <v-col cols="12" v-for="item in news" :key="item.id">
        <NewsCard
          :item="item"
          :category-color="getCategoryColor(item.category)"
          :category-label="getCategoryLabel(item.category)"
          :formatted-date="formatDate(item.publishedAt ?? item.createdAt)"
          @click="openNews(item)"
        />
      </v-col>
    </v-row>

    <v-card v-else class="pa-8 text-center">
      <v-card-text>{{ category !== 'all' || search ? 'Ничего не найдено' : 'Новостей пока нет' }}</v-card-text>
    </v-card>

    <div class="d-flex justify-center mt-4" v-if="totalPages > 1">
      <v-pagination v-model="page" :length="totalPages" @update:model-value="changePage" />
    </div>

    <v-dialog v-model="modalVisible" max-width="900">
      <NewsDetailModal v-if="selectedNews" :news="selectedNews" @close="modalVisible = false" />
    </v-dialog>
  </div>
</template>
