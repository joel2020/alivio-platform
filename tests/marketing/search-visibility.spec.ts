import { test, expect } from '@playwright/test';

const paths = ['/', '/services', '/about', '/product', '/industries/healthcare', '/industries/technology', '/privacy', '/terms', '/accessibility'];
for (const path of paths) {
  test(`${path} has useful content and its own canonical before JavaScript`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, storageState: process.env.PLAYWRIGHT_STORAGE_STATE });
    const page = await context.newPage();
    await page.goto(`${baseURL}${path}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://aliviosearchpartners.com${path}`);
    expect((await page.locator('main').innerText()).length).toBeGreaterThan(150);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    const data = await page.locator('#alivio-structured-data').textContent();
    expect(JSON.parse(data!)[0].url).toBe(`https://aliviosearchpartners.com${path}`);
    await context.close();
  });
}

test('industry metadata remains specific after client navigation', async ({ page }) => {
  await page.goto('/industries/healthcare');
  await expect(page).toHaveTitle('Physician & Healthcare Leadership Recruiting | Alivio');
  await page.locator('footer').getByRole('link', { name: 'Technology Practice', exact: true }).click();
  await expect(page).toHaveTitle('Technology & Healthtech Recruiting | Alivio Search Partners');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://aliviosearchpartners.com/industries/technology');
});

test('article dates and organization authors match their structured data', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ timezoneId: 'America/Los_Angeles', storageState: process.env.PLAYWRIGHT_STORAGE_STATE });
  const page = await context.newPage();
  const post = { id: 'seo-test', slug: 'seo-test', title: 'Search planning checklist', content: 'A checklist for agreeing hiring priorities.', excerpt: 'Plan a search.', author_name: 'Alivio Search Partners', category: 'Insights', published_date: '2026-04-13', cover_image_url: null, status: 'published' };
  await page.route('**/rest/v1/blog_posts?*', route => route.fulfill({ json: new URL(route.request().url()).searchParams.has('slug') ? post : [] }));
  await page.goto(`${baseURL}/blog/seo-test`);
  await expect(page.getByRole('heading', { name: post.title })).toBeVisible();
  await expect(page.locator('main')).toContainText('April 13, 2026');
  const data = JSON.parse((await page.locator('#alivio-structured-data').textContent())!);
  expect(data.author['@type']).toBe('Organization');
  await context.close();
});

test('deployment returns real 404s and excludes private URLs from search', async ({ request }) => {
  test.skip(!process.env.PLAYWRIGHT_DEPLOYMENT, 'Vercel routing and headers are verified on the deployed preview/production.');
  for (const path of ['/seo-check-no-such-page', '/assets/seo-check-missing.js', '/fonts/seo-check-missing.woff2']) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
  for (const path of ['/login', '/signup', '/client/report/seo-check', '/client/shortlist/seo-check', '/shortlists', '/tasks']) {
    const response = await request.get(path);
    expect(response.headers()['x-robots-tag'], path).toContain('noindex');
    expect(response.headers()['cache-control'], path).toContain('no-store');
    expect(await response.text()).not.toContain('AI-POWERED SEARCH. HUMAN-DRIVEN RESULTS.');
  }
});
