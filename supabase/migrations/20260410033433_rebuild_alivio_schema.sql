/*
  # Alivio OS - Rebuild Schema
  
  The previous migration created tables with a different schema. Since no user data exists,
  we drop the old tables and recreate with the correct Alivio OS schema.
  
  All tables are empty (verified) so no data loss occurs.
  
  New tables added: organizations, users (replacing profiles), voice_settings, 
  agent_activity_log, candidate_feedback, voice_transcripts
  
  Existing tables altered: roles, candidates, voice_calls, transcripts -> voice_transcripts
*/

DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS transcripts CASCADE;
DROP TABLE IF EXISTS voice_calls CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size TEXT CHECK (size IN ('1-50', '51-200', '201-1000', '1000+')),
  industry TEXT DEFAULT 'healthcare',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  remote BOOLEAN DEFAULT FALSE,
  employment_type TEXT DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'contract', 'per-diem')),
  experience_min INTEGER DEFAULT 0,
  experience_max INTEGER DEFAULT 20,
  must_have_requirements TEXT[] DEFAULT '{}',
  nice_to_have_requirements TEXT[] DEFAULT '{}',
  compensation_min INTEGER,
  compensation_max INTEGER,
  compensation_currency TEXT DEFAULT 'USD',
  description TEXT,
  target_candidate_volume INTEGER DEFAULT 50,
  outreach_tone TEXT DEFAULT 'conversational' CHECK (outreach_tone IN ('professional', 'conversational', 'direct')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  role_id UUID REFERENCES roles(id) NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  current_title TEXT,
  current_company TEXT,
  location TEXT,
  experience_years INTEGER,
  skills TEXT[] DEFAULT '{}',
  licenses TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  education TEXT,
  source TEXT,
  profile_data JSONB DEFAULT '{}',
  score NUMERIC(4,3),
  score_breakdown JSONB DEFAULT '{}',
  score_rationale TEXT,
  pipeline_stage TEXT DEFAULT 'discovered' CHECK (pipeline_stage IN ('discovered', 'scored', 'voice_qualified', 'engaged', 'responded', 'scheduled', 'archived')),
  archived_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) NOT NULL,
  role_id UUID REFERENCES roles(id) NOT NULL,
  org_id UUID REFERENCES organizations(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('initiated', 'ringing', 'in_progress', 'completed', 'no_answer', 'voicemail_left', 'failed')),
  call_type TEXT NOT NULL CHECK (call_type IN ('outbound', 'inbound')),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  provider TEXT NOT NULL DEFAULT 'vapi',
  provider_call_id TEXT,
  recording_url TEXT,
  qualification_status TEXT CHECK (qualification_status IN ('qualified', 'disqualified', 'needs_review', 'declined', 'escalated')),
  extracted_data JSONB,
  call_summary TEXT,
  escalated BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT,
  escalated_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES voice_calls(id) NOT NULL,
  entries JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  score_threshold NUMERIC(3,2) DEFAULT 0.75,
  calling_window_start TIME DEFAULT '09:00',
  calling_window_end TIME DEFAULT '19:00',
  max_attempts INTEGER DEFAULT 3,
  retry_interval_hours INTEGER DEFAULT 8,
  leave_voicemail BOOLEAN DEFAULT TRUE,
  auto_advance_qualified BOOLEAN DEFAULT FALSE,
  outreach_tone TEXT DEFAULT 'conversational',
  verification_points JSONB DEFAULT '[]',
  escalation_rules JSONB DEFAULT '{"on_human_request": true, "on_ambiguous_credentials": true, "on_high_score": true, "high_score_threshold": 0.92, "on_all_calls": false}',
  disclosure_text TEXT DEFAULT 'Hi, this is an AI assistant calling regarding an opportunity. This call is being recorded. Would you like to continue?',
  escalation_email TEXT,
  escalation_slack_channel TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  role_id UUID REFERENCES roles(id),
  candidate_id UUID REFERENCES candidates(id),
  agent_name TEXT NOT NULL CHECK (agent_name IN ('scout', 'enrich', 'signal', 'voice', 'engage', 'schedule', 'cortex')),
  action TEXT NOT NULL,
  detail TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  org_id UUID REFERENCES organizations(id) NOT NULL,
  rating TEXT CHECK (rating IN ('thumbs_up', 'thumbs_down')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_role ON candidates(role_id);
CREATE INDEX IF NOT EXISTS idx_candidates_org ON candidates(org_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON candidates(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(score DESC);
CREATE INDEX IF NOT EXISTS idx_voice_calls_candidate ON voice_calls(candidate_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_role ON voice_calls(role_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_status ON voice_calls(status);
CREATE INDEX IF NOT EXISTS idx_voice_calls_qualification ON voice_calls(qualification_status);
CREATE INDEX IF NOT EXISTS idx_agent_log_role ON agent_activity_log(role_id);
CREATE INDEX IF NOT EXISTS idx_agent_log_candidate ON agent_activity_log(candidate_id);
CREATE INDEX IF NOT EXISTS idx_agent_log_created ON agent_activity_log(created_at DESC);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_feedback ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT org_id FROM users WHERE id = auth.uid() LIMIT 1;
$$;

CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (id = get_user_org_id());

CREATE POLICY "Organizations can be inserted"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (id IS NOT NULL);

CREATE POLICY "Users can update their organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (id = get_user_org_id())
  WITH CHECK (id = get_user_org_id());

CREATE POLICY "Users can view own user record"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own user record"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own user record"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Org members can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can insert roles"
  ON roles FOR INSERT
  TO authenticated
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can update roles"
  ON roles FOR UPDATE
  TO authenticated
  USING (org_id = get_user_org_id())
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can delete roles"
  ON roles FOR DELETE
  TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can view candidates"
  ON candidates FOR SELECT
  TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can insert candidates"
  ON candidates FOR INSERT
  TO authenticated
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can update candidates"
  ON candidates FOR UPDATE
  TO authenticated
  USING (org_id = get_user_org_id())
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can view voice calls"
  ON voice_calls FOR SELECT
  TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can insert voice calls"
  ON voice_calls FOR INSERT
  TO authenticated
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can view voice transcripts"
  ON voice_transcripts FOR SELECT
  TO authenticated
  USING (
    call_id IN (
      SELECT id FROM voice_calls WHERE org_id = get_user_org_id()
    )
  );

CREATE POLICY "Org members can insert voice transcripts"
  ON voice_transcripts FOR INSERT
  TO authenticated
  WITH CHECK (
    call_id IN (
      SELECT id FROM voice_calls WHERE org_id = get_user_org_id()
    )
  );

CREATE POLICY "Org members can view voice settings"
  ON voice_settings FOR SELECT
  TO authenticated
  USING (
    role_id IN (
      SELECT id FROM roles WHERE org_id = get_user_org_id()
    )
  );

CREATE POLICY "Org members can insert voice settings"
  ON voice_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    role_id IN (
      SELECT id FROM roles WHERE org_id = get_user_org_id()
    )
  );

CREATE POLICY "Org members can update voice settings"
  ON voice_settings FOR UPDATE
  TO authenticated
  USING (
    role_id IN (
      SELECT id FROM roles WHERE org_id = get_user_org_id()
    )
  )
  WITH CHECK (
    role_id IN (
      SELECT id FROM roles WHERE org_id = get_user_org_id()
    )
  );

CREATE POLICY "Org members can view agent activity log"
  ON agent_activity_log FOR SELECT
  TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can insert agent activity"
  ON agent_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Org members can view candidate feedback"
  ON candidate_feedback FOR SELECT
  TO authenticated
  USING (org_id = get_user_org_id());

CREATE POLICY "Org members can insert candidate feedback"
  ON candidate_feedback FOR INSERT
  TO authenticated
  WITH CHECK (org_id = get_user_org_id());
