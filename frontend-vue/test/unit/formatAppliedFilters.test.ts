import { describe, expect, it } from 'vitest';
import { NewsCategory } from '@/types';
import { formatAppliedFilters } from '@/utils/formatAppliedFilters';

describe('formatAppliedFilters', () => {
  it('returns empty string for empty filters', () => {
    expect(formatAppliedFilters({})).toBe('');
  });

  it('formats search and category', () => {
    expect(
      formatAppliedFilters({
        search: 'AI новости',
        category: NewsCategory.TECHNOLOGY,
      }),
    ).toBe('поиск: «AI новости» · Технологии');
  });

  it('formats tags and AI flags', () => {
    expect(
      formatAppliedFilters({
        tags: ['ml', 'chips'],
        isAiGenerated: true,
      }),
    ).toBe('теги: ml, chips · только AI');

    expect(formatAppliedFilters({ isAiGenerated: false })).toBe('без AI');
  });

  it('adds period label when date range is present', () => {
    expect(
      formatAppliedFilters({
        fromDate: '2026-08-01',
        toDate: '2026-08-20',
      }),
    ).toBe('за период');
  });
});
