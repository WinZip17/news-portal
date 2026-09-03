import { ref, type InjectionKey } from 'vue';
import { newsService } from '@/services/news.service';
import type { News, NewsStats } from '@/types';
import {
  HOME_NEWS_MAX_PAGES,
  HOME_NEWS_PAGE_LIMIT,
  HOME_NEWS_TARGET,
} from '@/constants/homeNews';

export function hasNewsImage(item: News): boolean {
  return Boolean(item.imageUrl?.trim());
}

export function useHomeNews() {
  const news = ref<News[]>([]);
  const stats = ref<NewsStats | null>(null);
  const loading = ref(true);
  const error = ref('');

  async function fetchHomeNews() {
    loading.value = true;
    error.value = '';

    try {
      const [statsData, items] = await Promise.all([newsService.getStats(), loadNewsWithImages()]);
      stats.value = statsData;
      news.value = items;
    } catch {
      error.value = 'Не удалось загрузить выпуск';
      news.value = [];
    } finally {
      loading.value = false;
    }
  }

  return {
    news,
    stats,
    loading,
    error,
    fetchHomeNews,
  };
}

export type HomeNewsContext = ReturnType<typeof useHomeNews>;

export const HOME_NEWS_KEY: InjectionKey<HomeNewsContext> = Symbol('homeNews');

async function loadNewsWithImages(): Promise<News[]> {
  const collected: News[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= HOME_NEWS_MAX_PAGES && collected.length < HOME_NEWS_TARGET; page += 1) {
    const response = await newsService.getNews({
      page,
      limit: HOME_NEWS_PAGE_LIMIT,
      sortBy: 'publishedAt',
      sortOrder: 'DESC',
    });

    for (const item of response.data) {
      if (!hasNewsImage(item) || seen.has(item.id)) continue;
      seen.add(item.id);
      collected.push(item);
      if (collected.length >= HOME_NEWS_TARGET) break;
    }

    if (page >= response.totalPages) break;
  }

  return collected.slice(0, HOME_NEWS_TARGET);
}
