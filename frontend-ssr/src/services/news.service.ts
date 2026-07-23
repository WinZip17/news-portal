import api from './api';
import type { News, NewsResponse } from '../types';

export const newsService = {
  async fetchInitialData(): Promise<NewsResponse> {
    try {
      return await newsService.fetchList();
    } catch {
      return { data: [], total: 0, page: 0, limit: 0, totalPages: 0 };
    }
  },

  async fetchList(
    params?: Record<string, string | number>,
  ): Promise<NewsResponse> {
    const response = await api.get<NewsResponse>('/news', {
      params: {
        limit: 12,
        sortBy: 'publishedAt',
        sortOrder: 'DESC',
        ...params,
      },
    });
    return response.data;
  },

  async fetchById(id: string): Promise<News> {
    const response = await api.get<News>(`/news/${id}`);
    return response.data;
  },

  async fetchFavorites(): Promise<NewsResponse> {
    const response = await api.get<NewsResponse>('/news/favorites');
    return response.data;
  },

  async isLiked(newsId: string): Promise<boolean> {
    const response = await api.get<{ liked: boolean }>(
      `/news/${newsId}/like/check`,
    );
    return response.data.liked;
  },

  async toggleLike(newsId: string): Promise<{ liked: boolean; likes: number }> {
    const response = await api.post<{ liked: boolean; likes: number }>(
      `/news/${newsId}/like`,
    );
    return response.data;
  },

  async isFavorited(newsId: string): Promise<boolean> {
    const response = await api.get<{ favorited: boolean }>(
      `/news/${newsId}/favorite/check`,
    );
    return response.data.favorited;
  },

  async toggleFavorite(newsId: string): Promise<{ favorited: boolean }> {
    const response = await api.post<{ favorited: boolean }>(
      `/news/${newsId}/favorite`,
    );
    return response.data;
  },
};
