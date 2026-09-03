import { expect, test } from '@playwright/test';
import { mockNewsItem } from './mocks/data';
import { clearAuthStorage, mockNewsPortalApi } from './mocks/api';

test.describe('Home → newspaper issue', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    await mockNewsPortalApi(page);
  });

  test('opens news detail from lead story', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Short News' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Коротко')).toBeVisible();
    await expect(page.getByText(mockNewsItem.title)).toBeVisible({ timeout: 15_000 });

    await page.locator('.newspaper-lead').click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByText(mockNewsItem.title)).toBeVisible({ timeout: 15_000 });
    await expect(modal.getByText(mockNewsItem.summary!)).toBeVisible();
  });
});
