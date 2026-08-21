import { act, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { useNewsInfiniteQuery, useNewsQuery, useNewsStatsQuery } from '@/hooks/useNewsQuery.ts';
import { mockNewsItem, mockNewsResponse, mockStats, renderHookWithProviders, server } from '@/test-utils';

describe('useNewsQuery', () => {
  it('useNewsQuery fetches news list', async () => {
    const { result } = renderHookWithProviders(() => useNewsQuery({ page: 1, limit: 20 }));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data[0]?.title).toBe(mockNewsItem.title);
    expect(result.current.data?.total).toBe(1);
  });

  it('useNewsStatsQuery fetches stats', async () => {
    const { result } = renderHookWithProviders(() => useNewsStatsQuery());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.totalNews).toBe(mockStats.totalNews);
  });

  it('useNewsInfiniteQuery loads first page and fetches next page', async () => {
    server.use(
      http.get('/api/news', ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') || '1');
        if (page === 2) {
          return HttpResponse.json({
            data: [{ ...mockNewsItem, id: 'news-2', title: 'Страница 2' }],
            total: 2,
            page: 2,
            limit: 20,
            totalPages: 2,
          });
        }
        return HttpResponse.json({ ...mockNewsResponse, total: 2, totalPages: 2 });
      }),
    );

    const { result } = renderHookWithProviders(() => useNewsInfiniteQuery({ limit: 20 }));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0]?.data[0]?.id).toBe('news-1');
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
    });

    expect(result.current.data?.pages[1]?.data[0]?.id).toBe('news-2');
  });
});
