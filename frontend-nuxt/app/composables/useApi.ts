import { useStorage } from '@vueuse/core';

function resolveApiBase(): string {
  if (import.meta.server) {
    return `${useRequestURL().origin}/api`;
  }

  return '/api';
}

export function useApi() {
  const accessToken = useStorage<string | null>('accessToken', null);
  const refreshTokenValue = useStorage<string | null>('refreshToken', null);

  const API_BASE = resolveApiBase();

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

    // refreshToken
    if (response.status === 401 && refreshTokenValue.value && !url.includes('/auth/refresh')) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${accessToken.value}`;
        const retryResponse = await fetch(`${API_BASE}${url}`, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({ message: 'Unauthorized' }));
          throw new Error(error.message || 'Unauthorized');
        }

        if (retryResponse.status === 204 || retryResponse.headers.get('content-length') === '0') {
          return {} as T;
        }

        return retryResponse.json();
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

    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');

    if (
      response.status === 204 ||
      contentLength === '0' ||
      !contentType?.includes('application/json')
    ) {
      return {} as T;
    }

    return response.json();
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
