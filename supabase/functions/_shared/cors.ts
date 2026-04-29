const ALLOWED_ORIGINS = new Set([
  "https://aliviosearchpartners.com",
  "https://www.aliviosearchpartners.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
]);

/**
 * Returns CORS headers that reflect the request origin when it is allowed,
 * falling back to the production origin for un-allowed or missing origins.
 * All Edge Functions should use this instead of a hardcoded wildcard.
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://aliviosearchpartners.com";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Vary": "Origin",
  };
}
