import api from './api';
import type { News, NewsResponse } from '@/types';

export const newsService = {
  async getNews(params?: Record<string, string | number>): Promise<NewsResponse> {
    const response = await api.get<NewsResponse>('/news', {
      params: { limit: 12, sortBy: 'publishedAt', sortOrder: 'DESC', ...params },
    });
    return response.data;
  },

  async getNewsById(id: string): Promise<News> {
    const response = await api.get<News>(`/news/${id}`);
    return response.data;
  },

  async toggleLike(id: string): Promise<{ liked: boolean; likes: number }> {
    const response = await api.post(`/news/${id}/like`);
    return response.data;
  },

  async toggleFavorite(id: string): Promise<{ favorited: boolean }> {
    const response = await api.post(`/news/${id}/favorite`);
    return response.data;
  },

  async isLiked(id: string): Promise<boolean> {
    const response = await api.get(`/news/${id}/like/check`);
    return response.data.liked;
  },

  async isFavorited(id: string): Promise<boolean> {
    const response = await api.get(`/news/${id}/favorite/check`);
    return response.data.favorited;
  },

  async getFavorites(): Promise<NewsResponse> {
    const response = await api.get<NewsResponse>('/news/favorites');
    return response.data;
  },

  async updateNews(id: string, data: Partial<News>): Promise<News> {
    const response = await api.put<News>(`/news/${id}`, data);
    return response.data;
  },

  async deleteNews(id: string): Promise<void> {
    await api.delete(`/news/${id}`);
  },

  async moderateNews(id: string, status: string): Promise<News> {
    const response = await api.patch<News>(`/news/${id}/moderate`, { status });
    return response.data;
  },
};
