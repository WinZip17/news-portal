import { describe, expect, it } from 'vitest';
import { newsService } from '@/services/newsService.ts';
import { mockNewsItem, mockStats } from '@/test-utils/msw/handlers';

describe('newsService (MSW)', () => {
  it('fetches news list', async () => {
    const response = await newsService.getNews({ page: 1, limit: 20 });
    expect(response.data).toHaveLength(1);
    expect(response.data[0]?.title).toBe(mockNewsItem.title);
  });

  it('fetches stats', async () => {
    const stats = await newsService.getStats();
    expect(stats.totalNews).toBe(mockStats.totalNews);
  });

  it('fetches news by id', async () => {
    const news = await newsService.getNewsById('custom-id');
    expect(news.id).toBe('custom-id');
  });

  it('performs smart search', async () => {
    const result = await newsService.smartSearch('AI новости', 1, 20);
    expect(result.data).toHaveLength(1);
    expect(result.source).toBe('ai');
    expect(result.appliedFilters.search).toBe('AI новости');
  });
});
