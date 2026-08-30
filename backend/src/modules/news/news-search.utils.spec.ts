import {
  buildFtsSearchCondition,
  buildNewsDateRangeSql,
  buildSearchWordGroups,
  getExclusiveCalendarEndDate,
  getWordSearchVariants,
  normalizeTagsFilter,
  parseCalendarDate,
  resolveSortColumn,
} from './news-search.utils';

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

  describe('parseCalendarDate', () => {
    it('parses YYYY-MM-DD start of day in UTC', () => {
      expect(parseCalendarDate('2026-03-01', 'start')?.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    });

    it('parses YYYY-MM-DD end of day in UTC', () => {
      expect(parseCalendarDate('2026-03-13', 'end')?.toISOString()).toBe('2026-03-13T23:59:59.999Z');
    });

    it('rejects invalid calendar dates', () => {
      expect(parseCalendarDate('2026-02-30', 'start')).toBeNull();
      expect(parseCalendarDate('2026/03/01', 'start')).toBeNull();
      expect(parseCalendarDate('2026-03-01T00:00:00.000Z', 'start')).toBeNull();
    });
  });

  describe('buildNewsDateRangeSql', () => {
    it('builds inclusive calendar range for PostgreSQL', () => {
      const range = buildNewsDateRangeSql('2026-08-02', '2026-09-13');

      expect(range).toEqual([
        {
          sql: 'news.publishedAt >= CAST(:fromDate AS date)',
          params: { fromDate: '2026-08-02' },
        },
        {
          sql: 'news.publishedAt < CAST(:toDateExclusive AS date)',
          params: { toDateExclusive: '2026-09-14' },
        },
      ]);
    });

    it('supports single-sided filters', () => {
      expect(buildNewsDateRangeSql('2026-08-02', undefined)).toEqual([
        {
          sql: 'news.publishedAt >= CAST(:fromDate AS date)',
          params: { fromDate: '2026-08-02' },
        },
      ]);
      expect(buildNewsDateRangeSql(undefined, '2026-09-13')[0]?.params.toDateExclusive).toBe('2026-09-14');
    });

    it('includes news published on the last day of range', () => {
      expect(getExclusiveCalendarEndDate('2026-09-13')).toBe('2026-09-14');
    });
  });

  describe('getWordSearchVariants', () => {
    it('expands Ozon brand aliases from Cyrillic input', () => {
      const variants = getWordSearchVariants('Озон');
      expect(variants).toEqual(expect.arrayContaining(['Озон', 'ozon']));
    });

    it('expands Ozon brand aliases from Latin input', () => {
      const variants = getWordSearchVariants('Ozon');
      expect(variants).toEqual(expect.arrayContaining(['Ozon', 'озон']));
    });

    it('transliterates generic Cyrillic words', () => {
      expect(getWordSearchVariants('тест')).toEqual(expect.arrayContaining(['тест', 'test']));
    });
  });

  describe('buildSearchWordGroups', () => {
    it('merges AI variants into a single-word query', () => {
      expect(buildSearchWordGroups('озон', ['Ozon', 'ozon'])).toEqual([['озон', 'ozon']]);
    });

    it('keeps separate AND groups for multi-word queries', () => {
      const groups = buildSearchWordGroups('маркетплейс озон', ['Ozon']);
      expect(groups).toHaveLength(2);
      expect(groups[1]).toEqual(expect.arrayContaining(['озон', 'ozon']));
    });
  });

  describe('buildFtsSearchCondition', () => {
    it('builds OR variants and AND word groups for SQL', () => {
      const condition = buildFtsSearchCondition('озон', ['Ozon']);

      expect(condition).not.toBeNull();
      expect(condition?.sql).toContain("plainto_tsquery('russian'");
      expect(condition?.sql).toContain("plainto_tsquery('simple'");
      expect(condition?.sql).toContain(' OR ');
      expect(Object.values(condition?.params ?? {})).toEqual(expect.arrayContaining(['озон', 'ozon']));
    });

    it('returns null for empty search', () => {
      expect(buildFtsSearchCondition('   ')).toBeNull();
    });
  });
});
