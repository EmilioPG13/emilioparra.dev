import { test, expect } from '@playwright/test';

const theme = (page: import('@playwright/test').Page) =>
  page.locator('html').getAttribute('data-theme');

test('follows the system setting when nothing is stored', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await theme(page)).toBe('dark');

  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();
  expect(await theme(page)).toBe('light');
});

test('keeps following the system if it changes while the tab is open', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await theme(page)).toBe('light');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('a stored choice wins over the system setting', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('/');
  expect(await theme(page)).toBe('light');
});

test('an invalid stored value is ignored', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('theme', 'purple'));
  await page.goto('/');
  expect(await theme(page)).toBe('dark');
});

test('the theme is set before first paint (no flash)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  // Record the attribute at the moment the body starts to exist: if the script
  // were deferred or a module, it would still be unset here.
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      if (document.body) {
        (window as unknown as { themeAtBody: string | null }).themeAtBody =
          document.documentElement.getAttribute('data-theme');
        observer.disconnect();
      }
    });
    // The init script runs before <html> exists, so observe the document itself.
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.goto('/');
  const atBody = await page.evaluate(
    () => (window as unknown as { themeAtBody: string | null }).themeAtBody,
  );
  expect(atBody).toBe('dark');
});

test('color-scheme matches the active theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const scheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
  expect(scheme).toBe('dark');
});

test('the toggle is a button that announces its state and switches the theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Dark theme' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
});

test('the toggle choice survives a reload and beats the system setting', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Dark theme' }).click();
  await page.reload();
  expect(await theme(page)).toBe('dark');
  await expect(page.getByRole('button', { name: 'Dark theme' })).toHaveAttribute('aria-pressed', 'true');
});

test('the toggle works from the keyboard', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Dark theme' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('the toggle still works when storage throws', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('blocked');
    };
    Storage.prototype.getItem = () => {
      throw new Error('blocked');
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
