export type AgentName =
  | 'ScoutReady'
  | 'MatchReady'
  | 'EnrichReady'
  | 'SignalReady'
  | 'EngageReady'
  | 'MonitorReady'
  | 'Parse Resume';

export interface Candidate {
  id: string;
  fullName: string;
  title: string;
  location: string;
  licenses: string[];
  specialties: string[];
  yearsExperience: number;
  careSettings: string[];
  leadershipExperience: boolean;
  summary: string;
  recentEmployers: string[];
  preferredStates: string[];
  compensationRange: { min: number; max: number; currency: string };
  status: 'active' | 'passive' | 'placed' | 'inactive';
  email?: string;
  phone?: string;
  source: string;
  sourceUrl: string;
  lastSeenAt: string;
  completenessScore: number;
}

export interface Job {
  id: string;
  title: string;
  client: string;
  location: string;
  salaryRange: { min: number; max: number; currency: string };
  setting: string;
  requiredLicenses: string[];
  requiredExperience: number;
  mustHaveKeywords: string[];
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'on-hold' | 'closed';
}

export interface Client {
  id: string;
  name: string;
  headquarters: string;
  facilities: string[];
  preferredRoles: string[];
  notes: string;
}

export interface MatchScore {
  candidateId: string;
  jobId: string;
  score: number;
  strengths: string[];
  risks: string[];
  explanation: string;
  factors: Record<string, number>;
}

export interface EnrichmentResult {
  candidateId: string;
  normalizedCandidate: Candidate;
  missingFields: string[];
  completenessScore: number;
  suggestions: string[];
}

export interface FitSignal {
  candidateId: string;
  jobId: string;
  fitScore: number;
  strengths: string[];
  risks: string[];
  explanation: string;
}

export interface OutreachDraft {
  candidateId: string;
  jobId: string;
  firstTouch: string;
  followUp: string;
  callPrep: string;
}

export interface MonitoringSummary {
  requestCount: number;
  errorRate: number;
  averageLatencyMs: number;
  matchScoreDistribution: Record<string, number>;
  enrichmentCompletionRate: number;
  recommendedAction: 'search_more' | 'enrich_more' | 'engage_now' | 'manual_review';
}

export interface ResumeParseResult {
  candidate: Candidate;
  uncertainFields: string[];
  confidence: number;
  rawTextPreview: string;
}

export interface AgentRunLog {
  id: string;
  agentName: AgentName;
  input: unknown;
  outputSummary: unknown;
  durationMs: number;
  status: 'success' | 'error';
  timestamp: string;
  error?: string;
}

export interface SearchQuery {
  role?: string;
  specialty?: string;
  geography?: string;
  careSetting?: string;
  keywords?: string[];
  limit?: number;
}
