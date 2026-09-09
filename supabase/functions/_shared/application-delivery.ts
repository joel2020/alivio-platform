export const IDEMPOTENCY_SAFE_MS = 23 * 60 * 60 * 1000;
export function retryDecision(attempts: number, firstAttempt: string | null, now = Date.now()) {
  if ((firstAttempt && now - Date.parse(firstAttempt) >= IDEMPOTENCY_SAFE_MS) || attempts >= 6) return { retry: false, delaySeconds: 0 };
  return { retry: true, delaySeconds: Math.min(3600, 60 * 2 ** Math.max(0, attempts - 1)) };
}
export async function sendApplicationEmail(payload: Record<string, unknown>, key: string, apiKey: string, fetcher: typeof fetch = fetch) {
  try {
    const response = await fetcher('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(payload), signal: AbortSignal.timeout(20000) });
    const data = await response.json().catch(() => ({}));
    if (response.ok && typeof data.id === 'string') return { accepted: true, providerId: data.id, retryable: false, error: null };
    return { accepted: false, providerId: null, retryable: response.status === 429 || response.status >= 500 || response.ok, error: response.ok ? 'provider_response_uncertain' : `provider_http_${response.status}` };
  } catch { return { accepted: false, providerId: null, retryable: true, error: 'provider_response_uncertain' }; }
}
export async function verifyWebhook(body: string, headers: Headers, secret: string, now = Date.now()) {
  const id = headers.get('svix-id'), timestamp = headers.get('svix-timestamp'), signatures = headers.get('svix-signature');
  if (!id || !timestamp || !signatures || !/^\d+$/.test(timestamp) || Math.abs(now / 1000 - Number(timestamp)) > 300) return false;
  try {
    const bytes = Uint8Array.from(atob(secret.replace(/^whsec_/, '')), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const message = new TextEncoder().encode(`${id}.${timestamp}.${body}`);
    for (const signature of signatures.split(' ')) {
      const [version, value] = signature.split(',');
      if (version === 'v1' && value && await crypto.subtle.verify('HMAC', key, Uint8Array.from(atob(value), c => c.charCodeAt(0)), message)) return true;
    }
  } catch { return false; }
  return false;
}
