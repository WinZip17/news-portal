import { NewsCategory, NewsStatus } from '../../types';
import { sanitizeNewsFilter } from './parse-news-filter';

describe('parse-news-filter', () => {
  it('sanitizes valid AI output', () => {
    const filter = sanitizeNewsFilter(
      {
        search: 'инфляция',
        category: NewsCategory.ECONOMY,
        tags: ['цены', ''],
        fromDate: '2026-03-01T00:00:00.000Z',
        toDate: '2026-03-13T23:59:59.999Z',
        isAiGenerated: true,
        sortBy: 'views',
        sortOrder: 'DESC',
        status: NewsStatus.DRAFT,
        authorId: 'hack',
      },
      'fallback',
    );

    expect(filter.status).toBe(NewsStatus.PUBLISHED);
    expect(filter.search).toBe('инфляция');
    expect(filter.category).toBe(NewsCategory.ECONOMY);
    expect(filter.tags).toEqual(['цены']);
    expect(filter.isAiGenerated).toBe(true);
    expect(filter.sortBy).toBe('views');
    expect(filter.sortOrder).toBe('DESC');
    expect(filter.fromDate).toBe('2026-03-01');
    expect(filter.toDate).toBe('2026-03-13');
    expect(filter).not.toHaveProperty('authorId');
  });

  it('uses fallback search when AI output is empty', () => {
    const filter = sanitizeNewsFilter({}, 'технологии за неделю');
    expect(filter.search).toBe('технологии за неделю');
  });

  it('drops invalid category and dates', () => {
    const filter = sanitizeNewsFilter({
      category: 'hacking',
      fromDate: 'not-a-date',
      sortBy: 'password',
    });

    expect(filter.category).toBeUndefined();
    expect(filter.fromDate).toBeUndefined();
    expect(filter.sortBy).toBeUndefined();
  });

  it('accepts calendar dates in YYYY-MM-DD format', () => {
    const filter = sanitizeNewsFilter({
      fromDate: '2026-08-01',
      toDate: '2026-08-20',
    });

    expect(filter.fromDate).toBe('2026-08-01');
    expect(filter.toDate).toBe('2026-08-20');
  });

  it('keeps searchVariants for bilingual smart search', () => {
    const filter = sanitizeNewsFilter({
      search: 'озон',
      searchVariants: ['Ozon', 'ozon', ''],
    });

    expect(filter.search).toBe('озон');
    expect(filter.searchVariants).toEqual(['Ozon', 'ozon']);
  });
});
