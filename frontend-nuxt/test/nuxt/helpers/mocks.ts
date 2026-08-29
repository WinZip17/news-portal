import type { Ref } from 'vue';

export interface NuxtTestMocks {
  navigateToMock: ReturnType<typeof import('vitest').vi.fn>;
  accessToken: Ref<string | null>;
  authServiceMock: {
    login: ReturnType<typeof import('vitest').vi.fn>;
    register: ReturnType<typeof import('vitest').vi.fn>;
    logout: ReturnType<typeof import('vitest').vi.fn>;
    getCurrentUser: ReturnType<typeof import('vitest').vi.fn>;
    updateProfile: ReturnType<typeof import('vitest').vi.fn>;
    changePassword: ReturnType<typeof import('vitest').vi.fn>;
    updatePreferences: ReturnType<typeof import('vitest').vi.fn>;
    getUsers: ReturnType<typeof import('vitest').vi.fn>;
    updateUser: ReturnType<typeof import('vitest').vi.fn>;
    deleteUser: ReturnType<typeof import('vitest').vi.fn>;
  };
  newsServiceMock: {
    getNews: ReturnType<typeof import('vitest').vi.fn>;
    smartSearch: ReturnType<typeof import('vitest').vi.fn>;
    getNewsById: ReturnType<typeof import('vitest').vi.fn>;
    createNews: ReturnType<typeof import('vitest').vi.fn>;
    updateNews: ReturnType<typeof import('vitest').vi.fn>;
    deleteNews: ReturnType<typeof import('vitest').vi.fn>;
    moderateNews: ReturnType<typeof import('vitest').vi.fn>;
    likeNews: ReturnType<typeof import('vitest').vi.fn>;
    toggleFavorite: ReturnType<typeof import('vitest').vi.fn>;
    getFavorites: ReturnType<typeof import('vitest').vi.fn>;
    getStats: ReturnType<typeof import('vitest').vi.fn>;
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __nuxtTestMocks: NuxtTestMocks;
}

export function getTestMocks(): NuxtTestMocks {
  return globalThis.__nuxtTestMocks;
}
