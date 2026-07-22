import axios from 'axios';

const isServer = typeof window === 'undefined';

const api = axios.create({
  baseURL: isServer ? 'http://localhost:3001/api' : '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Добавление токена на клиенте
if (!isServer) {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export default api;
