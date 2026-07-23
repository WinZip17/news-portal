import api from './api';
import { User } from '@/types';
import { AxiosError } from 'axios';
import { AuthResponse } from 'frontend/src/types';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      return response.data;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || 'Ошибка входа';
        throw new Error(message);
      }
      throw err;
    }
  },

  async register(data: { email: string; username: string; password: string }): Promise<void> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || 'Ошибка регистрации';
        throw new Error(message);
      }
      throw err;
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: Record<string, string>) {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  async updatePreferences(preferences: Record<string, unknown>) {
    const response = await api.put('/auth/preferences', preferences);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await api.post('/auth/change-password', data);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || 'Ошибка смены пароля';
        throw new Error(message);
      }
      throw err;
    }
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/auth/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/auth/users/${id}`);
  },
};
