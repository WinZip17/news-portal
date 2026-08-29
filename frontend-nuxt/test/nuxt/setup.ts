import { beforeEach, vi } from 'vitest';
import { computed, ref } from 'vue';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { NuxtTestMocks } from './helpers/mocks';

const accessTokenRef = ref<string | null>(null);

const mocks = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  authServiceMock: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    updatePreferences: vi.fn().mockResolvedValue(undefined),
    getUsers: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
  newsServiceMock: {
    getNews: vi.fn(),
    smartSearch: vi.fn(),
    getNewsById: vi.fn(),
    createNews: vi.fn(),
    updateNews: vi.fn(),
    deleteNews: vi.fn(),
    moderateNews: vi.fn(),
    likeNews: vi.fn(),
    toggleFavorite: vi.fn(),
    getFavorites: vi.fn(),
    getStats: vi.fn(),
  },
}));

globalThis.__nuxtTestMocks = {
  ...mocks,
  accessToken: accessTokenRef,
} as NuxtTestMocks;

mockNuxtImport('navigateTo', () => mocks.navigateToMock);

vi.mock('~/services/auth.service.ts', () => ({
  useAuthService: () => mocks.authServiceMock,
}));

vi.mock('~/services/news.service.ts', () => ({
  useNewsService: () => mocks.newsServiceMock,
}));

vi.mock('~/composables/useApi.ts', () => ({
  useApi: () => ({
    accessToken: accessTokenRef,
    refreshToken: ref<string | null>(null),
    apiFetch: vi.fn(),
    isAuthenticated: computed(() => !!accessTokenRef.value),
  }),
}));

beforeEach(() => {
  mocks.navigateToMock.mockReset();
  accessTokenRef.value = null;
  vi.clearAllMocks();
  mocks.authServiceMock.logout.mockResolvedValue(undefined);
  mocks.authServiceMock.updatePreferences.mockResolvedValue(undefined);
});
