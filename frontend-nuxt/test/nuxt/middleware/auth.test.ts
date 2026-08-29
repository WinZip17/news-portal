import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import authMiddleware from '~/middleware/auth';
import { useAuthStore } from '~/stores/auth';
import { getTestMocks } from '../helpers/mocks';
import { mockAdmin, mockModerator, mockSuperAdmin, mockUser } from '../../fixtures/mocks';

const mocks = getTestMocks();

const from = { path: '/' };

describe('auth middleware', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mocks.navigateToMock.mockReset();
  });

  it('redirects unauthenticated users to login', async () => {
    await authMiddleware({ path: '/profile' } as never, from as never);

    expect(mocks.navigateToMock).toHaveBeenCalledWith('/login');
  });

  it('allows authenticated users on protected non-admin routes', async () => {
    const store = useAuthStore();
    store.user = mockUser;
    store.isAuthenticated = true;

    await authMiddleware({ path: '/profile' } as never, from as never);

    expect(mocks.navigateToMock).not.toHaveBeenCalled();
  });

  it('redirects regular users from admin area', async () => {
    const store = useAuthStore();
    store.user = mockUser;
    store.isAuthenticated = true;

    await authMiddleware({ path: '/admin' } as never, from as never);

    expect(mocks.navigateToMock).toHaveBeenCalledWith('/');
  });

  it('allows moderators to access admin area', async () => {
    const store = useAuthStore();
    store.user = mockModerator;
    store.isAuthenticated = true;

    await authMiddleware({ path: '/admin/moderation' } as never, from as never);

    expect(mocks.navigateToMock).not.toHaveBeenCalled();
  });

  it('redirects non-admins from users management', async () => {
    const store = useAuthStore();
    store.user = mockModerator;
    store.isAuthenticated = true;

    await authMiddleware({ path: '/admin/users' } as never, from as never);

    expect(mocks.navigateToMock).toHaveBeenCalledWith('/admin');
  });

  it('allows admins to manage users', async () => {
    const store = useAuthStore();
    store.user = mockAdmin;
    store.isAuthenticated = true;

    await authMiddleware({ path: '/admin/users' } as never, from as never);

    expect(mocks.navigateToMock).not.toHaveBeenCalled();
  });

  it('redirects non-super-admins from AI generate page', async () => {
    const store = useAuthStore();
    store.user = mockAdmin;
    store.isAuthenticated = true;

    await authMiddleware({ path: '/admin/ai-generate' } as never, from as never);

    expect(mocks.navigateToMock).toHaveBeenCalledWith('/admin');
  });

  it('allows super admin on AI generate page', async () => {
    const store = useAuthStore();
    store.user = mockSuperAdmin;
    store.isAuthenticated = true;

    await authMiddleware({ path: '/admin/ai-generate' } as never, from as never);

    expect(mocks.navigateToMock).not.toHaveBeenCalled();
  });
});
