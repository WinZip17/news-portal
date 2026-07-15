import { apiService } from './api';
import { News, NewsFilter, NewsResponse } from '../types/news';

export const newsService = {
    async getNews(filters?: NewsFilter): Promise<NewsResponse> {
        const response = await apiService.get<NewsResponse>('/news', {
            params: filters,
        });
        return response.data;
    },

    async getNewsById(id: string): Promise<News> {
        const response = await apiService.get<News>(`/news/${id}`);
        return response.data;
    },

    async createNews(data: Partial<News>): Promise<News> {
        const response = await apiService.post<News>('/news', data);
        return response.data;
    },

    async updateNews(id: string, data: Partial<News>): Promise<News> {
        const response = await apiService.put<News>(`/news/${id}`, data);
        return response.data;
    },

    async deleteNews(id: string): Promise<void> {
        await apiService.delete(`/news/${id}`);
    },

    async moderateNews(id: string, status: string): Promise<News> {
        const response = await apiService.patch<News>(`/news/${id}/moderate`, {
            status,
        });
        return response.data;
    },

    async likeNews(id: string): Promise<News> {
        const response = await apiService.post<News>(`/news/${id}/like`);
        return response.data;
    },

    async getPersonalizedNews(preferences: string[]): Promise<NewsResponse> {
        const response = await apiService.post<NewsResponse>('/news/personalized', {
            preferences,
        });
        return response.data;
    },
};