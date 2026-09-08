import { test, expect } from '@playwright/test';

const path = '/blog/succession-planning-for-growing-staffing-organizations';

test('published article has current content and metadata before JavaScript', async ({ browser, baseURL }) => {
  test.skip(!process.env.PLAYWRIGHT_DEPLOYMENT, 'Requires the deployed article function.');
  const context = await browser.newContext({ javaScriptEnabled: false, storageState: process.env.PLAYWRIGHT_STORAGE_STATE });
  const page = await context.newPage();
  const response = await page.goto(`${baseURL}${path}`);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Succession Planning');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://aliviosearchpartners.com${path}`);
  expect((await page.locator('.blog-markdown').innerText()).length).toBeGreaterThan(300);
  expect(await page.title()).toContain('Succession Planning');
  const data = JSON.parse(await page.locator('#alivio-structured-data').textContent() || '{}');
  expect(data['@type']).toBe('Article');
  await context.close();
});

test('unpublished or missing articles return a real non-cacheable 404', async ({ request }) => {
  test.skip(!process.env.PLAYWRIGHT_DEPLOYMENT, 'Requires the deployed article function.');
  for (const missing of ['nonexistent-article-seo-verification', 'passive-candidate-outreach-messages']) {
    const response = await request.get(`/blog/${missing}`);
    expect(response.status()).toBe(404);
    expect(response.headers()['cache-control']).toContain('no-store');
    const html = await response.text();
    expect(html).toContain('noindex, follow');
    expect(html).toContain('This article');
  }
});

test('server-rendered article hydrates and remains readable', async ({ page }) => {
  test.skip(!process.env.PLAYWRIGHT_DEPLOYMENT, 'Requires the deployed article function.');
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Succession Planning');
  await expect(page.getByRole('button', { name: 'Copy link', exact: true })).toBeVisible();
  await page.getByRole('link', { name: '← Back to blog', exact: true }).click();
  await expect(page).toHaveURL(/\/blog$/);
  expect(errors).toEqual([]);
});

test('verified server content survives a blocked browser database refresh', async ({ page }) => {
  test.skip(!process.env.PLAYWRIGHT_DEPLOYMENT, 'Requires the deployed article function.');
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/rest/v1/blog_posts?*', route => route.abort());
  await page.goto(path);
  await expect(page.locator('#alivio-article-data')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Succession Planning');
  await expect(page).toHaveTitle(/Succession Planning/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  expect(errors).toEqual([]);
});
