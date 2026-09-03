import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { User } from '@/types';

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
    changePassword: vi.fn(),
  },
}));

const stubPage = vi.hoisted(() => ({ template: '<div />' }));

vi.mock('@/pages/HomeView.vue', () => ({ default: stubPage }));
vi.mock('@/pages/NewsView.vue', () => ({ default: stubPage }));
vi.mock('@/pages/SearchView.vue', () => ({ default: stubPage }));
vi.mock('@/pages/LoginView.vue', () => ({ default: stubPage }));
vi.mock('@/pages/RegisterView.vue', () => ({ default: stubPage }));
vi.mock('@/pages/ProfileView.vue', () => ({ default: stubPage }));
vi.mock('@/pages/AdminView.vue', () => ({ default: stubPage }));
vi.mock('@/pages/NotFoundView.vue', () => ({ default: stubPage }));

import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { mockAdmin, mockModerator, mockSuperAdmin, mockUser } from '../fixtures/mocks';

function setSession(user: User | null) {
  const store = useAuthStore();
  if (user) {
    store.accessToken = 'test-token';
    store.refreshToken = 'test-refresh';
    store.user = user;
    localStorage.setItem('accessToken', 'test-token');
  } else {
    store.logout();
  }
}

async function navigate(path: string) {
  await router.push(path);
  await router.isReady();
}

describe('router guards', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    localStorage.clear();
    setSession(null);
    await navigate('/');
  });

  it('redirects guest from protected route to login with redirect query', async () => {
    await navigate('/profile');

    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.query.redirect).toBe('/profile');
  });

  it('redirects guest from admin to login with redirect query', async () => {
    await navigate('/admin');

    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.query.redirect).toBe('/admin');
  });

  it('redirects authenticated user from guest login route to home', async () => {
    setSession(mockUser);
    await navigate('/login');

    expect(router.currentRoute.value.name).toBe('home');
  });

  it('redirects authenticated user from guest register route to home', async () => {
    setSession(mockUser);
    await navigate('/register');

    expect(router.currentRoute.value.name).toBe('home');
  });

  it('allows authenticated user on profile', async () => {
    setSession(mockUser);
    await navigate('/profile');

    expect(router.currentRoute.value.name).toBe('profile');
  });

  it('redirects regular user from admin to home', async () => {
    setSession(mockUser);
    await navigate('/admin');

    expect(router.currentRoute.value.name).toBe('home');
  });

  it('allows moderator on admin route', async () => {
    setSession(mockModerator);
    await navigate('/admin');

    expect(router.currentRoute.value.name).toBe('admin');
  });

  it('allows admin on admin route', async () => {
    setSession(mockAdmin);
    await navigate('/admin');

    expect(router.currentRoute.value.name).toBe('admin');
  });

  it('allows super admin on admin route', async () => {
    setSession(mockSuperAdmin);
    await navigate('/admin');

    expect(router.currentRoute.value.name).toBe('admin');
  });

  it('allows guest on public routes', async () => {
    await navigate('/news');
    expect(router.currentRoute.value.name).toBe('news');

    await navigate('/search');
    expect(router.currentRoute.value.name).toBe('search');
  });
});
