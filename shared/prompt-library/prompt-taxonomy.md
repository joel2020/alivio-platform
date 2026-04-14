# Prompt Taxonomy for Alivio Recruiter Workflows

## 1) Candidate Search

**Primary intent:** Find and prioritize people for an open role.

**Best for:**
- New req kickoff
- Rebuilding stale pipelines
- High-priority healthcare leadership searches

**Healthcare examples:**
- Director of Nursing in SNF settings
- MDS Coordinator with PDPM experience
- Allied health professionals with multi-site flexibility

**Tech examples:**
- Staff Frontend Engineer
- Senior Security Engineer

---

## 2) Job Search

**Primary intent:** Find open roles for a known candidate profile.

**Best for:**
- Candidate-first marketing
- Retention-risk mitigation
- Passive candidate re-engagement

**Healthcare examples:**
- LNHA opportunities with relocation support
- Physician jobs matching board/call constraints

**Tech examples:**
- Data Platform roles aligned with cloud + Spark strengths

---

## 3) Job-to-Candidate Match

**Primary intent:** Rank candidate pool against one specific job.

**Best for:**
- Interview slate decisions
- Same-day hiring manager updates
- Structured shortlist rationale

**Recommended output fields:**
- `match_score`
- `top_match_reasons`
- `concerns`
- `interview_focus`

---

## 4) Candidate-to-Job Match

**Primary intent:** Rank jobs against one specific candidate.

**Best for:**
- Candidate presentation calls
- Offer strategy discussions
- Relocation or schedule-sensitive searches

**Recommended output fields:**
- `match_score`
- `fit_reasons`
- `tradeoffs`
- `pitch_angle`

---

## 5) Recruiter Copilot

**Primary intent:** Drive daily recruiter execution.

**Best for:**
- Morning desk prioritization
- Pipeline risk review
- Hiring manager communication drafts

**Recommended output sections:**
- Priority actions
- At-risk requisitions
- Likely closes this week
- Follow-up message drafts

---

## Practical Prompt Writing Rules

1. Keep prompts task-specific and output-structured.
2. Ask for recruiter-actionable fields (not generic summaries).
3. Include explicit constraints (license, shift model, comp band, location radius).
4. Require risk flags to speed up screening and submittal decisions.
5. Prefer concise output suitable for ATS/CRM notes.
