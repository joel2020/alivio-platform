import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const userId = '00000000-0000-4000-8000-000000000101';
const orgId = '00000000-0000-4000-8000-000000000102';
const roleId = '00000000-0000-4000-8000-000000000103';
const applicant = { id: 912345, public_reference: 'APP-QA-PREVIEW', job_id: 912345, job_title: 'QA Clinical Director', first_name: 'Synthetic', last_name: 'Applicant', email: 'delivered@resend.dev', phone: null, status: 'new', created_at: '2026-09-08T15:00:00Z', org_id: orgId, role_id: roleId, candidate_id: null, assigned_to: null, questionnaire: { location: 'New York · Hybrid', experience: 'Five years leading clinical teams.', skills: 'Clinical operations', availability: 'Four weeks', interest: 'A role supporting care delivery.' }, resume_filename: 'synthetic-resume.pdf', next_action: null, next_action_at: null, messages_stopped: false, followups_stopped: false };

test('recruiter reviews answers, saves a next action, and queues a truthful email', async ({ page }) => {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const jwt = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: userId, exp: expires, aud: 'authenticated', role: 'authenticated' })).toString('base64url')}.synthetic-signature`;
  const session = { access_token: jwt, refresh_token: 'synthetic-refresh', expires_at: expires, expires_in: 3600, token_type: 'bearer', user: { id: userId, email: 'ats-qa@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' } };
  await page.addInitScript(({ session }) => {
    localStorage.setItem('sb-ovxttubotjebnaoedllu-auth-token', JSON.stringify(session));
  }, { session });
  const actions: Record<string, unknown>[] = [];
  let application = { ...applicant };
  let queued = false;
  // Every Supabase request is intercepted, including all writes. No real account or email is used.
  await page.route('https://*.supabase.co/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/candidate-applications')) {
      const body = route.request().postDataJSON(); actions.push(body);
      if (body.action === 'list') return route.fulfill({ json: { data: { applications: [application], jobs: [{ id: 912345, title: application.job_title, role_id: roleId }], roles: [{ id: roleId, title: application.job_title, org_id: orgId }], reviewers: [{ id: userId, full_name: 'QA Recruiter' }], is_admin: true, email_ready: true, followups_ready: false } } });
      if (body.action === 'detail') return route.fulfill({ json: { data: { application, events: [], messages: queued ? [{ id: 'qa-message', created_at: '2026-09-08T15:01:00Z', subject: 'Next steps — QA Clinical Director', body: 'QA message', status: 'queued', scheduled_at: null, sent_at: null, last_error: null }] : [] } } });
      if (body.action === 'update') application = { ...application, status: body.status, next_action: body.next_action, assigned_to: body.assigned_to };
      if (body.action === 'message') {
        queued = true;
        if (actions.filter(action => action.action === 'message').length === 1) return route.fulfill({ status: 503, json: { error: 'Temporary connection failure' } });
      }
      return route.fulfill({ json: { ok: true } });
    }
    if (url.pathname === '/auth/v1/user') return route.fulfill({ json: session.user });
    if (url.pathname === '/rest/v1/users') return route.fulfill({ json: { id: userId, org_id: orgId, full_name: 'QA Recruiter', email: 'ats-qa@example.com', role: 'admin', is_active: true } });
    if (url.pathname === '/rest/v1/organizations') return route.fulfill({ json: { id: orgId, name: 'Synthetic QA organization', plan: 'pro', subscription_status: 'active' } });
    if (url.pathname.endsWith('/rpc/is_platform_admin')) return route.fulfill({ json: true });
    return route.fulfill({ json: [], headers: { 'content-range': '0-0/0' } });
  });
  await page.goto('/applications');
  await expect(page.getByRole('heading', { name: 'Applications', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Synthetic Applicant/ }).click();
  await expect(page.getByRole('heading', { name: 'Application questionnaire' })).toBeVisible();
  await expect(page.getByText('Five years leading clinical teams.', { exact: true })).toBeVisible();
  await page.getByLabel('Subject', { exact: true }).fill('Unsaved email draft');
  await page.getByLabel('Application stage', { exact: true }).selectOption('screening');
  await page.getByLabel('Assigned recruiter', { exact: true }).selectOption(userId);
  await page.getByLabel('Next action', { exact: true }).fill('Schedule a screening call');
  await page.getByLabel('Internal note', { exact: true }).fill('Reviewed the application questionnaire.');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Application updated' })).toBeVisible();
  expect(actions.find(action => action.action === 'update')).toMatchObject({ id: applicant.id, status: 'screening', assigned_to: userId, next_action: 'Schedule a screening call' });
  await expect(page.getByLabel('Subject', { exact: true })).toHaveValue('Unsaved email draft');
  await page.getByLabel('Internal note', { exact: true }).fill('Unsaved recruiter note');
  await page.getByLabel('Start from a template', { exact: true }).selectOption('screening');
  await expect(page.getByLabel('Subject', { exact: true })).toHaveValue('Next steps — QA Clinical Director');
  await expect(page.getByLabel('Schedule for (optional)', { exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Queue email', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Retry same email', exact: true })).toBeVisible();
  await expect(page.getByLabel('Subject', { exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Retry same email', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Email queued' })).toBeVisible();
  const attempts = actions.filter(action => action.action === 'message');
  expect(attempts).toHaveLength(2);
  expect(attempts[1]).toEqual(attempts[0]);
  expect(attempts[0].request_id).toMatch(/^[0-9a-f-]{36}$/);
  await expect(page.getByLabel('Internal note', { exact: true })).toHaveValue('Unsaved recruiter note');
  await expect(page.getByText('Queued', { exact: true })).toBeVisible();
  await expect(page.getByText('Accepted by email provider', { exact: true })).toHaveCount(0);
  const message = actions.find(action => action.action === 'message');
  expect(message).toMatchObject({ id: applicant.id, subject: 'Next steps — QA Clinical Director' });
  expect(message).not.toHaveProperty('to');
  const accessibility = await new AxeBuilder({ page }).include('.ats-page').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(accessibility.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }))).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.getByLabel('Internal note', { exact: true })).toHaveValue('Unsaved recruiter note');
  await expect(page.getByRole('heading', { name: 'Applications', exact: true })).toHaveCount(1);
});

test('application workspace requires a login', async ({ page }) => {
  await page.goto('/applications');
  await expect(page).toHaveURL(/\/login\?next=/);
  await expect(page.getByRole('heading', { name: 'Applications', exact: true })).toHaveCount(0);
});
