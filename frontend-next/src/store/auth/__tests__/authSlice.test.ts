import { createTestStore, mockAuthResponse, mockUser, setupMockApi } from '@/test-utils';
import { fetchCurrentUser, login, logout, setTokens } from '@/store/auth/authSlice';

describe('authSlice (mock API)', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    setupMockApi();
    store = createTestStore();
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

    it('setTokens stores tokens in state and localStorage', () => {
      store.dispatch(setTokens({ accessToken: 'access', refreshToken: 'refresh' }));

      expect(store.getState().auth.accessToken).toBe('access');
      expect(localStorage.getItem('accessToken')).toBe('access');
      expect(localStorage.getItem('refreshToken')).toBe('refresh');
    });
  });

  describe('login', () => {
    it('fulfills and stores tokens', async () => {
      const result = await store.dispatch(login({ email: 'test@example.com', password: 'password123' }));

      expect(result.type).toBe('auth/login/fulfilled');
      const auth = store.getState().auth;
      expect(auth.isAuthenticated).toBe(true);
      expect(auth.accessToken).toBe(mockAuthResponse.accessToken);
      expect(localStorage.getItem('accessToken')).toBe(mockAuthResponse.accessToken);
    });

    it('rejects with API error message', async () => {
      setupMockApi().onPost('/auth/login').reply(401, { message: 'Invalid credentials' });

      const result = await store.dispatch(login({ email: 'bad@example.com', password: 'wrong' }));

      expect(result.type).toBe('auth/login/rejected');
      expect(store.getState().auth.isAuthenticated).toBe(false);
      expect(store.getState().auth.error).toBe('Invalid credentials');
    });
  });

  describe('fetchCurrentUser', () => {
    it('fulfills when token is present', async () => {
      store.dispatch(setTokens({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' }));

      const result = await store.dispatch(fetchCurrentUser());

      expect(result.type).toBe('auth/fetchCurrentUser/fulfilled');
      expect(store.getState().auth.user?.email).toBe(mockUser.email);
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });

    it('rejects when API returns error', async () => {
      setupMockApi().onGet('/auth/me').reply(401, { message: 'Unauthorized' });

      store.dispatch(setTokens({ accessToken: 'bad-token', refreshToken: 'bad-refresh' }));
      const result = await store.dispatch(fetchCurrentUser());

      expect(result.type).toBe('auth/fetchCurrentUser/rejected');
      expect(store.getState().auth.isAuthenticated).toBe(false);
    });
  });
});
