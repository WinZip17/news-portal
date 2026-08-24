import { getCategoryLabel } from '@/utils/getCategoryLabel';

describe('getCategoryLabel', () => {
  it('returns Russian label for known category', () => {
    expect(getCategoryLabel('technology')).toBe('Технологии');
    expect(getCategoryLabel('economy')).toBe('Экономика');
  });

  it('returns original value for unknown category', () => {
    expect(getCategoryLabel('unknown')).toBe('unknown');
  });
});
