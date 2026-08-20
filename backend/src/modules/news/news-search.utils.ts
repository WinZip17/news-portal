const SORTABLE_COLUMNS = new Set(['publishedAt', 'views', 'likes', 'createdAt']);

export function normalizeTagsFilter(tags?: string | string[]): string[] | undefined {
  if (!tags) return undefined;

  const list = (Array.isArray(tags) ? tags : tags.split(',')).map((tag) => tag.trim().toLowerCase()).filter(Boolean);

  return list.length > 0 ? list : undefined;
}

export function resolveSortColumn(sortBy?: string): 'publishedAt' | 'views' | 'likes' | 'createdAt' {
  if (sortBy && SORTABLE_COLUMNS.has(sortBy)) {
    return sortBy as 'publishedAt' | 'views' | 'likes' | 'createdAt';
  }
  return 'publishedAt';
}
