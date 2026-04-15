# Recruiter Workflow Pack (Sample)

Lightweight, synthetic workflow examples for Alivio demos and internal testing.

## What is included

1. Candidate search
2. Job search
3. Job-to-candidate matching
4. Candidate-to-job matching
5. Recruiter copilot

Each workflow includes:
- `*.request.json`
- `*.response.json`
- short usage notes below

## Usage notes (short)

### 1) Candidate search
- Endpoint: `POST /api/agents/scoutready/run`
- Use this to generate a lead list from healthcare-focused role constraints.
- Files: `candidate-search.request.json`, `candidate-search.response.json`

### 2) Job search
- Support-layer example for filtering a job catalog in app/backend orchestration.
- This is intentionally runtime-safe documentation data and does not require a new endpoint.
- Files: `job-search.request.json`, `job-search.response.json`

### 3) Job-to-candidate matching
- Endpoint: `POST /api/agents/matchready/run`
- Use when a recruiter starts from one requisition and wants ranked candidates.
- Files: `job-to-candidate-match.request.json`, `job-to-candidate-match.response.json`

### 4) Candidate-to-job matching
- Support-layer orchestration example for “candidate-first” workflows.
- Candidate profile + ranked open jobs payload shape for demos/internal prototyping.
- Files: `candidate-to-job-match.request.json`, `candidate-to-job-match.response.json`

### 5) Recruiter copilot
- Support-layer copilot turn shape for natural-language recruiter assistance.
- Includes grounded answer with suggested next actions and API calls.
- Files: `recruiter-copilot.request.json`, `recruiter-copilot.response.json`

## Data safety

- Synthetic healthcare data only.
- No real patient or candidate PII.
- Intended for examples, docs, mocks, and internal demos.
