import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { getTestMocks } from '../helpers/mocks';
import {
  mockAdmin,
  mockAuthResponse,
  mockModerator,
  mockSuperAdmin,
  mockUser,
} from '../../fixtures/mocks';

const mocks = getTestMocks();

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('checkAuth clears state when token is missing', async () => {
    const store = useAuthStore();
    store.user = mockUser;
    store.isAuthenticated = true;
    mocks.accessToken.value = null;

    await store.checkAuth();

    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(mocks.authServiceMock.getCurrentUser).not.toHaveBeenCalled();
  });

  it('checkAuth loads user when token is valid', async () => {
    mocks.accessToken.value = 'token';
    mocks.authServiceMock.getCurrentUser.mockResolvedValue(mockUser);

    const store = useAuthStore();
    await store.checkAuth();

    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.email).toBe(mockUser.email);
  });

  it('checkAuth clears token on API error', async () => {
    mocks.accessToken.value = 'bad-token';
    mocks.authServiceMock.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));

    const store = useAuthStore();
    await store.checkAuth();

    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(mocks.accessToken.value).toBeNull();
  });

  it('login stores user from response', async () => {
    mocks.authServiceMock.login.mockResolvedValue(mockAuthResponse);

    const store = useAuthStore();
    await store.login({ email: 'test@example.com', password: 'password123' });

    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.email).toBe(mockUser.email);
    expect(store.isLoading).toBe(false);
  });

  it('logout clears auth and redirects home', async () => {
    mocks.authServiceMock.login.mockResolvedValue(mockAuthResponse);

    const store = useAuthStore();
    await store.login({ email: 'test@example.com', password: 'password123' });
    await store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(mocks.authServiceMock.logout).toHaveBeenCalled();
    expect(mocks.navigateToMock).toHaveBeenCalledWith('/');
  });

  it('computes role flags', () => {
    const store = useAuthStore();

    store.user = mockUser;
    expect(store.isAdmin).toBe(false);
    expect(store.isModerator).toBe(false);
    expect(store.isSuperAdmin).toBe(false);

    store.user = mockModerator;
    expect(store.isModerator).toBe(true);
    expect(store.isAdmin).toBe(false);

    store.user = mockAdmin;
    expect(store.isAdmin).toBe(true);
    expect(store.isSuperAdmin).toBe(false);

    store.user = mockSuperAdmin;
    expect(store.isSuperAdmin).toBe(true);
    expect(store.isAdmin).toBe(true);
  });

  it('sendSaveTheme syncs preferences when authenticated', async () => {
    mocks.authServiceMock.login.mockResolvedValue(mockAuthResponse);

    const store = useAuthStore();
    await store.login({ email: 'test@example.com', password: 'password123' });
    await store.sendSaveTheme('dark');

    expect(mocks.authServiceMock.updatePreferences).toHaveBeenCalledWith({ theme: 'dark' });
  });

  it('sendSaveTheme skips API when not authenticated', async () => {
    const store = useAuthStore();
    await store.sendSaveTheme('dark');

    expect(mocks.authServiceMock.updatePreferences).not.toHaveBeenCalled();
  });
});
