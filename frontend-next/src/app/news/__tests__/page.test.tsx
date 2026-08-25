import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewsPage from '@/app/news/page';
import { mockNewsItem, renderWithProviders, setupMockApi } from '@/test-utils';

describe('NewsPage', () => {
  beforeEach(() => {
    setupMockApi();
  });

  it('renders title and loads news list', async () => {
    renderWithProviders(<NewsPage />);

    expect(await screen.findByText('📰 Лента новостей')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Поиск...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(mockNewsItem.title)).toBeInTheDocument();
    });

    expect(screen.getByText('Все новости загружены')).toBeInTheDocument();
  });

  it('shows reset button when filters are active', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewsPage />);

    await screen.findByText(mockNewsItem.title);

    await user.type(screen.getByPlaceholderText('Поиск...'), 'AI');

    expect(screen.getByRole('button', { name: 'Сбросить' })).toBeInTheDocument();
  });

  it('clears filters when reset is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewsPage />);

    await screen.findByText(mockNewsItem.title);

    const searchInput = screen.getByPlaceholderText('Поиск...');
    await user.type(searchInput, 'AI');
    expect(searchInput).toHaveValue('AI');

    await user.click(screen.getByRole('button', { name: 'Сбросить' }));

    expect(searchInput).toHaveValue('');
  });
});
