import { describe, expect, it } from 'vitest';
import { authService } from '@/services/authService.ts';
import { mockAuthResponse, mockUser } from '@/test-utils/msw/handlers';

describe('authService (MSW)', () => {
  it('logs in and returns auth response', async () => {
    const response = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.accessToken).toBe(mockAuthResponse.accessToken);
    expect(response.user.email).toBe(mockUser.email);
  });

  it('registers and returns auth response', async () => {
    const response = await authService.register({
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    });

    expect(response.refreshToken).toBe(mockAuthResponse.refreshToken);
    expect(response.user.username).toBe(mockUser.username);
  });

  it('fetches current user', async () => {
    const user = await authService.getCurrentUser();
    expect(user.id).toBe(mockUser.id);
    expect(user.preferences.theme).toBe('light');
  });

  it('updates profile', async () => {
    const user = await authService.updateProfile({ firstName: 'Updated' });
    expect(user.firstName).toBe('Updated');
  });

  it('updates preferences', async () => {
    const user = await authService.updatePreferences({ theme: 'dark' });
    expect(user.preferences.theme).toBe('dark');
  });

  it('refreshes token', async () => {
    const response = await authService.refreshToken('old-refresh-token');
    expect(response.accessToken).toBe(mockAuthResponse.accessToken);
  });

  it('logs out without error', async () => {
    await expect(authService.logout()).resolves.toBeUndefined();
  });

  it('changes password without error', async () => {
    await expect(authService.changePassword('old-pass', 'new-pass')).resolves.toBeUndefined();
  });
});
