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

import { authService } from '@/services/auth.service';
import { mockAuthResponse, mockUser } from '../fixtures/mocks';

describe('authService', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    putMock.mockReset();
  });

  it('login posts credentials and returns tokens', async () => {
    postMock.mockResolvedValue({ data: mockAuthResponse });

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(postMock).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.accessToken).toBe(mockAuthResponse.accessToken);
    expect(result.user.email).toBe(mockUser.email);
  });

  it('register posts user data', async () => {
    postMock.mockResolvedValue({ data: undefined });

    await authService.register({
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    });

    expect(postMock).toHaveBeenCalledWith('/auth/register', {
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    });
  });

  it('getMe fetches current user', async () => {
    getMock.mockResolvedValue({ data: mockUser });

    const result = await authService.getMe();

    expect(getMock).toHaveBeenCalledWith('/auth/me');
    expect(result.id).toBe(mockUser.id);
  });

  it('updateProfile puts profile fields', async () => {
    const updated = { ...mockUser, firstName: 'Updated' };
    putMock.mockResolvedValue({ data: updated });

    const result = await authService.updateProfile({ firstName: 'Updated' });

    expect(putMock).toHaveBeenCalledWith('/auth/profile', { firstName: 'Updated' });
    expect(result.firstName).toBe('Updated');
  });

  it('updatePreferences puts preferences', async () => {
    const updated = {
      ...mockUser,
      preferences: { ...mockUser.preferences, theme: 'dark' as const },
    };
    putMock.mockResolvedValue({ data: updated });

    const result = await authService.updatePreferences({ theme: 'dark' });

    expect(putMock).toHaveBeenCalledWith('/auth/preferences', { theme: 'dark' });
    expect(result.preferences.theme).toBe('dark');
  });

  it('changePassword posts password change', async () => {
    postMock.mockResolvedValue({ data: undefined });

    await authService.changePassword({
      currentPassword: 'old-pass',
      newPassword: 'new-pass',
    });

    expect(postMock).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'old-pass',
      newPassword: 'new-pass',
    });
  });
});
