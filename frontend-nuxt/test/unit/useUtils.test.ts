import { describe, expect, it } from 'vitest';
import { useUtils } from '~/composables/useUtils';
import { NewsCategory } from '~/types';

describe('useUtils', () => {
  const utils = useUtils();

  it('getCategoryLabel returns Russian label', () => {
    expect(utils.getCategoryLabel(NewsCategory.TECHNOLOGY)).toBe('Технологии');
    expect(utils.getCategoryLabel('unknown')).toBe('unknown');
  });

  it('getStatusLabel returns Russian label', () => {
    expect(utils.getStatusLabel('published')).toBe('Опубликовано');
    expect(utils.getStatusLabel('pending')).toBe('На проверке');
  });

  it('truncateText adds ellipsis when text is too long', () => {
    expect(utils.truncateText('short', 10)).toBe('short');
    expect(utils.truncateText('very long text here', 10)).toBe('very long...');
  });

  it('getInitials builds initials from name or username', () => {
    expect(utils.getInitials('John', 'Doe', 'jd')).toBe('JD');
    expect(utils.getInitials(undefined, undefined, 'user')).toBe('U');
  });

  it('formatAppliedFilters joins filter parts', () => {
    expect(utils.formatAppliedFilters({})).toBe('');
    expect(
      utils.formatAppliedFilters({
        search: 'AI новости',
        category: NewsCategory.TECHNOLOGY,
      }),
    ).toBe('поиск: «AI новости» · Технологии');
    expect(utils.formatAppliedFilters({ isAiGenerated: true })).toBe('только AI');
    expect(utils.formatAppliedFilters({ isAiGenerated: false })).toBe('без AI');
    expect(
      utils.formatAppliedFilters({
        fromDate: '2026-08-01',
        toDate: '2026-08-20',
      }),
    ).toBe('за период');
  });
});
