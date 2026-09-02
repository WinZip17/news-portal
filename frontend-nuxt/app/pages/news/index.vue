<template>
  <div class="news-page">
    <h1 class="page-title">Новости</h1>

    <NewsListFilters
      v-model:search-query="searchQuery"
      v-model:selected-category="selectedCategory"
      v-model:sort-by="sortBy"
      v-model:ai-filter="aiFilter"
      v-model:from-date="fromDate"
      v-model:to-date="toDate"
      :has-active-filters="hasActiveFilters"
      @search="applyFilters"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <div v-if="newsStore.isLoading && !newsStore.news.length" class="loading-container">
      <ProgressSpinner />
    </div>

    <div v-else-if="newsStore.error && !newsStore.news.length" class="error-container">
      <Message severity="error">{{ newsStore.error }}</Message>
    </div>

    <div v-if="newsStore.news.length" class="news-list">
      <NewsListCard
        v-for="item in newsStore.news"
        :key="item.id"
        :news="item"
        @click="openNewsDetail"
      />
    </div>

    <div v-else-if="!newsStore.isLoading && !newsStore.error" class="empty-state">
      <i class="pi pi-inbox icon-empty-lg"></i>
      <h3>Новости не найдены</h3>
      <p>Попробуйте изменить параметры поиска</p>
    </div>

    <div ref="loaderRef" class="load-more">
      <ProgressSpinner v-if="newsStore.loadingMore" class="spinner-sm" />
      <span v-else-if="!newsStore.hasMore && newsStore.news.length" class="load-more-text">
        Все новости загружены
      </span>
    </div>

    <NewsDetailModal
      v-if="detailModalVisible"
      v-model:visible="detailModalVisible"
      :news="selectedNews"
    />
  </div>
</template>

<script setup lang="ts">
import type { NewsItem, NewsCategory, NewsFilter } from '~/types';
import { formatCalendarDate } from '~/utils/formatCalendarDate';

const newsStore = useNewsStore();

const searchQuery = ref('');
const selectedCategory = ref<NewsCategory | null>(null);
const sortBy = ref('publishedAt');
const aiFilter = ref<'all' | 'true' | 'false'>('all');
const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);
const detailModalVisible = ref(false);
const selectedNews = ref<NewsItem | null>(null);
const loaderRef = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;

await useAsyncData('news-page-data', async () => {
  await newsStore.fetchNews();
  return {
    newsCount: newsStore.news.length,
  };
});

const hasActiveFilters = computed(
  () =>
    !!searchQuery.value ||
    !!selectedCategory.value ||
    aiFilter.value !== 'all' ||
    !!fromDate.value ||
    !!toDate.value ||
    sortBy.value !== 'publishedAt',
);

onMounted(() => {
  setupObserver();
});

onUnmounted(() => {
  observer?.disconnect();
});

watch(
  () => [newsStore.news.length, newsStore.hasMore, newsStore.isLoading, newsStore.loadingMore],
  async () => {
    await nextTick();
    setupObserver();
  },
);

function setupObserver(): void {
  observer?.disconnect();
  if (!loaderRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (
        entries[0]?.isIntersecting &&
        newsStore.hasMore &&
        !newsStore.isLoading &&
        !newsStore.loadingMore
      ) {
        newsStore.loadMore();
      }
    },
    { threshold: 0.1 },
  );
  observer.observe(loaderRef.value);
}

function applyFilters(): void {
  const filter: NewsFilter = {
    search: searchQuery.value || undefined,
    category: selectedCategory.value || undefined,
    fromDate: undefined,
    toDate: undefined,
    isAiGenerated: undefined,
  };

  if (sortBy.value) {
    const [field, order] = sortBy.value.split('_');
    filter.sortBy = field as NewsFilter['sortBy'];
    filter.sortOrder = order === 'asc' ? 'ASC' : 'DESC';
  }

  if (aiFilter.value === 'true') {
    filter.isAiGenerated = true;
  } else if (aiFilter.value === 'false') {
    filter.isAiGenerated = false;
  }

  if (fromDate.value) {
    filter.fromDate = formatCalendarDate(fromDate.value);
  }

  if (toDate.value) {
    filter.toDate = formatCalendarDate(toDate.value);
  }

  newsStore.setFilter({ ...filter, page: 1 });
  newsStore.fetchNews();
}

function resetFilters(): void {
  searchQuery.value = '';
  selectedCategory.value = null;
  sortBy.value = 'publishedAt';
  aiFilter.value = 'all';
  fromDate.value = null;
  toDate.value = null;
  newsStore.resetFilter();
  newsStore.fetchNews();
}

function openNewsDetail(id: string): void {
  selectedNews.value = newsStore.news.find((n: NewsItem) => n.id === id) || null;
  if (selectedNews.value) {
    detailModalVisible.value = true;
  }
}
</script>

<style scoped>
.news-page {
  max-width: 960px;
  margin: 0 auto;
  padding-inline: 8px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--p-text-color);
  margin-bottom: 1.5rem;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  width: 100%;
}

.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 3rem;
  padding: 1rem 0 2rem;
}

.load-more-text {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.error-container {
  max-width: 600px;
  margin: 0 auto 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--p-text-muted-color);
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  color: var(--p-text-color);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .news-page {
    padding-inline: 0;
  }
}
</style>
