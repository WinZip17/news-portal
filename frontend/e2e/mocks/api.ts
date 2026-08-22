import type { Page, Route } from '@playwright/test';
import {
  mockAuthResponse,
  mockNewsItem,
  mockNewsResponse,
  mockSmartSearchResponse,
  mockStats,
  mockUser,
} from './data';

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export async function mockNewsPortalApi(page: Page) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const { pathname } = url;
    const method = route.request().method();

    if (method === 'POST' && pathname.endsWith('/auth/login')) {
      const payload = route.request().postDataJSON() as { email?: string; password?: string };
      if (payload.email === 'bad@example.com') {
        return fulfillJson(route, { message: 'Invalid credentials' }, 401);
      }
      return fulfillJson(route, mockAuthResponse);
    }

    if (method === 'GET' && pathname.endsWith('/auth/me')) {
      return fulfillJson(route, mockUser);
    }

    if (method === 'GET' && pathname.endsWith('/news/stats')) {
      return fulfillJson(route, mockStats);
    }

    if (method === 'GET' && pathname.endsWith('/news/favorites')) {
      return fulfillJson(route, { ...mockNewsResponse, data: [] });
    }

    if (method === 'POST' && pathname.includes('/news/smart-search')) {
      const payload = route.request().postDataJSON() as { query?: string };
      return fulfillJson(route, {
        ...mockSmartSearchResponse,
        appliedFilters: { search: payload.query ?? 'AI' },
      });
    }

    if (method === 'GET' && /\/news\/[^/]+$/.test(pathname) && !pathname.endsWith('/news')) {
      const id = pathname.split('/').pop() ?? mockNewsItem.id;
      return fulfillJson(route, { ...mockNewsItem, id });
    }

    if (method === 'GET' && (pathname.endsWith('/news') || pathname.endsWith('/news/'))) {
      const pageNum = Number(url.searchParams.get('page') || '1');
      if (pageNum > 1) {
        return fulfillJson(route, { ...mockNewsResponse, data: [], total: 1, page: pageNum });
      }
      return fulfillJson(route, mockNewsResponse);
    }

    if (method === 'GET' && pathname.includes('/like/check')) {
      return fulfillJson(route, { liked: false });
    }

    if (method === 'GET' && pathname.includes('/favorite/check')) {
      return fulfillJson(route, { favorited: false });
    }

    await route.continue();
  });
}

export async function clearAuthStorage(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
