# Alivio Recruiter Prompt Library

Lightweight, reusable prompt fixtures for **frontend flows**, **backend examples**, and future **agent workflows**.

## Files

- `recruiter-prompts.fixtures.json` — Canonical prompt objects by use case.
- `recruiter-workflow-examples.json` — End-to-end workflow examples that chain prompt types.
- `prompt-taxonomy.md` — Practical guidance on prompt selection.

## Prompt types and when to use them

1. **candidate_search**
   - Use when starting from a requisition and building a candidate longlist/shortlist.
   - Output should include fit reasons plus outreach hooks.

2. **job_search**
   - Use when starting from a candidate profile and finding relevant open jobs.
   - Output should emphasize role constraints (location, compensation, schedule, licensing).

3. **job_to_candidate_match**
   - Use when you already have one job and a candidate pool.
   - Output should rank candidates with specific fit evidence and risk flags.

4. **candidate_to_job_match**
   - Use when you have a specific candidate and need ranked opportunities.
   - Output should include alignment tradeoffs and closing angle.

5. **recruiter_copilot**
   - Use for daily execution support (priorities, follow-up drafts, manager updates).
   - Output should be action-first and concise.

## Coverage

- **Healthcare**: Director of Nursing, Licensed Nursing Home Administrator, MDS Coordinator, allied health, physicians.
- **Tech**: Staff Frontend Engineer, Data Platform Engineer, Security Engineer, Product Manager.

## Implementation notes

- Keep prompt objects plain JSON for portability.
- IDs are stable and suitable for referencing from API request payloads or UI dropdowns.
- Prompt templates use placeholder variables (for example, `{result_count}`, `{location}`, `{job_summary}`).
- This library is fixture-oriented and intentionally does not modify runtime architecture.

## Suggested integration pattern

- Frontend: expose a prompt picker by `useCase` and `roleFamily`.
- Backend examples/tests: pull fixture by `id` and hydrate template placeholders.
- Agent workflows: chain fixture IDs from `recruiter-workflow-examples.json` as playbooks.
