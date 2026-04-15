# Alivio Search Partners Backend (CommonJS)

Production-leaning Express backend for Alivio Search Partners retrieval and recruiter-assist generation.

## Routes

- `GET /health`
- `POST /api/vertex-search`
- `POST /api/recruiter-search`
- `POST /api/outreach-draft`

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


## Smoke tests, payload fixtures, and response validation

These scripts are intentionally lightweight and framework-agnostic, so you can validate backend behavior while the main implementation thread continues independently.

### Base URL assumptions

All scripts use `ALIVIO_API_BASE_URL` and default to `http://localhost:8080` when unset.

```bash
export ALIVIO_API_BASE_URL=http://localhost:8080
```

### Run smoke tests

From `backend/alivio-backend`:

```bash
npm run smoke:health
npm run smoke:vertex
npm run smoke:recruiter
npm run smoke
```

Optional payload override examples:

```bash
node scripts/smoke-vertex.js examples/payloads/job-search.json
node scripts/smoke-recruiter.js examples/payloads/recruiter-copilot.json
```

### Success vs failure interpretation

- **Success**: script exits with code `0` and prints a pass message with high-level counts/fields.
- **Failure**: script exits non-zero and prints HTTP status and response body (or validation errors).

A failing smoke test usually indicates one of:

- backend not running at `ALIVIO_API_BASE_URL`
- request validation error (`query`, `pageSize`)
- upstream dependency issue (Vertex/OpenAI auth, timeout, or API error)
- response-shape regression

### Required response fields for grounded and generated flows

For `POST /api/vertex-search`, smoke checks expect:

- `ok`
- `query`
- `grounded.results` (array)

For `POST /api/recruiter-search`, smoke + shape validation expect:

- `ok`
- `query`
- `grounded.results` (array)
- `generated.ranked_matches` (array)
- `generated.explanation` (string)
- `generated.outreach_draft` (string)

For `POST /api/outreach-draft`, expect:

- `ok`
- `input.role` (string)
- `input.outreach_tone` (`professional` | `warm` | `direct`)
- `grounded.results` (array, first 3 results)
- `generated.subject_line` (string)
- `generated.outreach_message` (string)
- `generated.fit_summary` (array)
- `generated.talking_points` (array)

Use the standalone validator against a saved response:

```bash
npm run validate:recruiter-shape -- /tmp/recruiter-response.json
# or
cat /tmp/recruiter-response.json | npm run validate:recruiter-shape
```

### Reusable healthcare recruiting payload fixtures

`examples/payloads/` includes practical samples aligned to Alivio Search Partners workflows:

- `candidate-search.json`
- `job-search.json`
- `job-to-candidate-matching.json`
- `candidate-to-job-matching.json`
- `recruiter-copilot.json`


### `POST /api/outreach-draft`

Use this when a recruiter already knows the hiring context and wants a practical outreach draft that is grounded in Vertex retrieval before LLM drafting.

Request JSON:

```json
{
  "role": "Director of Nursing",
  "location": "New Jersey",
  "care_setting": "Skilled Nursing Facility",
  "seniority": "Director",
  "outreach_tone": "warm",
  "reason_for_fit": "Multi-site SNF leadership and survey readiness ownership",
  "pageSize": 8
}
```

Success response example:

```json
{
  "ok": true,
  "input": {
    "role": "Director of Nursing",
    "location": "New Jersey",
    "care_setting": "Skilled Nursing Facility",
    "seniority": "Director",
    "outreach_tone": "warm",
    "reason_for_fit": "Multi-site SNF leadership and survey readiness ownership",
    "pageSize": 8
  },
  "query": "Find healthcare candidates for recruiter outreach. Role: Director of Nursing. Location: New Jersey. Care setting: Skilled Nursing Facility. Seniority: Director",
  "grounded": {
    "totalSize": 11,
    "results": []
  },
  "generated": {
    "subject_line": "Director of Nursing opportunity in New Jersey SNF settings",
    "outreach_message": "Hi <First Name>, I support SNF operators in New Jersey that are hiring Director-level nursing leaders. Your background appears aligned with the role scope, especially around multi-site leadership and readiness work. If you are open, I would value a short call to share details and hear what you want in your next step.",
    "fit_summary": [
      "Targets Director of Nursing leadership in NJ SNF environments.",
      "Centers on the recruiter-provided fit reason for survey readiness and multi-site oversight."
    ],
    "talking_points": [
      "Scope of teams and facilities currently led",
      "Survey outcomes and quality improvement ownership",
      "Compensation and relocation preferences"
    ]
  }
}
```

Sample outreach outputs for common Alivio workflows:

1) **LNHA (direct tone)**

- Subject: `LNHA leadership opening | Post-acute growth facility`
- Message: `Hi <First Name>, I am recruiting for a post-acute operator seeking an LNHA to stabilize census and lead interdisciplinary operations. Your profile appears relevant to turnaround-focused leadership in skilled settings. Would you be open to a 15-minute call this week to discuss scope and support model?`

2) **MDS Coordinator (professional tone)**

- Subject: `MDS Coordinator role | quality and reimbursement focus`
- Message: `Hello <First Name>, we are partnering with a skilled nursing team seeking an MDS Coordinator with strong assessment accuracy and reimbursement workflow ownership. Your background appears aligned with the clinical documentation priorities for this opening. If you are open, I can share role details and expected onboarding timeline in a short call.`

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
  - Lightweight reusable API client for website usage.
  - Methods: `vertexSearch(...)` and `recruiterSearch(...)`.
  - Exposes `window.AlivioApiClient.createClient(...)` in browsers.
  - Supports CommonJS import (`require(...)`) for server-rendered pages.
- `examples/website-integration-example.html`
  - Static-site-ready example with selectable call to `/api/vertex-search` or `/api/recruiter-search`.
  - Includes recruiter UI flow: query input -> request -> render ranked matches + outreach draft.
- `examples/README.md`
  - Mock response rendering references for frontend UI patterns (grounded results, ranked matches, explanation, outreach draft).
- `examples/frontend-integration-usage.js`
  - Small helper examples for static + simple JS app + server-rendered page integration.

### Client usage

```html
<script src="/path/to/alivio-api-client.js"></script>
<script>
  const client = window.AlivioApiClient.createClient({
    baseUrl: 'https://api.aliviosearchpartners.com'
  });

  const vertexResult = await client.vertexSearch({
    query: 'Find ICU travel nurses in Texas with active compact RN license',
    pageSize: 8
  });

  const recruiterResult = await client.recruiterSearch({
    query: 'Match this role to likely candidates: Director of Nursing in New Jersey, SNF and multi-site leadership required',
    pageSize: 10
  });
</script>
```

If your backend is reverse-proxied on the same domain under `/api`, set `baseUrl` to empty (`''`) and keep API paths relative.

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

### Response rendering fields from `/api/recruiter-search`

- `generated.ranked_matches` (array): render as ranked cards/list rows.
- `generated.explanation` (string): render as why-these-matches summary.
- `generated.outreach_draft` (string): render in recruiter outreach editor.
- `grounded.results` (array): optional evidence/debug panel for confidence and provenance.
- `requestId` (string, on errors and some proxies): surface in support logs and incident tickets when available.

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

## Website-oriented integration patterns

### 1) Static site

- Serve `frontend/alivio-api-client.js` as an asset.
- Instantiate with `baseUrl` pointing at API origin or blank for same-origin `/api` proxy.
- Use `examples/website-integration-example.html` as a drop-in starter.

### 2) Simple JavaScript app

- Use `examples/frontend-integration-usage.js` and call `runSimpleAppFlow(client, query)`.
- Bind query input and render blocks to:
  - ranked matches (`generated.ranked_matches`)
  - explanation (`generated.explanation`)
  - outreach draft (`generated.outreach_draft`)

### 3) Server-rendered page (Node)

- Require the shared client (`frontend/alivio-api-client.js`) in your route/controller.
- Fetch from backend on server side, then render HTML with hydrated response sections.
- Use `createServerRenderedModel(...)` in `examples/frontend-integration-usage.js` as a template.

## Website deployment topology and routing

Use either topology; keep auth backend-only in both.

### Topology A: dedicated API subdomain

- Website origin: `https://aliviosearchpartners.com`
- Backend origin: `https://api.aliviosearchpartners.com`
- Frontend client config: `baseUrl: 'https://api.aliviosearchpartners.com'`

This topology is usually cleanest when backend and website are deployed independently.

### Topology B: backend mounted under `/api` on same origin

- Website origin: `https://aliviosearchpartners.com`
- Backend routed behind same domain path prefix, e.g. `/api/*`
- Frontend client config: `baseUrl: ''` and call relative backend paths

This avoids cross-origin browser requests and usually avoids CORS configuration.

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
