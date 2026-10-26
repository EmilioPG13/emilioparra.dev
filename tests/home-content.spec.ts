import { test, expect } from '@playwright/test';

test('hero has the role, the pitch and the primary action', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Software Developer', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('I build backend services that stay correct when things fail')).toBeVisible();

  const cv = page.getByRole('link', { name: /Download CV/ }).first();
  await expect(cv).toBeVisible();
  await expect(cv).toHaveAttribute('href', '/emilio-parra-cv.pdf');
  await expect(cv).toHaveAttribute('download', '');
});

test('email is plain visible text with a mailto link, and profiles are linked', async ({ page }) => {
  await page.goto('/');
  const email = page.getByRole('link', { name: 'hello@emilioparra.dev' }).first();
  await expect(email).toBeVisible();
  await expect(email).toHaveAttribute('href', 'mailto:hello@emilioparra.dev');
  await expect(page.getByRole('link', { name: 'GitHub profile' })).toHaveAttribute('href', /github\.com\/EmilioPG13$/);
  await expect(page.getByRole('link', { name: 'LinkedIn profile' })).toHaveAttribute('href', /linkedin\.com\/in\/emilio-parra/);
});

test('off-site links open in a new tab; the CV, mail and anchors stay in place', async ({ page }) => {
  await page.goto('/');
  const external = page.locator('a[href^="http"]');
  expect(await external.count()).toBeGreaterThan(10);
  for (const link of await external.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
  for (const link of await page.locator('a[href^="#"], a[href^="mailto:"], a[href$=".pdf"]').all()) {
    await expect(link).not.toHaveAttribute('target', '_blank');
  }
});

test('the three languages lead to projects that exist on the page', async ({ page }) => {
  await page.goto('/');
  const bullets = page.getByRole('list', { name: 'Main languages' }).getByRole('link');
  await expect(bullets).toHaveCount(3);
  for (const link of await bullets.all()) {
    const target = (await link.getAttribute('href'))!;
    await expect(page.locator(target)).toHaveCount(1);
  }
});

test('every section the nav points to exists', async ({ page }) => {
  await page.goto('/');
  for (const id of ['projects', 'about', 'stack', 'experience', 'contact']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'About',
    'Projects',
    'Stack',
    'Experience',
    'Education',
    'Contact',
  ]);
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveText([
    'Projects',
    'About',
    'Contact',
  ]);
});

test('experience and education match the CV', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Digital Developer & Marketing')).toBeVisible();
  await expect(page.getByText('Jun 2026 to Present')).toBeVisible();
  await expect(page.getByText('Remote interpreter for US clients')).toBeVisible();
  await expect(page.getByText('Universidad Madero')).toBeVisible();
  await expect(page.getByText('Graduating 2027')).toBeVisible();
});

test('project proof links point at the repositories', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('#projects a').evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
  expect(hrefs).toContain('https://reservation-system-azure.vercel.app/');
  expect(hrefs).toContain('https://github.com/EmilioPG13/webhook-delivery-platform');
  expect(hrefs.some((h) => h.endsWith('test_reservations_concurrency.py'))).toBe(true);
});

test('page copy has no em or en dashes', async ({ page }) => {
  await page.goto('/');
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/[–—]/);
});

test('every image has alt text or is hidden from assistive tech', async ({ page }) => {
  await page.goto('/');
  const bad = await page.locator('img:not([alt])').count();
  expect(bad).toBe(0);
});

test('no horizontal scrolling', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test.describe('life of an event map', () => {
  test('with reduced motion it stays static and still tells the whole story', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const map = page.locator('[data-event-map]');
    await expect(map.getByRole('img', { name: 'The life of a webhook event' })).toBeVisible();
    await expect(map.getByText('500, 500, 200', { exact: true })).toBeVisible();
    await expect(map.getByText(/delivered on attempt 3/)).toBeVisible();
    await expect(map.getByText('Dead-letter queue', { exact: true })).toBeVisible();
    await expect(map.locator('[data-token]')).toBeHidden();
    await expect(map.getByRole('button', { name: 'Replay the event' })).toBeHidden();
  });

  test('with motion it plays once and offers a replay', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.locator('[data-event-map]').scrollIntoViewIfNeeded();
    const replay = page.getByRole('button', { name: 'Replay the event' });
    await expect(replay).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('[data-bubble-text]')).toHaveText('200');
    await replay.click();
    await expect(replay).toBeHidden();
    await expect(replay).toBeVisible({ timeout: 20_000 });
  });
});

test('the CV link serves a real PDF', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.getByRole('link', { name: /Download CV/ }).first().getAttribute('href');
  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('the call links are secondary and live only in Contact', async ({ page }) => {
  await page.goto('/');
  const calls = page.locator('a[href^="https://calendly.com/"]');
  await expect(calls).toHaveCount(2);
  await expect(page.locator('#contact a[href^="https://calendly.com/"]')).toHaveCount(2);
  await expect(page.locator('section[aria-labelledby="hero-name"] a[href^="https://calendly.com/"]')).toHaveCount(0);
});

test('the home gives a short About that leads to the full page', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: /More about me/ });
  await expect(link).toHaveAttribute('href', '/about');
  await link.click();
  await expect(page).toHaveURL(/\/about$/);
});

test('the stack is grouped by what the work is', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#stack h3')).toHaveText(['Frontend', 'Backend', 'Testing and deployment']);
});

test('language marks gain their colour on hover', async ({ page }) => {
  await page.goto('/');
  // Touch screens have no hover, and the styles are guarded so colour does not stick after a tap.
  test.skip(!(await page.evaluate(() => matchMedia('(hover: hover)').matches)), 'no hover on this device');
  const link = page.getByRole('list', { name: 'Main languages' }).getByRole('link').first();
  const colour = link.locator('svg').nth(1);
  await expect(colour).toHaveCSS('opacity', '0');
  await link.hover();
  await expect(colour).toHaveCSS('opacity', '1');
});
