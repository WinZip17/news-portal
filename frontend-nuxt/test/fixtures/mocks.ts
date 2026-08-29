import type { AuthResponse, NewsItem, UserResponse } from '~/types';
import { NewsCategory, NewsStatus, UserRole } from '~/types';

const basePreferences = {
  categories: [NewsCategory.TECHNOLOGY],
  tags: [] as string[],
  language: 'ru',
  notificationsEnabled: true,
  emailNotifications: false,
  theme: 'light' as const,
};

export const mockUser: UserResponse = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: UserRole.USER,
  isActive: true,
  preferences: basePreferences,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const mockModerator: UserResponse = {
  ...mockUser,
  id: 'mod-1',
  username: 'moderator',
  role: UserRole.MODERATOR,
};

export const mockAdmin: UserResponse = {
  ...mockUser,
  id: 'admin-1',
  username: 'admin',
  role: UserRole.ADMIN,
};

export const mockSuperAdmin: UserResponse = {
  ...mockUser,
  id: 'super-1',
  username: 'superadmin',
  role: UserRole.SUPER_ADMIN,
};

export const mockAuthResponse: AuthResponse = {
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresIn: 3600,
  user: mockUser,
};

export const mockNewsItem: NewsItem = {
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
