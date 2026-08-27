import { expect, test } from '@playwright/test';
import { clearAuthStorage, mockNewsPortalApi } from './mocks/api';

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    await mockNewsPortalApi(page);
  });

  test('shows validation for empty required fields', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('logs in successfully and redirects to home', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Читать новости')).toBeVisible({ timeout: 15_000 });
  });

  test('shows API error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('textbox', { name: 'Email' }).fill('bad@example.com');
    await page.locator('input[name="password"]').fill('wrongpass');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
