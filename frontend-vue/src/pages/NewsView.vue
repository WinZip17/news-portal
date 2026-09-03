<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useNewsStore } from '@/stores/news';
import NewsCard from '@/components/news/NewsCard.vue';
import NewsDetailModal from '@/components/news/NewsDetailModal.vue';
import NewsListFilters from '@/components/news/NewsListFilters.vue';
import { getCategoryLabel } from '@/utils/getCategoryLabel';
import { getCategoryColor } from '@/utils/getCategoryColor';
import { formatDate } from '@/utils/formatDate';
import type { News, NewsFilter } from '@/types';
import { storeToRefs } from 'pinia';
import { useHead } from '@unhead/vue';

const newsStore = useNewsStore();
const { news, initialLoading, isLoading, loadingMore, hasMore } = storeToRefs(newsStore);

const search = ref('');
const category = ref('all');
const sortBy = ref('publishedAt');
const aiFilter = ref('all');
const fromDate = ref('');
const toDate = ref('');
const selectedNews = ref<News | null>(null);
const modalVisible = ref(false);
const loaderRef = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;

const hasActiveFilters = computed(() => category.value !== 'all' || aiFilter.value !== 'all' || !!search.value || !!fromDate.value || !!toDate.value);

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

onMounted(() => {
  if (!news.value.length) newsStore.fetchNews();
  setupObserver();
});

onUnmounted(() => {
  observer?.disconnect();
});

watch([category, sortBy, aiFilter, fromDate, toDate], () => {
  applyFilters();
});

watch([news, hasMore, isLoading, loadingMore], async () => {
  await nextTick();
  setupObserver();
});

function applyFilters() {
  const filters: Partial<NewsFilter> = {
    category: category.value !== 'all' ? (category.value as NewsFilter['category']) : undefined,
    search: search.value || undefined,
    isAiGenerated: aiFilter.value !== 'all' ? aiFilter.value === 'true' : undefined,
    fromDate: fromDate.value || undefined,
    toDate: toDate.value || undefined,
    sortBy: sortBy.value as NewsFilter['sortBy']
  };
  newsStore.setFilter(filters);
  newsStore.fetchNews();
}

function handleSearch() {
  applyFilters();
}

function resetFilters() {
  category.value = 'all';
  aiFilter.value = 'all';
  search.value = '';
  fromDate.value = '';
  toDate.value = '';
  handleSearch();
}

function setupObserver() {
  observer?.disconnect();
  if (!loaderRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore.value && !isLoading.value && !loadingMore.value) {
        newsStore.loadMore();
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(loaderRef.value);
}

function openNews(item: News) {
  selectedNews.value = item;
  modalVisible.value = true;
}

useHead({
  title: 'Лента новостей',
  meta: [{ name: 'description', content: 'Актуальные новости с фильтрацией по категориям.' }]
});
</script>

<template>
  <div class="mx-auto news-page">
    <h2 class="text-h4 mb-4">📰 Лента новостей</h2>

    <NewsListFilters
      v-model:search="search"
      v-model:category="category"
      v-model:sort-by="sortBy"
      v-model:ai-filter="aiFilter"
      v-model:from-date="fromDate"
      v-model:to-date="toDate"
      :has-active-filters="hasActiveFilters"
      :categories="categories"
      @search="handleSearch"
      @reset="resetFilters"
    />

    <v-row v-if="initialLoading || isLoading">
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
          :formatted-date="formatDate(item.publishedAt ?? item.createdAt, 'relative')"
          @click="openNews(item)"
        />
      </v-col>
    </v-row>

    <v-card v-else class="pa-8 text-center">
      <v-card-text>{{ category !== 'all' || search ? 'Ничего не найдено' : 'Новостей пока нет' }}</v-card-text>
    </v-card>

    <div ref="loaderRef" class="text-center py-6">
      <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="24" />
      <span v-else-if="!hasMore && news.length" class="text-caption text-medium-emphasis">Все новости загружены</span>
    </div>

    <v-dialog v-model="modalVisible" max-width="900">
      <NewsDetailModal v-if="selectedNews" :news="selectedNews" @close="modalVisible = false" />
    </v-dialog>
  </div>
</template>

<style scoped>
.news-page {
  max-width: 960px;
  padding-inline: 8px;
}

@media (min-width: 600px) {
  .news-page {
    padding-inline: 0;
  }
}
</style>
