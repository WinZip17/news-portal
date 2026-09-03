import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMock = vi.fn();
const postMock = vi.fn();
const putMock = vi.fn();

vi.mock('@/api/client', () => ({
  apiClient: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
    put: (...args: unknown[]) => putMock(...args),
  },
}));

import { newsService } from '@/services/news.service';
import { mockNewsItem, mockNewsResponse, mockStats } from '../fixtures/mocks';

describe('newsService', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    putMock.mockReset();
  });

  it('getNews fetches list with filters', async () => {
    getMock.mockResolvedValue({ data: mockNewsResponse });

    const result = await newsService.getNews({ page: 1, limit: 12, search: 'AI' });

    expect(getMock).toHaveBeenCalledWith('/news', { params: { page: 1, limit: 12, search: 'AI' } });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.title).toBe(mockNewsItem.title);
  });

  it('smartSearch posts query and returns AI results', async () => {
    const smartResponse = {
      data: [mockNewsItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      source: 'ai' as const,
      appliedFilters: { search: 'AI новости' },
    };
    postMock.mockResolvedValue({ data: smartResponse });

    const result = await newsService.smartSearch('AI новости', 1, 20);

    expect(postMock).toHaveBeenCalledWith('/news/smart-search', {
      query: 'AI новости',
      page: 1,
      limit: 20,
    });
    expect(result.source).toBe('ai');
    expect(result.appliedFilters.search).toBe('AI новости');
  });

  it('getNewsById fetches single news item', async () => {
    getMock.mockResolvedValue({ data: mockNewsItem });

    const result = await newsService.getNewsById('news-1');

    expect(getMock).toHaveBeenCalledWith('/news/news-1');
    expect(result.id).toBe('news-1');
  });

  it('getStats fetches statistics', async () => {
    getMock.mockResolvedValue({ data: mockStats });

    const result = await newsService.getStats();

    expect(getMock).toHaveBeenCalledWith('/news/stats');
    expect(result.totalNews).toBe(mockStats.totalNews);
  });

  it('toggleLike posts to like endpoint', async () => {
    postMock.mockResolvedValue({ data: { liked: true, likes: 3 } });

    const result = await newsService.toggleLike('news-1');

    expect(postMock).toHaveBeenCalledWith('/news/news-1/like');
    expect(result.liked).toBe(true);
    expect(result.likes).toBe(3);
  });

  it('updateNews puts changes', async () => {
    const updated = { ...mockNewsItem, title: 'Обновлённая' };
    putMock.mockResolvedValue({ data: updated });

    const result = await newsService.updateNews('news-1', { title: 'Обновлённая' });

    expect(putMock).toHaveBeenCalledWith('/news/news-1', { title: 'Обновлённая' });
    expect(result.title).toBe('Обновлённая');
  });
});
