import { apiClient } from '@/api/client';
import type { User, UsersResponse } from '@news-portal/types/auth';

export const userService = {
  async getUsers(page = 1, limit = 20): Promise<UsersResponse> {
    const response = await apiClient.get<UsersResponse>('/auth/users', { params: { page, limit } });
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`/auth/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/auth/users/${id}`);
  }
};
