import { NewsCategory, NewsFilter, NewsStatus } from '../../types';

const VALID_CATEGORIES = new Set<string>(Object.values(NewsCategory));
const VALID_SORT_COLUMNS = new Set<string>(['publishedAt', 'views', 'likes', 'createdAt']);

function isValidIsoDate(value: string): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function normalizeStringArray(value: unknown, maxItems: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const items = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);

  return items.length > 0 ? items : undefined;
}

/** Whitelist LLM output into a safe NewsFilter for findAll. */
export function sanitizeNewsFilter(raw: unknown, fallbackSearch?: string): NewsFilter {
  const input = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const filter: NewsFilter = { status: NewsStatus.PUBLISHED };

  const search = typeof input.search === 'string' && input.search.trim() ? input.search.trim().slice(0, 200) : fallbackSearch?.trim().slice(0, 200);

  if (search) {
    filter.search = search;
  }

  if (typeof input.category === 'string' && VALID_CATEGORIES.has(input.category)) {
    filter.category = input.category as NewsCategory;
  }

  const tags = normalizeStringArray(input.tags, 5);
  if (tags) {
    filter.tags = tags;
  }

  const searchVariants = normalizeStringArray(input.searchVariants, 10);
  if (searchVariants) {
    filter.searchVariants = searchVariants;
  }

  if (typeof input.fromDate === 'string' && isValidIsoDate(input.fromDate)) {
    filter.fromDate = new Date(input.fromDate).toISOString();
  }

  if (typeof input.toDate === 'string' && isValidIsoDate(input.toDate)) {
    filter.toDate = new Date(input.toDate).toISOString();
  }

  if (typeof input.isAiGenerated === 'boolean') {
    filter.isAiGenerated = input.isAiGenerated;
  }

  if (typeof input.sortBy === 'string' && VALID_SORT_COLUMNS.has(input.sortBy)) {
    filter.sortBy = input.sortBy as NewsFilter['sortBy'];
  }

  if (input.sortOrder === 'ASC' || input.sortOrder === 'DESC') {
    filter.sortOrder = input.sortOrder;
  }

  return filter;
}
