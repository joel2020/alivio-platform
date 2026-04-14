# Monitoring Guide

This backend emits structured JSON logs, exposes `/api/status`, and fails fast on unhandled runtime exceptions.

## Structured logs on Vercel

1. Open your Vercel project.
2. Go to **Functions**.
3. Open a recent invocation for this backend.
4. Review log lines as JSON (one object per line).

For production error tracking, filter for error responses (`statusCode >= 400`) and watch these fields:

- `timestamp`
- `requestId`
- `route`
- `statusCode`
- `errorCode`
- `message`
- `durationMs`

Sensitive values are intentionally not logged (query content, API keys, credentials).

## Optional: Vercel log drains (Datadog / Logtail)

You can forward the same structured logs to an external observability tool.

### Datadog (optional)

1. In Vercel, go to **Settings → Log Drains**.
2. Add a new drain targeting Datadog.
3. Provide the Datadog intake URL and API key.
4. Verify logs appear in Datadog and parse JSON fields for dashboards/alerts.

### Logtail (optional)

1. In Vercel, go to **Settings → Log Drains**.
2. Add a new drain targeting Better Stack / Logtail.
3. Configure source token and ingestion endpoint.
4. Validate that JSON fields (`statusCode`, `errorCode`, `durationMs`, etc.) are indexed.

## `/api/status` endpoint

`GET /api/status` returns:

- `ok` (always `true` when the endpoint is reachable)
- `version` (`process.env.npm_package_version`)
- `uptime` (`process.uptime()`)
- `mode` (`process.env.APP_MODE || 'live'`)
- `vertexEndpoint` (`configured` or `missing`)
- `openaiKey` (`configured` or `missing`)
- `gcpCredentials` (`configured` or `missing`)
- `timestamp` (ISO string)

Use this endpoint to quickly confirm deployment health and required integration configuration without exposing secret values.

## Alert thresholds to monitor

Start with these baseline thresholds and tune over time:

- **5xx rate:** alert when sustained above 2% over 5 minutes.
- **Response time:** alert when `durationMs` is consistently above 10,000 ms.
- **OpenAI timeout:** alert on recurring timeout-related errors (for example, `OPENAI_REQUEST_FAILED` paired with timeout messages).

