import { describe, expect, it, vi } from 'vitest';
import NewsCard from '@/components/news/NewsCard.tsx';
import { NewsCategory, NewsStatus } from '@/types';
import { fireEvent, mockNewsItem, renderWithProviders, screen } from '@/test-utils';

describe('NewsCard', () => {
  const item = {
    ...mockNewsItem,
    summary: 'Краткое описание новости для карточки',
    views: 100,
    likes: 7,
    source: 'Test Source',
  };

  it('renders title, category and stats', () => {
    renderWithProviders(<NewsCard item={item} openNews={vi.fn()} />);

    expect(screen.getByText(item.title)).toBeInTheDocument();
    expect(screen.getByText('Технологии')).toBeInTheDocument();
    expect(screen.getByText('AI-рерайт')).toBeInTheDocument();
    expect(screen.getByText('Test Source')).toBeInTheDocument();
    expect(screen.getByText(/👁 100/)).toBeInTheDocument();
    expect(screen.getByText(/❤️ 7/)).toBeInTheDocument();
  });

  it('calls openNews with item id on click', () => {
    const openNews = vi.fn();

    renderWithProviders(<NewsCard item={item} openNews={openNews} />);

    fireEvent.click(screen.getByText(item.title));

    expect(openNews).toHaveBeenCalledWith(item.id);
  });

  it('shows original tag for non-AI news', () => {
    renderWithProviders(
      <NewsCard item={{ ...item, isAiGenerated: false, category: NewsCategory.SPORTS, status: NewsStatus.PUBLISHED }} openNews={vi.fn()} />,
    );

    expect(screen.getByText('Оригинал')).toBeInTheDocument();
    expect(screen.getByText('Спорт')).toBeInTheDocument();
  });
});
