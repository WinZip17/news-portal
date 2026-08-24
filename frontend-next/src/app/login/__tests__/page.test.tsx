import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import { mockUser, renderWithProviders, setupMockApi } from '@/test-utils';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    setupMockApi();
    pushMock.mockClear();
  });

  it('renders login form', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
  });

  it('shows validation for empty required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByLabelText(/email/i)).toBeInvalid();
  });

  it('logs in successfully and redirects to home', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(store.getState().auth.user?.email).toBe(mockUser.email);
    });
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('shows API error for invalid credentials', async () => {
    setupMockApi().onPost('/auth/login').reply(401, { message: 'Invalid credentials' });

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'bad@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
