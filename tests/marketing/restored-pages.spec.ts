import { test, expect } from '@playwright/test';

const restored = [
  { path: '/pricing', heading: 'Recruiting pricing built around your search', link: 'Pricing & Engagements' },
  { path: '/recruiting-agency-westchester', heading: 'Recruiting for Westchester healthcare and technology teams', link: 'Westchester Recruiting' },
];

for (const entry of restored) {
  test(`${entry.path} is reachable from the footer and leads to a search request`, async ({ page }) => {
    await page.goto('/services');
    await page.locator('footer').getByRole('link', { name: entry.link, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${entry.path}$`));
    await expect(page.getByRole('heading', { level: 1, name: entry.heading })).toBeVisible();
    await page.locator('main').getByRole('link', { name: 'Request a Search Plan', exact: true }).first().click();
    await expect(page).toHaveURL(/\/start$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
}

test('restored URLs serve their own indexable HTML without redirects', async ({ request, baseURL }) => {
  test.skip(!process.env.PLAYWRIGHT_DEPLOYMENT, 'Verify real Vercel routes on the deployed preview and production.');
  for (const { path, heading } of restored) {
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
