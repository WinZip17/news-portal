import { apiService } from './api';
import { News, NewsFilter, NewsResponse, NewsStats } from '@/types';

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

  async getStats(): Promise<NewsStats> {
    const response = await apiService.get<NewsStats>('/news/stats');
    return response.data;
  },

  async toggleFavorite(id: string): Promise<{ favorited: boolean }> {
    const response = await apiService.post<{ favorited: boolean }>(`/news/${id}/favorite`);
    return response.data;
  },

  async isFavorited(id: string): Promise<boolean> {
    const response = await apiService.get<{ favorited: boolean }>(`/news/${id}/favorite/check`);
    return response.data.favorited;
  },

  async getFavorites(page = 1, limit = 20): Promise<NewsResponse> {
    const response = await apiService.get<NewsResponse>('/news/favorites', { params: { page, limit } });
    return response.data;
  },

  async toggleLike(id: string): Promise<{ liked: boolean; likes: number }> {
    const response = await apiService.post<{ liked: boolean; likes: number }>(`/news/${id}/like`);
    console.log('Toggle like response:', response); // Добавьте для отладки
    return response.data;
  },

  async isLiked(id: string): Promise<boolean> {
    const response = await apiService.get<{ liked: boolean }>(`/news/${id}/like/check`);
    return response.data.liked;
  },
};