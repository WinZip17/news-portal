import { Suspense } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import Home from '@/pages/Home.tsx';
import { mockNewsItem, mockStats, mockUser, renderWithProviders, screen, waitFor } from '@/test-utils';

const mockUseAuth = vi.fn();

vi.mock('@/hooks/useAuth.ts', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/useNewsModal.ts', () => ({
  useNewsModal: () => ({
    selectedNewsId: null,
    modalVisible: false,
    openNews: vi.fn(),
    closeNews: vi.fn(),
  }),
}));

vi.mock('@/components/news/NewsSkerleton.tsx', () => ({
  default: () => null,
}));

vi.mock('@/components/news/NewsStats.tsx', () => ({
  default: () => <div data-testid="news-stats">200</div>,
}));

vi.mock('@/components/news/NewsCard.tsx', () => ({
  default: ({ item }: { item: { title: string } }) => <div>{item.title}</div>,
}));

vi.mock('@/components/NewsDetailModal.tsx', () => ({
  default: () => null,
}));

describe('Home page', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
  });

  function renderHome() {
    return renderWithProviders(
      <Suspense fallback={null}>
        <Home />
      </Suspense>,
    );
  }

  it('renders hero section for guest with auth CTAs', async () => {
    renderHome();

    await waitFor(() => {
      expect(screen.getByText('📰 Short News')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Начать бесплатно/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Читать новости/i })).not.toBeInTheDocument();
  });

  it('shows read news CTA for authenticated user', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Читать новости/i })).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /Начать бесплатно/i })).not.toBeInTheDocument();
  });

  it('loads stats and latest news from API', async () => {
    renderHome();

    await waitFor(() => {
      expect(screen.getByText(String(mockStats.totalNews))).toBeInTheDocument();
      expect(screen.getByText(mockNewsItem.title)).toBeInTheDocument();
    });

    expect(screen.getByText('Последние новости')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Все новости/i })).toBeInTheDocument();
  });
});
