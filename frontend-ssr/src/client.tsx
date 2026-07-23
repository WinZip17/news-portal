import './index.css';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProviders } from './store/AppProviders';
import { createAppStores } from './store/createAppStores';
import type { NewsResponse } from './types';

declare global {
  interface Window {
    __INITIAL_DATA__?: NewsResponse;
  }
}

const initialData = window.__INITIAL_DATA__;
const { newsStore, uiStore, userStore } = createAppStores(initialData);

const container = document.getElementById('root');

if (container) {
  hydrateRoot(
    container,
    <BrowserRouter>
      <AppProviders
        newsStore={newsStore}
        uiStore={uiStore}
        userStore={userStore}
      >
        <App />
      </AppProviders>
    </BrowserRouter>,
  );
}
