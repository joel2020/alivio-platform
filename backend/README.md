# Alivio Search Partners Multi-Agent Backend

Production-style Express + TypeScript backend for internal healthcare recruiting operations.

## Features
- Modular provider architecture (`RetrievalProvider`, `LLMProvider`, `ResumeParserProvider`, `MonitoringProvider`)
- Agent modules: ScoutReady, MatchReady, EnrichReady, SignalReady, EngageReady, MonitorReady, Parse Resume
- Mock mode runs locally without Google credentials
- Live mode uses Vertex AI Search / Discovery Engine retrieval via REST + `google-auth-library`
- OpenAI-compatible LLM integration for reasoning/generation
- In-memory monitoring + `/api/metrics`
- Lightweight dashboard at `/dashboard`

## Setup
```bash
npm install
npm run backend:start
```

## Environment variables
Copy from `../.env.example`.

Key variables:
- `APP_MODE=mock|live`
- `GOOGLE_PROJECT_ID`, `GOOGLE_LOCATION`, `GOOGLE_ENGINE_ID`, `GOOGLE_SERVING_CONFIG`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY`
- `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`

## Mock mode vs live mode
- **Mock mode (`APP_MODE=mock`)**: uses local seed datasets (40 candidates, 20 jobs, 10 clients).
- **Live mode (`APP_MODE=live`)**: swaps retrieval to Vertex Discovery Engine provider while scoring logic remains deterministic in app services.

## Vertex usage across agents
- ScoutReady/MatchReady/JobSearch/CandidateSearch call the shared retrieval provider.
- In live mode these flow through `VertexDiscoveryEngineProvider`.
- SignalReady and EngageReady first receive retrieval-scoped entities, then apply LLM reasoning.

## Switch LLM providers
- Set `LLM_API_KEY` to enable `OpenAICompatibleLLMProvider`.
- Without API key, app uses deterministic `MockLLMProvider`.

## Run locally
```bash
npm run backend:start
# Dashboard: http://localhost:8787/dashboard
```

## Sample curl commands
```bash
curl -X POST http://localhost:8787/api/agents/scoutready/run -H 'content-type: application/json' -d '{"role":"Director of Nursing","geography":"NY"}'
curl -X POST http://localhost:8787/api/agents/matchready/run -H 'content-type: application/json' -d '{"jobId":"job-1"}'
curl -X POST http://localhost:8787/api/agents/parse-resume/run -H 'content-type: application/json' -d '{"resumeText":"Jordan Patel\nRN\nDirector of Nursing\nMiami, FL\n12 years experience"}'
```

## n8n / Supabase Edge integration
- n8n HTTP nodes can trigger each `/api/agents/*/run` route and persist responses in CRM tables.
- Supabase Edge Functions can proxy to this backend for orchestration while keeping auth/session policies centralized.

## Sample outputs
See JSON artifacts in `../backend/examples/*.sample.json`.
