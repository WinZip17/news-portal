import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '@/store';
import { logout, setTokens } from '@/store';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

class ApiService {
  private api: AxiosInstance;
  private refreshTokenPromise: Promise<TokenResponse> | null = null;

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
    this.api.interceptors.request.use(
      (config) => {
        const state = store.getState();
        const token = state.auth.accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/refresh')
        ) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (!this.refreshTokenPromise) {
            const state = store.getState();
            const refreshToken = state.auth.refreshToken;

            if (refreshToken) {
              this.refreshTokenPromise = this.refreshAccessToken(refreshToken).finally(() => {
                this.refreshTokenPromise = null;
              });
            }
          }

          try {
            const response = await this.refreshTokenPromise;
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return this.api(originalRequest);
          } catch {
            store.dispatch(logout());
            window.location.href = '/login';
            return Promise.reject(new Error('Token refresh failed'));
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const response = await axios.post<TokenResponse>('/api/auth/refresh', { refreshToken });

    store.dispatch(
      setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }),
    );

    return response.data;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }
  async postAi<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, {
      timeout: 600000, // 10 минут для AI генерации
    });
  }
}

export const apiService = new ApiService();
