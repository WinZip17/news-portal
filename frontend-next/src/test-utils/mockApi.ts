import MockAdapter from 'axios-mock-adapter';
import api from '@/services/api';
import {
  mockAuthResponse,
  mockNewsItem,
  mockNewsResponse,
  mockSmartSearchResponse,
  mockStats,
  mockUser,
} from './fixtures';

let mockApi: MockAdapter | null = null;

export function setupMockApi(): MockAdapter {
  if (mockApi) {
    mockApi.reset();
  } else {
    mockApi = new MockAdapter(api);
  }

  mockApi.onGet('/news/stats').reply(200, mockStats);
  mockApi.onGet('/news').reply(200, mockNewsResponse);
  mockApi.onGet(/\/news\/news-1$/).reply(200, mockNewsItem);
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
  mockApi.onPost('/auth/login').reply(200, mockAuthResponse);
  mockApi.onPost('/auth/register').reply(200, mockAuthResponse);
  mockApi.onGet('/auth/me').reply(200, mockUser);

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
