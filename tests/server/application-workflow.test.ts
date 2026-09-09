import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApplicationError, MAX_RESUME_BYTES, readBoundedBody, validatePayload, validateResume } from '../../supabase/functions/_shared/application-validation.ts';
import { retryDecision, sendApplicationEmail, verifyWebhook } from '../../supabase/functions/_shared/application-delivery.ts';
const payload = () => ({ submission_id: '6b03012a-5f22-47c9-a775-a6e03f317ba8', job_id: 1, first_name: 'Ada', last_name: 'Example', email: ' ADA@example.test ', privacy_consent: true, questionnaire: { location: 'Boston', experience: 'Five years', skills: 'Research', availability: 'Two weeks', interest: 'The role' } });
function zipDocx(names = ['[Content_Types].xml', 'word/document.xml']) {
  const locals: Buffer[] = [], centrals: Buffer[] = []; let offset = 0;
  for (const name of names) {
    const n = Buffer.from(name), content = Buffer.from('<xml/>'), local = Buffer.alloc(30 + n.length + content.length), central = Buffer.alloc(46 + n.length);
    local.writeUInt32LE(0x04034b50); local.writeUInt32LE(content.length, 18); local.writeUInt32LE(content.length, 22); local.writeUInt16LE(n.length, 26); n.copy(local, 30); content.copy(local, 30 + n.length);
    central.writeUInt32LE(0x02014b50); central.writeUInt32LE(content.length, 20); central.writeUInt32LE(content.length, 24); central.writeUInt16LE(n.length, 28); central.writeUInt32LE(offset, 42); n.copy(central, 46);
    locals.push(local); centrals.push(central); offset += local.length;
  }
  const directory = Buffer.concat(centrals), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(names.length, 8); end.writeUInt16LE(names.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}
test('valid payload normalizes email and rejects missing consent, answers, IDs and foreign LinkedIn host', () => {
  assert.equal(validatePayload(payload()).email, 'ada@example.test');
  for (const changes of [{ privacy_consent: false }, { questionnaire: { location: 'Boston' } }, { submission_id: 'invalid' }, { job_id: -1 }, { first_name: '' }, { email: 'a@b\nBcc:test@example.com' }, { linkedin_url: 'https://linkedin.com.evil.test/me' }, { website: 'spam' }]) assert.throws(() => validatePayload({ ...payload(), ...changes }), ApplicationError);
});
test('file validation accepts bounded PDF and real ZIP directory DOCX; rejects renamed, oversized and truncated files', () => {
  assert.equal(validateResume('cv.pdf', 'application/pdf', Buffer.from('%PDF-1.7\nExample\n%%EOF')).extension, 'pdf');
  const docxType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  assert.equal(validateResume('cv.docx', docxType, zipDocx()).extension, 'docx');
  for (const [name, type, data] of [
    ['cv.pdf', 'application/pdf', Buffer.from('<script>bad</script>')],
    ['cv.pdf', 'application/pdf', Buffer.from('%PDF-1.7\ntruncated')],
    ['cv.pdf', 'application/octet-stream', Buffer.from('%PDF-1.7\n%%EOF')],
    ['cv.pdf', 'application/pdf', Buffer.alloc(MAX_RESUME_BYTES + 1)],
    ['cv.docx', docxType, Buffer.from('PK\x03\x04[Content_Types].xml word/document.xml')],
    ['cv.docx', docxType, zipDocx(['[Content_Types].xml', 'word/document.xml', 'word/vbaProject.bin'])],
    ['cv.docx', docxType, zipDocx().subarray(0, -5)],
  ] as const) assert.throws(() => validateResume(name, type, data), ApplicationError);
});
test('chunked body limits cannot be bypassed by omitting or lying about Content-Length', async () => {
  const req = new Request('https://example.test', { method: 'POST', body: '123456789', headers: { 'Content-Length': '1' } });
  await assert.rejects(readBoundedBody(req, 5), (e: ApplicationError) => e.status === 413);
});
test('provider acceptance requires a successful response with provider ID; failures retain retry semantics', async () => {
  const fake = (status: number, body: object) => (async (_url: unknown, options?: RequestInit) => { assert.equal(new Headers(options?.headers).get('Idempotency-Key'), 'ats/unique'); return new Response(JSON.stringify(body), { status }); }) as typeof fetch;
  assert.equal((await sendApplicationEmail({}, 'ats/unique', 'fake', fake(200, { id: 'provider-id' }))).accepted, true);
  assert.deepEqual(await sendApplicationEmail({}, 'ats/unique', 'fake', fake(429, {})), { accepted: false, providerId: null, retryable: true, error: 'provider_http_429' });
  assert.equal((await sendApplicationEmail({}, 'ats/unique', 'fake', fake(422, {}))).retryable, false);
  assert.equal((await sendApplicationEmail({}, 'ats/unique', 'fake', fake(200, {}))).error, 'provider_response_uncertain');
  assert.equal((await sendApplicationEmail({}, 'ats/unique', 'fake', (async () => { throw new Error('timeout'); }) as typeof fetch)).retryable, true);
});
test('retry stops before the 24h provider idempotency window and after six attempts', () => {
  const now = Date.now();
  assert.equal(retryDecision(1, new Date(now - 22 * 3600000).toISOString(), now).retry, true);
  assert.equal(retryDecision(1, new Date(now - 23 * 3600000).toISOString(), now).retry, false);
  assert.equal(retryDecision(6, new Date(now).toISOString(), now).retry, false);
});
test('signed webhook checks raw body integrity and timestamp freshness', async () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32)), secret = `whsec_${Buffer.from(bytes).toString('base64')}`;
  const now = Date.now(), stamp = String(Math.floor(now / 1000)), body = '{"type":"email.received"}', id = 'event-1';
  const key = await crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = Buffer.from(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${stamp}.${body}`))).toString('base64');
  const headers = new Headers({ 'svix-id': id, 'svix-timestamp': stamp, 'svix-signature': `v1,${signature}` });
  assert.equal(await verifyWebhook(body, headers, secret, now), true);
  assert.equal(await verifyWebhook(body + ' ', headers, secret, now), false);
  assert.equal(await verifyWebhook(body, headers, secret, now + 301000), false);
});
