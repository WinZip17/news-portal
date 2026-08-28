<template>
  <div class="search-page">
    <h1 class="page-title">🧠 Умный поиск</h1>
    <p class="page-description">
      Опишите запрос своими словами — AI подберёт фильтры, а поиск выполнится по заголовку, описанию
      и тегам.
    </p>

    <div class="search-form">
      <Textarea
        v-model="query"
        rows="3"
        auto-resize
        placeholder="Например: AI новости про технологии за последнюю неделю"
        class="search-input"
        @keydown.enter.exact.prevent="handleSearch"
      />
      <Button
        label="Найти"
        icon="pi pi-sparkles"
        :loading="loading"
        :disabled="!query.trim()"
        @click="handleSearch"
      />
    </div>

    <div class="examples">
      <Chip
        v-for="example in exampleQueries"
        :key="example"
        :label="example"
        class="example-chip"
        @click="query = example"
      />
    </div>

    <p v-if="searchHint" class="search-hint">
      Распознано<span v-if="searchSource === 'fallback'"> (без AI)</span>: {{ searchHint }}
    </p>

    <p v-if="!activeQuery && !loading" class="search-placeholder">
      Введите запрос и нажмите «Найти».
    </p>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>

    <div v-else-if="news.length" class="news-grid">
      <NewsCard v-for="item in news" :key="item.id" :news="item" @click="openNewsDetail" />
    </div>

    <div v-else-if="activeQuery" class="empty-state">
      <i class="pi pi-search icon-empty-md"></i>
      <h3>По запросу «{{ activeQuery }}» ничего не найдено</h3>
    </div>

    <div ref="loaderRef" class="load-more">
      <ProgressSpinner v-if="loadingMore" class="spinner-sm" />
      <span v-else-if="!hasMore && news.length">Все результаты загружены</span>
    </div>

    <NewsDetailModal
      v-if="detailModalVisible"
      v-model:visible="detailModalVisible"
      :news="selectedNews"
    />
  </div>
</template>

<script setup lang="ts">
import type { NewsItem } from '~/types';
import { getErrorMessage } from '~/utils/getErrorMessage';
import { useNewsService } from '~/services/news.service.ts';

const PAGE_SIZE = 20;
const { formatAppliedFilters } = useUtils();

const exampleQueries = [
  'AI новости про технологии за неделю',
  'экономика и инфляция',
  'популярные новости про спорт',
];

const newsService = useNewsService();
const { showError } = useAppToast();

const query = ref('');
const activeQuery = ref<string | null>(null);
const news = ref<NewsItem[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const page = ref(1);
const hasMore = ref(false);
const searchHint = ref<string | null>(null);
const searchSource = ref<'ai' | 'fallback' | null>(null);
const detailModalVisible = ref(false);
const selectedNews = ref<NewsItem | null>(null);
const loaderRef = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;

useHead({
  title: 'Умный поиск',
  meta: [{ name: 'description', content: 'AI-поиск новостей по естественному языку.' }],
});

async function runSearch(searchQuery: string, pageNum: number, append: boolean) {
  if (append) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }

  try {
    const data = await newsService.smartSearch(searchQuery, pageNum, PAGE_SIZE);
    news.value = append ? [...news.value, ...data.data] : data.data;
    hasMore.value = pageNum * PAGE_SIZE < data.total;
    searchHint.value = formatAppliedFilters(data.appliedFilters);
    searchSource.value = data.source;
  } catch (error: unknown) {
    if (!append) {
      news.value = [];
      hasMore.value = false;
      searchHint.value = null;
      searchSource.value = null;
    }
    showError(getErrorMessage(error, 'Не удалось выполнить поиск'));
  } finally {
    loading.value = false;
    loadingMore.value = false;
    await nextTick();
    setupObserver();
  }
}

function handleSearch() {
  const trimmed = query.value.trim();
  if (!trimmed) return;

  activeQuery.value = trimmed;
  page.value = 1;
  hasMore.value = true;
  runSearch(trimmed, 1, false);
}

function openNewsDetail(id: string) {
  selectedNews.value = news.value.find((item) => item.id === id) || null;
  if (selectedNews.value) {
    detailModalVisible.value = true;
  }
}

function setupObserver() {
  observer?.disconnect();
  if (!loaderRef.value || !activeQuery.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore.value && !loading.value && !loadingMore.value) {
        const nextPage = page.value + 1;
        page.value = nextPage;
        runSearch(activeQuery.value!, nextPage, true);
      }
    },
    { threshold: 0.1 },
  );
  observer.observe(loaderRef.value);
}

onMounted(() => {
  setupObserver();
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.search-page {
  max-width: 960px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.page-description {
  color: var(--p-text-muted-color);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.search-form {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  min-width: 280px;
}

.examples {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.example-chip {
  cursor: pointer;
}

.search-hint,
.search-placeholder {
  color: var(--p-text-muted-color);
  margin-bottom: 1rem;
}

.news-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.loading-container,
.load-more {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.load-more span {
  color: var(--p-text-muted-color);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--p-text-muted-color);
}

.empty-state h3 {
  margin-top: 1rem;
  color: var(--p-text-color);
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .search-form {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
    min-width: unset;
  }
}
</style>
