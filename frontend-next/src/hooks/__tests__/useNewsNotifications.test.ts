import { act, waitFor } from '@testing-library/react';
import { io } from 'socket.io-client';
import { NEWS_WS_EVENTS, NewsCategory, NewsStatus, UserRole } from '@news-portal/types';
import { useNewsNotifications } from '@/hooks/useNewsNotifications';
import { renderHookWithProviders } from '@/test-utils/renderWithProviders';
import { mockUser } from '@/test-utils/fixtures';

jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

jest.mock('../../utils/getBackendOrigin', () => ({
  getBackendOrigin: () => 'http://localhost:3001',
}));

const ioMock = io as jest.MockedFunction<typeof io>;

const publishedPayload = {
  id: 'news-1',
  title: 'Published headline',
  summary: 'Summary',
  category: NewsCategory.TECHNOLOGY,
  status: NewsStatus.PUBLISHED,
  isAiGenerated: false,
  publishedAt: '2026-08-01T10:00:00.000Z',
  createdAt: '2026-08-01T09:00:00.000Z',
};

const pendingPayload = {
  ...publishedPayload,
  id: 'news-2',
  title: 'Pending headline',
  status: NewsStatus.PENDING,
};

describe('useNewsNotifications', () => {
  let publishedHandler: ((payload: typeof publishedPayload) => void) | undefined;
  let pendingHandler: ((payload: typeof pendingPayload) => void) | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    publishedHandler = undefined;
    pendingHandler = undefined;

    ioMock.mockReturnValue({
      on: jest.fn((event: string, callback: (payload: unknown) => void) => {
        if (event === NEWS_WS_EVENTS.PUBLISHED) publishedHandler = callback;
        if (event === NEWS_WS_EVENTS.PENDING) pendingHandler = callback;
      }),
      disconnect: jest.fn(),
    } as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('connects to news socket namespace', () => {
    renderHookWithProviders(() => useNewsNotifications());

    expect(ioMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/news',
      expect.objectContaining({
        path: '/api/socket.io',
        auth: undefined,
      }),
    );
  });

  it('passes access token in socket auth', () => {
    renderHookWithProviders(() => useNewsNotifications(), {
      preloadedState: {
        auth: {
          accessToken: 'token-123',
          refreshToken: null,
          user: null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });

    expect(ioMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/news',
      expect.objectContaining({
        auth: { token: 'token-123' },
      }),
    );
  });

  it('shows a single published notification after 5 seconds', async () => {
    const { result } = renderHookWithProviders(() => useNewsNotifications());

    act(() => {
      publishedHandler?.(publishedPayload);
    });

    expect(result.current.notification).toBeNull();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current.notification).toEqual(
        expect.objectContaining({
          kind: 'published',
          title: 'Published headline',
        }),
      );
      expect(result.current.notification?.count).toBeUndefined();
    });
  });

  it('batches multiple published notifications within 5 seconds', async () => {
    const { result } = renderHookWithProviders(() => useNewsNotifications());

    act(() => {
      publishedHandler?.(publishedPayload);
      publishedHandler?.({ ...publishedPayload, id: 'news-3', title: 'Another headline' });
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current.notification).toEqual(
        expect.objectContaining({
          kind: 'published',
          count: 2,
        }),
      );
    });
  });

  it('queues pending notifications only for moderators', async () => {
    const { result } = renderHookWithProviders(() => useNewsNotifications(), {
      preloadedState: {
        auth: {
          accessToken: 'token-123',
          refreshToken: null,
          user: { ...mockUser, role: UserRole.MODERATOR },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });

    act(() => {
      pendingHandler?.(pendingPayload);
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current.notification).toEqual(
        expect.objectContaining({
          kind: 'pending',
          title: 'Pending headline',
        }),
      );
    });
  });

  it('ignores pending notifications for regular users', async () => {
    const { result } = renderHookWithProviders(() => useNewsNotifications(), {
      preloadedState: {
        auth: {
          accessToken: 'token-123',
          refreshToken: null,
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });

    act(() => {
      pendingHandler?.(pendingPayload);
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current.notification).toBeNull();
    });
  });

  it('disconnects socket on unmount', () => {
    const disconnect = jest.fn();
    ioMock.mockReturnValue({
      on: jest.fn(),
      disconnect,
    } as never);

    const { unmount } = renderHookWithProviders(() => useNewsNotifications());
    unmount();

    expect(disconnect).toHaveBeenCalled();
  });
});
