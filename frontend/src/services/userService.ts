import { apiService } from './api';
import { User } from "@/types";


export const userService = {
  async getUsers(page = 1, limit = 20): Promise<{ data: User[], total: number }> {
    const response = await apiService.get<{ data: User[], total: number }>('/auth/users', { params: { page, limit } });
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiService.put<User>(`/auth/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiService.delete(`/auth/users/${id}`);
  },
};