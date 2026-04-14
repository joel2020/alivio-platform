# Alivio Platform Architecture

## Canonical deployment target

For first production deployment to Vercel, deploy **`backend/alivio-backend/`**.

- `backend/alivio-backend/` → **production backend** (CommonJS + Express, Vertex AI Search + OpenAI/LLM integration, Vercel-ready).
- `backend/` → **future agent layer** (TypeScript multi-agent orchestration, currently mock-first / future expansion, not the canonical production API yet).
- `frontend/` → recruiter dashboard UI assets.
- `shared/` → shared prompt library and fixtures.
- `docs/` → architecture/workflow/integration/deployment guides.

## Runtime layout

### Production backend (`backend/alivio-backend`)
- Default local port: `3000` from `.env.example` (runtime reads `PORT` with fallback in config).
- Framework: Express (CommonJS).
- Integrations: Vertex AI Search, OpenAI-compatible LLM.
- Deployment config: `backend/alivio-backend/vercel.json`.

### Agent backend (`backend`)
- Default local port: `8787` (from `backend/.env.example`).
- Framework: Express + TypeScript agents.
- Mode: mock/live based on env; currently positioned as a future layer.

## API surface

### `backend/alivio-backend/server.js`
- `GET /health`
- `GET /api/status`
- `POST /api/vertex-search`
- `POST /api/recruiter-search`
- `POST /api/webhook/n8n`

### `backend/src/app.ts` (agent layer)
- `GET /health`
- `GET /api/health`
- `POST /api/agents/scoutready/run`
- `POST /api/agents/matchready/run`
- `POST /api/agents/enrichready/run`
- `POST /api/agents/signalready/run`
- `POST /api/agents/engageready/run`
- `POST /api/agents/monitorready/run`
- `POST /api/agents/parse-resume/run`
- `GET /api/agents/logs`
- `GET /api/metrics`
- `GET /dashboard`

## Route conflict check (between both backends)

- **Conflict found:** `GET /health` exists in both services.
  - This is safe while services run independently, but would conflict if mounted behind the same host/path prefix.
- No other exact route conflicts were found.
