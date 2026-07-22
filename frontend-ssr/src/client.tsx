import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useNewsStore } from './store/newsStore';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
const initialData = (window as any).__INITIAL_DATA__;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (initialData?.news?.length) {
  useNewsStore.getState().hydrate(initialData);
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
