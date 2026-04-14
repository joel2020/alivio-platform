# Backend Deployment (Vercel)

This backend is configured to deploy as a Node.js serverless function on Vercel.

## Required Vercel Environment Variables

Set the following variables in your Vercel project settings:

- `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- `LLM_API_KEY`
- `LLM_MODEL` (recommended: `gpt-4o-mini`)

## Build `GOOGLE_APPLICATION_CREDENTIALS_JSON`

From your local credentials file, generate a one-line JSON string:

```bash
cat gcp-key.json | jq -c
```

Copy the output and paste it as the value for `GOOGLE_APPLICATION_CREDENTIALS_JSON` in Vercel.

## Custom Domain Setup

For `api.aliviosearchpartners.com`, create a DNS CNAME record pointing to:

- `cname.vercel-dns.com`

Then add `api.aliviosearchpartners.com` under your Vercel project's Domains settings.

## Health Check

After deployment, verify the service is healthy:

- `https://api.aliviosearchpartners.com/health`

Expected response includes:

- `ok: true`
- `status: "healthy"`
