import { test, expect } from '@playwright/test';

test('home responds and has a single h1 with the name', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Emilio Parra');
});

test('document declares English and has a title and description', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle(/Emilio Parra/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
});

test('skip link is the first focusable element and targets main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await expect(skip).toHaveAttribute('href', '#main');
  await expect(page.locator('main#main')).toHaveCount(1);
});
