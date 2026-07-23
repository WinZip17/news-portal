import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { createNewsStore } from './store/newsStore';
import { NewsStoreProvider } from './store/newsStoreProvider';
import type { NewsResponse } from './types';

declare global {
  interface Window {
    __INITIAL_DATA__?: NewsResponse;
  }
}

const initialData = window.__INITIAL_DATA__;

const store = createNewsStore({
  news: initialData?.data ?? [],
  total: initialData?.total ?? 0,
  loading: false,
});

const container = document.getElementById('root');

if (container) {
  hydrateRoot(
    container,
    <BrowserRouter>
      <NewsStoreProvider store={store}>
        <App />
      </NewsStoreProvider>
    </BrowserRouter>,
  );
}