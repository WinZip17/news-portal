import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewsDetailModal from '../NewsDetailModal';
import { Provider } from 'react-redux';
import { store } from '../../store';

vi.mock('../../hooks/useNews', () => ({
  useNews: () => ({
    currentNews: {
      id: '1',
      title: 'Test News',
      content: '<p>Test</p>',
      summary: 'Summary',
      category: 'technology',
      tags: ['test'],
      isAiGenerated: true,
      views: 100,
      likes: 5,
      source: 'Test Source',
      sourceUrl: 'https://test.com',
      publishedAt: '2026-01-01',
      author: 'Author',
      imageUrl: '',
    },
    isLoading: false,
    fetchNewsById: vi.fn(),
    likeNews: vi.fn(),
    clearError: vi.fn(),
  }),
}));

describe('NewsDetailModal', () => {
  it('renders news title', () => {
    render(
      <Provider store={store}>
        <NewsDetailModal newsId="1" />
      </Provider>
    );
    expect(screen.getByText('Test News')).toBeDefined();
  });
});