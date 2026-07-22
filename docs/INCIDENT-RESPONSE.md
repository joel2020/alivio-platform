# Incident Response Runbook (draft — pending formal review)

Scope: aliviosearchpartners.com (Vercel `alivio-platform`), Supabase Alivio-OS (`ovxttubotjebnaoedllu`), Azure OpenAI (`alivio-openai55-resource`), Resend, Cal.com.

## Severity
- SEV1: site down, data breach suspected, auth broken platform-wide.
- SEV2: a product surface broken (portal, forms, AI pipeline), crons failing.
- SEV3: degraded/cosmetic.

## First 30 minutes
1. Confirm blast radius: site (curl /, /product), Supabase status page, Vercel deployment state, edge function logs (Dashboard → Functions → Logs), cron results (`select * from net._http_response order by id desc limit 20`).
2. If a bad deploy: Vercel → promote previous production deployment (instant rollback).
3. If data exposure suspected: rotate Supabase service-role + anon keys and Resend/Azure keys immediately; disable affected edge functions (verify_jwt toggle or delete); preserve logs before rotation.
4. Note timeline in a scratch doc as you go — times, actions, evidence.

## Contacts / owners
- Owner: Joel Carias (hello@aliviosearchpartners.com).
- Escalation: Supabase support (Pro plan), Vercel support, Azure support.

## Post-incident
Within 5 business days: written post-mortem (impact, timeline, root cause, fixes, follow-ups) filed in Linear (project "Alivio Platform & Website") and Obsidian.

## Data-breach specifics
If personal data was likely accessed: preserve evidence, assess scope by table/rows, consult counsel on notification obligations (state breach laws; contractual DPA commitments) before external statements.
