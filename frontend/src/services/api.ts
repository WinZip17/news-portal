import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '@/store';
import { logout, setTokens } from '@/store';

class ApiService {
  private api: AxiosInstance;
  private refreshTokenPromise: Promise<any> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const state = store.getState();
        const token = state.auth.accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Не пытаемся обновить токен для запросов логина и регистрации
        if (originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/refresh')) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (!this.refreshTokenPromise) {
            const state = store.getState();
            const refreshToken = state.auth.refreshToken;

            if (refreshToken) {
              this.refreshTokenPromise = this.refreshAccessToken(refreshToken)
                .finally(() => {
                  this.refreshTokenPromise = null;
                });
            }
          }

          try {
            const response = await this.refreshTokenPromise;
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            store.dispatch(logout());
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(refreshToken: string) {
    try {
      const response = await axios.post('/api/auth/refresh', {
        refreshToken,
      });

      store.dispatch(setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }));

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }
}

export const apiService = new ApiService();