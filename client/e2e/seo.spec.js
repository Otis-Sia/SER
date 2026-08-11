import { test, expect } from '@playwright/test';

test.describe('SEO & Metadata E2E Tests', () => {
  test('Homepage has strong metadata, canonical, robots and structured data', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/Scouts Emergency Response/i);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description).toContain('Scouts Emergency Response');

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical?.replace(/\/$/, '')).toBe('https://www.seresponse.org');

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();

    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toMatch(/index/i);
    expect(robots).toMatch(/follow/i);

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.length).toBeGreaterThanOrEqual(2);
    expect(jsonLd.join('\n')).toContain('Scouts Emergency Response');
    expect(jsonLd.join('\n')).toContain('WebSite');
  });

  for (const route of [
    ['/about', /About Us/i],
    ['/projects', /Projects/i],
    ['/events', /Events/i],
    ['/community', /Community/i],
    ['/blog', /Blog/i],
  ]) {
    test(`${route[0]} has indexable metadata`, async ({ page }) => {
      await page.goto(route[0], { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveTitle(route[1]);

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();

      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(ogImage).toBeTruthy();
    });
  }

  test('Robots.txt is accessible and points to the sitemap', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/User-agent/i);
    expect(body).toContain('Sitemap: https://www.seresponse.org/sitemap.xml');
    expect(body).toContain('Disallow: /admin/');
  });

  test('Sitemap.xml is accessible and contains key public routes', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    const body = await page.content();
    expect(body).toContain('urlset');
    expect(body).toContain('https://www.seresponse.org/');
    expect(body).toContain('https://www.seresponse.org/about');
    expect(body).toContain('https://www.seresponse.org/projects');
    expect(body).toContain('https://www.seresponse.org/events');
  });
});
