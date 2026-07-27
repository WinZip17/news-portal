import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css';
// eslint-disable-next-line react-refresh/only-export-components
const App = lazy(() => import('./App'));

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
