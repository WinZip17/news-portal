import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';
import { mockNewsItem, mockStats, mockUser, renderWithProviders, setupMockApi } from '@/test-utils';
import type { RootState } from '@/store';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

function guestState(): Partial<RootState> {
  return {
    auth: {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    },
  };
}

function authenticatedState(): Partial<RootState> {
  return {
    auth: {
      user: mockUser,
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    },
  };
}

describe('HomePage', () => {
  beforeEach(() => {
    setupMockApi();
    pushMock.mockClear();
  });

  it('renders hero section for guest with auth CTAs', async () => {
    renderWithProviders(<HomePage />, { preloadedState: guestState() });

    expect(await screen.findByText('📰 Short News')).toBeInTheDocument();
    expect(screen.getByText('Начать бесплатно')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
    expect(screen.queryByText('Читать новости')).not.toBeInTheDocument();
  });

  it('shows read news CTA for authenticated user', async () => {
    renderWithProviders(<HomePage />, { preloadedState: authenticatedState() });

    expect(await screen.findByText('Читать новости')).toBeInTheDocument();
    expect(screen.queryByText('Начать бесплатно')).not.toBeInTheDocument();
  });

  it('loads stats and latest news from API', async () => {
    renderWithProviders(<HomePage />, { preloadedState: guestState() });

    await waitFor(() => {
      expect(screen.getByText(String(mockStats.totalNews))).toBeInTheDocument();
      expect(screen.getByText(mockNewsItem.title)).toBeInTheDocument();
    });

    expect(screen.getByText('Последние новости')).toBeInTheDocument();
  });

  it('navigates to news feed from hero CTA', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />, { preloadedState: guestState() });

    await screen.findByText('📰 Short News');
    await user.click(screen.getByText('Начать бесплатно'));

    expect(pushMock).toHaveBeenCalledWith('/news');
  });
});
