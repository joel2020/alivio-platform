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

Server defaults to `http://localhost:8080`.

## Environment variables

See `.env.example` for the full list. Key variables:

- `PORT` (default `8080`)
- `GOOGLE_APPLICATION_CREDENTIALS` (service-account key file path for local/dev)
- `VERTEX_SEARCH_ENDPOINT` (defaults to exact Alivio endpoint)
- `VERTEX_SEARCH_SERVING_CONFIG` (defaults to exact Alivio serving config)
- `VERTEX_TIMEOUT_MS` (default `15000`)
- `OPENAI_API_KEY` (required for `/api/recruiter-search`)
- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `OPENAI_TIMEOUT_MS` (default `30000`)
- `ENABLE_CORS` and `CORS_ORIGIN` (optional; disabled by default)

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

Success response (`200`):

```json
{
  "ok": true,
  "query": "Find ICU travel nurses in Texas with active compact RN license",
  "grounded": {
    "totalSize": 8,
    "attributionToken": "token_abc123",
    "results": [
      {
        "rank": 1,
        "id": "candidate_001",
        "title": "ICU RN - Austin, TX",
        "uri": "https://aliviosearchpartners.com/candidates/candidate_001",
        "snippet": "8 years ICU experience, compact RN license, rapid response team.",
        "snippets": [
          "8 years ICU experience, compact RN license, rapid response team."
        ],
        "extractiveSegments": [
          {
            "rank": 1,
            "content": "Compact RN license and 4 travel ICU assignments.",
            "pageNumber": 1,
            "confidenceScore": null
          }
        ],
        "metadata": {
          "source": "ATS",
          "company": "Alivio Search Partners",
          "location": "Austin, TX"
        },
        "rawDocumentName": "projects/.../documents/candidate_001"
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

Success response (`200`):

```json
{
  "ok": true,
  "query": "Match this role to likely candidates: Director of Nursing in New Jersey, SNF and multi-site leadership required",
  "grounded": {
    "totalSize": 10,
    "attributionToken": "token_xyz789",
    "results": []
  },
  "generated": "Top matches are Candidate A, Candidate B, and Candidate C. Candidate A has 6 years multi-site SNF leadership in New Jersey..."
}
```

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
  "requestId": "req_1713000000000"
}
```

## Frontend example (website/chat widget)

A minimal browser integration example is available at `examples/recruiter-search-widget.html`.

Quick inline snippet:

```html
<script>
  async function runRecruiterSearch(query) {
    const response = await fetch('https://api.aliviosearchpartners.com/api/recruiter-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, pageSize: 8 })
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data?.error?.message || 'Recruiter search failed');
    }

    return data.generated;
  }
</script>
```

## Deployment pathing recommendation

Keep frontend and backend separated:

1. Deploy backend as either:
   - subdomain (`https://api.aliviosearchpartners.com`), or
   - API path behind same domain (`https://aliviosearchpartners.com/api/...`).
2. Website frontend calls backend endpoints only.
3. Backend handles Google auth and OpenAI auth privately.
4. Never expose `GOOGLE_APPLICATION_CREDENTIALS` or `OPENAI_API_KEY` to frontend code.

## Optional CORS guidance (cross-origin frontend/backend)

If frontend and backend are on different origins, enable strict CORS:

- `ENABLE_CORS=true`
- `CORS_ORIGIN=https://aliviosearchpartners.com`

Current server behavior when enabled:

- Allows `POST,GET,OPTIONS`
- Allows `Content-Type` and request-id header
- Returns `204` for preflight `OPTIONS`

## Practical recruiter prompts by workflow

Use these prompts in website widgets, recruiter console, or internal tooling.

### 1) Candidate search

- `Find ICU travel nurses in Texas with active compact RN license and charge nurse experience.`
- `Find Directors of Nursing in New Jersey with SNF turnaround and survey readiness history.`

### 2) Job search

- `Find open Director of Nursing roles in New Jersey requiring multi-site SNF leadership.`
- `Find healthcare operations roles needing interim leadership in Northeast markets.`

### 3) Job-to-candidate matching

- `Given this job req, identify top 5 candidate matches and note strongest evidence for each.`
- `Match this ICU nurse manager role to candidates with Magnet facility and staffing-ratio improvement outcomes.`

### 4) Candidate-to-job matching

- `Given candidate profile C-204, suggest top matching open roles ranked by fit and location alignment.`
- `For this candidate's SNF leadership background, suggest roles where they can start within 30 days.`

### 5) Recruiter copilot

- `Draft a concise recruiter brief summarizing top matches and key risks for stakeholder review.`
- `Prepare a candidate outreach angle for the top 3 matches using only grounded search evidence.`

## Deployment notes

- Intended service account: `vertex-express@alivio-475419.iam.gserviceaccount.com`.
- For cloud deployment, prefer workload identity / attached service account over JSON key files.
- Keep this backend as the only place with Google credentials and OpenAI secrets.

## Runtime validation status

Code is hardened and structured for production use, but this repository alone does **not** claim live runtime validation of IAM, network path, or external API quotas.
