import type { News, NewsStats, User } from '@/types';
import { NewsCategory, NewsStatus, UserRole } from '@/types';

export const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: UserRole.USER,
  isActive: true,
  preferences: {
    categories: [NewsCategory.TECHNOLOGY],
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
  tags: ['ai'],
  status: NewsStatus.PUBLISHED,
  isAiGenerated: true,
  views: 10,
  likes: 2,
  source: 'Test Source',
  sourceUrl: 'https://example.com/news/1',
  publishedAt: '2026-08-20T08:00:00.000Z',
  createdAt: '2026-08-20T08:00:00.000Z',
  updatedAt: '2026-08-20T08:00:00.000Z',
};

export const mockNewsResponse = {
  data: [mockNewsItem],
  total: 1,
  page: 1,
  limit: 12,
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
