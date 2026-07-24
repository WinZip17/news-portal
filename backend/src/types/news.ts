import type { NewsCategory, NewsStatus } from './enums';

export interface NewsFilter {
  page?: number;
  limit?: number;
  category?: NewsCategory;
  status?: NewsStatus;
  search?: string;
  tags?: string[];
  fromDate?: string;
  toDate?: string;
  sortBy?: 'publishedAt' | 'views' | 'likes';
  sortOrder?: 'ASC' | 'DESC';
  isAiGenerated?: boolean;
  authorId?: string;
}

export interface ModerationBody {
  status: NewsStatus;
  comment?: string;
}

export interface AiRewriteResult {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
}

// RSS
export interface RssFeedItem {
  title?: string;
  'content:encoded'?: string;
  content?: string;
  description?: string;
  contentSnippet?: string;
  link?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  enclosure?: { url: string };
  'media:content'?: { url: string };
  categories?: string[];
}

export interface RssArticle {
  title: string;
  content: string;
  summary: string;
  link: string;
  pubDate: Date;
  source: string;
  author: string;
  imageUrl: string;
  categories: string[];
}
