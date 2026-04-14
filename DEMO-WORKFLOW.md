# PASS THREE — Primary Demo Workflow

## Chosen workflow
**B) Manual candidate flow**: Admin/user logs in → opens role pipeline → reviews candidate → advances stage → generates outreach with AI.

Reason selected: this is the most complete path with explicit UI screens, DB reads/writes, and AI invocation fully wired in frontend code.

---

## Step-by-step workflow map

## 1) Authenticated user enters app shell
- **Trigger:** Browser navigation to any app route (`/dashboard`, `/roles/:id/pipeline`, `/candidates/:id`).
- **Handler:** `src/components/app/AppLayout.tsx` (`AppLayout`).
- **Tables read/write:**
  - Reads `tasks` and `email_inbox` for header notifications.
  - Marks unread emails as processed (`email_inbox.processed = true`) when notifications open.
- **Edge functions called:** none.
- **Auth required:** valid Supabase session; otherwise redirected to `/login`.
- **What can go wrong:** missing/expired session, org not provisioned.
- **Status:** **WORKING**.

## 2) Role pipeline page loads candidate list
- **Trigger:** Navigate to `/roles/:id/pipeline`.
- **Handler:** `src/pages/app/PipelinePage.tsx` (`loadData`).
- **Tables read/write:**
  - Reads `roles`, `candidates`, `voice_calls`.
  - Writes `roles.status` when pause/resume toggled.
- **Edge functions called:** none on initial load.
- **Auth required:** authenticated user and RLS access to role/candidate rows.
- **What can go wrong:** RLS denies, stale session, query failure.
- **Status:** **WORKING** (load/empty/unauthorized/error states now explicit).

## 3) User runs AI scoring/matching from pipeline
- **Trigger:** Click **Match Candidates** or **Score Candidates** buttons.
- **Handler:** `src/pages/app/PipelinePage.tsx` (`handleRunAIMatch`, `handleScoreCandidates`).
- **Tables read/write:**
  - Reads in-memory role + candidate payload.
  - Writes `candidates.score`, `candidates.score_rationale`, `candidates.score_breakdown`, `candidates.pipeline_stage`.
  - Inserts `agent_activity_log` entries.
- **Edge functions called:**
  - `ai-match-candidates`
  - `ai-score-candidates`
- **Auth required:** Supabase session JWT; edge now validates bearer token server-side.
- **What can go wrong:** AI provider timeout, malformed model JSON, env missing (`OPENROUTER_API_KEY` etc).
- **Status:** **PARTIAL** (flow is wired; runtime depends on AI env/providers).

## 4) User opens candidate detail and advances stage
- **Trigger:** Click candidate row in pipeline table.
- **Handler:** `src/pages/app/CandidatePage.tsx` (`loadData`, `advanceStage`).
- **Tables read/write:**
  - Reads `candidates`, `voice_calls`, `voice_transcripts`, `agent_activity_log`, `candidate_feedback`, `roles`.
  - Writes `candidates.pipeline_stage` when advancing/archive.
  - Writes `candidate_feedback` on feedback submit.
- **Edge functions called:** none for stage transition itself.
- **Auth required:** Supabase session + RLS on all candidate-related tables.
- **What can go wrong:** candidate not found, RLS denial, stale session.
- **Status:** **WORKING** (added unauthorized/error states; no infinite spinner path).

## 5) User generates outreach AI message from candidate page
- **Trigger:** Candidate page → `Outreach` tab → click **Generate with Engage Agent**.
- **Handler:** `src/pages/app/CandidatePage.tsx` (`OutreachTab.generate`) via `src/lib/ai.ts` (`generateOutreachEmail`).
- **Tables read/write:** none required for generation itself (draft shown in UI only).
- **Edge functions called:** `generate-outreach`.
- **Auth required:** Supabase session JWT; edge now validates bearer token server-side.
- **What can go wrong:** missing AI env, provider timeout/failure, invalid model payload.
- **Status:** **WORKING** for graceful UI behavior, **PARTIAL** for external provider dependency.

## 6) Optional resume parsing in candidate overview
- **Trigger:** Candidate overview tab → paste resume text → click **Parse Resume**.
- **Handler:** `src/pages/app/CandidatePage.tsx` (`handleParseResume`) via `src/lib/ai.ts` (`parseResume`).
- **Tables read/write:**
  - Writes parsed candidate fields into `candidates`.
  - Inserts `agent_activity_log`.
- **Edge functions called:** `ai-parse-resume`.
- **Auth required:** Supabase session JWT; edge now validates bearer token server-side.
- **What can go wrong:** invalid resume text, AI errors, JSON parse failure.
- **Status:** **PARTIAL** (provider/env dependent).

---

## Live demo minimum success criteria
For demo execution, the following must work:
1. Login and authenticated app shell routing.
2. Role pipeline page for at least one role with at least one candidate.
3. Candidate detail page load + stage transition update.
4. Outreach generation from candidate page with either:
   - Successful AI response, or
   - Clear user-visible failure message.
5. Admin role gating enforced by server-side RPC (`is_platform_admin`) for `/admin/*`.

---

## Hard blockers found while tracing
1. Several non-demo ingestion edge functions (`fetch-emails`, `email-pipeline`, `ai-process-email`, `ai-parse-email-resume`) still do not enforce end-user auth and assume trusted scheduler/service-role invocation.
2. Inbound email pipeline reliability checks requested for launch are only partially verifiable in repository-only inspection (requires real IMAP inbox + scheduler + secrets).
