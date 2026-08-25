import { authService } from '@/services/authService';
import { mockAuthResponse, mockUser, setupMockApi } from '@/test-utils';

describe('authService (mock API)', () => {
  beforeEach(() => {
    setupMockApi();
  });

  it('login returns tokens', async () => {
    const result = await authService.login('test@example.com', 'password123');
    expect(result.accessToken).toBe(mockAuthResponse.accessToken);
    expect(result.refreshToken).toBe(mockAuthResponse.refreshToken);
  });

  it('login throws API error message', async () => {
    setupMockApi().onPost('/auth/login').reply(401, { message: 'Invalid credentials' });

    await expect(authService.login('bad@example.com', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('getMe returns current user', async () => {
    localStorage.setItem('accessToken', 'test-access-token');
    const user = await authService.getMe();
    expect(user.email).toBe(mockUser.email);
  });

  it('register stores tokens in localStorage', async () => {
    await authService.register({
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    });

    expect(localStorage.getItem('accessToken')).toBe(mockAuthResponse.accessToken);
  });
});
