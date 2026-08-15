import type { NewsFilter } from '@/types';
import { getCategoryLabel } from '@/utils/getCategoryLabel';

export function formatAppliedFilters(filters: NewsFilter): string {
  const parts: string[] = [];
  if (filters.search) parts.push(`поиск: «${filters.search}»`);
  if (filters.category) parts.push(getCategoryLabel(filters.category));
  if (filters.tags?.length) parts.push(`теги: ${filters.tags.join(', ')}`);
  if (filters.isAiGenerated === true) parts.push('только AI');
  if (filters.isAiGenerated === false) parts.push('без AI');
  if (filters.fromDate || filters.toDate) parts.push('за период');
  return parts.join(' · ');
}
