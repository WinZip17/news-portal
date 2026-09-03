import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDate } from '@/utils/formatDate';

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-02T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns em dash for empty value', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('formats short date in ru-RU', () => {
    expect(formatDate('2026-08-20T08:00:00.000Z', 'short')).toMatch(/20\.08\.2026|20\.8\.2026/);
  });

  it('formats relative time', () => {
    const fiveMinutesAgo = new Date('2026-09-02T11:55:00.000Z');
    expect(formatDate(fiveMinutesAgo, 'relative')).toBe('5 мин. назад');
  });

  it('returns "только что" for recent dates', () => {
    expect(formatDate(new Date('2026-09-02T11:59:30.000Z'), 'relative')).toBe('только что');
  });
});
