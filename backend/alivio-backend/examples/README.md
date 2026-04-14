# Rendering Examples (Mock Data Only)

These examples are a **parallel UI reference workstream** for frontend rendering and do not call live APIs.

## Included examples

- `recruiter-search-result-list.example.html`
  - Shows side-by-side grounded results and ranked matches.
- `candidate-to-job-match-output.example.html`
  - Shows candidate profile header + ranked job matches.
- `recruiter-copilot-answer-card.example.html`
  - Shows compact copilot answer card with explanation, evidence, and outreach draft.

All examples load mock JSON fixtures from `examples/mock-fixtures/*.json`.

## Field mapping for rendering

Use these fields from recruiter search style responses:

- **Grounded results list**
  - `grounded.results[].rank`
  - `grounded.results[].name`
  - `grounded.results[].title`
  - `grounded.results[].location`
  - `grounded.results[].snippet`
  - `grounded.results[].source`
- **Ranked matches list**
  - `generated.ranked_matches[].rank`
  - `generated.ranked_matches[].candidate_name` (or `job_title` in job-match outputs)
  - `generated.ranked_matches[].fit_score`
  - `generated.ranked_matches[].match_reasons[]`
- **Explanation block**
  - `generated.explanation`
- **Outreach draft block**
  - `generated.outreach_draft`

Optional support/debug fields:

- `requestId` (display in logs/support UI)
- `query` (can be shown as context)
- `grounded.results[].evidence` (if present)

## How to run locally

From `backend/alivio-backend`, run a simple static server so relative fixture paths work:

```bash
npx serve .
```

Then open these URLs:

- `http://localhost:3000/examples/recruiter-search-result-list.example.html`
- `http://localhost:3000/examples/candidate-to-job-match-output.example.html`
- `http://localhost:3000/examples/recruiter-copilot-answer-card.example.html`

## Notes

- No credentials, secrets, or live API calls are used.
- Files are intentionally framework-agnostic (plain HTML/CSS/JS).

## Synthetic fixture pack for backend/docs/demo workflows

Additional synthetic fixtures live under `examples/fixtures/`:

- `examples/fixtures/requests/*.json`
  - Request payload examples for `candidate_search`, `job_search`, `match` (both directions), and `copilot` workflow flows.
  - Designed to align with `/api/webhook/n8n` payload shape (`workflow_type`, `query`, `pageSize`, `metadata`).
- `examples/fixtures/responses/grounded-search.response.json`
  - Grounded response example aligned with `/api/vertex-search` response shape (`ok`, `query`, `grounded`).
- `examples/fixtures/responses/recruiter-search-generated.response.json`
  - Recruiter-generated response example aligned with `/api/recruiter-search` output shape (`ok`, `query`, `grounded`, `generated`).

Intended uses:

- docs and API examples
- smoke test payload references
- frontend rendering mocks
- recruiter demo scenarios

All records are synthetic and non-sensitive.
