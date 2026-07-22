import { apiService } from './api';

export const aiService = {
  async autoGenerate(countPerCategory: number = 1): Promise<{ totalGenerated: number; byCategory: Record<string, number> }> {
    const response = await apiService.post<{ totalGenerated: number; byCategory: Record<string, number> }>('/ai/auto-generate', { countPerCategory });
    return response.data;
  },
};
