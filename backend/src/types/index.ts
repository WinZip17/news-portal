export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  preferences: UserPreferences;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse extends TokenResponse {
  user: UserResponse;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface UserPreferences {
  categories: string[];
  tags: string[];
  language: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  theme: 'light' | 'dark';
}

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

export interface AiRewriteResult {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

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

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser {
  user: { id: string };
}

export interface ModerationBody {
  status: NewsStatus;
  comment?: string;
}

export enum NewsCategory {
  POLITICS = 'politics',
  ECONOMY = 'economy',
  TECHNOLOGY = 'technology',
  SCIENCE = 'science',
  SPORTS = 'sports',
  ENTERTAINMENT = 'entertainment',
  HEALTH = 'health',
  WORLD = 'world',
  OTHER = 'other',
}

export enum NewsStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
