import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SmartSearchPage from '@/app/search/page';
import { mockNewsItem, renderWithProviders, setupMockApi } from '@/test-utils';

describe('SmartSearchPage', () => {
  beforeEach(() => {
    setupMockApi();
  });

  it('renders search form and hint before search', () => {
    renderWithProviders(<SmartSearchPage />);

    expect(screen.getByText('🧠 Умный поиск')).toBeInTheDocument();
    expect(screen.getByText('Введите запрос и нажмите «Найти».')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Найти/i })).toBeDisabled();
  });

  it('fills query from example chip click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SmartSearchPage />);

    await user.click(screen.getByText('экономика и инфляция'));

    expect(screen.getByPlaceholderText(/Например:/)).toHaveValue('экономика и инфляция');
  });

  it('performs search and shows results with applied filters hint', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SmartSearchPage />);

    await user.type(screen.getByPlaceholderText(/Например:/), 'AI новости');
    await user.click(screen.getByRole('button', { name: /Найти/i }));

    await waitFor(() => {
      expect(screen.getByText(mockNewsItem.title)).toBeInTheDocument();
    });

    expect(screen.getByText(/Распознано:/)).toBeInTheDocument();
    expect(screen.getByText(/поиск: «AI новости»/)).toBeInTheDocument();
  });

  it('shows empty state when search returns no results', async () => {
    setupMockApi()
      .onPost('/news/smart-search')
      .reply(200, {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        appliedFilters: { search: 'пусто' },
        source: 'fallback',
      });

    const user = userEvent.setup();
    renderWithProviders(<SmartSearchPage />);

    await user.type(screen.getByPlaceholderText(/Например:/), 'пусто');
    await user.click(screen.getByRole('button', { name: /Найти/i }));

    await waitFor(() => {
      expect(screen.getByText(/По запросу «пусто» ничего не найдено/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Распознано \(без AI\)/)).toBeInTheDocument();
  });
});
