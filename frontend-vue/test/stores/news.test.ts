import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const getNewsMock = vi.fn();
const getStatsMock = vi.fn();

vi.mock('@/services/news.service', () => ({
  newsService: {
    getNews: (...args: unknown[]) => getNewsMock(...args),
    getStats: (...args: unknown[]) => getStatsMock(...args),
  },
}));

import { useNewsStore } from '@/stores/news';
import { mockNewsItem, mockNewsResponse, mockStats } from '../fixtures/mocks';

describe('news store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    getNewsMock.mockReset();
    getStatsMock.mockReset();
  });

  it('setFilter merges filters and resets page', () => {
    const store = useNewsStore();

    store.setFilter({ search: 'AI', category: 'technology' });
    expect(store.filters.search).toBe('AI');
    expect(store.filters.category).toBe('technology');
    expect(store.page).toBe(1);

    store.setFilter({ search: undefined });
    expect(store.filters.search).toBeUndefined();
  });

  it('fetchNews loads news list', async () => {
    getNewsMock.mockResolvedValue(mockNewsResponse);

    const store = useNewsStore();
    await store.fetchNews();

    expect(store.news).toHaveLength(1);
    expect(store.news[0]?.title).toBe(mockNewsItem.title);
    expect(store.isLoading).toBe(false);
    expect(store.initialLoading).toBe(false);
    expect(store.hasMore).toBe(false);
  });

  it('loadMore appends next page when more pages exist', async () => {
    getNewsMock
      .mockResolvedValueOnce({ ...mockNewsResponse, total: 2, totalPages: 2 })
      .mockResolvedValueOnce({
        data: [{ ...mockNewsItem, id: 'news-2', title: 'Вторая' }],
        total: 2,
        page: 2,
        limit: 12,
        totalPages: 2,
      });

    const store = useNewsStore();
    await store.fetchNews();
    expect(store.hasMore).toBe(true);

    await store.loadMore();

    expect(store.news).toHaveLength(2);
    expect(store.news[1]?.title).toBe('Вторая');
    expect(store.page).toBe(2);
    expect(getNewsMock).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
  });

  it('loadMore does nothing on last page', async () => {
    getNewsMock.mockResolvedValue(mockNewsResponse);

    const store = useNewsStore();
    await store.fetchNews();
    await store.loadMore();

    expect(store.news).toHaveLength(1);
    expect(getNewsMock).toHaveBeenCalledTimes(1);
  });

  it('fetchStats loads statistics', async () => {
    getStatsMock.mockResolvedValue(mockStats);

    const store = useNewsStore();
    await store.fetchStats();

    expect(store.stats?.totalNews).toBe(mockStats.totalNews);
  });

  it('clearFilters restores defaults', () => {
    const store = useNewsStore();

    store.setFilter({ search: 'test' });
    store.clearFilters();

    expect(store.filters.search).toBeUndefined();
    expect(store.filters.sortBy).toBe('publishedAt');
    expect(store.page).toBe(1);
  });
});
