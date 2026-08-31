import { describe, expect, it } from 'vitest';
import { formatCalendarDate } from '~/utils/formatCalendarDate';

describe('formatCalendarDate', () => {
  it('formats date as YYYY-MM-DD in local timezone', () => {
    expect(formatCalendarDate(new Date(2026, 7, 19))).toBe('2026-08-19');
  });

  it('pads month and day with zero', () => {
    expect(formatCalendarDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
