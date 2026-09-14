import { test, expect } from '@playwright/test';

for (const path of ['/employers', '/industries/healthcare', '/industries/technology', '/nearshore-latam-recruiting']) {
  test(`${path} connects visible breadcrumbs, service, and organization before JavaScript`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, storageState: process.env.PLAYWRIGHT_STORAGE_STATE });
    const page = await context.newPage();
    await page.goto(`${baseURL}${path}`);
    const graph = JSON.parse((await page.locator('#alivio-structured-data').textContent())!);
    const organization = graph.find((item: Record<string, unknown>) => item['@type'] === 'Organization');
    const service = graph.find((item: Record<string, unknown>) => item['@type'] === 'Service');
    const breadcrumb = graph.find((item: Record<string, unknown>) => item['@type'] === 'BreadcrumbList');
    expect(service.provider['@id']).toBe(organization['@id']);
    expect(service.url).toBe(`https://aliviosearchpartners.com${path}`);
    expect(graph[0].mainEntity['@id']).toBe(service['@id']);
    expect(organization.sameAs).toContain('https://www.linkedin.com/company/aliviosearchpartners/');
    const visibleItems = await page.getByRole('navigation', { name: 'Breadcrumb', exact: true }).locator('li').allTextContents();
    expect(breadcrumb.itemListElement.map((item: { name: string }) => item.name)).toEqual(visibleItems);
    expect(graph.some((item: Record<string, unknown>) => item.aggregateRating || item.review)).toBe(false);
    await context.close();
  });
}

test('legacy services has one canonical destination and is absent from the sitemap', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://aliviosearchpartners.com/employers</loc>');
  expect(sitemap).not.toContain('<loc>https://aliviosearchpartners.com/services</loc>');
  const legacy = await (await request.get('/services')).text();
  expect(legacy).toContain('rel="canonical" href="https://aliviosearchpartners.com/employers"');
});

test('healthtech content links to the nearshore service and its inquiry path', async ({ page }) => {
  await page.goto('/industries/technology');
  await expect(page.getByRole('heading', { name: 'Technology and healthtech recruiting built around the work.' })).toBeVisible();
  await page.getByRole('link', { name: 'Explore nearshore LATAM recruiting', exact: true }).click();
  await expect(page).toHaveURL(/\/nearshore-latam-recruiting$/);
  await page.getByRole('link', { name: 'Request a Search Plan', exact: true }).click();
  await expect(page).toHaveURL(/\/start$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://aliviosearchpartners.com/start');
  await expect(page.getByRole('option', { name: 'Nearshore LATAM recruiting', exact: true })).toHaveCount(1);
});
