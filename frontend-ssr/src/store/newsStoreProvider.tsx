import React, { createContext, useContext, useState } from 'react';
import { useStore } from 'zustand';
import type { ReactNode } from 'react';
import { createNewsStore, type NewsState, type NewsStore } from './newsStore';

const NewsStoreContext = createContext<NewsStore | null>(null);

type ProviderProps = {
  children: ReactNode;
  store?: NewsStore;
  initialState?: Partial<Pick<NewsState, 'news' | 'total' | 'loading'>>;
};

export const NewsStoreProvider: React.FC<ProviderProps> = ({
  children,
  store,
  initialState,
}) => {
  const [storeInstance] = useState<NewsStore>(() => {
    return store ?? createNewsStore(initialState);
  });

  return (
    <NewsStoreContext.Provider value={storeInstance}>
      {children}
    </NewsStoreContext.Provider>
  );
};

function useNewsStoreContext() {
  const store = useContext(NewsStoreContext);
  if (!store) {
    throw new Error('useNewsStore must be used within NewsStoreProvider');
  }
  return store;
}

export function useNewsStore<T>(selector: (state: NewsState) => T): T {
  const store = useNewsStoreContext();
  return useStore(store, selector);
}

export function useNewsStoreApi(): NewsStore {
  return useNewsStoreContext();
}
