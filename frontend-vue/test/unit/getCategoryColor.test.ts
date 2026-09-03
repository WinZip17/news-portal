import { describe, expect, it } from 'vitest';
import { getCategoryColor } from '@/utils/getCategoryColor';
import { NewsCategory } from '@/types';

describe('getCategoryColor', () => {
  it('returns color for known category', () => {
    expect(getCategoryColor(NewsCategory.TECHNOLOGY)).toBe('purple');
    expect(getCategoryColor(NewsCategory.SPORTS)).toBe('orange');
  });

  it('returns grey for unknown category', () => {
    expect(getCategoryColor('unknown')).toBe('grey');
  });
});
