import api from './api';

export const newsService = {
  async fetchInitialData() {
    try {
      const response = await api.get('/news', {
        params: { limit: 12, sortBy: 'publishedAt', sortOrder: 'DESC' },
      });
      return { news: response.data.data, total: response.data.total };
    } catch {
      return { news: [], total: 0 };
    }
  },
};
