import type { UserRole } from './enums';

export interface UserPreferences {
  categories: string[];
  tags: string[];
  language: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  theme: 'light' | 'dark';
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

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface RequestWithUser {
  user: { id: string };
}