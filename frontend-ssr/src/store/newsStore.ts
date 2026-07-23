import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';
import { newsService } from '../services/news.service';
import type { News } from '../types';

export interface NewsState {
  news: News[];
  total: number;
  loading: boolean;
  fetchNews: (params?: Record<string, string | number>) => Promise<void>;
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
        const data = await newsService.fetchList(params);
        set({ news: data.data ?? [], total: data.total ?? 0, loading: false });
      } catch {
        set({ loading: false });
      }
    },
  }));
