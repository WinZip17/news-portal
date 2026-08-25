import MockAdapter from 'axios-mock-adapter';
import api from '@/services/api';
import {
  mockAuthResponse,
  mockNewsItem,
  mockNewsResponse,
  mockPendingNewsItem,
  mockSmartSearchResponse,
  mockStats,
  mockUser,
} from './fixtures';
import { NewsStatus } from '@/types';

let mockApi: MockAdapter | null = null;

const emptyNewsResponse = {
  data: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

export function setupMockApi(): MockAdapter {
  if (mockApi) {
    mockApi.reset();
  } else {
    mockApi = new MockAdapter(api);
  }

  mockApi.onGet('/news/stats').reply(200, mockStats);
  mockApi.onGet('/news').reply((config) => {
    const params = (config.params ?? {}) as Record<string, string | number>;
    if (params.status === NewsStatus.PENDING) {
      return [
        200,
        {
          ...mockNewsResponse,
          data: [mockPendingNewsItem],
        },
      ];
    }
    return [200, mockNewsResponse];
  });
  mockApi.onGet('/news/favorites').reply(200, emptyNewsResponse);
  mockApi.onGet(/\/news\/news-1$/).reply(200, mockNewsItem);
  mockApi.onGet(/\/news\/[^/]+\/like\/check$/).reply(200, { liked: false });
  mockApi.onGet(/\/news\/[^/]+\/favorite\/check$/).reply(200, { favorited: false });
  mockApi.onPost('/news/smart-search').reply((config) => {
    const body = JSON.parse(config.data as string) as { query?: string };
    return [
      200,
      {
        ...mockSmartSearchResponse,
        appliedFilters: { search: body.query ?? 'AI' },
      },
    ];
  });
  mockApi.onPost(/\/news\/[^/]+\/like$/).reply(200, { liked: true, likes: 4 });
  mockApi.onPost(/\/news\/[^/]+\/favorite$/).reply(200, { favorited: false });
  mockApi.onPatch(/\/news\/[^/]+\/moderate$/).reply(200, mockNewsItem);
  mockApi.onPut(/\/news\/[^/]+$/).reply(200, mockNewsItem);
  mockApi.onDelete(/\/news\/[^/]+$/).reply(204);
  mockApi.onPost('/auth/login').reply(200, mockAuthResponse);
  mockApi.onPost('/auth/register').reply(200, mockAuthResponse);
  mockApi.onGet('/auth/me').reply(200, mockUser);
  mockApi.onPut('/auth/profile').reply(200, mockUser);
  mockApi.onPut('/auth/preferences').reply(200, mockUser);
  mockApi.onPost('/auth/change-password').reply(200, {});
  mockApi.onGet('/auth/users').reply(200, { data: [mockUser], total: 1 });
  mockApi.onPut(/\/auth\/users\/[^/]+$/).reply(200, mockUser);
  mockApi.onDelete(/\/auth\/users\/[^/]+$/).reply(204);
  mockApi.onPost('/ai/auto-generate').reply(200, {});

  return mockApi;
}

export function resetMockApi(): void {
  mockApi?.reset();
}

export function getMockApi(): MockAdapter {
  if (!mockApi) {
    return setupMockApi();
  }
  return mockApi;
}
