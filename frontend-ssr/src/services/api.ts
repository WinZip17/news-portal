import axios from 'axios';
import { isBrowser } from '../utils/isBrowser';

const baseURL =
  process.env.NODE_ENV !== 'development' && !isBrowser()
    ? 'http://localhost:3001/api'
    : '/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Добавление токена на клиенте
if (isBrowser()) {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export default api;
