import { describe, expect, it } from 'vitest';
import { truncateText } from '@/utils/truncateText.ts';

describe('truncateText', () => {
  it('returns empty string for empty input', () => {
    expect(truncateText('', 10)).toBe('');
    expect(truncateText(null, 10)).toBe('');
    expect(truncateText(undefined, 10)).toBe('');
  });

  it('returns trimmed text when shorter than limit', () => {
    expect(truncateText('  hello  ', 10)).toBe('hello');
  });

  it('truncates long text with ellipsis', () => {
    expect(truncateText('abcdefghijklmnopqrstuvwxyz', 10)).toBe('abcdefghij…');
  });

  it('trims before comparing length', () => {
    expect(truncateText('  short  ', 20)).toBe('short');
  });
});
