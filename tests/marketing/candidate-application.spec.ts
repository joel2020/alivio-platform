import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const job = { id: 912345, title: 'Clinical operations director', location: 'New York', type: 'Full time', category: 'Healthcare', salary: null, description: 'Lead clinical operations and support the care team.', responsibilities: ['Support the team'], qualifications: ['Relevant leadership experience'], created_at: '2026-09-01T12:00:00Z' };
const endpoint = '**/functions/v1/submit-application';
const resume = { name: 'candidate-resume.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nSynthetic browser test résumé.\n%%EOF') };
const background = {
  location: 'New York, United States; hybrid',
  experience: 'Five years leading clinical operations teams.',
  skills: 'Operations management and process improvement.',
  availability: 'Four weeks after an offer.',
  interest: 'I enjoy supporting teams that improve patient care.',
};

async function fillContact(page: Page) {
  await page.getByLabel('First name', { exact: true }).fill('Website');
  await page.getByLabel('Last name', { exact: true }).fill('QA');
  await page.getByLabel('Email', { exact: true }).fill('qa@example.com');
  await page.getByLabel('Résumé', { exact: true }).setInputFiles(resume);
}

async function toReview(page: Page) {
  await fillContact(page);
  await page.getByRole('button', { name: 'Continue to background' }).click();
  await expect(page.getByRole('heading', { name: 'Step 2 of 3: Your background' })).toBeFocused();
  for (const [key, answer] of Object.entries(background)) await page.locator(`textarea[name="${key}"]`).fill(answer);
  await page.getByRole('button', { name: 'Review application', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Step 3 of 3: Review & submit' })).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  await page.route('**/rest/v1/jobs?*', route => route.fulfill({ json: job }));
  // Intercept all submission endpoints: browser tests never send an application or email.
  await page.route('**/functions/v1/public-intake', route => route.fulfill({ status: 410, json: { error: 'Retired test endpoint' } }));
  await page.route(endpoint, route => route.fulfill({ json: { ok: true, reference: 'APP-SYNTHETIC-123' } }));
  await page.goto('/careers/912345');
  await expect(page.getByRole('heading', { name: job.title, exact: true })).toBeVisible();
});

test('sends the résumé and five answers as multipart data only after consent', async ({ page }) => {
  let calls = 0;
  await page.route(endpoint, async route => {
    calls++;
    const request = route.request();
    const contentType = request.headers()['content-type'];
    expect(contentType).toContain('multipart/form-data; boundary=');
    const multipart = await new Response(request.postDataBuffer(), { headers: { 'content-type': contentType } }).formData();
    const payload = JSON.parse(String(multipart.get('payload')));
    expect(payload).toMatchObject({ job_id: job.id, first_name: 'Website', last_name: 'QA', email: 'qa@example.com', phone: '', linkedin_url: '', website: '', privacy_consent: true, questionnaire: background });
    expect(payload.submission_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    const uploaded = multipart.get('resume') as File;
    expect(uploaded.name).toBe(resume.name);
    expect(await uploaded.text()).toContain('%PDF-1.7');
    await route.fulfill({ json: { ok: true, reference: 'APP-SYNTHETIC-123' } });
  });
  await toReview(page);
  await page.getByRole('button', { name: 'Submit application' }).click();
  await expect(page.getByRole('alert')).toContainText('acknowledge');
  await expect(page.getByRole('alert')).toBeFocused();
  expect(calls).toBe(0);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit application' }).click();
  await expect(page.getByRole('status')).toContainText('Application received');
  await expect(page.getByRole('status')).toContainText('has been saved');
  await expect(page.getByRole('status')).toContainText('APP-SYNTHETIC-123');
  await expect(page.getByRole('status')).toBeFocused();
  await expect(page.getByRole('status')).not.toContainText(/email.*(?:sent|delivered)/i);
  expect(calls).toBe(1);
});

test('retains answers and file while editing and rejects incomplete background', async ({ page }) => {
  await fillContact(page);
  await page.getByRole('button', { name: 'Continue to background' }).click();
  await page.getByRole('button', { name: 'Review application', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('current location');
  await expect(page.getByRole('alert')).toBeFocused();
  await page.getByRole('button', { name: 'Go to field' }).click();
  await expect(page.locator('textarea[name="location"]')).toBeFocused();
  for (const [key, answer] of Object.entries(background)) await page.locator(`textarea[name="${key}"]`).fill(answer);
  await page.getByRole('button', { name: 'Review application', exact: true }).click();
  await page.getByRole('button', { name: 'Edit contact details' }).click();
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('qa@example.com');
  expect(await page.getByLabel('Résumé', { exact: true }).evaluate((input: HTMLInputElement) => input.files?.[0].name)).toBe(resume.name);
  await page.getByRole('button', { name: 'Continue to background' }).click();
  await expect(page.locator('textarea[name="interest"]')).toHaveValue(background.interest);
});

test('validates résumé format, emptiness and size before sending', async ({ page }) => {
  await fillContact(page);
  for (const file of [
    { name: 'resume.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('invalid') },
    { name: 'resume.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(0) },
    { name: 'resume.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) },
  ]) {
    await page.getByLabel('Résumé', { exact: true }).setInputFiles(file);
    await expect(page.getByRole('alert')).toContainText('nonempty PDF or DOCX');
    await expect(page.getByRole('alert')).toBeFocused();
  }
  await page.getByRole('button', { name: 'Continue to background' }).click();
  await expect(page.getByRole('alert')).toContainText('Choose a PDF or DOCX');
  await page.getByLabel('Résumé', { exact: true }).setInputFiles({ name: 'resume.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: Buffer.from('PK synthetic docx client validation only') });
  await page.getByRole('button', { name: 'Continue to background' }).click();
  await expect(page.getByRole('heading', { name: 'Step 2 of 3: Your background' })).toBeVisible();
});

test('locks edits and retries identical payload and résumé after uncertain responses', async ({ page }) => {
  const payloads: string[] = [];
  const uploads: string[] = [];
  await page.route(endpoint, async route => {
    const multipart = await new Response(route.request().postDataBuffer(), { headers: { 'content-type': route.request().headers()['content-type'] } }).formData();
    payloads.push(String(multipart.get('payload')));
    const uploaded = multipart.get('resume') as File;
    uploads.push(`${uploaded.name}:${uploaded.type}:${Buffer.from(await uploaded.arrayBuffer()).toString('base64')}`);
    if (payloads.length === 1) await route.fulfill({ status: 200, contentType: 'text/html', body: '<html>Unavailable</html>' });
    else if (payloads.length === 2) await route.fulfill({ status: 503, json: { error: 'private provider detail' } });
    else if (payloads.length === 3) await route.abort('connectionreset');
    else if (payloads.length === 4) await route.fulfill({ status: 409, json: { error: 'Submission key conflict.' } });
    else await route.fulfill({ json: { ok: true, reference: 'APP-SYNTHETIC-RETRY' } });
  });
  await toReview(page);
  await page.getByRole('checkbox').check();
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.getByRole('button', { name: attempt === 0 ? 'Submit application' : 'Retry original submission', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText(attempt === 3 ? 'We could not reconcile' : 'We could not confirm');
    await expect(page.getByRole('alert')).toBeFocused();
    await expect(page.getByText('private provider detail')).toHaveCount(0);
    await expect(page.locator('.candidate-review')).toContainText(['qa@example.com', background.interest]);
    await expect(page.getByRole('checkbox')).toBeChecked();
    await expect(page.getByRole('checkbox')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Edit contact details' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Edit answers' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Retry original submission' })).toBeEnabled();
    await expect(page.locator('form')).toHaveAttribute('aria-busy', 'false');
    await expect(page.getByText('Editing is paused', { exact: false })).toBeVisible();
    await expect(page.getByRole('alert')).not.toContainText('go back to make changes');
  }
  await page.getByRole('button', { name: 'Retry original submission' }).click();
  await expect(page.getByRole('status')).toContainText('APP-SYNTHETIC-RETRY');
  expect(payloads).toHaveLength(5);
  expect(new Set(payloads).size).toBe(1);
  expect(new Set(uploads).size).toBe(1);
});

test('allows corrections and a fresh key after a definitive validation rejection', async ({ page }) => {
  const payloads: { submission_id: string; email: string; questionnaire: { interest: string } }[] = [];
  const filenames: string[] = [];
  await page.route(endpoint, async route => {
    const multipart = await new Response(route.request().postDataBuffer(), { headers: { 'content-type': route.request().headers()['content-type'] } }).formData();
    payloads.push(JSON.parse(String(multipart.get('payload'))));
    filenames.push((multipart.get('resume') as File).name);
    await route.fulfill(payloads.length === 1
      ? { status: 422, json: { error: 'The résumé content does not match its file type.' } }
      : { json: { ok: true, reference: 'APP-SYNTHETIC-CORRECTED' } });
  });
  await toReview(page);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit application' }).click();
  await expect(page.getByRole('alert')).toContainText('The résumé content does not match its file type.');
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Edit answers' })).toBeEnabled();
  await page.getByRole('button', { name: 'Edit contact details' }).click();
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('qa@example.com');
  await expect(page.locator('#application-resume-selected')).toContainText(resume.name);
  await page.getByLabel('Email', { exact: true }).fill('corrected@example.com');
  await page.getByLabel('Résumé', { exact: true }).setInputFiles({ ...resume, name: 'corrected-resume.pdf' });
  await page.getByRole('button', { name: 'Continue to background' }).click();
  await page.locator('textarea[name="interest"]').fill('Corrected role interest.');
  await page.getByRole('button', { name: 'Review application', exact: true }).click();
  await page.getByRole('button', { name: 'Submit application' }).click();
  await expect(page.getByRole('status')).toContainText('APP-SYNTHETIC-CORRECTED');
  expect(payloads).toHaveLength(2);
  expect(payloads[1].submission_id).not.toBe(payloads[0].submission_id);
  expect(payloads[1]).toMatchObject({ email: 'corrected@example.com', questionnaire: { interest: 'Corrected role interest.' } });
  expect(filenames).toEqual([resume.name, 'corrected-resume.pdf']);
});

test('shows progress and prevents duplicate submissions during upload', async ({ page }) => {
  let calls = 0;
  let finish: () => void = () => {};
  const pending = new Promise<void>(resolve => { finish = resolve; });
  await page.route(endpoint, async route => { calls++; await pending; await route.fulfill({ json: { ok: true, reference: 'APP-SYNTHETIC-PROGRESS' } }); });
  await toReview(page);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit application' }).click();
  await expect(page.getByRole('status')).toContainText('Uploading your résumé');
  await expect(page.getByRole('button', { name: 'Submitting…' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeDisabled();
  await expect(page.locator('form')).toHaveAttribute('aria-busy', 'true');
  finish();
  await expect(page.getByRole('status')).toContainText('APP-SYNTHETIC-PROGRESS');
  expect(calls).toBe(1);
});

test('supports keyboard navigation and accessible steps at 320px without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await fillContact(page);
  for (let step = 0; step < 3; step++) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
    if (step === 0) {
      await page.getByRole('button', { name: 'Continue to background' }).focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('heading', { name: 'Step 2 of 3: Your background' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.locator('textarea[name="location"]')).toBeFocused();
      for (const [key, answer] of Object.entries(background)) await page.locator(`textarea[name="${key}"]`).fill(answer);
    } else if (step === 1) await page.getByRole('button', { name: 'Review application', exact: true }).click();
  }
});
