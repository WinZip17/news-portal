import { defineStore } from 'pinia';
import type { CreateNewsDto, ModerationBody, NewsFilter, NewsItem, StatsResponse } from '~/types';
import { useNewsService } from '~/services/news.service.ts';
import { getErrorMessage } from '~/utils/getErrorMessage.ts';

export const useNewsStore = defineStore('news', () => {
  const news = ref<NewsItem[]>([]);
  const currentNews = ref<NewsItem | null>(null);
  const stats = ref<StatsResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const filter = ref<NewsFilter>({
    page: 1,
    limit: 20,
    sortBy: 'publishedAt',
    sortOrder: 'DESC',
  });

  const newsService = useNewsService();

  async function fetchNews(): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;
      const data = await newsService.getNews(filter.value);
      news.value = data.data;
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchNewsById(id: string): Promise<void> {
    try {
      isLoading.value = true;
      currentNews.value = await newsService.getNewsById(id);
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function createNews(data: CreateNewsDto): Promise<NewsItem> {
    const newNews = await newsService.createNews(data);
    news.value.unshift(newNews);
    return newNews;
  }

  async function updateNews(id: string, data: Partial<CreateNewsDto>): Promise<void> {
    const updated = await newsService.updateNews(id, data);
    const index = news.value.findIndex((n) => n.id === id);
    if (index !== -1) news.value[index] = updated;
    if (currentNews.value?.id === id) currentNews.value = updated;
  }

  async function deleteNews(id: string): Promise<void> {
    await newsService.deleteNews(id);
    news.value = news.value.filter((n) => n.id !== id);
    if (currentNews.value?.id === id) currentNews.value = null;
  }

  async function moderateNews(id: string, data: ModerationBody): Promise<void> {
    const updated = await newsService.moderateNews(id, data);
    const index = news.value.findIndex((n) => n.id === id);
    if (index !== -1) news.value[index] = updated;
    if (currentNews.value?.id === id) currentNews.value = updated;
  }

  async function likeNews(id: string): Promise<void> {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      throw new Error('Требуется авторизация');
    }

    const updated = await newsService.likeNews(id);
    const index = news.value.findIndex((n) => n.id === id);
    if (index !== -1) news.value[index] = updated;
    if (currentNews.value?.id === id) currentNews.value = updated;
  }

  async function toggleFavorite(id: string): Promise<void> {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      throw new Error('Требуется авторизация');
    }

    await newsService.toggleFavorite(id);
    const newsItem = news.value.find((n) => n.id === id);
    if (newsItem) newsItem.isFavorite = !newsItem.isFavorite;
    if (currentNews.value?.id === id) {
      currentNews.value.isFavorite = !currentNews.value.isFavorite;
    }
  }

  async function fetchStats(force = false): Promise<StatsResponse | undefined> {
    if (stats.value && !force) return;
    try {
      const newsService = useNewsService();
      stats.value = await newsService.getStats();
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
    }
  }

  function setFilter(newFilter: Partial<NewsFilter>): void {
    const merged: NewsFilter = { ...filter.value, ...newFilter };
    (Object.keys(newFilter) as (keyof NewsFilter)[]).forEach((key) => {
      if (newFilter[key] === undefined) {
        delete merged[key];
      }
    });
    filter.value = merged;
  }

  function resetFilter(): void {
    filter.value = {
      page: 1,
      limit: 20,
      sortBy: 'publishedAt',
      sortOrder: 'DESC',
    };
  }

  return {
    news,
    currentNews,
    stats,
    isLoading,
    error,
    filter,
    fetchNews,
    fetchNewsById,
    createNews,
    updateNews,
    deleteNews,
    moderateNews,
    likeNews,
    toggleFavorite,
    fetchStats,
    setFilter,
    resetFilter,
  };
});
