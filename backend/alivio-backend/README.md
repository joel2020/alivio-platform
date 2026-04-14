# Alivio Backend Scaffold (CommonJS)

This folder is the **scaffold target path** for the Alivio recruiter backend:

- `backend/alivio-backend`

> Status: **Scaffold only**. This merge is intentionally pending runtime validation of Vertex IAM permissions, service-account wiring, and environment variables.

## Implemented routes

- `GET /health`
- `POST /api/vertex-search`
- `POST /api/recruiter-search`

## Runtime assumptions

- Backend-only Google auth via `GOOGLE_APPLICATION_CREDENTIALS`
- Local development key path: `C:\alivio-backend\service-account.json`
- Primary intended service account: `vertex-express@alivio-475419.iam.gserviceaccount.com`
- Vertex endpoint:
  `https://discoveryengine.googleapis.com/v1alpha/projects/807488403515/locations/global/collections/default_collection/engines/alivio-search_1776189054215/servingConfigs/default_search:search`
- Serving config:
  `projects/807488403515/locations/global/collections/default_collection/engines/alivio-search_1776189054215/servingConfigs/default_search`

## PowerShell (Windows) local run

```powershell
# 1) Enter scaffold backend folder in this repo
cd backend/alivio-backend

# 2) Install dependencies
npm install

# 3) Create local env file
Copy-Item .env.example .env

# 4) Start API server
npm run dev
```

## PowerShell quick tests

```powershell
# Health
Invoke-RestMethod -Method GET -Uri http://localhost:8080/health

# Shared body
$body = @{ query = 'Find Directors of Nursing in New Jersey with SNF experience and multi-site leadership'; pageSize = 10 } | ConvertTo-Json

# Vertex retrieval (normalized)
Invoke-RestMethod -Method POST -Uri http://localhost:8080/api/vertex-search -ContentType 'application/json' -Body $body

# Retrieval + OpenAI generation (OpenAI called only after retrieval)
Invoke-RestMethod -Method POST -Uri http://localhost:8080/api/recruiter-search -ContentType 'application/json' -Body $body
```

## Notes

- Do not place service account keys or private secrets in frontend code.
- Keep this backend as the only location where Google credentials are used.
- `/api/recruiter-search` returns:

```json
{
  "ok": true,
  "query": "...",
  "grounded": [],
  "generated": "..."
}
```
