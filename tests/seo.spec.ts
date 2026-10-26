import { test, expect } from '@playwright/test';

test.describe('home metadata', () => {
  test('is indexable and has a canonical URL on the real domain', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://emilioparra.dev/');
  });

  test('description fits a search snippet', async ({ page }) => {
    await page.goto('/');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description!.length).toBeGreaterThan(70);
    expect(description!.length).toBeLessThanOrEqual(160);
  });

  test('Open Graph and Twitter tags point at an absolute image that exists', async ({ page, request }) => {
    await page.goto('/');
    for (const name of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type']) {
      await expect(page.locator(`meta[property="${name}"]`)).toHaveAttribute('content', /.+/);
    }
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');

    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(image).toBe('https://emilioparra.dev/og.png');
    // The tag is absolute for the real domain; fetch the same file from the local server.
    const response = await request.get('/og.png');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
  });

  test('JSON-LD describes the person', async ({ page }) => {
    await page.goto('/');
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(raw!);
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe('Emilio Parra');
    expect(data.jobTitle).toBe('Software Developer');
    expect(data.sameAs).toEqual(
      expect.arrayContaining([expect.stringContaining('github.com/EmilioPG13'), expect.stringContaining('linkedin.com/in/')]),
    );
  });

  test('CV links carry the analytics event', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('a[href="/emilio-parra-cv.pdf"]');
    await expect(links).toHaveCount(2);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('data-umami-event', 'download-cv');
    }
  });
});

test.describe('crawl files', () => {
  test('robots.txt allows crawling and names the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('User-agent: *');
    expect(body).toContain('Sitemap: https://emilioparra.dev/sitemap-index.xml');
    expect(body).not.toMatch(/Disallow:\s*\/\s*$/m);
  });

  test('the sitemap lists the home page', async ({ request }) => {
    const index = await request.get('/sitemap-index.xml');
    expect(index.status()).toBe(200);
    const sitemap = await request.get('/sitemap-0.xml');
    expect(sitemap.status()).toBe(200);
    const body = await sitemap.text();
    expect(body).toContain('https://emilioparra.dev/');
    expect(body).toContain('https://emilioparra.dev/about/');
  });
});

test.describe('404 page', () => {
  test('unknown routes show the custom page, out of search results', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page is not here.');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.getByRole('link', { name: /Back to the home page/ })).toHaveAttribute('href', '/');
  });
});
