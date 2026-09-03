import { apiClient } from '@/api/client';
import type { AutoGenerateResponse, CronScheduleResponse } from '@news-portal/types/ai';

export type { AutoGenerateResponse, CronScheduleResponse };

const AI_REQUEST_TIMEOUT_MS = 600_000;

export const aiService = {
  async autoGenerate(countPerCategory = 1): Promise<AutoGenerateResponse> {
    const response = await apiClient.post<AutoGenerateResponse>('/ai/auto-generate', { countPerCategory }, { timeout: AI_REQUEST_TIMEOUT_MS });
    return response.data;
  },

  async getCronSchedule(): Promise<CronScheduleResponse> {
    const response = await apiClient.get<CronScheduleResponse>('/ai/cron');
    return response.data;
  },

  async updateCronSchedule(cron: string): Promise<CronScheduleResponse> {
    const response = await apiClient.put<CronScheduleResponse>('/ai/cron', { cron });
    return response.data;
  }
};
