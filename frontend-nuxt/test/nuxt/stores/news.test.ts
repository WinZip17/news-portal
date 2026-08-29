import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { useNewsStore } from '~/stores/news';
import { getTestMocks } from '../helpers/mocks';

const mocks = getTestMocks();
import { mockAuthResponse, mockNewsItem, mockNewsResponse, mockStats } from '../../fixtures/mocks';

describe('news store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('setFilter merges filter and resetFilter restores defaults', () => {
    const store = useNewsStore();

    store.setFilter({ search: 'AI', page: 2 });
    expect(store.filter.search).toBe('AI');
    expect(store.filter.page).toBe(2);

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
      category: 'technology',
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
