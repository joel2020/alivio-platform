export interface Organization {
  id: string;
  name: string;
  size: '1-50' | '51-200' | '201-1000' | '1000+';
  industry: string;
  onboarding_complete?: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  created_at: string;
}

export interface Role {
  id: string;
  org_id: string;
  title: string;
  care_setting?: string | null;
  required_credentials?: string[] | null;
  location: string;
  remote: boolean;
  employment_type: 'full-time' | 'contract' | 'per-diem';
  experience_min: number;
  experience_max: number;
  must_have_requirements: string[];
  nice_to_have_requirements: string[];
  compensation_min: number | null;
  compensation_max: number | null;
  compensation_currency: string;
  description: string | null;
  onboarding_urgency?: string | null;
  onboarding_outreach_style?: string | null;
  onboarding_notify_email?: string | null;
  target_candidate_volume: number;
  outreach_tone: 'professional' | 'conversational' | 'direct';
  status: 'active' | 'paused' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
}

export type PipelineStage = 'discovered' | 'scored' | 'voice_qualified' | 'engaged' | 'responded' | 'scheduled' | 'archived';

export interface Candidate {
  id: string;
  org_id: string;
  role_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  current_title: string | null;
  current_company: string | null;
  location: string | null;
  experience_years: number | null;
  skills: string[];
  licenses: string[];
  certifications: string[];
  education: string | null;
  source: string | null;
  profile_data: Record<string, unknown>;
  score: number | null;
  score_breakdown: {
    hard_qualification?: number;
    experience_trajectory?: number;
    skills_adjacency?: number;
    engagement_propensity?: number;
  };
  score_rationale: string | null;
  ai_score: number | null;
  ai_summary: {
    top_strengths?: string[];
    gaps?: string[];
    recommendation?: string;
    confidence?: 'high' | 'medium' | 'low';
  } | null;
  ai_scored_at: string | null;
  pipeline_stage: PipelineStage;
  archived_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type CallStatus = 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'no_answer' | 'voicemail_left' | 'failed';
export type QualificationStatus = 'qualified' | 'disqualified' | 'needs_review' | 'declined' | 'escalated';

export interface VoiceCall {
  id: string;
  candidate_id: string;
  role_id: string;
  org_id: string;
  status: CallStatus;
  call_type: 'outbound' | 'inbound';
  attempt_number: number;
  duration_seconds: number | null;
  started_at: string | null;
  completed_at: string | null;
  provider: string;
  provider_call_id: string | null;
  recording_url: string | null;
  qualification_status: QualificationStatus | null;
  extracted_data: Record<string, unknown> | null;
  call_summary: string | null;
  escalated: boolean;
  escalation_reason: string | null;
  escalated_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface TranscriptEntry {
  timestamp: string;
  speaker: 'voice_agent' | 'candidate';
  text: string;
}

export interface VoiceTranscript {
  id: string;
  call_id: string;
  entries: TranscriptEntry[];
  created_at: string;
}

export interface EscalationRules {
  on_human_request: boolean;
  on_ambiguous_credentials: boolean;
  on_high_score: boolean;
  high_score_threshold: number;
  on_all_calls: boolean;
}

export interface VerificationPoint {
  label: string;
  question: string;
  required: boolean;
}

export interface VoiceSettings {
  id: string;
  role_id: string;
  enabled: boolean;
  score_threshold: number;
  calling_window_start: string;
  calling_window_end: string;
  max_attempts: number;
  retry_interval_hours: number;
  leave_voicemail: boolean;
  auto_advance_qualified: boolean;
  outreach_tone: string;
  verification_points: VerificationPoint[];
  escalation_rules: EscalationRules;
  disclosure_text: string;
  escalation_email: string | null;
  escalation_slack_channel: string | null;
  created_at: string;
  updated_at: string;
}

export type AgentName = 'scout' | 'enrich' | 'signal' | 'voice' | 'engage' | 'schedule' | 'cortex';

export interface AgentActivityLog {
  id: string;
  org_id: string;
  role_id: string | null;
  candidate_id: string | null;
  agent_name: AgentName;
  action: string;
  detail: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CandidateFeedback {
  id: string;
  candidate_id: string;
  role_id: string | null;
  user_id: string;
  org_id: string;
  rating: number;
  stage: 'screened' | 'interviewed' | 'rejected' | 'hired';
  notes: string | null;
  created_at: string;
}

export const AGENT_COLORS: Record<AgentName, string> = {
  scout: '#3B82F6',
  enrich: '#8B5CF6',
  signal: '#F59E0B',
  voice: '#22C55E',
  engage: '#EC4899',
  schedule: '#06B6D4',
  cortex: '#6366F1',
};

export const PIPELINE_STAGES: PipelineStage[] = [
  'discovered', 'scored', 'voice_qualified', 'engaged', 'responded', 'scheduled', 'archived'
];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  discovered: 'Discovered',
  scored: 'Scored',
  voice_qualified: 'Voice Qualified',
  engaged: 'Engaged',
  responded: 'Responded',
  scheduled: 'Scheduled',
  archived: 'Archived',
};

export type ClientStatus = 'prospect' | 'contacted' | 'meeting_scheduled' | 'proposal_sent' | 'active_client' | 'closed_lost';
export type OutreachType = 'email' | 'linkedin' | 'call' | 'meeting';
export type OutreachDeliveryStatus = 'draft' | 'sent' | 'opened' | 'replied' | 'bounced';

export interface Client {
  id: string;
  org_id: string;
  name: string;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  title: string | null;
  location: string | null;
  status: ClientStatus;
  source: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  next_followup_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachHistoryItem {
  id: string;
  org_id: string;
  client_id: string;
  type: OutreachType;
  subject: string | null;
  message: string | null;
  status: OutreachDeliveryStatus;
  sent_at: string | null;
  created_at: string;
}

export interface OutreachTemplate {
  id: string;
  org_id: string;
  name: string;
  subject: string;
  body: string;
  sequence_step: number;
  created_at: string;
}

export type EmailProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'ignored';
export type EmailClassification = 'resume_submission' | 'client_inquiry' | 'candidate_reply' | 'spam_irrelevant' | 'unknown';

export interface EmailInboxRow {
  id: string;
  org_id: string;
  message_id: string;
  from_email: string | null;
  from_name: string | null;
  to_email: string | null;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  received_at: string | null;
  has_attachment: boolean;
  attachment_names: string[];
  processed: boolean;
  processing_status: EmailProcessingStatus;
  processing_notes: string | null;
  classification: EmailClassification;
  classification_data: Record<string, unknown>;
  candidate_id: string | null;
  created_at: string;
}

export interface ResumeAttachment {
  id: string;
  email_id: string;
  file_name: string;
  file_type: 'pdf' | 'docx' | 'doc' | 'txt';
  file_content: string | null;
  parsed_data: Record<string, unknown>;
  candidate_id: string | null;
  created_at: string;
}
