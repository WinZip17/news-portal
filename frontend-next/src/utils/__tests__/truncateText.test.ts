import { truncateText } from '@/utils/truncateText';

describe('truncateText', () => {
  it('returns empty string for empty input', () => {
    expect(truncateText(null, 10)).toBe('');
    expect(truncateText(undefined, 10)).toBe('');
    expect(truncateText('   ', 10)).toBe('');
  });

  it('returns original text when shorter than limit', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('truncates long text with ellipsis', () => {
    expect(truncateText('hello world from next', 5)).toBe('hello…');
  });
});
