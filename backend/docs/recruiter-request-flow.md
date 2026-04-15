# Recruiter Request Flow (Backend)

Practical request-path reference for recruiter-facing backend calls. This is documentation-only and reflects current behavior in `backend/src`.

## 1) Standard recruiter request flow

1. Client sends `POST /api/agents/<agent>/run`.
2. `src/app.ts` applies request defaults where needed (`jobId`, `candidate`, `resumeText`).
3. Route delegates to `AgentOrchestratorService`.
4. Agent starts monitoring timer and runs domain services.
5. Services use provider interfaces for retrieval/LLM/parser integrations.
6. Agent returns structured JSON, route responds directly.

## 2) Retrieval and normalization path (Vertex live mode)

When `APP_MODE=live`, candidate/job retrieval goes through `VertexDiscoveryEngineProvider`:

- Discovery Engine search request is issued using Google auth.
- Response docs are normalized to internal `Candidate` / `Job` models.
- Missing fields are defaulted to keep service contracts stable.

When `APP_MODE=mock`, the same services are fed by `MockRetrievalProvider` seeded data.

## 3) Ranking path

`MatchReady` path:

- `MatchingService.matchByJob(jobId)` resolves job context.
- Candidate pool is fetched from retrieval provider.
- `FitScoringService` computes weighted factor scores.
- Results are sorted descending and returned as `ranked`.

`SignalReady` reuses fit scoring and adds LLM-generated rationale.

## 4) OpenAI generation path

LLM generation is used for:

- fit signal narratives,
- enrichment suggestions,
- outreach drafts.

Provider selection is startup-driven:

- `OPENAI_API_KEY` present → `OpenAICompatibleLLMProvider`.
- missing key → deterministic `MockLLMProvider`.

## 5) Webhook flow (integration view)

Current backend runtime (`backend/src/app.ts`) does **not** expose a dedicated `/api/webhook/*` route.

Webhook-style integrations should route into one of the existing agent endpoints (commonly `parse-resume` for inbound resume workflows). The repository also includes an n8n integration guide under `docs/n8n-integration.md` for platform-level webhook usage outside this local backend service.

## 6) Error handling flow

- Provider failures throw errors upward.
- `ScoutReady` and `MatchReady` wrap execution in `try/catch`, log monitor error runs, then rethrow.
- Other agents currently bubble errors without per-agent catch blocks.
- No custom Express global error middleware is registered in `src/app.ts`; uncaught failures use default Express behavior.

## Mermaid overview

```mermaid
flowchart LR
  C[Recruiter Client / Automation] --> R[Express Route\nsrc/app.ts]
  R --> O[AgentOrchestratorService]
  O --> A[Agent]
  A --> S[Service Layer]
  S --> P[Provider Interface]

  P --> V[VertexDiscoveryEngineProvider\n(APP_MODE=live)]
  P --> M[MockRetrievalProvider\n(APP_MODE=mock)]
  P --> L[OpenAICompatibleLLMProvider\nor MockLLMProvider]

  V --> GCP[Vertex AI Search]
  L --> LLM[OpenAI-compatible API]

  A --> MON[MonitoringService]
  MON --> RESP[JSON response / logs]

  W[Webhook Integrations] -. map to .-> R
```

## Fast endpoint map

- `POST /api/agents/scoutready/run`
- `POST /api/agents/matchready/run`
- `POST /api/agents/enrichready/run`
- `POST /api/agents/signalready/run`
- `POST /api/agents/engageready/run`
- `POST /api/agents/monitorready/run`
- `POST /api/agents/parse-resume/run`
- `GET /api/agents/logs`
- `GET /api/metrics`
