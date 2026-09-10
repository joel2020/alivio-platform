import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateHistoricalResume } from '../../supabase/functions/_shared/historical-resume.ts';
const payload = () => ({ first_name: 'Synthetic', last_name: null, email: null, batch: 'test',
  upload_sha256: 'a'.repeat(64), original_sha256: 'b'.repeat(64), sources: [{ url: 'https://mail.google.com/mail/u/0/#all/example', message_id: 'example' }], notes: ['Reviewed'], flags: [] });
test('historical metadata preserves original evidence and unknown contact fields', () => {
  const result = validateHistoricalResume(payload());
  assert.equal(result.last_name, null); assert.equal(result.email, null);
  assert.deepEqual(result.flags, ['missing_candidate_email']);
  assert.deepEqual(result.sources, payload().sources);
  assert.equal(result.original_sha256, 'b'.repeat(64));
  assert.equal(result.upload_sha256, 'a'.repeat(64));
});
test('historical intake rejects fabricated answers, consent, ownership and job associations', () => {
  for (const key of ['questionnaire', 'consent', 'consent_at', 'privacy_consent', 'job_id', 'role_id', 'org_id', 'actor_id']) {
    assert.throws(() => validateHistoricalResume({ ...payload(), [key]: 'invented' }), /Unexpected import field/);
  }
});
test('uncertain identities, emails and unsupported originals remain held', () => {
  for (const flag of ['identity_requires_review', 'email_requires_review', 'unsupported_upload_format']) {
    assert.throws(() => validateHistoricalResume({ ...payload(), flags: [flag] }), /Resolve identity/);
  }
  assert.throws(() => validateHistoricalResume({ ...payload(), first_name: '' }), /required/);
  assert.throws(() => validateHistoricalResume({ ...payload(), email: 'not an email' }), /Invalid candidate email/);
  assert.throws(() => validateHistoricalResume({ ...payload(), sources: [] }), /source/);
  assert.throws(() => validateHistoricalResume({ ...payload(), sources: [{ url: 'javascript:alert(1)' }] }), /secure source/);
  assert.throws(() => validateHistoricalResume({ ...payload(), upload_sha256: 'broken' }), /checksum/);
});
