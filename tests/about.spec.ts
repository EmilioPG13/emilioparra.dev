import { test, expect } from '@playwright/test';

test('about responds, has one h1 and is indexable', async ({ page }) => {
  const response = await page.goto('/about');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('About');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://emilioparra.dev/about/');
});

test('about tells the story in four parts', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'How I got here',
    'The first thing that worked',
    'How I work',
    'Outside the code',
  ]);
});

test('about links the first project and states the facts from the CV', async ({ page }) => {
  await page.goto('/about');
  const repo = page.getByRole('link', { name: /impulso-ecommerce on GitHub/ });
  await expect(repo).toHaveAttribute('href', 'https://github.com/EmilioPG13/impulso-ecommerce');
  await expect(repo).toHaveAttribute('target', '_blank');
  await expect(page.getByText('Spanish (native), English (C2), German (B1)')).toBeVisible();
});

test('about copy has no em or en dashes', async ({ page }) => {
  await page.goto('/about');
  expect(await page.locator('body').innerText()).not.toMatch(/[–—]/);
});

test('the nav marks the current page', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('about lists four favorite films and four favorite books', async ({ page }) => {
  await page.goto('/about');
  const films = page.locator('dt', { hasText: 'Favorite films' }).locator('xpath=following-sibling::dd[1]//li');
  const books = page.locator('dt', { hasText: 'Favorite books' }).locator('xpath=following-sibling::dd[1]//li');
  await expect(films).toHaveCount(4);
  await expect(books).toHaveCount(4);
  await expect(films.first()).toContainText('The Godfather');
  await expect(books.first()).toContainText('The Great Gatsby');
});

test('about names a family member, not a cousin', async ({ page }) => {
  await page.goto('/about');
  const text = await page.locator('main').innerText();
  expect(text).toContain('A family member');
  expect(text).not.toMatch(/cousin/i);
});
