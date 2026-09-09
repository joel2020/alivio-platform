import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const job = { id: 912345, title: 'Clinical operations director', location: 'New York', type: 'Full time', category: 'Healthcare', salary: null, description: 'Lead clinical operations and support the care team.', responsibilities: ['Support the team'], qualifications: ['Relevant leadership experience'], created_at: '2026-09-01T12:00:00Z' };

for (const path of ['/blog', '/careers', '/privacy', '/terms', '/accessibility']) {
  test(`${path} secondary page is accessible on a small phone`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 850 });
    if (path === '/careers') await page.route('**/rest/v1/jobs?*', route => route.fulfill({ json: [{ ...job, title: 'Principal Machine Learning Engineer (Healthcare AI)', category: 'Data Science' }] }));
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (path === '/careers') await expect(page.getByRole('heading', { level: 2, name: 'Principal Machine Learning Engineer (Healthcare AI)' })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(n => n.target) }))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });
}

test.describe('career application', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/jobs?*', route => route.fulfill({ json: job }));
    // Every application request is intercepted; these tests never submit a real application.
    await page.route('**/functions/v1/public-intake', route => route.fulfill({ json: { ok: true } }));
    await page.goto('/careers/912345');
    await expect(page.getByRole('heading', { name: job.title, exact: true })).toBeVisible();
  });

  test('fits a small phone with readable labels and feedback', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 850 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(n => n.target) }))).toEqual([]);
    await expect(page.getByLabel('First name', { exact: true })).toHaveAttribute('autocomplete', 'given-name');
  });

  // Submission validation, retries, and confirmations are covered by candidate-application.spec.ts.

});

test('blog search is labeled and a failed request can be retried', async ({ page }) => {
  let failing = true;
  await page.route('**/rest/v1/blog_posts?*', route => failing
    ? route.fulfill({ status: 503, json: { message: 'private provider detail' } })
    : route.fulfill({ json: [], headers: { 'content-range': '*/0' } }));
  await page.goto('/blog');
  await expect(page.getByRole('alert')).toContainText('try again');
  await expect(page.getByText('private provider detail')).toHaveCount(0);
  await expect(page.getByLabel('Search blog posts', { exact: true })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  failing = false;
  await page.getByRole('button', { name: 'Retry loading posts' }).click();
  await expect(page.getByRole('heading', { name: 'No posts found' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
