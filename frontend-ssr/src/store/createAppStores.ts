import { createNewsStore } from './newsStore';
import { createUIStore } from './uiStore';
import { createUserStore } from './userStore';
import type { NewsResponse } from '../types';

export const createAppStores = (initialNewsData?: NewsResponse) => {
  const newsStore = createNewsStore({
    news: initialNewsData?.data ?? [],
    total: initialNewsData?.total ?? 0,
    loading: false,
  });

  const uiStore = createUIStore();
  const userStore = createUserStore();

  return {
    newsStore,
    uiStore,
    userStore,
  };
};
