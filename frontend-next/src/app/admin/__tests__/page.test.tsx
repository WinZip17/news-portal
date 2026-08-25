import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from '@/app/admin/page';
import {
  mockAdminUser,
  mockPendingNewsItem,
  mockUser,
  renderWithProviders,
  setupMockApi,
} from '@/test-utils';
import type { RootState } from '@/store';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

function adminState(): Partial<RootState> {
  return {
    auth: {
      user: mockAdminUser,
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    },
  };
}

describe('AdminPage', () => {
  beforeEach(() => {
    setupMockApi();
    localStorage.setItem('accessToken', 'test-access-token');
    pushMock.mockClear();
  });

  it('redirects to login without token', async () => {
    localStorage.removeItem('accessToken');
    renderWithProviders(<AdminPage />, { preloadedState: adminState() });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('renders admin panel with news and users tabs', async () => {
    renderWithProviders(<AdminPage />, { preloadedState: adminState() });

    expect(await screen.findByText('Админ-панель')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Новости' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Пользователи' })).toBeInTheDocument();
  });

  it('shows pending news with moderation actions', async () => {
    renderWithProviders(<AdminPage />, { preloadedState: adminState() });

    expect(await screen.findByText(mockPendingNewsItem.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Опубликовать' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отклонить' })).toBeInTheDocument();
  });

  it('loads users on users tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminPage />, { preloadedState: adminState() });

    await screen.findByText('Админ-панель');
    await user.click(screen.getByRole('tab', { name: 'Пользователи' }));

    expect(await screen.findByText(mockUser.username)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });
});
