import axios from 'axios';

const isBrowser = () => typeof window !== 'undefined';
const api = axios.create({
  baseURL: isBrowser() ? '/api' : 'http://localhost:3001/api',
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
