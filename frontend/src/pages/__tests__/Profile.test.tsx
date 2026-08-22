import { describe, expect, it, vi, beforeEach } from 'vitest';
import Profile from '@/pages/Profile.tsx';
import { fireEvent, mockNewsItem, mockUser, renderWithProviders, screen, server, waitFor } from '@/test-utils';
import { http, HttpResponse } from 'msw';

const mockUseAuth = vi.fn();
const updateProfile = vi.fn();
const updatePreferences = vi.fn();

vi.mock('@/hooks/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/useNewsModal.ts', () => ({
  useNewsModal: () => ({
    selectedNewsId: null,
    modalVisible: false,
    openNews: vi.fn(),
    closeNews: vi.fn(),
  }),
}));

vi.mock('@/components/NewsDetailModal.tsx', () => ({
  default: () => null,
}));

describe('Profile page', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'test-access-token');
    updateProfile.mockResolvedValue(mockUser);
    updatePreferences.mockResolvedValue(mockUser);
    mockUseAuth.mockReturnValue({
      user: mockUser,
      updateProfile,
      updatePreferences,
    });
  });

  function renderProfile() {
    return renderWithProviders(<Profile />);
  }

  it('renders profile heading and tabs', () => {
    renderProfile();

    expect(screen.getByText('Личный кабинет')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Профиль/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Пароль/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Настройки/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Избранное/i })).toBeInTheDocument();
  });

  it('shows user data on profile tab', () => {
    renderProfile();

    expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.username)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.firstName!)).toBeInTheDocument();
  });

  it('submits profile update', async () => {
    renderProfile();

    fireEvent.change(screen.getByLabelText('Имя'), { target: { value: 'UpdatedName' } });
    fireEvent.click(screen.getByRole('button', { name: /^Сохранить$/i }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'UpdatedName' }));
    });
  });

  it('shows empty favorites state', async () => {
    renderProfile();

    fireEvent.click(screen.getByRole('tab', { name: /Избранное/i }));

    await waitFor(() => {
      expect(screen.getByText('Нет избранных новостей')).toBeInTheDocument();
    });
  });

  it('loads and displays favorites', async () => {
    server.use(
      http.get('/api/news/favorites', () =>
        HttpResponse.json({
          data: [mockNewsItem],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        }),
      ),
    );

    renderProfile();

    fireEvent.click(screen.getByRole('tab', { name: /Избранное/i }));

    await waitFor(() => {
      expect(screen.getByText(mockNewsItem.title)).toBeInTheDocument();
    });
  });

  it('changes password successfully', async () => {
    renderProfile();

    fireEvent.click(screen.getByRole('tab', { name: /Пароль/i }));

    fireEvent.change(screen.getByPlaceholderText('Текущий пароль'), { target: { value: 'OldPass1' } });
    fireEvent.change(screen.getByPlaceholderText('Новый пароль'), { target: { value: 'NewPass1' } });
    fireEvent.change(screen.getByPlaceholderText('Подтвердите пароль'), { target: { value: 'NewPass1' } });
    fireEvent.click(screen.getByRole('button', { name: /Сменить пароль/i }));

    await waitFor(() => {
      expect(screen.queryByText('Введите текущий пароль')).not.toBeInTheDocument();
    });
  });
});
