import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { newsService } from '@/services/news.service';
import type { News, NewsFilter, NewsStats } from '@/types/news';

export const useNewsStore = defineStore('news', () => {
  const news = ref<News[]>([]);
  const currentNews = ref<News | null>(null);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(12);
  const totalPages = ref(0);
  const isLoading = ref(false);
  const isLoadingStats = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<NewsFilter>({
    sortBy: 'publishedAt',
    sortOrder: 'DESC'
  });
  const stats = ref<NewsStats | null>(null);
  const initialLoading = ref(true);

  async function fetchNews() {
    isLoading.value = true;
    error.value = null;
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
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки';
      initialLoading.value = false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchNewsById(id: string) {
    isLoading.value = true;
    try {
      currentNews.value = await newsService.getNewsById(id);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchStats() {
    isLoadingStats.value = true;
    try {
      stats.value = await newsService.getStats();
    } catch {
      //
    } finally {
      isLoadingStats.value = false;
    }
  }

  function setFilter(newFilters: Partial<NewsFilter>) {
    filters.value = { ...filters.value, ...newFilters };
    page.value = 1;
  }

  function setPage(newPage: number) {
    page.value = newPage;
  }

  function clearFilters() {
    filters.value = { sortBy: 'publishedAt', sortOrder: 'DESC' };
    page.value = 1;
  }

  function clearError() {
    error.value = null;
  }

  return {
    news,
    currentNews,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    isLoadingStats,
    error,
    filters,
    stats,
    initialLoading,
    fetchNews,
    fetchNewsById,
    fetchStats,
    setFilter,
    setPage,
    clearFilters,
    clearError
  };
});
