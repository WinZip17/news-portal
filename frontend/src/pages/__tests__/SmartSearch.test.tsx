import { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import SmartSearch from '@/pages/SmartSearch.tsx';
import { fireEvent, mockNewsItem, renderWithProviders, screen, server, waitFor } from '@/test-utils';

vi.mock('@/hooks/useNewsModal.ts', () => ({
  useNewsModal: () => ({
    selectedNewsId: null,
    modalVisible: false,
    openNews: vi.fn(),
    closeNews: vi.fn(),
  }),
}));

describe('SmartSearch', () => {
  function renderSmartSearch() {
    return renderWithProviders(
      <Suspense fallback={null}>
        <SmartSearch />
      </Suspense>,
    );
  }

  it('renders search form and hint before search', () => {
    renderSmartSearch();

    expect(screen.getByText('🧠 Умный поиск')).toBeInTheDocument();
    expect(screen.getByText('Введите запрос и нажмите «Найти».')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Найти/i })).toBeDisabled();
  });

  it('fills query from example tag click', () => {
    renderSmartSearch();

    fireEvent.click(screen.getByText('экономика и инфляция'));

    expect(screen.getByPlaceholderText(/Например:/)).toHaveValue('экономика и инфляция');
  });

  it('performs search and shows results with applied filters hint', async () => {
    renderSmartSearch();

    fireEvent.change(screen.getByPlaceholderText(/Например:/), {
      target: { value: 'AI новости' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Найти/i }));

    await waitFor(() => {
      expect(screen.getByText(mockNewsItem.title)).toBeInTheDocument();
    });

    expect(screen.getByText(/Распознано:/)).toBeInTheDocument();
    expect(screen.getByText(/поиск: «AI новости»/)).toBeInTheDocument();
  });

  it('shows empty state when search returns no results', async () => {
    server.use(
      http.post('/api/news/smart-search', () =>
        HttpResponse.json({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          appliedFilters: { search: 'пусто' },
          source: 'fallback',
        }),
      ),
    );

    renderSmartSearch();

    fireEvent.change(screen.getByPlaceholderText(/Например:/), {
      target: { value: 'пусто' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Найти/i }));

    await waitFor(() => {
      expect(screen.getByText(/По запросу «пусто» ничего не найдено/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Распознано \(без AI\)/)).toBeInTheDocument();
  });
});
