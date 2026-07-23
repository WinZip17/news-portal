import axios from 'axios';
import { isBrowser } from '../utils/isBrowser';

const getBaseUrl = () => {
  if (isBrowser()) return '/api';
  if (process.env.NODE_ENV === 'development')
    return 'http://localhost:3001/api';
  // На сервере в Docker используем имя сервиса
  return 'http://backend:3001/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
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
