BEGIN;

CREATE TYPE email_processing_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'ignored');
CREATE TYPE email_classification AS ENUM ('resume_submission', 'client_inquiry', 'candidate_reply', 'spam_irrelevant', 'unknown');

CREATE TABLE email_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL UNIQUE,
  from_email TEXT,
  from_name TEXT,
  to_email TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ,
  has_attachment BOOLEAN NOT NULL DEFAULT FALSE,
  attachment_names TEXT[] NOT NULL DEFAULT '{}',
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processing_status email_processing_status NOT NULL DEFAULT 'pending'::email_processing_status,
  processing_notes TEXT,
  classification email_classification NOT NULL DEFAULT 'unknown'::email_classification,
  classification_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resume_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_inbox(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'doc', 'txt')),
  file_content TEXT,
  parsed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_inbox_org_received_at ON email_inbox(org_id, received_at DESC);
CREATE INDEX idx_email_inbox_org_status ON email_inbox(org_id, processing_status);
CREATE INDEX idx_email_inbox_org_classification ON email_inbox(org_id, classification);
CREATE INDEX idx_resume_attachments_email_id ON resume_attachments(email_id);

ALTER TABLE email_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view email inbox"
  ON email_inbox FOR SELECT TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can insert email inbox"
  ON email_inbox FOR INSERT TO authenticated
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can update email inbox"
  ON email_inbox FOR UPDATE TO authenticated
  USING (org_id = get_user_org_id())
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can view resume attachments"
  ON resume_attachments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_inbox ei
      WHERE ei.id = resume_attachments.email_id
        AND ei.org_id = get_user_org_id()
    )
  );

CREATE POLICY "Org members can insert resume attachments"
  ON resume_attachments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_inbox ei
      WHERE ei.id = resume_attachments.email_id
        AND ei.org_id = get_user_org_id()
    )
  );

CREATE POLICY "Org members can update resume attachments"
  ON resume_attachments FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_inbox ei
      WHERE ei.id = resume_attachments.email_id
        AND ei.org_id = get_user_org_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM email_inbox ei
      WHERE ei.id = resume_attachments.email_id
        AND ei.org_id = get_user_org_id()
    )
  );

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'alivio-email-pipeline-30min') THEN
    PERFORM cron.unschedule('alivio-email-pipeline-30min');
  END IF;

  PERFORM cron.schedule(
    'alivio-email-pipeline-30min',
    '*/30 * * * *',
    $job$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/email-pipeline',
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
