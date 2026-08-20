import { UserRole, type AuthResponse, type User } from '@/types';

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
