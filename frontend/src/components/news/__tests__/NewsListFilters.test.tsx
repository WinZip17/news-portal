import { describe, expect, it, vi, beforeEach } from 'vitest';
import NewsListFilters from '@/components/news/NewsListFilters.tsx';
import { NewsCategory } from '@/types';
import { fireEvent, renderWithProviders, screen } from '@/test-utils';

const mockUseNews = vi.fn();

vi.mock('@/hooks/useNews.ts', () => ({
  useNews: () => mockUseNews(),
}));

describe('NewsListFilters', () => {
  const setSearch = vi.fn();
  const setCategory = vi.fn();
  const setSortBy = vi.fn();
  const setAiFilter = vi.fn();
  const setDateFilter = vi.fn();
  const clearAllFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNews.mockReturnValue({
      filters: { search: 'AI', category: NewsCategory.TECHNOLOGY, sortBy: 'views', isAiGenerated: true },
      setSearch,
      setCategory,
      setSortBy,
      setAiFilter,
      setDateFilter,
      clearAllFilters,
    });
  });

  it('renders search field with current filter value', () => {
    renderWithProviders(<NewsListFilters hasActiveFilters={false} />);

    expect(screen.getByPlaceholderText('Поиск...')).toHaveValue('AI');
  });

  it('shows reset button when filters are active', () => {
    renderWithProviders(<NewsListFilters hasActiveFilters={true} />);

    expect(screen.getByRole('button', { name: /Сбросить/i })).toBeInTheDocument();
  });

  it('hides reset button when no active filters', () => {
    renderWithProviders(<NewsListFilters hasActiveFilters={false} />);

    expect(screen.queryByRole('button', { name: /Сбросить/i })).not.toBeInTheDocument();
  });

  it('calls clearAllFilters when reset is clicked', () => {
    renderWithProviders(<NewsListFilters hasActiveFilters={true} />);

    fireEvent.click(screen.getByRole('button', { name: /Сбросить/i }));

    expect(clearAllFilters).toHaveBeenCalledTimes(1);
  });

  it('clears search when input is emptied', () => {
    renderWithProviders(<NewsListFilters hasActiveFilters={true} />);

    fireEvent.change(screen.getByPlaceholderText('Поиск...'), { target: { value: '' } });

    expect(setSearch).toHaveBeenCalledWith('');
  });

  it('shows sort control in the toolbar', () => {
    renderWithProviders(<NewsListFilters hasActiveFilters={false} />);

    expect(screen.getByText('Сортировка')).toBeInTheDocument();
  });

  it('opens filters popover with secondary controls', () => {
    renderWithProviders(<NewsListFilters hasActiveFilters={true} />);

    fireEvent.click(screen.getByRole('button', { name: /Фильтры/i }));

    expect(screen.getByText('Категория')).toBeInTheDocument();
    expect(screen.getByText('Тип новости')).toBeInTheDocument();
    expect(screen.getByText('Дата новостей')).toBeInTheDocument();
  });
});
