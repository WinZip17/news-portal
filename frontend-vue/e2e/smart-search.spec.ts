import { expect, test } from '@playwright/test';
import { mockNewsItem } from './mocks/data';
import { clearAuthStorage, mockNewsPortalApi } from './mocks/api';

test.describe('Smart search', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    await mockNewsPortalApi(page);
  });

  test('renders search page with hint', async ({ page }) => {
    await page.goto('/search');

    await expect(page.getByText('🧠 Умный поиск')).toBeVisible();
    await expect(page.getByText('Введите запрос и нажмите «Найти».')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Найти' })).toBeDisabled();
  });

  test('runs search and shows results with applied filters hint', async ({ page }) => {
    await page.goto('/search');

    await page.getByPlaceholder(/Например:/).fill('AI новости про технологии');
    await page.getByRole('button', { name: 'Найти' }).click();

    await expect(page.getByText(mockNewsItem.title)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Распознано:/)).toBeVisible();
    await expect(page.getByText(/поиск: «AI новости про технологии»/)).toBeVisible();
  });

  test('fills query from example tag', async ({ page }) => {
    await page.goto('/search');

    await page.getByText('экономика и инфляция').click();

    await expect(page.getByPlaceholder(/Например:/)).toHaveValue('экономика и инфляция');
    await expect(page.getByRole('button', { name: 'Найти' })).toBeEnabled();
  });
});
