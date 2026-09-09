import { test, expect } from '@playwright/test';

// Protect the consultative path through the redesign, including cross-page anchors.
test('desktop expertise and approach links lead to the correct visible sections', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about');
  const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  await nav.getByRole('link', { name: 'Expertise', exact: true }).click();
  await expect(page).toHaveURL(/\/#search-specialties$/);
  await expect(page.locator('#practice-heading')).toBeInViewport();
  await nav.getByRole('link', { name: 'Our Approach', exact: true }).click();
  await expect(page).toHaveURL(/\/#process$/);
  await expect(page.locator('#process-heading')).toBeInViewport();
  await expect(nav.getByRole('link', { name: 'Discuss a Search' })).toHaveAttribute('href', 'https://cal.com/alivio/intro-call30');
  await expect(nav.getByRole('link', { name: 'Client Sign In' })).toHaveAttribute('href', '/login');
});

test('search evidence retains the qualification and founder remains reachable', async ({ page }) => {
  await page.goto('/');
  const evidence = page.getByRole('region', { name: 'The work behind a considered shortlist.' });
  await expect(evidence).toContainText('10');
  await expect(evidence).toContainText('16 sourced and matched');
  await expect(evidence).toContainText('not a placement or retention result');
  await expect(page.getByText('Sample pipeline', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Meet our founder and explore the firm' }).click();
  await expect(page).toHaveURL(/\/about#leadership$/);
  await expect(page.getByRole('heading', { name: 'Joel Carias' })).toBeInViewport();
});

test('mobile practice navigation opens the selected practice', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Healthcare recruiting', exact: true }).click();
  await expect(page).toHaveURL(/\/industries\/healthcare$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Clinical and healthcare leadership');
  expect(await page.locator('main').evaluate(el => el.inert)).toBe(false);
});
