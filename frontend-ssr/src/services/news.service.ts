import api from './api';
import { NewsResponse } from '../types';

export const newsService = {
  async fetchInitialData() {
    try {
      const response = await api.get<NewsResponse>('/news', {
        params: { limit: 12, sortBy: 'publishedAt', sortOrder: 'DESC' },
      });
      console.log('fetchInitialData response', Object.keys(response.data));
      return response.data;
    } catch {
      console.log('fetchInitialData error');
      return {
        data: [],
        total: 0,
        page: 0,
        limit: 0,
        totalPages: 0,
      };
    }
  },
};
