import React, { type ReactNode } from 'react';
import { NewsStoreProvider } from './newsStoreProvider';
import { UIStoreProvider } from './uiStoreProvider';
import { UserStoreProvider } from './userStoreProvider';
import type { NewsStore } from './newsStore';
import type { UIStore } from './uiStore';
import type { UserStore } from './userStore';

type AppProvidersProps = {
  children: ReactNode;
  newsStore?: NewsStore;
  uiStore?: UIStore;
  userStore?: UserStore;
};

export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  newsStore,
  uiStore,
  userStore,
}) => {
  return (
    <NewsStoreProvider store={newsStore}>
      <UIStoreProvider store={uiStore}>
        <UserStoreProvider store={userStore}>{children}</UserStoreProvider>
      </UIStoreProvider>
    </NewsStoreProvider>
  );
};
