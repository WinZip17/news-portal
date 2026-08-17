<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { newsService } from '@/services/news.service';
import { formatAppliedFilters } from '@/utils/formatAppliedFilters';
import { getCategoryLabel } from '@/utils/getCategoryLabel';
import { getCategoryColor } from '@/utils/getCategoryColor';
import { formatDate } from '@/utils/formatDate';
import NewsCard from '@/components/news/NewsCard.vue';
import NewsDetailModal from '@/components/news/NewsDetailModal.vue';
import type { News } from '@/types';
import { useHead } from '@unhead/vue';

const PAGE_SIZE = 20;

const EXAMPLE_QUERIES = ['AI новости про технологии за неделю', 'экономика и инфляция', 'популярные новости про спорт'];

const query = ref('');
const activeQuery = ref<string | null>(null);
const news = ref<News[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const page = ref(1);
const hasMore = ref(false);
const searchHint = ref<string | null>(null);
const searchSource = ref<'ai' | 'fallback' | null>(null);
const selectedNews = ref<News | null>(null);
const modalVisible = ref(false);
const loaderRef = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;

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
  } catch {
    if (!append) {
      news.value = [];
      hasMore.value = false;
      searchHint.value = null;
      searchSource.value = null;
    }
  } finally {
    loading.value = false;
    loadingMore.value = false;
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

function openNews(item: News) {
  selectedNews.value = item;
  modalVisible.value = true;
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
    { threshold: 0.1 }
  );
  observer.observe(loaderRef.value);
}

onMounted(() => {
  setupObserver();
});

watch([activeQuery, news, hasMore, loading], async () => {
  await nextTick();
  setupObserver();
});

onUnmounted(() => {
  observer?.disconnect();
});

useHead({
  title: 'Умный поиск',
  meta: [{ name: 'description', content: 'AI-поиск новостей по естественному языку.' }]
});
</script>

<template>
  <div class="mx-auto" style="max-width: 960px">
    <h2 class="text-h4 mb-2">🧠 Умный поиск</h2>
    <p class="text-body-2 text-medium-emphasis mb-6">Опишите запрос своими словами — AI подберёт фильтры, а поиск выполнится по заголовку, описанию и тегам.</p>

    <div class="d-flex flex-wrap gap-2 mb-4">
      <v-textarea
        v-model="query"
        label="Запрос"
        placeholder="Например: AI новости про технологии за последнюю неделю"
        rows="2"
        density="compact"
        auto-grow
        hide-details
        style="flex: 1; min-width: 280px"
        @keydown.enter.exact.prevent="handleSearch"
      />
      <v-btn color="primary" prepend-icon="mdi-brain" :loading="loading" :disabled="!query.trim()" @click="handleSearch"> Найти </v-btn>
    </div>

    <div class="d-flex flex-wrap gap-2 mb-4">
      <v-chip v-for="example in EXAMPLE_QUERIES" :key="example" variant="outlined" @click="query = example">
        {{ example }}
      </v-chip>
    </div>

    <p v-if="searchHint" class="text-body-2 text-medium-emphasis mb-4">Распознано<span v-if="searchSource === 'fallback'"> (без AI)</span>: {{ searchHint }}</p>

    <p v-if="!activeQuery && !loading" class="text-body-2 text-medium-emphasis">Введите запрос и нажмите «Найти».</p>

    <v-row v-if="loading" class="mt-2">
      <v-col cols="12" v-for="i in 4" :key="i">
        <v-skeleton-loader type="article" />
      </v-col>
    </v-row>

    <v-row v-else-if="news.length" class="mt-2">
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

    <v-card v-else-if="activeQuery" class="pa-8 text-center mt-4">
      <v-card-text>По запросу «{{ activeQuery }}» ничего не найдено.</v-card-text>
    </v-card>

    <div ref="loaderRef" class="text-center py-6">
      <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="24" />
      <span v-else-if="!hasMore && news.length" class="text-caption text-medium-emphasis">Все результаты загружены</span>
    </div>

    <v-dialog v-model="modalVisible" max-width="900">
      <NewsDetailModal v-if="selectedNews" :news="selectedNews" @close="modalVisible = false" />
    </v-dialog>
  </div>
</template>
