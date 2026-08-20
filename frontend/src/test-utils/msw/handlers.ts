import { http, HttpResponse } from 'msw';
import { NewsCategory, NewsStatus, type News, type NewsResponse, type NewsStats, type SmartSearchResponse } from '@/types';
import { mockAuthResponse, mockUser } from './authFixtures';

export { mockAuthResponse, mockUser } from './authFixtures';

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
  http.post('/api/auth/login', () => HttpResponse.json(mockAuthResponse)),
  http.post('/api/auth/register', () => HttpResponse.json(mockAuthResponse)),
  http.post('/api/auth/logout', () => HttpResponse.json({ success: true })),
  http.post('/api/auth/refresh', () => HttpResponse.json(mockAuthResponse)),
  http.post('/api/auth/change-password', () => HttpResponse.json({ success: true })),
  http.get('/api/auth/me', () => HttpResponse.json(mockUser)),
  http.put('/api/auth/profile', async ({ request }) => {
    const body = (await request.json()) as Partial<typeof mockUser>;
    return HttpResponse.json({ ...mockUser, ...body });
  }),
  http.put('/api/auth/preferences', async ({ request }) => {
    const body = (await request.json()) as Partial<typeof mockUser.preferences>;
    return HttpResponse.json({
      ...mockUser,
      preferences: { ...mockUser.preferences, ...body },
    });
  }),
];
