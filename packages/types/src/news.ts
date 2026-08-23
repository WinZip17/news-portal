import type { User } from './auth';
import type { NewsCategory, NewsStatus } from './enums';

export { NewsCategory, NewsStatus } from './enums';

export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  source?: string;
  sourceUrl?: string;
  author?: User;
  authorId?: string;
  category: NewsCategory;
  tags: string[];
  status: NewsStatus;
  isAiGenerated: boolean;
  views: number;
  likes: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
  isLiked?: boolean;
  isFavorite?: boolean;
}

/** Alias for Nuxt naming */
export type NewsItem = News;

export interface NewsFilter {
  category?: NewsCategory;
  status?: NewsStatus;
  tags?: string[];
  search?: string;
  /** Alternate spellings (Latin/Cyrillic) for smart search — OR within the matching term */
  searchVariants?: string[];
  fromDate?: string;
  toDate?: string;
  isAiGenerated?: boolean;
  authorId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'views' | 'likes' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ModerationBody {
  status: NewsStatus;
  comment?: string;
}

export interface CreateNewsDto {
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  source?: string;
  sourceUrl?: string;
  category: NewsCategory;
  tags?: string[];
  isAiGenerated?: boolean;
}

export interface NewsResponse {
  data: News[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SmartSearchRequest {
  query: string;
  page?: number;
  limit?: number;
}

export interface SmartSearchResponse extends NewsResponse {
  appliedFilters: NewsFilter;
  source: 'ai' | 'fallback';
}

export interface NewsStats {
  newsToday: number;
  totalUsers: number;
  totalAiNews: number;
  pendingNews: number;
  newsLastHour: number;
  activeSources: number;
  totalNews: number;
  totalViews: number;
  categoriesCount: number;
}

/** Alias for Nuxt naming */
export type StatsResponse = NewsStats;
