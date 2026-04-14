# Alivio Search Partners Backend (CommonJS)

Production-leaning Express backend for Alivio Search Partners retrieval and recruiter-assist generation.

## Routes

- `GET /health`
- `POST /api/vertex-search`
- `POST /api/recruiter-search`

Reusable sample recruiter query:

`Find Directors of Nursing in New Jersey with SNF experience and multi-site leadership`

## Local run

```bash
cd backend/alivio-backend
npm install
cp .env.example .env
npm run dev
```

Server binds to `process.env.PORT` and defaults to `8080` when unset.

## Docker build and run

```bash
cd backend/alivio-backend
docker build -t alivio-backend:local .
docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e GOOGLE_APPLICATION_CREDENTIALS=/var/secrets/google/key.json \
  -v "$PWD/dev-service-account.json:/var/secrets/google/key.json:ro" \
  alivio-backend:local
```

Notes:

- For local Docker runs only, `GOOGLE_APPLICATION_CREDENTIALS` can point to a mounted key file.
- In Cloud Run, prefer attached service account identity instead of key files.

## Cloud Run deployment approach

Example deployment (adjust region, artifact image, and secret refs):

```bash
gcloud run deploy alivio-search-backend \
  --project alivio-475419 \
  --region us-central1 \
  --image us-central1-docker.pkg.dev/alivio-475419/alivio/alivio-backend:latest \
  --service-account vertex-express@alivio-475419.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,SERVICE_NAME=alivio-search-partners-backend,VERTEX_SEARCH_ENDPOINT=https://discoveryengine.googleapis.com/v1alpha/projects/807488403515/locations/global/collections/default_collection/engines/alivio-search_1776189054215/servingConfigs/default_search:search,VERTEX_SEARCH_SERVING_CONFIG=projects/807488403515/locations/global/collections/default_collection/engines/alivio-search_1776189054215/servingConfigs/default_search \
  --set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest
```

Cloud Run injects `PORT`; this app already listens on `process.env.PORT`.

`GET /health` returns `200` JSON with a small readiness payload and is suitable for health checks.

## Environment variables and secrets

See `.env.example` for the full list. Key variables:

- `PORT` (default `8080`)
- `GOOGLE_APPLICATION_CREDENTIALS` (local/dev key file path only)
- `VERTEX_SEARCH_ENDPOINT` (defaults to exact Alivio endpoint)
- `VERTEX_SEARCH_SERVING_CONFIG` (defaults to exact Alivio serving config)
- `VERTEX_TIMEOUT_MS` (default `15000`)
- `OPENAI_API_KEY` (required for `/api/recruiter-search`)
- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `OPENAI_TIMEOUT_MS` (default `30000`)
- `ENABLE_CORS` and `CORS_ORIGIN` (optional; disabled by default)

Secret guidance:

- Never commit real credentials, `.env` files, or service-account keys.
- Use Secret Manager + runtime secret injection (`--set-secrets`) for `OPENAI_API_KEY`.
- Use runtime env vars (`--set-env-vars`) for non-secret config.

## Service account expectations

Intended runtime identity:

- `vertex-express@alivio-475419.iam.gserviceaccount.com`

Expected behavior:

- Cloud Run workload identity should authenticate to Vertex AI Search.
- No frontend or browser code should hold Google or OpenAI credentials.
- Keep this backend as the only auth boundary for Google/OpenAI calls.

## Runtime caveats

- `OPENAI_API_KEY` is required only for `POST /api/recruiter-search`.
- `POST /api/vertex-search` can work with Google auth only.
- Structured logs are JSON lines and include request-safe metadata only (no secret values).
- Request IDs are accepted from `x-request-id` (or configured header) and generated when missing.

## Frontend integration package (framework-agnostic)

### Files

- `frontend/alivio-api-client.js`
  - Lightweight reusable API client for website use.
  - Exposes `window.AlivioApiClient.createClient(...)` in browsers.
  - Also supports CommonJS import (`require(...)`) for server-rendered pages.
- `examples/website-integration-example.html`
  - Minimal website flow (query input -> backend call -> render ranked matches and outreach draft).

### Client usage

```html
<script src="/path/to/alivio-api-client.js"></script>
<script>
  const client = window.AlivioApiClient.createClient({
    baseUrl: 'https://api.aliviosearchpartners.com'
  });

  const recruiterResult = await client.recruiterSearch({
    query: 'Find Directors of Nursing in New Jersey with SNF experience',
    pageSize: 10
  });
</script>
```

If your backend is reverse-proxied on the same domain under `/api`, set `baseUrl` to an empty string and keep API paths relative.

## Website integration contract

This backend is the only layer that talks to Google Cloud and OpenAI. The website should call these API routes and should **not** contain Google or OpenAI credentials.

### `POST /api/vertex-search`

Use this when the website only needs grounded retrieval results from Vertex AI Search.

Request JSON:

```json
{
  "query": "Find ICU travel nurses in Texas with active compact RN license",
  "pageSize": 8
}
```

Request fields:

- `query` (string, required, max 500 chars)
- `pageSize` (integer, optional, clamped to 1-20, default 10)

Success response shape (high-level):

```json
{
  "ok": true,
  "query": "...",
  "grounded": {
    "totalSize": 12,
    "attributionToken": "...",
    "results": [
      {
        "rank": 1,
        "title": "...",
        "role": "...",
        "location": "...",
        "sourceType": "candidate"
      }
    ]
  }
}
```

### `POST /api/recruiter-search`

Use this for recruiter copilot responses grounded on Vertex results. Flow:

1. Validates request.
2. Runs Vertex search.
3. Normalizes and validates grounded payload.
4. Sends only grounded JSON to OpenAI for response generation.

Request JSON:

```json
{
  "query": "Match this role to likely candidates: Director of Nursing in New Jersey, SNF and multi-site leadership required",
  "pageSize": 10
}
```

Success response rendering fields:

- `generated.ranked_matches` (array): render as ranked cards/list rows.
- `generated.explanation` (string): render as why-these-matches summary.
- `generated.outreach_draft` (string): render in recruiter outreach editor.
- `grounded.results` (array): optional evidence/debug panel for confidence and provenance.
- `requestId` (string, on errors and many proxies): surface in support logs and incident tickets when available.

Error response shape (`4xx/5xx`):

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required string field: query",
    "details": {
      "field": "query"
    }
  },
  "requestId": "ff4fc321-86f7-4df5-9f2a-198870130ca1"
}
```

## Website deployment topology and routing

Use either topology; keep auth backend-only in both.

### Topology A: dedicated API subdomain

- Website origin: `https://aliviosearchpartners.com`
- Backend origin: `https://api.aliviosearchpartners.com`
- Frontend client config: `baseUrl: 'https://api.aliviosearchpartners.com'`

When using this topology, browser CORS is typically required.

### Topology B: backend mounted under `/api` on same origin

- Website origin: `https://aliviosearchpartners.com`
- Backend routed behind same domain path prefix, e.g. `/api/*`
- Frontend client config: `baseUrl: ''` and call relative backend paths

This avoids cross-origin calls and usually avoids CORS configuration.

### Routing assumptions to keep consistent

- Backend routes are fixed at `/api/vertex-search` and `/api/recruiter-search`.
- If an ingress/proxy rewrites paths, ensure rewritten destination still matches these backend routes.
- Preserve request/response JSON and `x-request-id` header for debugging across layers.

## Alivio sample recruiter queries by workflow

- Candidate search:
  - `Find senior healthcare operations candidates in New Jersey with SNF and multi-site leadership experience.`
- Job search:
  - `Find open Director of Nursing roles in New Jersey requiring SNF and multi-site leadership background.`
- Job-to-candidate matching:
  - `Match this role to likely candidates: Director of Nursing in New Jersey, SNF and multi-site leadership required.`
- Candidate-to-job matching:
  - `Given this candidate profile: RN leader with SNF and multi-site oversight in NJ, find best-fit open roles.`
- Recruiter copilot:
  - `Draft a recruiter-ready shortlist and outreach for Directors of Nursing in New Jersey with SNF experience and multi-site leadership.`

## Optional CORS guidance

Enable CORS only if frontend and backend are on different origins.

- `ENABLE_CORS=true`
- `CORS_ORIGIN=https://aliviosearchpartners.com`

Current server behavior when enabled:

- Allows `POST,GET,OPTIONS`
- Allows `Content-Type` and request-id header
- Returns `204` for preflight `OPTIONS`
