# Alivio Agent Workflow Map (Lightweight)

This document defines a practical workflow contract between recruiting agents, backend APIs, and recruiter-facing workflows.

## Scope

- Keep implementation lightweight and API-first.
- Describe how current agents should be composed in end-to-end recruiter operations.
- Identify stable service boundaries so parallel teams can integrate safely.

## Agent roles in pipeline

| Agent | Primary role | Pipeline stage | Current API endpoint | Core service boundary (now / near-term) |
|---|---|---|---|---|
| ScoutReady | Find candidate leads from query constraints (role, geo, skills). | Candidate discovery | `POST /api/agents/scoutready/run` | `candidate-search-service` |
| MatchReady | Rank candidates for a selected job. | Matching & prioritization | `POST /api/agents/matchready/run` | `matching-service` + `fit-scoring-service` |
| EnrichReady | Normalize and enrich candidate profiles (summary, gaps, scores). | Profile enrichment | `POST /api/agents/enrichready/run` | `enrichment-service` |
| SignalReady | Generate fit signal with rationale and risks. | Qualification / decision support | `POST /api/agents/signalready/run` | `fit-scoring-service` |
| EngageReady | Generate recruiter outreach draft from candidate + job context. | Outreach preparation | `POST /api/agents/engageready/run` | `outreach-service` |
| MonitorReady | Summarize run health and operational metrics. | Monitoring & operations | `POST /api/agents/monitorready/run` | `monitoring-service` |
| Parse Resume | Parse inbound resume text and chain enrichment + fit scoring. | Intake / inbound candidate processing | `POST /api/agents/parse-resume/run` | `resume-parsing-service` orchestrating `enrichment-service` + `fit-scoring-service` |

## Recruiter workflow map

### 1) Candidate search workflow

1. Recruiter creates role context and target profile.
2. Website/backend calls **ScoutReady** for initial lead set.
3. Optional enrichment pass via **EnrichReady** before human review.
4. Shortlist is persisted by product layer (outside this backend doc).

**Primary endpoints**
- `POST /api/agents/scoutready/run`
- `POST /api/agents/enrichready/run` (optional per lead)

### 2) Job search + matching workflow

1. Recruiter selects a job requisition.
2. Backend calls **MatchReady** with `jobId`.
3. Top ranked candidates are scored and ordered.
4. For deeper explainability per profile, call **SignalReady**.

**Primary endpoints**
- `POST /api/agents/matchready/run`
- `POST /api/agents/signalready/run`

### 3) Outreach workflow

1. Recruiter selects a candidate-job pair.
2. Backend calls **EngageReady** for outreach draft.
3. Recruiter edits and sends via communication layer.
4. Follow-up outcomes are captured for monitoring.

**Primary endpoints**
- `POST /api/agents/engageready/run`

### 4) Monitoring workflow

1. Product or admin job polls monitoring status.
2. **MonitorReady** provides run summary for agent operations.
3. If needed, product can also read logs/metrics endpoints.

**Primary endpoints**
- `POST /api/agents/monitorready/run`
- `GET /api/agents/logs`
- `GET /api/metrics`

### 5) Resume intake workflow

1. Candidate resume arrives from form/email/import.
2. Backend calls **Parse Resume** with optional `jobId`.
3. Parse Resume returns parsed profile + enriched candidate + fit signal.
4. Recruiter can immediately route candidate to shortlist/outreach.

**Primary endpoints**
- `POST /api/agents/parse-resume/run`

## Practical orchestration guidance

- Keep frontend integration thin: call one agent endpoint per interaction step.
- Prefer explicit chaining in product/backend orchestration rather than hidden side effects.
- Store workflow state outside agent responses (e.g., shortlist, outreach status).
- Use MonitorReady + logs for operational visibility and regression checks.

## Suggested future service boundaries

These are forward-compatible seams, not infra changes:

- **Search boundary**: candidate + job retrieval providers.
- **Evaluation boundary**: matching + fit scoring.
- **Engagement boundary**: draft generation, channel adapters.
- **Intake boundary**: resume parsing and profile normalization.
- **Ops boundary**: monitoring summaries, run logs, latency/error counters.

## Mermaid flowchart (optional)

```mermaid
flowchart TD
    A[Recruiter opens role/job workflow] --> B[ScoutReady]
    B --> C[EnrichReady (optional)]
    C --> D[MatchReady]
    D --> E[SignalReady]
    E --> F[EngageReady]
    F --> G[Recruiter sends outreach]

    H[Inbound resume intake] --> I[Parse Resume]
    I --> C
    I --> E

    B --> M[MonitorReady]
    D --> M
    E --> M
    F --> M
    I --> M
```

## Integration checklist for parallel teams

- Backend API team: maintain endpoint contracts above.
- Website team: map each UI action to one explicit agent call.
- Recruiting workflow team: persist stage transitions (`discovered`, `matched`, `contacted`, `responded`).
- Ops team: use MonitorReady and logs to confirm successful end-to-end runs.
