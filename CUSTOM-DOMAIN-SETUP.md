# Custom Domain Setup (Production)

This guide covers DNS, SSL, and deployment options for running Alivio Search Partners in production.

## 1. Vercel custom domain (API)

1. In your Vercel project settings, add `api.aliviosearchpartners.com` as a custom domain.
2. Create the DNS record in your DNS provider:
   - Type: `CNAME`
   - Host/Name: `api`
   - Value/Target: `cname.vercel-dns.com`
3. Wait for DNS propagation and verify Vercel marks the domain as configured.
4. Confirm SSL is auto-provisioned by Vercel (certificate status should be valid).
5. Test API health:

```bash
curl https://api.aliviosearchpartners.com/health
```

## 2. Frontend deployment options

### Option A — Vercel (recommended)

- Deploy the `frontend/` folder as a separate Vercel static project.
- Point `aliviosearchpartners.com` to that frontend project.

### Option B — Existing host (Hostinger or other)

- Upload `frontend/alivio-dashboard.html` to `public_html`.
- Set `window.ALIVIO_API_BASE` to `https://api.aliviosearchpartners.com`.
- Add `CORS_ORIGIN=https://aliviosearchpartners.com` to backend environment variables on Vercel.

### Option C — Same-origin `/api` proxy

- Configure a Hostinger reverse proxy: `/api/*` → `https://api.aliviosearchpartners.com/*`.
- Set `ENABLE_CORS=false` on backend (same origin means CORS is not needed).

## 3. End-to-end validation checklist

- [ ] `api.aliviosearchpartners.com/health` returns `ok`
- [ ] Dashboard loads and shows green health dot
- [ ] Test query returns results (after crawl completes)
- [ ] No credentials visible in browser network tab
- [ ] HTTPS only, with no mixed-content warnings
