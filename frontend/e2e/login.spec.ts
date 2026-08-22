import { expect, test } from '@playwright/test';
import { clearAuthStorage, mockNewsPortalApi } from './mocks/api';

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    await mockNewsPortalApi(page);
  });

  test('shows validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Вход в аккаунт' })).toBeVisible();
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.getByText('Пожалуйста, введите email')).toBeVisible();
    await expect(page.getByText('Пожалуйста, введите пароль')).toBeVisible();
  });

  test('logs in successfully and redirects to home', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Пароль').fill('password123');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('testuser')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Читать новости' })).toBeVisible();
  });

  test('shows API error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email').fill('bad@example.com');
    await page.getByPlaceholder('Пароль').fill('wrongpass');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
