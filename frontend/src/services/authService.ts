import { apiService } from './api';
import { AuthResponse, LoginCredentials, RegisterData, User, UserPreferences } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiService.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>('/auth/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<User>('/auth/profile', data);
    return response.data;
  },

  async updatePreferences(preferences: UserPreferences): Promise<User> {
    const response = await apiService.put<User>('/auth/preferences', preferences);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },
};
