alter table if exists public.candidates
  add column if not exists ai_score integer,
  add column if not exists ai_summary jsonb,
  add column if not exists ai_scored_at timestamptz;
