import { createTestStore, mockNewsItem, mockNewsResponse, mockStats, setupMockApi } from '@/test-utils';
import { fetchNews, fetchNewsById, fetchStats, setCurrentNews } from '@/store/news/newsSlice';

describe('newsSlice (mock API)', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    setupMockApi();
    store = createTestStore();
  });

  it('setCurrentNews updates currentNews', () => {
    store.dispatch(setCurrentNews(mockNewsItem));
    expect(store.getState().news.currentNews?.id).toBe('news-1');
  });

  describe('fetchNews', () => {
    it('fulfills with paginated news', async () => {
      const result = await store.dispatch(fetchNews({ page: 1 }));

      expect(result.type).toBe('news/fetchNews/fulfilled');
      expect(store.getState().news.news).toHaveLength(1);
      expect(store.getState().news.total).toBe(mockNewsResponse.total);
    });

    it('rejects on API error', async () => {
      setupMockApi().onGet('/news').reply(500, { message: 'Error' });

      const result = await store.dispatch(fetchNews(undefined));

      expect(result.type).toBe('news/fetchNews/rejected');
      expect(store.getState().news.error).toBeTruthy();
    });
  });

  describe('fetchNewsById', () => {
    it('fulfills with news item', async () => {
      const result = await store.dispatch(fetchNewsById('news-1'));

      expect(result.type).toBe('news/fetchNewsById/fulfilled');
      expect(store.getState().news.currentNews?.title).toBe(mockNewsItem.title);
    });
  });

  describe('fetchStats', () => {
    it('fulfills with stats', async () => {
      const result = await store.dispatch(fetchStats());

      expect(result.type).toBe('news/fetchStats/fulfilled');
      expect(store.getState().news.stats.totalNews).toBe(mockStats.totalNews);
    });
  });
});
