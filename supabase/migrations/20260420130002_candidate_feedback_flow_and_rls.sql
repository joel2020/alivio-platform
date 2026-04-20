-- Add fields needed by product feedback flow + tighten RLS.
ALTER TABLE public.candidate_feedback
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id),
  ADD COLUMN IF NOT EXISTS stage TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

UPDATE public.candidate_feedback
SET notes = COALESCE(notes, note)
WHERE note IS NOT NULL;

ALTER TABLE public.candidate_feedback
  ALTER COLUMN stage SET DEFAULT 'screened';

UPDATE public.candidate_feedback
SET stage = COALESCE(stage, 'screened');

ALTER TABLE public.candidate_feedback
  ALTER COLUMN stage SET NOT NULL;

ALTER TABLE public.candidate_feedback
  DROP CONSTRAINT IF EXISTS candidate_feedback_stage_check;

ALTER TABLE public.candidate_feedback
  ADD CONSTRAINT candidate_feedback_stage_check
  CHECK (stage IN ('screened', 'interviewed', 'rejected', 'hired'));

ALTER TABLE public.candidate_feedback
  ALTER COLUMN rating TYPE INTEGER
  USING CASE
    WHEN rating = 'thumbs_up' THEN 5
    WHEN rating = 'thumbs_down' THEN 1
    WHEN rating ~ '^[0-9]+$' THEN rating::INTEGER
    ELSE 3
  END;

ALTER TABLE public.candidate_feedback
  ALTER COLUMN rating SET NOT NULL;

ALTER TABLE public.candidate_feedback
  DROP CONSTRAINT IF EXISTS candidate_feedback_rating_check;

ALTER TABLE public.candidate_feedback
  ADD CONSTRAINT candidate_feedback_rating_check
  CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE public.candidate_feedback
  DROP COLUMN IF EXISTS note;

DROP POLICY IF EXISTS "Org members can view candidate feedback" ON public.candidate_feedback;
DROP POLICY IF EXISTS "Org members can insert candidate feedback" ON public.candidate_feedback;

CREATE POLICY "Org members can view candidate feedback"
  ON public.candidate_feedback FOR SELECT TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can insert candidate feedback"
  ON public.candidate_feedback FOR INSERT TO authenticated
  WITH CHECK (org_id = get_user_org_id() AND user_id = auth.uid());
