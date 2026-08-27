import { expect, test } from '@playwright/test';
import { mockNewsItem } from './mocks/data';
import { clearAuthStorage, mockNewsPortalApi } from './mocks/api';

test.describe('News feed', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    await mockNewsPortalApi(page);
  });

  test('loads news list and opens detail modal', async ({ page }) => {
    await page.goto('/news');

    await expect(page.getByRole('heading', { name: '📰 Лента новостей' })).toBeVisible();
    await expect(page.getByText(mockNewsItem.title)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Все новости загружены')).toBeVisible();

    await page.getByText(mockNewsItem.title).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: mockNewsItem.title })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('shows reset button when search filter is active', async ({ page }) => {
    await page.goto('/news');

    await expect(page.getByText(mockNewsItem.title)).toBeVisible({ timeout: 15_000 });
    await page.getByPlaceholder('Поиск...').fill('AI');

    await expect(page.getByRole('button', { name: 'Сбросить' })).toBeVisible();
  });
});
