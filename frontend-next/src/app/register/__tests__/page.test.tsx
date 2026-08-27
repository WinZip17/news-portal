import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/app/register/page';
import { renderWithProviders, setupMockApi } from '@/test-utils';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    setupMockApi();
    pushMock.mockClear();
  });

  it('renders registration form', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByRole('heading', { name: 'Регистрация' })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/имя пользователя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /войти/i })).toHaveAttribute('href', '/login');
  });

  it('registers successfully and redirects to home', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/имя пользователя/i), 'newuser');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
    expect(store.getState().auth.accessToken).toBe('test-access-token');
    expect(localStorage.getItem('accessToken')).toBe('test-access-token');
  });

  it('shows API error on failed registration', async () => {
    setupMockApi().onPost('/auth/register').reply(400, { message: 'Email already exists' });

    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), 'exists@example.com');
    await user.type(screen.getByLabelText(/имя пользователя/i), 'exists');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    expect(await screen.findByText('Email already exists')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
