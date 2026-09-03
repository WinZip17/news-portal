import { expect, test } from '@playwright/test';
import { clearAuthStorage, mockNewsPortalApi } from './mocks/api';

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    await mockNewsPortalApi(page);
  });

  test('shows validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByLabel('Email')).toBeVisible();
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.getByText('Обязательное поле').first()).toBeVisible();
  });

  test('logs in successfully and redirects to home', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Пароль').fill('password123');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: /Читать ленту/i })).toBeVisible();
  });

  test('shows API error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('bad@example.com');
    await page.getByLabel('Пароль').fill('wrongpass');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.getByRole('alert').filter({ hasText: /401|Invalid credentials|Ошибка/i })).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
