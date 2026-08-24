import { UserRole, type AuthResponse, type News, type NewsResponse, type NewsStats, type SmartSearchResponse, type User } from '@/types';
import { NewsCategory, NewsStatus } from '@/types';

export const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: UserRole.USER,
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

export const mockAuthResponse: AuthResponse = {
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresIn: 3600,
  user: mockUser,
};

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
  totalPages: 1,
  appliedFilters: { search: 'AI', category: NewsCategory.TECHNOLOGY },
  source: 'ai',
};
