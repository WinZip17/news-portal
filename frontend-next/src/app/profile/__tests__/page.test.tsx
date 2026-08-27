import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/app/profile/page';
import { mockNewsItem, mockUser, renderWithProviders, setupMockApi } from '@/test-utils';
import type { RootState } from '@/store';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

function profileState(): Partial<RootState> {
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

describe('ProfilePage', () => {
  beforeEach(() => {
    setupMockApi();
    pushMock.mockClear();
  });

  it('redirects to login without token', async () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        auth: {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
      },
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('renders profile heading and tabs', async () => {
    renderWithProviders(<ProfilePage />, { preloadedState: profileState() });

    expect(await screen.findByText('Личный кабинет')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Профиль/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Пароль/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Настройки/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Избранное/i })).toBeInTheDocument();
  });

  it('shows user data on profile tab', async () => {
    renderWithProviders(<ProfilePage />, { preloadedState: profileState() });

    expect(await screen.findByDisplayValue(mockUser.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.username)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.firstName!)).toBeInTheDocument();
  });

  it('shows password form on password tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, { preloadedState: profileState() });

    await screen.findByText('Личный кабинет');
    await user.click(screen.getByRole('tab', { name: /Пароль/i }));

    expect(await screen.findByRole('button', { name: /Сменить пароль/i })).toBeInTheDocument();
    expect(document.querySelector('input[name="currentPassword"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="newPassword"]')).toBeInTheDocument();
  });

  it('shows theme settings on preferences tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, { preloadedState: profileState() });

    await screen.findByText('Личный кабинет');
    await user.click(screen.getByRole('tab', { name: /Настройки/i }));

    expect(await screen.findByRole('combobox')).toHaveTextContent('Темная');
    expect(screen.getByRole('button', { name: /^Сохранить$/i })).toBeInTheDocument();
  });

  it('loads and displays favorites', async () => {
    setupMockApi()
      .onGet('/news/favorites')
      .reply(200, {
        data: [mockNewsItem],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, { preloadedState: profileState() });

    await screen.findByText('Личный кабинет');
    await user.click(screen.getByRole('tab', { name: /Избранное/i }));

    expect(await screen.findByText(mockNewsItem.title)).toBeInTheDocument();
  });
});
