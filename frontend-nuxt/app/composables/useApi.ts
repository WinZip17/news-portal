import { useStorage } from '@vueuse/core';

export function useApi() {
  const accessToken = useStorage<string | null>('accessToken', null);
  const refreshTokenValue = useStorage<string | null>('refreshToken', null);

  const config = useRuntimeConfig();
  const API_BASE = config.public.apiBase as string;

  async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (accessToken.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`;
    }

    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && refreshTokenValue.value) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${accessToken.value}`;
        const retryResponse = await fetch(`${API_BASE}${url}`, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          throw new Error(`HTTP ${retryResponse.status}`);
        }

        return retryResponse.status === 204 ? ({} as T) : retryResponse.json();
      } else {
        accessToken.value = null;
        refreshTokenValue.value = null;
        navigateTo('/login');
        throw new Error('Unauthorized');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.status === 204 ? ({} as T) : response.json();
  }

  async function refreshAccessToken(): Promise<boolean> {
    if (!refreshTokenValue.value) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue.value }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      accessToken.value = data.accessToken;
      refreshTokenValue.value = data.refreshToken;
      return true;
    } catch {
      return false;
    }
  }

  return {
    apiFetch,
    accessToken,
    refreshToken: refreshTokenValue,
    isAuthenticated: computed(() => !!accessToken.value),
  };
}
