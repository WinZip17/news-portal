import { normalizeTagsFilter, resolveSortColumn } from './news-search.utils';

describe('news-search.utils', () => {
  describe('normalizeTagsFilter', () => {
    it('splits comma-separated tags', () => {
      expect(normalizeTagsFilter('AI, Экономика')).toEqual(['ai', 'экономика']);
    });

    it('normalizes array tags', () => {
      expect(normalizeTagsFilter([' Sport ', 'Health'])).toEqual(['sport', 'health']);
    });

    it('returns undefined for empty input', () => {
      expect(normalizeTagsFilter(undefined)).toBeUndefined();
      expect(normalizeTagsFilter(' , ')).toBeUndefined();
    });
  });

  describe('resolveSortColumn', () => {
    it('falls back to publishedAt for unknown column', () => {
      expect(resolveSortColumn('invalid')).toBe('publishedAt');
    });

    it('keeps allowed sort columns', () => {
      expect(resolveSortColumn('views')).toBe('views');
    });
  });
});
