import { describe, expect, it } from 'vitest';
import { getCategoryColor } from '@/utils/getCategoryColor.ts';

describe('getCategoryColor', () => {
  it('returns ant design color for known categories', () => {
    expect(getCategoryColor('technology')).toBe('purple');
    expect(getCategoryColor('economy')).toBe('green');
  });

  it('returns default for unknown category', () => {
    expect(getCategoryColor('unknown')).toBe('default');
  });
});
