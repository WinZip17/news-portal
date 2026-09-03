import { expect, test } from '@playwright/test';
import { mockNewsItem } from './mocks/data';
import { clearAuthStorage, mockNewsPortalApi } from './mocks/api';

test.describe('Home → news modal', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    await mockNewsPortalApi(page);
  });

  test('opens news detail modal from home page card', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: '📰 News Portal' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Последние новости')).toBeVisible();
    await expect(page.getByText(mockNewsItem.title)).toBeVisible({ timeout: 15_000 });

    await page.getByText(mockNewsItem.title).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByText(mockNewsItem.title)).toBeVisible({ timeout: 15_000 });
    await expect(modal.getByText(mockNewsItem.summary)).toBeVisible();
  });
});
