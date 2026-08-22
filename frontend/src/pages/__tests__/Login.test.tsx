import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import Login from '@/pages/Login.tsx';
import { fireEvent, mockAuthResponse, mockUser, renderWithProviders, screen, server, waitFor } from '@/test-utils';

describe('Login page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function renderLogin() {
    return renderWithProviders(
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/register" element={<div>Register page</div>} />
      </Routes>,
      { route: '/login' },
    );
  }

  it('renders login form', () => {
    renderLogin();

    expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Зарегистрироваться/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty form', async () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(screen.getByText('Пожалуйста, введите email')).toBeInTheDocument();
      expect(screen.getByText('Пожалуйста, введите пароль')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(screen.getByText('Введите корректный email')).toBeInTheDocument();
    });
  });

  it('logs in successfully and redirects to home', async () => {
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(screen.getByText('Home page')).toBeInTheDocument();
    });

    expect(localStorage.getItem('accessToken')).toBe(mockAuthResponse.accessToken);
  });

  it('shows API error on failed login', async () => {
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 }),
      ),
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    expect(screen.queryByText('Home page')).not.toBeInTheDocument();
  });
});
