import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useNewsStore } from './store/newsStore';
import type { NewsResponse } from './types';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
const initialData: NewsResponse = (window as any).__INITIAL_DATA__;

if (initialData?.data?.length) {
  useNewsStore.getState().hydrate(initialData);
}
console.log('initialData', initialData);
const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
