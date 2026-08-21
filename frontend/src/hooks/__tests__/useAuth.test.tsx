import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App as AntApp, ConfigProvider, message } from 'antd';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { useAuth } from '@/hooks/useAuth.ts';
import { logout, setTokens, store } from '@/store';
import { mockUser, server } from '@/test-utils';
import { http, HttpResponse } from 'msw';

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    message: {
      ...actual.message,
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  };
});

function renderUseAuth() {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <ConfigProvider>
          <AntApp>{children}</AntApp>
        </ConfigProvider>
      </Provider>
    );
  }

  return renderHook(() => useAuth(), { wrapper: Wrapper });
}

describe('useAuth', () => {
  beforeEach(() => {
    store.dispatch(logout());
    vi.mocked(message.success).mockClear();
    vi.mocked(message.error).mockClear();
  });

  it('login authenticates user via Redux', async () => {
    const { result } = renderUseAuth();

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password123' });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe(mockUser.email);
    });
  });

  it('logout clears authenticated state', async () => {
    const { result } = renderUseAuth();

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password123' });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('clearError resets auth error', async () => {
    server.use(http.post('/api/auth/login', () => HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })));

    const { result } = renderUseAuth();

    await act(async () => {
      await result.current.login({ email: 'bad@example.com', password: 'wrong' }).catch(() => undefined);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid credentials');
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('updatePreferences saves theme and syncs ui slice', async () => {
    store.dispatch(setTokens({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' }));

    const { result } = renderUseAuth();

    await act(async () => {
      await result.current.fetchCurrentUser();
    });

    await act(async () => {
      await result.current.updatePreferences({ theme: 'dark' });
    });

    expect(result.current.user?.preferences.theme).toBe('dark');
    expect(store.getState().ui.theme).toBe('dark');
    expect(message.success).toHaveBeenCalledWith('Настройки сохранены');
  });

  it('updatePreferences shows error message on failure', async () => {
    store.dispatch(setTokens({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' }));
    server.use(http.put('/api/auth/preferences', () => HttpResponse.json({ message: 'Save failed' }, { status: 500 })));

    const { result } = renderUseAuth();

    await act(async () => {
      await result.current.fetchCurrentUser();
    });

    await act(async () => {
      await expect(result.current.updatePreferences({ theme: 'dark' })).rejects.toBeDefined();
    });

    expect(message.error).toHaveBeenCalledWith('Ошибка сохранения настроек');
  });
});
