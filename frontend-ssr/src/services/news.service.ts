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

  async toggleFavorite(newsId: string): Promise<void> {
    await api.post(`/news/${newsId}/favorite`);
  },
};
