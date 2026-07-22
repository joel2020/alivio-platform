# AI Bias Monitoring Controls — internal process (v1, 2026-07-22)

These are the internal controls behind the public Responsible AI commitments (aliviosearchpartners.com/about#responsible-ai).

## Design-time controls
- Scoring prompts evaluate job-related criteria only (licensure, experience, skills, location/shift fit, compensation alignment); protected characteristics are never inputs.
- Match scores must include written rationale (enforced by function output shape) so a human can audit the basis of every ranking.

## Runtime controls
- No automated advance/reject: shortlist inclusion and rejection require a recruiter action; AI output is advisory.
- Screening calls disclose automation at call start; candidates may decline recording or request a human callback; disclosure text is configurable per role (voice_settings.disclosure_text).

## Monitoring cadence (owner: Joel Carias, monthly)
1. Sample 10 recent AI-scored candidates per active search: check rationale quality and that scores track job-related criteria.
2. Compare stage-conversion rates across candidate source channels for unexplained divergence.
3. Review any candidate complaints tagged "AI" in the inbox.
4. Log findings and remediations in Linear (project: Alivio Platform & Website).

## Escalation
Suspected systematic skew: pause AI scoring for the affected search (score_threshold/voice settings), fall back to manual review, document in an incident per docs/INCIDENT-RESPONSE.md.
