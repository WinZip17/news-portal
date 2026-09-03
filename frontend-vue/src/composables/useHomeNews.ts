import { ref, type InjectionKey } from 'vue';
import { newsService } from '@/services/news.service';
import type { News, NewsStats } from '@/types';
import { HOME_NEWS_TARGET } from '@/constants/homeNews';

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
    stats.value = null;

    try {
      const statsPromise = newsService.getStats().then((data) => {
        stats.value = data;
      });
      const items = await loadNewsWithImages();
      await statsPromise;
      news.value = items;
    } catch {
      error.value = 'Не удалось загрузить выпуск';
      news.value = [];
      stats.value = null;
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
  const response = await newsService.getNews({
    page: 1,
    limit: HOME_NEWS_TARGET,
    sortBy: 'publishedAt',
    sortOrder: 'DESC',
    hasImage: true,
  });

  return response.data.slice(0, HOME_NEWS_TARGET);
}
