import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`homepage stays within ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    if (width < 1200) {
      const toggle = page.getByRole('button', { name: 'Open menu' });
      await expect(toggle).toBeInViewport();
    }
  });
}

test('homepage dark headings and secondary call to action remain readable', async ({ page }) => {
  await page.goto('/');
  const issues = await new AxeBuilder({ page }).include('main').withRules(['color-contrast']).analyze();
  expect(issues.violations.map(({ id, nodes }) => ({ id, elements: nodes.map(n => n.target) }))).toEqual([]);
});

for (const path of ['/nearshore-latam-recruiting', '/recruiting-agency-medellin', '/pricing', '/recruiting-agency-westchester', '/', '/services', '/about', '/product', '/start', '/contact', '/industries/healthcare', '/industries/technology']) {
  test(`${path} is accessible and fits a small phone`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.locator('main').count()).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map(n => n.target) }))).toEqual([]);
  });
}

test('mobile menu traps focus, closes on Escape, and restores focus and scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await page.goto('/');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const toggle = page.getByRole('button', { name: 'Open menu', exact: true });
  await toggle.click();
  const panel = page.getByRole('dialog', { name: 'Navigation menu' });
  await expect(panel).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close navigation menu', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(panel.getByRole('link', { name: 'Client Sign In', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(panel.getByRole('button', { name: 'Close navigation menu', exact: true })).toBeFocused();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(toggle).toBeFocused();
  expect(await page.locator('main').evaluate(el => el.hasAttribute('inert'))).toBe(false);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(panel).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('skip link and menu navigation work with a keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Our Approach', exact: true }).click();
  await expect(page).toHaveURL(/\/#process$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

for (const path of ['/start', '/contact']) {
  test(`${path} preserves input on failure and only confirms an accepted request`, async ({ page }) => {
    await page.goto(path);
    let attempts = 0;
    await page.route('**/functions/v1/public-intake', async route => {
      attempts++;
      const data = route.request().postDataJSON();
      expect(data.name).toBe('Website QA');
      expect(data.email).toBe('qa@example.com');
      expect(data.company).toBe('QA organization');
      expect(data.website).toBe('');
      await route.fulfill({ status: attempts === 1 ? 503 : 200, contentType: 'application/json', body: JSON.stringify(attempts === 1 ? { error: 'private provider detail' } : { ok: true }) });
    });
    await page.getByLabel(/Full name/).fill('Website QA');
    await page.getByLabel(/Work email/).fill('qa@example.com');
    await page.getByLabel(path === '/start' ? /Company/ : /Organization/).fill('QA organization');
    await page.getByLabel(/Roles to fill/).fill('A clinical leadership role in New York.');
    await page.getByRole('button', { name: path === '/start' ? 'Request my search plan' : 'Send Message' }).click();
    await expect(page.getByRole('alert')).toContainText('We could not confirm');
    await expect(page.getByRole('alert')).toBeFocused();
    await expect(page.getByLabel(/Full name/)).toHaveValue('Website QA');
    await expect(page.getByText('private provider detail')).toHaveCount(0);
    await page.getByRole('button', { name: path === '/start' ? 'Request my search plan' : 'Send Message' }).click();
    await expect(page.getByRole('status')).toContainText(/received/);
    await expect(page.getByRole('status')).toBeFocused();
    expect(attempts).toBe(2);
  });

  test(`${path} rejects an invalid success payload`, async ({ page }) => {
    await page.goto(path);
    await page.route('**/functions/v1/public-intake', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<html>Unavailable</html>' }));
    await page.getByLabel(/Full name/).fill('Website QA');
    await page.getByLabel(/Work email/).fill('qa@example.com');
    await page.getByLabel(path === '/start' ? /Company/ : /Organization/).fill('QA organization');
    await page.getByLabel(/Roles to fill/).fill('Clinical leader');
    await page.getByRole('button', { name: path === '/start' ? 'Request my search plan' : 'Send Message' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('status')).toHaveCount(0);
  });
}

test('the FAQ opens in place and product sample data remains labeled', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Am I buying recruiting services or software?', { exact: true }).click();
  await expect(page.getByText(/Alivio is your recruiting partner/)).toBeVisible();
  await page.goto('/product');
  await expect(page.getByText('Sample data', { exact: true })).toBeVisible();
});

test('client navigation scrolls to the destination and honors section links', async ({ page }) => {
  await page.goto('/');
  await page.locator('footer').getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.locator('footer').getByRole('link', { name: 'Responsible AI', exact: true }).click();
  await expect(page.locator('#responsible-ai')).toBeInViewport();
});

test('a failed route download gives a usable recovery screen', async ({ page }) => {
  await page.route(/ProductPage[^/]*\.(js|tsx)(\?|$)/, route => route.abort());
  await page.goto('/product');
  await expect(page.getByRole('heading', { name: 'We couldn’t load this page.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reload page' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to homepage' })).toHaveAttribute('href', '/');
});

for (const path of ['/login', '/signup']) {
  test(`${path} still loads after route splitting`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(path);
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('the logo accessible name matches its visible text', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withRules(['label-content-name-mismatch']).analyze();
  expect(results.violations).toEqual([]);
});
