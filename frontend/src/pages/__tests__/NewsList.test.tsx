import { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import NewsList from '@/pages/NewsList.tsx';
import { fireEvent, mockNewsItem, renderWithProviders, screen, server, waitFor } from '@/test-utils';

vi.mock('@/hooks/useNewsModal.ts', () => ({
  useNewsModal: () => ({
    selectedNewsId: null,
    modalVisible: false,
    openNews: vi.fn(),
    closeNews: vi.fn(),
  }),
}));

vi.mock('@/components/NewsDetailModal', () => ({
  default: () => null,
}));

vi.mock('@/components/news/NewsListCard', () => ({
  default: ({ item }: { item: { title: string } }) => <div>{item.title}</div>,
}));

vi.mock('@/components/news/NewsListFilters', () => ({
  default: ({ hasActiveFilters }: { hasActiveFilters: boolean }) => (
    <div>
      <input placeholder="Поиск..." readOnly />
      {hasActiveFilters && <button type="button">Сбросить фильтры</button>}
    </div>
  ),
}));

const baseNewsState = {
  news: [],
  currentNews: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  isLoadingStats: false,
  error: null,
  errorStats: null,
  filters: {},
  personalizedNews: [],
  stats: null,
  initialLoading: false,
};

describe('NewsList page', () => {
  function renderNewsList(preloadedState?: { news: typeof baseNewsState }) {
    return renderWithProviders(
      <Suspense fallback={null}>
        <NewsList />
      </Suspense>,
      { preloadedState },
    );
  }

  it('renders title and loads news list', async () => {
    renderNewsList({ news: baseNewsState });

    await waitFor(() => {
      expect(screen.getByText('📰 Лента новостей')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Поиск...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(mockNewsItem.title)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Все новости загружены')).toBeInTheDocument();
    });
  });

  it('shows active filters hint when filters are set', async () => {
    renderNewsList({
      news: {
        ...baseNewsState,
        filters: { search: 'AI' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Показаны результаты с фильтрами')).toBeInTheDocument();
    });
  });

  it('shows empty state with reset when filters match nothing', async () => {
    server.use(
      http.get('/api/news', () =>
        HttpResponse.json({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        }),
      ),
    );

    renderNewsList({
      news: {
        ...baseNewsState,
        filters: { search: 'missing' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /^Сбросить$/ })).toBeInTheDocument();
  });

  it('clears filters when reset button is clicked', async () => {
    server.use(
      http.get('/api/news', () =>
        HttpResponse.json({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        }),
      ),
    );

    const { store } = renderNewsList({
      news: {
        ...baseNewsState,
        filters: { search: 'missing' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Сбросить$/ }));

    expect(store.getState().news.filters).toEqual({});
  });
});
