import { describe, expect, it, vi } from 'vitest';
import NewsListCard from '@/components/news/NewsListCard.tsx';
import { fireEvent, mockNewsItem, renderWithProviders, screen } from '@/test-utils';

describe('NewsListCard', () => {
  const item = {
    ...mockNewsItem,
    summary: 'Summary for list card',
    views: 55,
    likes: 4,
  };

  it('renders title, summary and metadata', () => {
    renderWithProviders(<NewsListCard item={item} openNews={vi.fn()} />);

    expect(screen.getByText(item.title)).toBeInTheDocument();
    expect(screen.getByText('Summary for list card')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('calls openNews when card is clicked', () => {
    const openNews = vi.fn();

    renderWithProviders(<NewsListCard item={item} openNews={openNews} />);

    fireEvent.click(screen.getByText(item.title));

    expect(openNews).toHaveBeenCalledWith(item.id);
  });
});
