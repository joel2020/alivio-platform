# Recruiter workflow fixtures

Synthetic JSON fixtures for local development of Alivio recruiter search workflows.

## Contents

- `candidates.records.json`
  - Candidate records aligned to `Candidate` contract in `backend/src/models/types.ts`.
- `jobs.records.json`
  - Job records aligned to `Job` contract in `backend/src/models/types.ts`.
- `grounded-search.response.json`
  - Example API response aligned to `/api/vertex-search` shape in `backend/alivio-backend/server.js` and grounded payload structure from `backend/alivio-backend/normalize.js`.
- `recruiter-search.response.json`
  - Example API response aligned to `/api/recruiter-search` shape in `backend/alivio-backend/server.js`, including strict generated keys expected by `parseGeneratedOutput`.

## Intended use

- UI prototyping and component demos.
- API contract examples in docs.
- Integration test stubs/mocks where live provider calls are disabled.

## Notes

- Data is intentionally lightweight and synthetic.
- No real candidate PII is included.
- Sample emails/phone numbers are reserved demo formats only.
For end-to-end workflow payload examples (request/response pairs + usage notes), also see `../recruiter-workflow-pack/`.
