import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const loginMock = vi.fn();
const registerMock = vi.fn();
const getMeMock = vi.fn();

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: (...args: unknown[]) => loginMock(...args),
    register: (...args: unknown[]) => registerMock(...args),
    getMe: (...args: unknown[]) => getMeMock(...args),
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
    changePassword: vi.fn(),
  },
}));

import { useAuthStore } from '@/stores/auth';
import { UserRole } from '@/types';
import { mockAuthResponse, mockUser } from '../fixtures/mocks';

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    loginMock.mockReset();
    registerMock.mockReset();
    getMeMock.mockReset();
  });

  it('login stores tokens and loads user', async () => {
    loginMock.mockResolvedValue(mockAuthResponse);
    getMeMock.mockResolvedValue(mockUser);

    const store = useAuthStore();
    await store.login({ email: 'test@example.com', password: 'password123' });

    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.email).toBe(mockUser.email);
    expect(localStorage.getItem('accessToken')).toBe(mockAuthResponse.accessToken);
  });

  it('logout clears session', async () => {
    loginMock.mockResolvedValue(mockAuthResponse);
    getMeMock.mockResolvedValue(mockUser);

    const store = useAuthStore();
    await store.login({ email: 'test@example.com', password: 'password123' });
    store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('initialize marks store ready without token', async () => {
    const store = useAuthStore();
    await store.initialize();

    expect(store.isInitialized).toBe(true);
    expect(getMeMock).not.toHaveBeenCalled();
  });

  it('canAccessAdmin is true for moderator', async () => {
    getMeMock.mockResolvedValue({ ...mockUser, role: UserRole.MODERATOR });
    localStorage.setItem('accessToken', 'token');

    const store = useAuthStore();
    await store.initialize();

    expect(store.canAccessAdmin).toBe(true);
    expect(store.isModerator).toBe(true);
  });
});
