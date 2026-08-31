import { defineStore } from 'pinia';
import { ref } from 'vue';
import { newsService } from '@/services/news.service';
import type { News, NewsFilter, NewsStats } from '@/types';

export const useNewsStore = defineStore('news', () => {
  const news = ref<News[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(12);
  const totalPages = ref(0);
  const isLoading = ref(false);
  const filters = ref<NewsFilter>({
    sortBy: 'publishedAt',
    sortOrder: 'DESC'
  });
  const stats = ref<NewsStats | null>(null);
  const initialLoading = ref(true);

  async function fetchNews() {
    isLoading.value = true;
    try {
      const response = await newsService.getNews({
        ...filters.value,
        page: page.value,
        limit: limit.value
      });
      news.value = response.data;
      total.value = response.total;
      page.value = response.page;
      limit.value = response.limit;
      totalPages.value = response.totalPages;
      initialLoading.value = false;
    } catch {
      initialLoading.value = false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchStats() {
    try {
      stats.value = await newsService.getStats();
    } catch {
      console.error('error fetchStats');
    }
  }

  function setFilter(newFilters: Partial<NewsFilter>) {
    const merged: NewsFilter = { ...filters.value, ...newFilters };
    (Object.keys(newFilters) as (keyof NewsFilter)[]).forEach((key) => {
      if (newFilters[key] === undefined) {
        delete merged[key];
      }
    });
    filters.value = merged;
    page.value = 1;
  }

  function setPage(newPage: number) {
    page.value = newPage;
  }

  function clearFilters() {
    filters.value = { sortBy: 'publishedAt', sortOrder: 'DESC' };
    page.value = 1;
  }

  return {
    news,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    filters,
    stats,
    initialLoading,
    fetchNews,
    fetchStats,
    setFilter,
    setPage,
    clearFilters
  };
});
