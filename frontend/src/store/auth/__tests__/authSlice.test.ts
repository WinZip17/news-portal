import { beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { store } from '@/store';
import { clearAuthError, fetchCurrentUser, login, logout, register, setTokens, updatePreferences, updateProfile } from '@/store/auth/authSlice';
import { mockAuthResponse, mockUser, server } from '@/test-utils';

describe('authSlice (MSW)', () => {
  beforeEach(() => {
    store.dispatch(logout());
  });

  describe('reducers', () => {
    it('logout clears auth state and localStorage', () => {
      store.dispatch(setTokens({ accessToken: 'a', refreshToken: 'r' }));
      store.dispatch(logout());

      const auth = store.getState().auth;
      expect(auth.user).toBeNull();
      expect(auth.accessToken).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('clearAuthError resets error', async () => {
      server.use(http.post('/api/auth/login', () => HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })));

      await store.dispatch(login({ email: 'bad@example.com', password: 'wrong' }));
      expect(store.getState().auth.error).toBe('Invalid credentials');

      store.dispatch(clearAuthError());
      expect(store.getState().auth.error).toBeNull();
    });
  });

  describe('login', () => {
    it('fulfills and stores user with tokens', async () => {
      const result = await store.dispatch(login({ email: 'test@example.com', password: 'password123', rememberMe: true }));

      expect(result.type).toBe('auth/login/fulfilled');
      const auth = store.getState().auth;
      expect(auth.isAuthenticated).toBe(true);
      expect(auth.user?.email).toBe(mockUser.email);
      expect(auth.accessToken).toBe(mockAuthResponse.accessToken);
      expect(localStorage.getItem('accessToken')).toBe(mockAuthResponse.accessToken);
      expect(localStorage.getItem('rememberMe')).toBe('true');
    });

    it('rejects with API error message', async () => {
      server.use(http.post('/api/auth/login', () => HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })));

      const result = await store.dispatch(login({ email: 'bad@example.com', password: 'wrong' }));

      expect(result.type).toBe('auth/login/rejected');
      expect(store.getState().auth.isAuthenticated).toBe(false);
      expect(store.getState().auth.error).toBe('Invalid credentials');
    });
  });

  describe('register', () => {
    it('fulfills and authenticates user', async () => {
      const result = await store.dispatch(
        register({
          email: 'new@example.com',
          username: 'newuser',
          password: 'password123',
        }),
      );

      expect(result.type).toBe('auth/register/fulfilled');
      expect(store.getState().auth.isAuthenticated).toBe(true);
      expect(store.getState().auth.user?.username).toBe(mockUser.username);
    });
  });

  describe('fetchCurrentUser', () => {
    it('fulfills when token is present', async () => {
      store.dispatch(setTokens({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' }));

      const result = await store.dispatch(fetchCurrentUser());

      expect(result.type).toBe('auth/fetchCurrentUser/fulfilled');
      expect(store.getState().auth.user?.id).toBe(mockUser.id);
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });

    it('rejects on unauthorized', async () => {
      server.use(http.get('/api/auth/me', () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })));

      store.dispatch(setTokens({ accessToken: 'invalid', refreshToken: 'invalid' }));
      const result = await store.dispatch(fetchCurrentUser());

      expect(result.type).toBe('auth/fetchCurrentUser/rejected');
      expect(store.getState().auth.isAuthenticated).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('updates user in state', async () => {
      store.dispatch(setTokens({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' }));
      await store.dispatch(fetchCurrentUser());

      await store.dispatch(updateProfile({ firstName: 'UpdatedName' }));

      expect(store.getState().auth.user?.firstName).toBe('UpdatedName');
    });
  });

  describe('updatePreferences', () => {
    it('updates preferences in state', async () => {
      store.dispatch(setTokens({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' }));
      await store.dispatch(fetchCurrentUser());

      await store.dispatch(updatePreferences({ theme: 'dark' }));

      expect(store.getState().auth.user?.preferences.theme).toBe('dark');
    });
  });
});
