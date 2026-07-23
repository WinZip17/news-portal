import api from './api';
import { User } from '../types';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async register(data: RegisterData): Promise<void> {
    await api.post('/auth/register', data);
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async updateProfile(data: ProfileData): Promise<User> {
    const response = await api.put<User>('/auth/profile', data);
    return response.data;
  },

  async updatePreferences(preferences: Record<string, unknown>): Promise<User> {
    const response = await api.put<User>('/auth/preferences', preferences);
    return response.data;
  },

  async changePassword(data: PasswordData): Promise<void> {
    await api.post('/auth/change-password', data);
  },
};
