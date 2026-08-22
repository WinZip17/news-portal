import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout.tsx';
import { UserRole } from '@/types';
import { mockUser, renderWithProviders, screen } from '@/test-utils';

const mockUseAuth = vi.fn();
const mockLogout = vi.fn();

vi.mock('@/hooks/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/components/FrameworkSwitcher.tsx', () => ({
  default: () => <div>Framework switcher</div>,
}));

describe('MainLayout', () => {
  beforeEach(() => {
    mockLogout.mockClear();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      logout: mockLogout,
    });
  });

  function renderLayout(route = '/') {
    return renderWithProviders(
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<div>Page content</div>} />
          <Route path="/admin" element={<div>Admin content</div>} />
        </Route>
      </Routes>,
      { route },
    );
  }

  it('renders main navigation links for guest', () => {
    renderLayout();

    expect(screen.getByRole('menuitem', { name: /Главная/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Новости/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Умный поиск/ })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /Профиль/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /Админ панель/ })).not.toBeInTheDocument();
    expect(screen.getByText('Гость')).toBeInTheDocument();
  });

  it('shows profile for authenticated user', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { ...mockUser, role: UserRole.USER, username: 'testuser' },
      logout: mockLogout,
    });

    renderLayout();

    expect(screen.getByRole('menuitem', { name: /Профиль/ })).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /Админ панель/ })).not.toBeInTheDocument();
  });

  it('shows admin menu item for admin role', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { ...mockUser, role: UserRole.ADMIN, username: 'admin' },
      logout: mockLogout,
    });

    renderLayout('/admin');

    expect(screen.getByRole('menuitem', { name: /Админ панель/ })).toBeInTheDocument();
    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });
});
