import { newsService } from '@/services/newsService';
import {
  mockNewsItem,
  mockNewsResponse,
  mockSmartSearchResponse,
  mockStats,
  setupMockApi,
} from '@/test-utils';

describe('newsService (mock API)', () => {
  beforeEach(() => {
    setupMockApi();
  });

  it('getNews returns paginated response', async () => {
    const result = await newsService.getNews({ page: 1 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(mockNewsResponse.total);
  });

  it('getNewsById returns news item', async () => {
    const result = await newsService.getNewsById('news-1');
    expect(result.id).toBe(mockNewsItem.id);
    expect(result.title).toBe(mockNewsItem.title);
  });

  it('smartSearch returns applied filters', async () => {
    const result = await newsService.smartSearch('AI новости', 1, 20);
    expect(result.data).toHaveLength(1);
    expect(result.source).toBe(mockSmartSearchResponse.source);
    expect(result.appliedFilters.search).toBe('AI новости');
  });

  it('getStats returns stats payload', async () => {
    const result = await newsService.getStats();
    expect(result.totalNews).toBe(mockStats.totalNews);
  });

  it('toggleLike returns liked state', async () => {
    const result = await newsService.toggleLike('news-1');
    expect(result.liked).toBe(true);
  });
});
