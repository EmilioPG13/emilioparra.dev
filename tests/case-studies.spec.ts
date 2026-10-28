import { test, expect } from '@playwright/test';

const cases = [
  { id: 'court-booking', title: 'Court Booking', facts: 4, headline: 2, next: { id: 'webhook-delivery-platform', title: 'Webhook Delivery Platform' } },
  { id: 'webhook-delivery-platform', title: 'Webhook Delivery Platform', facts: 5, headline: 2, next: { id: 'court-booking', title: 'Court Booking' } },
];

for (const { id, title, facts, headline, next } of cases) {
  test.describe(title, () => {
    test('responds, has one h1 and is indexable', async ({ page }) => {
      const response = await page.goto(`/projects/${id}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(title);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://emilioparra.dev/projects/${id}/`,
      );
    });

    test('tells the case in four parts and lists where the numbers come from', async ({ page }) => {
      await page.goto(`/projects/${id}`);
      await expect(page.getByRole('heading', { level: 2 })).toHaveText([
        'The problem',
        'The decision',
        'The evidence',
        'What I would change',
        'Numbers and where they come from',
        next.title,
      ]);
    });

    test('the header band shows the headline figures, each linked to its source', async ({ page }) => {
      await page.goto(`/projects/${id}`);
      const band = page.locator('h1').locator('xpath=ancestor::div[contains(@class,"on-sign")]');
      const figures = band.locator('ul').first().getByRole('link');
      await expect(figures).toHaveCount(headline);
      for (const figure of await figures.all()) {
        await expect(figure).toHaveAttribute('href', /^https:\/\/github\.com\/EmilioPG13\//);
        await expect(figure).toHaveAttribute('target', '_blank');
      }
    });

    test('ends with the other case study, the CV and the email', async ({ page }) => {
      await page.goto(`/projects/${id}`);
      const end = page.getByRole('region', { name: next.title });
      await expect(end.getByRole('link', { name: next.title })).toHaveAttribute('href', `/projects/${next.id}`);
      await expect(end.getByRole('link', { name: /Download CV/ })).toHaveAttribute('href', '/emilio-parra-cv.pdf');
      await expect(end.getByRole('link', { name: /@emilioparra\.dev/ })).toHaveAttribute('href', /^mailto:/);
    });

    test('every figure carries a source link that opens in a new tab', async ({ page }) => {
      await page.goto(`/projects/${id}`);
      const items = page.locator('aside dl > div');
      await expect(items).toHaveCount(facts);
      for (const item of await items.all()) {
        const source = item.getByRole('link');
        await expect(source).toHaveAttribute('href', /^https:\/\/github\.com\/EmilioPG13\//);
        await expect(source).toHaveAttribute('target', '_blank');
        await expect(source).toHaveAttribute('rel', /noopener/);
      }
    });

    test('every off-site link in the text opens in a new tab', async ({ page }) => {
      await page.goto(`/projects/${id}`);
      const links = page.locator('main a[href^="http"]');
      for (const link of await links.all()) {
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', /noopener/);
      }
    });

    test('copy has no em or en dashes', async ({ page }) => {
      await page.goto(`/projects/${id}`);
      expect(await page.locator('body').innerText()).not.toMatch(/[–—]/);
    });

    test('the title is the largest text of the header band', async ({ page }) => {
      await page.goto(`/projects/${id}`);
      const [title, summary] = await page.evaluate(() => {
        const h1 = document.querySelector('h1')!;
        const size = (el: Element) => parseFloat(getComputedStyle(el).fontSize);
        return [size(h1), size(h1.nextElementSibling!)];
      });
      expect(title).toBeGreaterThan(summary);
    });

    test('has no horizontal scroll on a phone', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 800 });
      await page.goto(`/projects/${id}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test('the webhook case shows the lifecycle diagram with a link to every proof', async ({ page }) => {
  await page.goto('/projects/webhook-delivery-platform');
  const figure = page.getByRole('group', { name: /life of a webhook event/i });
  await expect(figure).toBeVisible();
  const proofs = figure.getByRole('link');
  await expect(proofs).toHaveCount(6);
  for (const proof of await proofs.all()) {
    await expect(proof).toHaveAttribute('href', /^https:\/\/github\.com\/EmilioPG13\/webhook-delivery-platform\//);
    await expect(proof).toHaveAttribute('target', '_blank');
  }
});

test('the project links and the numbers are reachable from the header band', async ({ page }) => {
  await page.goto('/projects/court-booking');
  const band = page.locator('h1').locator('xpath=ancestor::div[contains(@class,"on-sign")]');
  await expect(band.getByRole('link', { name: /Live demo/ })).toHaveAttribute(
    'href',
    'https://reservation-system-azure.vercel.app',
  );
  await expect(band.getByRole('link', { name: /Code/ })).toHaveAttribute('target', '_blank');
  await expect(band.getByRole('link', { name: 'Numbers and sources' })).toHaveAttribute('href', '#facts');
});

test('code blocks follow the site theme instead of a fixed palette', async ({ page }) => {
  const background = async (scheme: 'light' | 'dark') => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/projects/court-booking');
    return page.locator('.case-body pre').first().evaluate((pre) => getComputedStyle(pre).backgroundColor);
  };
  const light = await background('light');
  const dark = await background('dark');
  expect(light).not.toBe(dark);
  expect(light).not.toBe('rgb(36, 41, 46)');
  expect(dark).not.toBe('rgb(36, 41, 46)');
});

test('the court booking case does not show the webhook diagram', async ({ page }) => {
  await page.goto('/projects/court-booking');
  await expect(page.getByRole('group', { name: /life of a webhook event/i })).toHaveCount(0);
});

test('the home links each featured project to its case study', async ({ page }) => {
  await page.goto('/');
  for (const { id, title } of cases) {
    const link = page.getByRole('link', { name: `Read the case study for ${title}` });
    await expect(link).toHaveAttribute('href', `/projects/${id}`);
  }
});

test('the case study template is not published', async ({ request }) => {
  const response = await request.get('/projects/_template');
  expect(response.status()).toBe(404);
});
