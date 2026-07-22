// Общие типы для API ответов
import { NewsCategory, NewsStatus } from '../entities';

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
