import { test, expect } from '@playwright/test';

test.describe('SEO & Metadata E2E Tests', () => {
  test('Homepage has correct title, description, and OG image', async ({ page }) => {
    await page.goto('/');
    
    // Title check
    await expect(page).toHaveTitle(/Scouts Emergency Response/i);
    
    // Meta description check
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description).toContain('Scouts Emergency Response');

    // OpenGraph meta checks
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();

    // Canonical URL check
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
  });

  test('About page loads and has valid OpenGraph tags', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/About Us/i);

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
  });

  test('Projects page loads correctly', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveTitle(/Projects/i);
  });

  test('Events page loads correctly', async ({ page }) => {
    await page.goto('/events');
    await expect(page).toHaveTitle(/Events/i);
  });

  test('Robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const body = await page.content();
    expect(body).toMatch(/User-agent/i);
    expect(body).toContain('Sitemap');
  });

  test('Sitemap.xml is accessible and valid XML', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    const body = await page.content();
    expect(body).toContain('urlset');
    expect(body).toContain('https://www.seresponse.org');
  });
});
