import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { NewsCategory } from '@/types';
import { clearFilters, fetchNews, fetchNewsById, fetchStats, setCategory, setPage, setSearch } from '@/store/news/newsSlice';
import { createTestStore, mockNewsItem, mockStats, server } from '@/test-utils';

const baseNewsState = {
  news: [] as (typeof mockNewsItem)[],
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

describe('newsSlice (MSW)', () => {
  describe('reducers', () => {
    it('setSearch updates search and resets page filter', () => {
      const store = createTestStore({
        news: { ...baseNewsState, filters: { page: 3, search: 'old' } },
      });

      store.dispatch(setSearch('AI новости'));

      expect(store.getState().news.filters.search).toBe('AI новости');
      expect(store.getState().news.filters.page).toBeUndefined();
    });

    it('setCategory updates category and resets page filter', () => {
      const store = createTestStore({
        news: { ...baseNewsState, filters: { page: 2 } },
      });

      store.dispatch(setCategory(NewsCategory.TECHNOLOGY));

      expect(store.getState().news.filters.category).toBe(NewsCategory.TECHNOLOGY);
      expect(store.getState().news.filters.page).toBeUndefined();
    });

    it('setPage updates filters.page', () => {
      const store = createTestStore({ news: baseNewsState });

      store.dispatch(setPage(5));

      expect(store.getState().news.filters.page).toBe(5);
    });

    it('clearFilters resets filters', () => {
      const store = createTestStore({
        news: {
          ...baseNewsState,
          filters: { search: 'test', category: NewsCategory.SPORTS, page: 2 },
        },
      });

      store.dispatch(clearFilters());

      expect(store.getState().news.filters).toEqual({});
    });
  });

  describe('fetchNews', () => {
    it('fulfills and replaces news on first page', async () => {
      const store = createTestStore({ news: baseNewsState });

      const result = await store.dispatch(fetchNews());

      expect(result.type).toBe('news/fetchNews/fulfilled');
      const newsState = store.getState().news;
      expect(newsState.news).toHaveLength(1);
      expect(newsState.news[0]?.title).toBe(mockNewsItem.title);
      expect(newsState.total).toBe(1);
      expect(newsState.initialLoading).toBe(false);
      expect(newsState.isLoading).toBe(false);
    });

    it('appends news when state.page > 1', async () => {
      const page2Item = { ...mockNewsItem, id: 'news-2', title: 'Вторая страница' };
      server.use(
        http.get('/api/news', () =>
          HttpResponse.json({
            data: [page2Item],
            total: 2,
            page: 2,
            limit: 10,
            totalPages: 2,
          }),
        ),
      );

      const store = createTestStore({
        news: {
          ...baseNewsState,
          news: [mockNewsItem],
          page: 2,
          initialLoading: false,
        },
      });

      await store.dispatch(fetchNews());

      const { news } = store.getState().news;
      expect(news).toHaveLength(2);
      expect(news[0]?.id).toBe('news-1');
      expect(news[1]?.id).toBe('news-2');
    });

    it('rejects with error message', async () => {
      server.use(http.get('/api/news', () => HttpResponse.json({ message: 'Server error' }, { status: 500 })));

      const store = createTestStore({ news: baseNewsState });
      const result = await store.dispatch(fetchNews());

      expect(result.type).toBe('news/fetchNews/rejected');
      expect(store.getState().news.error).toBe('Server error');
      expect(store.getState().news.initialLoading).toBe(false);
    });
  });

  describe('fetchStats', () => {
    it('fulfills and stores stats', async () => {
      const store = createTestStore({ news: baseNewsState });

      const result = await store.dispatch(fetchStats());

      expect(result.type).toBe('news/getStats/fulfilled');
      expect(store.getState().news.stats?.totalNews).toBe(mockStats.totalNews);
      expect(store.getState().news.isLoadingStats).toBe(false);
    });
  });

  describe('fetchNewsById', () => {
    it('fulfills and sets currentNews', async () => {
      const store = createTestStore({ news: baseNewsState });

      const result = await store.dispatch(fetchNewsById('article-42'));

      expect(result.type).toBe('news/fetchNewsById/fulfilled');
      expect(store.getState().news.currentNews?.id).toBe('article-42');
    });
  });
});
