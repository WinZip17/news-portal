import { create } from 'zustand';
import api from '../services/api';
export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  category: string;
  tags?: string[];
  isAiGenerated: boolean;
  views: number;
  likes: number;
  source?: string;
  sourceUrl?: string;
  author?: string;
  publishedAt: string;
}
interface NewsState {
  news: News[];
  total: number;
  loading: boolean;
  fetchNews: (params?: Record<string, string | number>) => Promise<void>;
  hydrate: (data: { news: News[]; total: number }) => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  news: [],
  total: 0,
  loading: false,

  fetchNews: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/news', {
        params: {
          limit: 12,
          sortBy: 'publishedAt',
          sortOrder: 'DESC',
          ...params,
        },
      });
      set({ news: res.data.data, total: res.data.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  hydrate: (data) => {
    set({ news: data.news, total: data.total, loading: false });
  },
}));
