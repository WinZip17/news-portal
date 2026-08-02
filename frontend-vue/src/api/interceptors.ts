import { apiClient } from './client';
import { useAuthStore } from '@/stores/auth';

export function setupInterceptors() {
  let isRefreshing = false;
  let refreshPromise: Promise<string> | null = null;

  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const url = originalRequest?.url || '';
      if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = localStorage.getItem('refreshToken');

          if (refreshToken) {
            refreshPromise = apiClient
              .post('/auth/refresh', { refreshToken })
              .then((res) => {
                const { accessToken, refreshToken: newRefreshToken } = res.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                return accessToken;
              })
              .catch(() => {
                const authStore = useAuthStore();
                authStore.logout();
                window.location.href = '/login';
                return Promise.reject(error);
              })
              .finally(() => {
                isRefreshing = false;
                refreshPromise = null;
              });
          } else {
            isRefreshing = false;
            const authStore = useAuthStore();
            authStore.logout();
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }

        try {
          const accessToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch {
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );
}
