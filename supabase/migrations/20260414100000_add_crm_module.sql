BEGIN;

CREATE TYPE client_status AS ENUM (
  'prospect',
  'contacted',
  'meeting_scheduled',
  'proposal_sent',
  'active_client',
  'closed_lost'
);

CREATE TYPE outreach_type AS ENUM ('email', 'linkedin', 'call', 'meeting');
CREATE TYPE outreach_status AS ENUM ('draft', 'sent', 'opened', 'replied', 'bounced');

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  title TEXT,
  location TEXT,
  status client_status NOT NULL DEFAULT 'prospect'::client_status,
  source TEXT,
  notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE outreach_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type outreach_type NOT NULL,
  subject TEXT,
  message TEXT,
  status outreach_status NOT NULL DEFAULT 'draft'::outreach_status,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE outreach_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sequence_step INT NOT NULL CHECK (sequence_step BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_org_status ON clients(org_id, status);
CREATE INDEX idx_clients_followup ON clients(org_id, next_followup_at);
CREATE INDEX idx_outreach_history_client_created ON outreach_history(client_id, created_at DESC);
CREATE INDEX idx_outreach_templates_org_step ON outreach_templates(org_id, sequence_step);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view clients"
  ON clients FOR SELECT TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can insert clients"
  ON clients FOR INSERT TO authenticated
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can update clients"
  ON clients FOR UPDATE TO authenticated
  USING (org_id = get_user_org_id())
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can delete clients"
  ON clients FOR DELETE TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can view outreach history"
  ON outreach_history FOR SELECT TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can insert outreach history"
  ON outreach_history FOR INSERT TO authenticated
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can update outreach history"
  ON outreach_history FOR UPDATE TO authenticated
  USING (org_id = get_user_org_id())
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can view outreach templates"
  ON outreach_templates FOR SELECT TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can insert outreach templates"
  ON outreach_templates FOR INSERT TO authenticated
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can update outreach templates"
  ON outreach_templates FOR UPDATE TO authenticated
  USING (org_id = get_user_org_id())
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can delete outreach templates"
  ON outreach_templates FOR DELETE TO authenticated
  USING (org_id = get_user_org_id());

CREATE OR REPLACE FUNCTION touch_client_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION touch_client_updated_at();

WITH first_org AS (
  SELECT id FROM organizations ORDER BY created_at ASC LIMIT 1
), seeded_clients AS (
  INSERT INTO clients (org_id, name, contact_name, contact_email, contact_phone, title, location, status, source, notes, next_followup_at)
  SELECT id, 'Cleveland Clinic', 'Melissa Carter', 'melissa.carter@clevelandclinic.example', '216-555-0101', 'Director of Talent Acquisition', 'Cleveland, OH', 'prospect'::client_status, 'LinkedIn', 'Interested in reducing RN time-to-fill across ICU and med-surg.', now() + interval '2 days' FROM first_org
  UNION ALL
  SELECT id, 'Mount Sinai Health System', 'Daniela Brooks', 'daniela.brooks@mountsinai.example', '212-555-0142', 'VP, Human Resources', 'New York, NY', 'contacted'::client_status, 'Conference - SHRM Healthcare', 'Sent initial intro email and one-pager.', now() + interval '1 day' FROM first_org
  UNION ALL
  SELECT id, 'Houston Methodist', 'Robert Nguyen', 'robert.nguyen@houstonmethodist.example', '713-555-0193', 'HR Director', 'Houston, TX', 'meeting_scheduled'::client_status, 'Referral', 'Discovery call scheduled for Thursday at 2 PM CST.', now() + interval '3 days' FROM first_org
  UNION ALL
  SELECT id, 'UCLA Health', 'Alyssa Perez', 'alyssa.perez@uclahealth.example', '310-555-0120', 'Senior Talent Partner', 'Los Angeles, CA', 'prospect'::client_status, 'Outbound list build', 'Strong growth in behavioral health recruiting.', now() + interval '4 days' FROM first_org
  UNION ALL
  SELECT id, 'Mass General Brigham', 'Thomas Reid', 'thomas.reid@mgb.example', '617-555-0188', 'Workforce Planning Lead', 'Boston, MA', 'contacted'::client_status, 'Website form inquiry', 'Requested benchmark data on nurse vacancy rates.', now() + interval '5 days' FROM first_org
  RETURNING id, org_id, name, contact_name
)
INSERT INTO outreach_templates (org_id, name, subject, body, sequence_step)
SELECT id, 'Step 1 - Cold Intro', 'Helping {{hospital_name}} hire nurses faster', 'Hi {{contact_name}},\n\nI lead Alivio Search Partners, an AI-powered healthcare recruiting partner helping hospitals fill hard-to-hire nursing roles faster.\n\nWe combine targeted sourcing, automated outreach, and recruiter-in-the-loop screening to reduce time-to-fill without sacrificing quality.\n\nOpen to a quick 15-minute call next week to see if this could help {{hospital_name}}?', 1 FROM first_org
UNION ALL
SELECT id, 'Step 2 - Follow Up', 'Quick follow up on nurse hiring at {{hospital_name}}', 'Hi {{contact_name}},\n\nFollowing up on my last note. Many health systems are still facing persistent RN vacancies — recent national reports continue to show elevated nursing shortages across acute care settings.\n\nIf useful, I can share how we are helping similar teams build stronger candidate pipelines with less manual work.\n\nWould a brief call be worth it?', 2 FROM first_org
UNION ALL
SELECT id, 'Step 3 - Breakup', 'Close the loop?', 'Hi {{contact_name}},\n\nI know your inbox is packed, so I’ll close the loop here.\n\nIf improving healthcare hiring efficiency becomes a priority this quarter, I’m happy to reconnect and share ideas tailored to {{hospital_name}}.\n\nEither way, thanks for considering it.', 3 FROM first_org;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'alivio-auto-followup-daily-9am') THEN
    PERFORM cron.unschedule('alivio-auto-followup-daily-9am');
  END IF;

  PERFORM cron.schedule(
    'alivio-auto-followup-daily-9am',
    '0 9 * * *',
    $job$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/auto-followup',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.scheduler_secret', true)
      ),
      body := '{}'::jsonb
    );
    $job$
  );
END $$;

COMMIT;
