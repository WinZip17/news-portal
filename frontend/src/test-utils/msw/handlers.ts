import { http, HttpResponse } from 'msw';
import { NewsCategory, NewsStatus, type News, type NewsResponse, type NewsStats, type SmartSearchResponse } from '@/types';

export const mockNewsItem: News = {
  id: 'news-1',
  title: 'Тестовая новость',
  content: '<p>Контент</p>',
  summary: 'Краткое описание',
  category: NewsCategory.TECHNOLOGY,
  tags: ['ai', 'tech'],
  status: NewsStatus.PUBLISHED,
  isAiGenerated: true,
  views: 42,
  likes: 3,
  source: 'Test Source',
  sourceUrl: 'https://example.com/news/1',
  publishedAt: '2026-08-20T08:00:00.000Z',
  createdAt: '2026-08-20T08:00:00.000Z',
  updatedAt: '2026-08-20T08:00:00.000Z',
};

export const mockNewsResponse: NewsResponse = {
  data: [mockNewsItem],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export const mockStats: NewsStats = {
  newsToday: 5,
  totalUsers: 100,
  totalAiNews: 50,
  totalNews: 200,
  pendingNews: 3,
  totalViews: 1000,
  newsLastHour: 2,
  activeSources: 10,
  categoriesCount: 8,
};

export const mockSmartSearchResponse: SmartSearchResponse = {
  data: [mockNewsItem],
  total: 1,
  page: 1,
  limit: 20,
  appliedFilters: { search: 'AI', category: NewsCategory.TECHNOLOGY },
  source: 'ai',
};

export const handlers = [
  http.get('/api/news', () => HttpResponse.json(mockNewsResponse)),
  http.get('/api/news/stats', () => HttpResponse.json(mockStats)),
  http.get('/api/news/:id', ({ params }) =>
    HttpResponse.json({ ...mockNewsItem, id: String(params.id) }),
  ),
  http.post('/api/news/smart-search', async ({ request }) => {
    const body = (await request.json()) as { query?: string };
    return HttpResponse.json({
      ...mockSmartSearchResponse,
      appliedFilters: { search: body.query ?? 'AI' },
    });
  }),
  http.get('/api/news/favorites', () => HttpResponse.json({ ...mockNewsResponse, data: [] })),
  http.post('/api/auth/login', () =>
    HttpResponse.json({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        isActive: true,
      },
    }),
  ),
  http.get('/api/auth/me', () =>
    HttpResponse.json({
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      role: 'user',
      isActive: true,
      preferences: { theme: 'light' },
    }),
  ),
];
