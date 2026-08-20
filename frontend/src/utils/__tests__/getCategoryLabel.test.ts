import { describe, expect, it } from 'vitest';
import { getCategoryLabel } from '@/utils/getCategoryLabel.ts';

describe('getCategoryLabel', () => {
  it('returns Russian label for known categories', () => {
    expect(getCategoryLabel('technology')).toBe('Технологии');
    expect(getCategoryLabel('politics')).toBe('Политика');
    expect(getCategoryLabel('world')).toBe('Мир');
  });

  it('returns original value for unknown category', () => {
    expect(getCategoryLabel('unknown-category')).toBe('unknown-category');
  });
});
