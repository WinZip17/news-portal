import { apiClient } from '@/api/client';
import type { News, NewsFilter, NewsResponse, NewsStats } from '@/types/news';

export const newsService = {
  async getNews(filters?: NewsFilter): Promise<NewsResponse> {
    const response = await apiClient.get<NewsResponse>('/news', { params: filters });
    return response.data;
  },

  async getNewsById(id: string): Promise<News> {
    const response = await apiClient.get<News>(`/news/${id}`);
    return response.data;
  },

  async getStats(): Promise<NewsStats> {
    const response = await apiClient.get<NewsStats>('/news/stats');
    return response.data;
  },

  async toggleLike(id: string): Promise<{ liked: boolean; likes: number }> {
    const response = await apiClient.post<{ liked: boolean; likes: number }>(`/news/${id}/like`);
    return response.data;
  },

  async isLiked(id: string): Promise<boolean> {
    const response = await apiClient.get<{ liked: boolean }>(`/news/${id}/like/check`);
    return response.data.liked;
  },

  async toggleFavorite(id: string): Promise<{ favorited: boolean }> {
    const response = await apiClient.post<{ favorited: boolean }>(`/news/${id}/favorite`);
    return response.data;
  },

  async isFavorited(id: string): Promise<boolean> {
    const response = await apiClient.get<{ favorited: boolean }>(`/news/${id}/favorite/check`);
    return response.data.favorited;
  },

  async getFavorites(page = 1, limit = 20): Promise<NewsResponse> {
    const response = await apiClient.get<NewsResponse>('/news/favorites', { params: { page, limit } });
    return response.data;
  }
};
