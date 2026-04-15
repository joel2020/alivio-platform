# Alivio Backend (Express + TypeScript)

This folder is a local backend service that runs in **mock mode by default** and exposes provider-based AI-agent endpoints.

## Implemented endpoints

- `GET /health`
- `GET /api/health`
- `POST /api/agents/scoutready/run`
- `POST /api/agents/matchready/run`
- `POST /api/agents/enrichready/run`
- `POST /api/agents/signalready/run`
- `POST /api/agents/engageready/run`
- `POST /api/agents/monitorready/run`
- `POST /api/agents/parse-resume/run`

## Architecture

- **Providers** (swappable): retrieval, LLM, monitoring, resume parsing.
- **Services**: search, matching, enrichment, fit scoring, outreach, monitoring, resume parsing.
- **Agents**: ScoutReady, MatchReady, EnrichReady, SignalReady, EngageReady, MonitorReady, Parse Resume.
- Detailed architecture doc (flows + module glossary + Mermaid): `backend/docs/architecture.md`.
- Recruiter-facing request flow reference (including webhook integration notes): `backend/docs/recruiter-request-flow.md`.

## Quick start

```bash
cd backend
npm install
npm run dev
```

Backend starts on `http://localhost:8787` by default.

## Environment variables

Copy `.env.example` to `.env` and adjust values as needed.

Pre-filled Google settings:

- `GOOGLE_PROJECT_ID=alivio-475419`
- `GOOGLE_ENGINE_ID=AQ.Ab8RN6Ik78BXLwMDA05UnoNhsV6lgiDGUFHcSaGyCyT6p-20UQ`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL=vertex-express@alivio-475419.iam.gserviceaccount.com`

### Modes

- `APP_MODE=mock` (default): uses seeded in-memory data.
- `APP_MODE=live`: uses Vertex AI Search provider for retrieval.

## Example request

```bash
curl -X POST http://localhost:8787/api/agents/scoutready/run \
  -H "Content-Type: application/json" \
  -d '{"role":"Director of Nursing","geography":"California","limit":5}'
```

Sample payloads and outputs are available in `backend/examples/*.json`.

A lightweight recruiter workflow pack (candidate search, job search, matching, copilot) is available in:

- `backend/examples/recruiter-workflow-pack/`

## Workflow map

For practical agent-to-endpoint orchestration guidance, see:

- `docs/agent-workflow-map.md`
- `examples/agent-workflow-map.yaml`

## Recruiter prompt fixtures

Reusable prompt fixtures and workflow examples live in `shared/prompt-library/`:

- `shared/prompt-library/recruiter-prompts.fixtures.json`
- `shared/prompt-library/recruiter-workflow-examples.json`
- `shared/prompt-library/prompt-taxonomy.md`

These fixtures are designed to be consumed by frontend prompt pickers, backend test/examples, and future recruiter-agent workflows.
