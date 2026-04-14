# Vercel Deployment Checklist (Alivio Backend)

Use this checklist each time you deploy `backend/alivio-backend` to Vercel.

## 1) Pre-deployment

1. Confirm code is merged and up to date on the deployment branch.
2. Confirm `vercel.json` is present and committed.
3. Confirm backend dependencies are installed and lockfile is committed.
4. (Optional) Run local syntax checks:
   - `npm run check`

## 2) Configure Vercel project settings

In the Vercel dashboard for your backend project, set these environment variables:

- `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- `LLM_API_KEY`
- `LLM_MODEL`
- `ENABLE_CORS`
- `CORS_ORIGIN`

Apply variables to the environments you deploy (Production, Preview, and/or Development).

## 3) Build `GOOGLE_APPLICATION_CREDENTIALS_JSON`

From your service account file (`gcp-key.json`), produce a one-line JSON string and paste it into Vercel:

```bash
cat gcp-key.json | python -m json.tool -c
```

Windows-compatible one-liner (PowerShell):

```powershell
Get-Content .\gcp-key.json -Raw | python -m json.tool -c
```

## 4) Deploy on Vercel

1. Trigger deployment from Git integration or Vercel CLI.
2. Wait for deployment status to show **Ready**.
3. Copy the generated deployment URL (for example: `https://your-vercel-url.vercel.app`).

## 5) Post-deploy validation

From `backend/alivio-backend`, run:

```bash
npm run validate:deployment -- https://your-vercel-url.vercel.app
```

Expected result:

- All 4 checks pass.
- Summary reports `Passed: 4/4`.
- Command exits with status code `0`.

## 6) Custom domain checklist

1. Add your custom domain in Vercel Project → **Settings** → **Domains**.
2. Configure DNS records exactly as prompted by Vercel (typically CNAME to `cname.vercel-dns.com` for subdomains).
3. Wait for SSL certificate issuance to complete.
4. Re-run post-deploy validation against the custom domain URL.
5. Confirm browser and API clients can reach:
   - `/health`
   - `/api/status`

## 7) Production sign-off

1. Save validation command output in deployment notes.
2. Notify stakeholders that backend is healthy.
3. Monitor logs/alerts for the first 15–30 minutes after release.
