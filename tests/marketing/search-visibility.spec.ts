import { test, expect } from '@playwright/test';

const paths = ['/nearshore-latam-recruiting', '/recruiting-agency-medellin', '/recruiting-agency-westchester', '/', '/services', '/about', '/employers', '/candidates', '/industries', '/industries/executive', '/contact', '/jobs', '/industries/healthcare', '/industries/technology', '/privacy', '/terms', '/accessibility', '/start', '/blog'];

test('a slow route chunk preserves server content and hydrates without errors', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /hydrat|Minified React error/i.test(message.text())) errors.push(message.text()); });
  let release!: () => void;
  const delayed = new Promise<void>(resolve => { release = resolve; });
  let requested = false;
  await page.route(/(?:Employers|Services)Page[^/]*\.js$/, async route => { requested = true; await delayed; await route.continue(); });
  await page.goto('/services', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => requested).toBe(true);
  await page.waitForTimeout(1500);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('Loading page…', { exact: true })).toHaveCount(0);
  release();
  // Releasing the intercepted request does not mean the remote script has
  // downloaded and hydrated yet. Retry interaction until the page is ready.
  await expect(async () => {
    const dialog = page.getByRole('dialog', { name: 'Navigation menu' });
    if (!(await dialog.isVisible())) await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await expect(dialog).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 10000 });
  expect(errors).toEqual([]);
});
for (const path of paths) {
  test(`${path} hydrates without browser errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible();
    expect(errors).toEqual([]);
  });
  test(`${path} has useful content and its own canonical before JavaScript`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, storageState: process.env.PLAYWRIGHT_STORAGE_STATE });
    const page = await context.newPage();
    await page.goto(`${baseURL}${path}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const canonicalPath = path === '/services' ? '/employers' : path;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://aliviosearchpartners.com${canonicalPath}`);
    expect((await page.locator('main').innerText()).length).toBeGreaterThan(150);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    const data = await page.locator('#alivio-structured-data').textContent();
    expect(JSON.parse(data!)[0].url).toBe(`https://aliviosearchpartners.com${canonicalPath}`);
    await context.close();
  });
}

test('industry metadata remains specific after client navigation', async ({ page }) => {
  await page.goto('/industries/healthcare');
  await expect(page).toHaveTitle('Physician & Healthcare Leadership Recruiting | Alivio');
  await page.locator('footer').getByRole('link', { name: 'Technology Recruiting', exact: true }).click();
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

test('legacy search URLs reach their relevant replacement without reviving retired jobs', async ({ request, baseURL }) => {
  test.skip(!process.env.PLAYWRIGHT_DEPLOYMENT, 'Permanent redirects are checked on Vercel.');
  const replacements = [
    ['/privacy-policy', '/privacy'], ['/terms-of-service', '/terms'],
    ['/careers', '/jobs'], ['/apply', '/jobs'], ['/product', '/employers'], ['/platform', '/employers'], ['/pricing', '/employers#engagement-models'], ['/candidate', '/candidates'], ['/schedule', '/contact'],
    ['/services', '/employers'],
    ['/services/retained-search', '/employers#engagement-models'],
    ['/services/recruitment-as-a-service', '/employers#engagement-models'],
  ];
  for (const [source, destination] of replacements) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status(), source).toBe(308);
    expect(new URL(response.headers().location, baseURL).pathname + new URL(response.headers().location, baseURL).hash, source).toBe(destination);
    expect((await request.get(destination)).status(), destination).toBe(200);
  }
  expect(await (await request.get('/services')).text()).toContain('id="engagement-models"');
  for (const path of ['/jobs/medical-laboratory-technician-nyc', '/services/no-such-service', '/roi-calculator']) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test('deployment returns real 404s and excludes private URLs from search', async ({ request }) => {
  test.skip(!process.env.PLAYWRIGHT_DEPLOYMENT, 'Vercel routing and headers are verified on the deployed preview/production.');
  for (const path of ['/seo-check-no-such-page', '/assets/seo-check-missing.js', '/fonts/seo-check-missing.woff2']) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
  for (const path of ['/login', '/signup', '/client/report/seo-check', '/client/shortlist/seo-check', '/shortlists', '/tasks', '/applications', '/candidates/123']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['x-robots-tag'], path).toContain('noindex');
    expect(response.headers()['cache-control'], path).toContain('no-store');
    expect(await response.text()).not.toContain('AI-POWERED SEARCH. HUMAN-DRIVEN RESULTS.');
  }
});
