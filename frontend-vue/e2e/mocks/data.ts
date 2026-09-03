export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  isActive: true,
  preferences: {
    categories: ['technology'],
    tags: [],
    language: 'ru',
    notificationsEnabled: true,
    emailNotifications: false,
    theme: 'light',
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const mockAuthResponse = {
  accessToken: 'e2e-access-token',
  refreshToken: 'e2e-refresh-token',
  expiresIn: 3600,
  user: mockUser,
};

export const mockNewsItem = {
  id: 'news-1',
  title: 'E2E тестовая новость',
  content: '<p>Контент для E2E</p>',
  summary: 'Краткое описание E2E',
  category: 'technology',
  tags: ['ai', 'tech'],
  status: 'published',
  isAiGenerated: true,
  views: 42,
  likes: 3,
  source: 'E2E Source',
  sourceUrl: 'https://example.com/news/1',
  publishedAt: '2026-08-20T08:00:00.000Z',
  createdAt: '2026-08-20T08:00:00.000Z',
  updatedAt: '2026-08-20T08:00:00.000Z',
};

export const mockNewsResponse = {
  data: [mockNewsItem],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export const mockStats = {
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

export const mockSmartSearchResponse = {
  data: [mockNewsItem],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
  appliedFilters: { search: 'AI новости', category: 'technology' },
  source: 'ai' as const,
};
