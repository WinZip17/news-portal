import { describe, expect, it } from 'vitest';
import { getCategoryLabel } from '@/utils/getCategoryLabel';
import { NewsCategory } from '@/types';

describe('getCategoryLabel', () => {
  it('returns Russian label for known category', () => {
    expect(getCategoryLabel(NewsCategory.TECHNOLOGY)).toBe('Технологии');
    expect(getCategoryLabel(NewsCategory.POLITICS)).toBe('Политика');
  });

  it('returns original value for unknown category', () => {
    expect(getCategoryLabel('unknown')).toBe('unknown');
  });
});
