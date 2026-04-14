const redactPatterns = [/api[_-]?key/gi, /authorization/gi, /private[_-]?key/gi, /GOOGLE_SERVICE_ACCOUNT_KEY/gi];

const redact = (payload: unknown): unknown => {
  const json = JSON.stringify(payload, (_k, v) => {
    if (typeof v === 'string' && v.length > 24) {
      if (redactPatterns.some((p) => p.test(v))) return '[REDACTED]';
      if (v.includes('-----BEGIN PRIVATE KEY-----')) return '[REDACTED_PRIVATE_KEY]';
    }
    return v;
  });
  return JSON.parse(json ?? '{}');
};

export const logger = {
  info: (message: string, payload?: unknown) => {
    console.log(`[INFO] ${message}`, payload ? redact(payload) : '');
  },
  warn: (message: string, payload?: unknown) => {
    console.warn(`[WARN] ${message}`, payload ? redact(payload) : '');
  },
  error: (message: string, payload?: unknown) => {
    console.error(`[ERROR] ${message}`, payload ? redact(payload) : '');
  }
};
