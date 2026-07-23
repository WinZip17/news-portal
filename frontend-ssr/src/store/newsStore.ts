import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';
import api from '../services/api';
import type { News, NewsResponse } from '../types';

export interface NewsState {
  news: News[];
  total: number;
  loading: boolean;
  fetchNews: (params?: Record<string, string | number>) => Promise<void>;
  hydrate: (data: NewsResponse) => void;
}

export type NewsStore = StoreApi<NewsState>;

export const createNewsStore = (
  initialState?: Partial<Pick<NewsState, 'news' | 'total' | 'loading'>>,
): NewsStore =>
  createStore<NewsState>()((set) => ({
    news: initialState?.news ?? [],
    total: initialState?.total ?? 0,
    loading: initialState?.loading ?? false,

    fetchNews: async (params = {}) => {
      set({ loading: true });
      try {
        const res = await api.get<NewsResponse>('/news', {
          params: {
            limit: 12,
            sortBy: 'publishedAt',
            sortOrder: 'DESC',
            ...params,
          },
        });

        set({
          news: res.data.data ?? [],
          total: res.data.total ?? 0,
          loading: false,
        });
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    hydrate: (data: NewsResponse) => {
      set({
        news: data.data ?? [],
        total: data.total ?? 0,
        loading: false,
      });
    },
  }));
