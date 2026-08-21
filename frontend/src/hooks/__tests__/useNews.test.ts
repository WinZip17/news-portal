import { act, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NewsCategory } from '@/types';
import { useNews } from '@/hooks/useNews.ts';
import { mockNewsItem, renderHookWithProviders } from '@/test-utils';

const baseNewsState = {
  news: [] as typeof mockNewsItem[],
  currentNews: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  isLoadingStats: false,
  error: null,
  errorStats: null,
  filters: {},
  personalizedNews: [],
  stats: null,
  initialLoading: true,
};

describe('useNews', () => {
  it('fetchNews loads news list from API', async () => {
    const { result } = renderHookWithProviders(() => useNews(), {
      preloadedState: { news: baseNewsState },
    });

    await act(async () => {
      await result.current.fetchNews();
    });

    await waitFor(() => {
      expect(result.current.news).toHaveLength(1);
      expect(result.current.news[0]?.title).toBe(mockNewsItem.title);
      expect(result.current.initialLoading).toBe(false);
    });
  });

  it('fetchStats loads stats', async () => {
    const { result } = renderHookWithProviders(() => useNews(), {
      preloadedState: { news: baseNewsState },
    });

    await act(async () => {
      await result.current.fetchStats();
    });

    await waitFor(() => {
      expect(result.current.stats?.totalNews).toBe(200);
    });
  });

  it('clearError resets news error', async () => {
    const { result, store } = renderHookWithProviders(() => useNews(), {
      preloadedState: {
        news: { ...baseNewsState, error: 'Something failed', initialLoading: false },
      },
    });

    act(() => {
      result.current.clearError();
    });

    expect(store.getState().news.error).toBeNull();
  });

  it('setSearch and clearAllFilters update filters', async () => {
    const { result, store } = renderHookWithProviders(() => useNews(), {
      preloadedState: { news: baseNewsState },
    });

    act(() => {
      result.current.setSearch('AI');
    });
    expect(store.getState().news.filters.search).toBe('AI');

    act(() => {
      result.current.setCategory(NewsCategory.TECHNOLOGY);
    });
    expect(store.getState().news.filters.category).toBe(NewsCategory.TECHNOLOGY);

    act(() => {
      result.current.clearAllFilters();
    });
    expect(store.getState().news.filters).toEqual({});
  });

  it('setCurrentNews clears currentNews', async () => {
    const { result } = renderHookWithProviders(() => useNews(), {
      preloadedState: { news: baseNewsState },
    });

    await act(async () => {
      await result.current.fetchNewsById('article-1');
    });

    await waitFor(() => {
      expect(result.current.currentNews?.id).toBe('article-1');
    });

    act(() => {
      result.current.setCurrentNews();
    });

    expect(result.current.currentNews).toBeNull();
  });

  it('loadMore requests next page when more pages exist', async () => {
    const { result, store } = renderHookWithProviders(() => useNews(), {
      preloadedState: {
        news: {
          ...baseNewsState,
          news: [mockNewsItem],
          page: 1,
          totalPages: 2,
          total: 2,
          initialLoading: false,
        },
      },
    });

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(store.getState().news.filters.page).toBe(2);
      expect(result.current.news[0]?.id).toBe('news-2');
    });
  });

  it('loadMore does nothing on last page', async () => {
    const { result } = renderHookWithProviders(() => useNews(), {
      preloadedState: {
        news: {
          ...baseNewsState,
          news: [mockNewsItem],
          page: 1,
          totalPages: 1,
          total: 1,
          initialLoading: false,
        },
      },
    });

    await act(async () => {
      result.current.loadMore();
    });

    expect(result.current.news).toHaveLength(1);
  });
});
