/*
  # Outreach sequences

  - Adds outreach sequence tracking by candidate + role
  - Adds outreach message records for multi-step campaigns
  - Enforces org-level RLS on both tables
*/

CREATE TABLE IF NOT EXISTS public.outreach_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'paused')),
  current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.outreach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES public.outreach_sequences(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number >= 1),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'linkedin')),
  message_body TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sequence_id, step_number)
);

ALTER TABLE public.outreach_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view outreach sequences" ON public.outreach_sequences;
CREATE POLICY "Org members can view outreach sequences"
  ON public.outreach_sequences
  FOR SELECT
  TO authenticated
  USING (org_id = public.get_user_org_id());

DROP POLICY IF EXISTS "Org members can insert outreach sequences" ON public.outreach_sequences;
CREATE POLICY "Org members can insert outreach sequences"
  ON public.outreach_sequences
  FOR INSERT
  TO authenticated
  WITH CHECK (org_id = public.get_user_org_id());

DROP POLICY IF EXISTS "Org members can update outreach sequences" ON public.outreach_sequences;
CREATE POLICY "Org members can update outreach sequences"
  ON public.outreach_sequences
  FOR UPDATE
  TO authenticated
  USING (org_id = public.get_user_org_id())
  WITH CHECK (org_id = public.get_user_org_id());

DROP POLICY IF EXISTS "Org members can delete outreach sequences" ON public.outreach_sequences;
CREATE POLICY "Org members can delete outreach sequences"
  ON public.outreach_sequences
  FOR DELETE
  TO authenticated
  USING (org_id = public.get_user_org_id());

DROP POLICY IF EXISTS "Org members can view outreach messages" ON public.outreach_messages;
CREATE POLICY "Org members can view outreach messages"
  ON public.outreach_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.outreach_sequences seq
      WHERE seq.id = outreach_messages.sequence_id
        AND seq.org_id = public.get_user_org_id()
    )
  );

DROP POLICY IF EXISTS "Org members can insert outreach messages" ON public.outreach_messages;
CREATE POLICY "Org members can insert outreach messages"
  ON public.outreach_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.outreach_sequences seq
      WHERE seq.id = outreach_messages.sequence_id
        AND seq.org_id = public.get_user_org_id()
    )
  );

DROP POLICY IF EXISTS "Org members can update outreach messages" ON public.outreach_messages;
CREATE POLICY "Org members can update outreach messages"
  ON public.outreach_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.outreach_sequences seq
      WHERE seq.id = outreach_messages.sequence_id
        AND seq.org_id = public.get_user_org_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.outreach_sequences seq
      WHERE seq.id = outreach_messages.sequence_id
        AND seq.org_id = public.get_user_org_id()
    )
  );

DROP POLICY IF EXISTS "Org members can delete outreach messages" ON public.outreach_messages;
CREATE POLICY "Org members can delete outreach messages"
  ON public.outreach_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.outreach_sequences seq
      WHERE seq.id = outreach_messages.sequence_id
        AND seq.org_id = public.get_user_org_id()
    )
  );

CREATE INDEX IF NOT EXISTS idx_outreach_sequences_org_status ON public.outreach_sequences(org_id, status);
CREATE INDEX IF NOT EXISTS idx_outreach_sequences_candidate ON public.outreach_sequences(candidate_id);
CREATE INDEX IF NOT EXISTS idx_outreach_sequences_role ON public.outreach_sequences(role_id);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_sequence_step ON public.outreach_messages(sequence_id, step_number);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_status ON public.outreach_messages(status);
