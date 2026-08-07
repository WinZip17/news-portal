import { useQuery } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { newsService } from '@/services/newsService';
import type { NewsResponse, NewsFilter } from '@/types';

export const NEWS_KEYS = {
  all: ['news'] as const,
  list: (filters?: NewsFilter) => ['news', 'list', filters] as const,
  detail: (id: string) => ['news', 'detail', id] as const,
  stats: () => ['news', 'stats'] as const,
};

export function useNewsQuery(filters?: NewsFilter) {
  return useQuery<NewsResponse>({
    queryKey: NEWS_KEYS.list(filters),
    queryFn: () => newsService.getNews(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
    placeholderData: (previousData) => previousData, // Показываем старые данные при загрузке
  });
}

export function useNewsStatsQuery() {
  return useQuery({
    queryKey: NEWS_KEYS.stats(),
    queryFn: () => newsService.getStats(),
    staleTime: 60 * 1000, // 1 минута
  });
}

export function useNewsInfiniteQuery(filters?: NewsFilter) {
  return useInfiniteQuery<NewsResponse>({
    queryKey: NEWS_KEYS.list(filters),
    queryFn: ({ pageParam = 1 }) => newsService.getNews({ ...filters, page: pageParam as number, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}
