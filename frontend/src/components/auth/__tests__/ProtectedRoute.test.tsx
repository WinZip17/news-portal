import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute.tsx';
import { UserRole } from '@/types';
import { mockUser, renderWithProviders, screen } from '@/test-utils';

const mockUseAuth = vi.fn();

vi.mock('@/hooks/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  function renderProtectedRoute(requiredRoles?: string[]) {
    return renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/" element={<div>Home page</div>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRoles={requiredRoles}>
              <div>Protected content</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { route: '/profile' },
    );
  }

  it('shows loading spinner while auth is loading', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true, user: null });

    renderProtectedRoute();

    expect(screen.getByText('Проверка авторизации...')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects guest to login', () => {
    renderProtectedRoute();

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children for authenticated user', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
    });

    renderProtectedRoute();

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to home when role is not allowed', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { ...mockUser, role: UserRole.USER },
    });

    renderProtectedRoute(['admin', 'moderator', 'super_admin']);

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('allows access when user has required role', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { ...mockUser, role: UserRole.ADMIN },
    });

    renderProtectedRoute(['admin', 'moderator', 'super_admin']);

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
