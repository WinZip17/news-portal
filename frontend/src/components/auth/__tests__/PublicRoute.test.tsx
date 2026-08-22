import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import PublicRoute from '@/components/auth/PublicRoute.tsx';
import { mockUser, renderWithProviders, screen } from '@/test-utils';

const mockUseAuth = vi.fn();

vi.mock('@/hooks/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('PublicRoute', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
  });

  function renderPublicRoute(route = '/login') {
    return renderWithProviders(
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <div>Login form</div>
            </PublicRoute>
          }
        />
        <Route path="/profile" element={<div>Profile page</div>} />
        <Route path="/" element={<div>Home page</div>} />
      </Routes>,
      { route },
    );
  }

  it('shows loading spinner while auth is loading', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });

    renderPublicRoute();

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    expect(screen.queryByText('Login form')).not.toBeInTheDocument();
  });

  it('renders login page for guest', () => {
    renderPublicRoute();

    expect(screen.getByText('Login form')).toBeInTheDocument();
  });

  it('redirects authenticated user away from login', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
    });

    renderPublicRoute();

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.queryByText('Login form')).not.toBeInTheDocument();
  });
});
