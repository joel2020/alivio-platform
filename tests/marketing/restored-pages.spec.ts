import { test, expect } from '@playwright/test';

const restored = [
  { path: '/nearshore-latam-recruiting', heading: 'Nearshore LATAM recruiting for U.S. teams', link: 'LATAM Recruiting' },
  { path: '/recruiting-agency-medellin', heading: 'Recruiting in Medellín for bilingual and technical talent', link: 'Medellín Recruiting' },
  { path: '/recruiting-agency-westchester', heading: 'Recruiting for Westchester healthcare and technology teams', link: 'Westchester Recruiting' },
];

for (const entry of restored) {
  test(`${entry.path} remains reachable and leads to a search request`, async ({ page }) => {
    await page.goto(entry.path);
    await expect(page).toHaveURL(new RegExp(`${entry.path}$`));
    await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
    await page.locator('main').getByRole('link', { name: 'Request a Search Plan', exact: true }).first().click();
    await expect(page).toHaveURL(/\/start$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
}

test('restored URLs serve their own indexable HTML without redirects', async ({ request, baseURL }) => {
  test.skip(!process.env.PLAYWRIGHT_DEPLOYMENT, 'Verify real Vercel routes on the deployed preview and production.');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const sitemapXml = await sitemap.text();
  for (const { path, heading } of restored) {
    expect(sitemapXml.split(`<loc>https://aliviosearchpartners.com${path}</loc>`)).toHaveLength(2);
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    expect(response.headers().location, path).toBeUndefined();
    // Vercel adds noindex to protected previews; production must be indexable.
    if (new URL(baseURL!).hostname === 'aliviosearchpartners.com') {
      expect(response.headers()['x-robots-tag'] ?? '', path).not.toContain('noindex');
    }
    const html = await response.text();
    expect(html).toContain(heading);
    expect(html).toContain(`data-prerendered="${path}"`);
    expect(html).toContain(`href="https://aliviosearchpartners.com${path}"`);
    expect(html).toContain('<meta name="robots" content="index, follow"');
  }
});


test('legacy pricing leads to the recruiting engagement models', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page).toHaveURL(/\/employers#engagement-models$/);
  await expect(page.locator('#engagement-models')).toBeInViewport();
  await expect(page.getByRole('heading', { name: 'Contingency Search', exact: true })).toBeVisible();
});


for (const [source, target] of [
  ['/nearshore-latam-talent', '/nearshore-latam-recruiting'],
  ['/recruiters-ny-medellin', '/recruiting-agency-medellin'],
]) {
  test(`${source} permanently redirects to its regional recruiting page`, async ({ request }) => {
    test.skip(!process.env.PLAYWRIGHT_DEPLOYMENT, 'Verify Vercel redirects on deployment.');
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers().location, 'https://aliviosearchpartners.com').pathname).toBe(target);
    const destination = await request.get(target, { maxRedirects: 0 });
    expect(destination.status()).toBe(200);
  });
}
