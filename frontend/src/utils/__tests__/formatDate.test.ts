import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatFullDate, formatLocaleDate, getTimeAgoString } from '@/utils/formatDate.ts';

describe('formatDate utils', () => {
  describe('getTimeAgoString', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-20T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "только что" for dates within a minute', () => {
      expect(getTimeAgoString('2026-08-20T11:59:30')).toBe('только что');
    });

    it('returns minutes ago', () => {
      expect(getTimeAgoString('2026-08-20T11:30:00')).toBe('30 мин. назад');
    });

    it('returns hours ago', () => {
      expect(getTimeAgoString('2026-08-20T09:00:00')).toBe('3 ч. назад');
    });

    it('returns days ago', () => {
      expect(getTimeAgoString('2026-08-18T12:00:00')).toBe('2 дн. назад');
    });

    it('returns full date for older entries', () => {
      expect(getTimeAgoString('2026-01-01T12:00:00')).toMatch(/1 января 2026/);
    });
  });

  describe('formatLocaleDate', () => {
    it('formats date in ru-RU locale', () => {
      expect(formatLocaleDate('2026-08-20')).toBe('20.08.2026');
    });
  });

  describe('formatFullDate', () => {
    it('includes date and time parts', () => {
      const formatted = formatFullDate('2026-08-20T15:30:00');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('20');
    });
  });
});
