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

## API contract

### `GET /health`

`200 OK`

```json
{
  "ok": true,
  "service": "alivio-search-partners-backend",
  "env": "development",
  "timestamp": "2026-04-14T00:00:00.000Z"
}
```

### `POST /api/vertex-search`

Request:

```json
{
  "query": "Find Directors of Nursing in New Jersey with SNF experience and multi-site leadership",
  "pageSize": 10
}
```

Response (`200`):

```json
{
  "ok": true,
  "query": "...",
  "grounded": {
    "totalSize": 10,
    "attributionToken": "...",
    "results": [
      {
        "rank": 1,
        "id": "...",
        "title": "...",
        "uri": "...",
        "snippet": "...",
        "snippets": ["..."],
        "extractiveSegments": [
          {
            "rank": 1,
            "content": "...",
            "pageNumber": 1,
            "confidenceScore": null
          }
        ],
        "metadata": {
          "source": null,
          "company": null,
          "location": null
        },
        "rawDocumentName": null
      }
    ]
  }
}
```

### `POST /api/recruiter-search`

Behavior:
1. Validates input.
2. Runs Vertex search first.
3. Normalizes/validates grounded results.
4. Sends only grounded normalized JSON to OpenAI.

Response (`200`):

```json
{
  "ok": true,
  "query": "...",
  "grounded": {
    "totalSize": 10,
    "attributionToken": "...",
    "results": []
  },
  "generated": "..."
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
  "requestId": "req_..."
}
```

## Deployment notes

- Intended service account: `vertex-express@alivio-475419.iam.gserviceaccount.com`.
- For cloud deployment, prefer workload identity / attached service account over JSON key files.
- Keep this backend as the only place with Google credentials and OpenAI secrets.
- CORS is disabled by default. If deploying with a separate frontend origin, explicitly set:
  - `ENABLE_CORS=true`
  - `CORS_ORIGIN=https://your-frontend-origin`

## Runtime validation status

Code is hardened and structured for production use, but this repository alone does **not** claim live runtime validation of IAM, network path, or external API quotas.
