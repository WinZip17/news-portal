import React, { createContext, useContext, useState } from 'react';
import { useStore } from 'zustand';
import type { ReactNode } from 'react';
import { createUserStore, type UserState, type UserStore } from './userStore';

const UserStoreContext = createContext<UserStore | null>(null);

export const UserStoreProvider: React.FC<{
  children: ReactNode;
  store?: UserStore;
}> = ({ children, store }) => {
  const [storeInstance] = useState(() => store ?? createUserStore());
  return (
    <UserStoreContext.Provider value={storeInstance}>
      {children}
    </UserStoreContext.Provider>
  );
};

function useUserStoreContext() {
  const store = useContext(UserStoreContext);
  if (!store)
    throw new Error('useUserStore must be used within UserStoreProvider');
  return store;
}

export function useUserStore<T>(selector: (state: UserState) => T): T {
  return useStore(useUserStoreContext(), selector);
}
