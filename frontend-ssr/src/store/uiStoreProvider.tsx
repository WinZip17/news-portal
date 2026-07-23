import React, { createContext, useContext, useState } from 'react';
import { useStore } from 'zustand';
import type { ReactNode } from 'react';
import { createUIStore, type UIState, type UIStore } from './uiStore';

const UIStoreContext = createContext<UIStore | null>(null);

export const UIStoreProvider: React.FC<{
  children: ReactNode;
  store?: UIStore;
}> = ({ children, store }) => {
  const [storeInstance] = useState(() => store ?? createUIStore());
  return (
    <UIStoreContext.Provider value={storeInstance}>
      {children}
    </UIStoreContext.Provider>
  );
};

function useUIStoreContext() {
  const store = useContext(UIStoreContext);
  if (!store) throw new Error('useUIStore must be used within UIStoreProvider');
  return store;
}

export function useUIStore<T>(selector: (state: UIState) => T): T {
  return useStore(useUIStoreContext(), selector);
}
