import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { useNewsStore } from '~/stores/news';
import { NewsCategory } from '~/types';
import { getTestMocks } from '../helpers/mocks';
import { mockAuthResponse, mockNewsItem, mockNewsResponse, mockStats } from '../../fixtures/mocks';

const mocks = getTestMocks();

describe('news store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('setFilter merges filter and resetFilter restores defaults', () => {
    const store = useNewsStore();

    store.setFilter({ search: 'AI', page: 2, fromDate: '2026-08-01', toDate: '2026-08-31' });
    expect(store.filter.search).toBe('AI');
    expect(store.filter.page).toBe(2);
    expect(store.filter.fromDate).toBe('2026-08-01');

    store.setFilter({ fromDate: undefined, toDate: undefined });
    expect(store.filter.fromDate).toBeUndefined();
    expect(store.filter.toDate).toBeUndefined();

    store.resetFilter();
    expect(store.filter).toEqual({
      page: 1,
      limit: 20,
      sortBy: 'publishedAt',
      sortOrder: 'DESC',
    });
  });

  it('fetchNews loads news list', async () => {
    mocks.newsServiceMock.getNews.mockResolvedValue(mockNewsResponse);

    const store = useNewsStore();
    await store.fetchNews();

    expect(store.news).toHaveLength(1);
    expect(store.news[0]?.title).toBe(mockNewsItem.title);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.filter.page).toBe(1);
    expect(store.hasMore).toBe(false);
  });

  it('loadMore appends next page when more pages exist', async () => {
    mocks.newsServiceMock.getNews
      .mockResolvedValueOnce({
        ...mockNewsResponse,
        total: 2,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        data: [{ ...mockNewsItem, id: 'news-2', title: 'Вторая' }],
        total: 2,
        page: 2,
        limit: 20,
        totalPages: 2,
      });

    const store = useNewsStore();
    await store.fetchNews();
    expect(store.hasMore).toBe(true);

    await store.loadMore();

    expect(store.news).toHaveLength(2);
    expect(store.news[1]?.title).toBe('Вторая');
    expect(store.filter.page).toBe(2);
    expect(mocks.newsServiceMock.getNews).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });

  it('loadMore does nothing on last page', async () => {
    mocks.newsServiceMock.getNews.mockResolvedValue(mockNewsResponse);

    const store = useNewsStore();
    await store.fetchNews();
    await store.loadMore();

    expect(store.news).toHaveLength(1);
    expect(mocks.newsServiceMock.getNews).toHaveBeenCalledTimes(1);
  });

  it('fetchNews stores error message on failure', async () => {
    mocks.newsServiceMock.getNews.mockRejectedValue(new Error('Network error'));

    const store = useNewsStore();
    await store.fetchNews();

    expect(store.news).toEqual([]);
    expect(store.error).toBe('Network error');
  });

  it('createNews prepends item to list', async () => {
    const created = { ...mockNewsItem, id: 'news-2', title: 'Новая' };
    mocks.newsServiceMock.createNews.mockResolvedValue(created);

    const store = useNewsStore();
    await store.createNews({
      title: 'Новая',
      content: '<p>x</p>',
      category: NewsCategory.TECHNOLOGY,
    });

    expect(store.news[0]?.id).toBe('news-2');
  });

  it('deleteNews removes item from list', async () => {
    mocks.newsServiceMock.deleteNews.mockResolvedValue(undefined);

    const store = useNewsStore();
    store.news = [{ ...mockNewsItem }, { ...mockNewsItem, id: 'news-2' }];

    await store.deleteNews('news-1');

    expect(store.news).toHaveLength(1);
    expect(store.news[0]?.id).toBe('news-2');
  });

  it('likeNews throws when user is not authenticated', async () => {
    const store = useNewsStore();

    await expect(store.likeNews('news-1')).rejects.toThrow('Требуется авторизация');
    expect(mocks.newsServiceMock.likeNews).not.toHaveBeenCalled();
  });

  it('likeNews updates item when authenticated', async () => {
    mocks.authServiceMock.login.mockResolvedValue(mockAuthResponse);
    const liked = { ...mockNewsItem, likes: 3 };
    mocks.newsServiceMock.likeNews.mockResolvedValue(liked);

    const authStore = useAuthStore();
    await authStore.login({ email: 'test@example.com', password: 'password123' });

    const store = useNewsStore();
    store.news = [{ ...mockNewsItem }];

    await store.likeNews('news-1');

    expect(store.news[0]?.likes).toBe(3);
  });

  it('fetchStats caches stats unless forced', async () => {
    mocks.newsServiceMock.getStats.mockResolvedValue(mockStats);

    const store = useNewsStore();
    await store.fetchStats();
    await store.fetchStats();

    expect(mocks.newsServiceMock.getStats).toHaveBeenCalledTimes(1);
    expect(store.stats?.totalNews).toBe(mockStats.totalNews);

    await store.fetchStats(true);
    expect(mocks.newsServiceMock.getStats).toHaveBeenCalledTimes(2);
  });
});
