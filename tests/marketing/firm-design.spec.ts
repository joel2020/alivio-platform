import { test, expect } from '@playwright/test';

const pages = ['/','/employers','/candidates','/industries','/industries/healthcare','/industries/technology','/industries/executive','/jobs','/about','/contact'];
for (const path of pages) {
  test(`${path} presents recruiting services with its own indexable metadata`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://aliviosearchpartners.com${path}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    const text = await page.locator('main').innerText();
    expect(text).not.toMatch(/Talent Engine|AI Candidate Engine|book demo|flat monthly fee|recruiting OS/i);
  });
}

test('employers and candidates have complete navigation and working destination links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  for (const label of ['Employers','Candidates','Industries','Jobs','About','Contact']) await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Book a Recruiting Call' })).toHaveAttribute('href', 'https://cal.com/alivio/intro-call30');
  await nav.getByRole('link', { name: 'Employers', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Contingency Search', exact: true })).toBeVisible();
  await nav.getByRole('link', { name: 'Candidates', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Submit Your Resume by Email' })).toHaveAttribute('href', /^mailto:hello@aliviosearchpartners.com/);
  await nav.getByRole('link', { name: 'Jobs', exact: true }).click();
  await expect(page).toHaveURL(/\/jobs$/);
});

test('homepage has the approved eight sections and no invented proof', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hire Better Talent Without Wasting Months on the Search');
  await expect(page.locator('main section')).toHaveCount(8);
  await expect(page.getByText('Sample pipeline', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Meet Alivio' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await page.getByRole('link', { name: 'Meet our founder' }).click();
  await expect(page.getByRole('heading', { name: 'Joel Carias' })).toBeInViewport();
});

test('mobile practice navigation opens the selected practice', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Healthcare recruiting', exact: true }).click();
  await expect(page).toHaveURL(/\/industries\/healthcare$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Healthcare Recruiting');
  expect(await page.locator('main').evaluate(el => el.inert)).toBe(false);
});
