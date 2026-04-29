import { supabase } from './supabase';
import type { Candidate } from './types';

export type CandidateRoleMatchStatus =
  | 'matched'
  | 'shortlisted'
  | 'submitted'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'archived';

export type CandidateRoleMatch = {
  id: string;
  org_id: string;
  candidate_id: string;
  role_id: string;
  match_score: number;
  status: CandidateRoleMatchStatus;
  reasons: string[];
  risks: string[];
  next_step: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  candidates: Candidate | null;
};

export type MatchedCandidate = Candidate & {
  match_id: string;
  match_score: number;
  match_status: CandidateRoleMatchStatus;
  match_reasons: string[];
  match_risks: string[];
  match_next_step: string | null;
  submitted_at: string | null;
};

export async function fetchMatchedCandidates(roleId: string): Promise<MatchedCandidate[]> {
  const { data, error } = await supabase
    .from('candidate_role_matches')
    .select('*, candidates(*)')
    .eq('role_id', roleId)
    .order('match_score', { ascending: false });

  if (error) throw error;

  return ((data || []) as CandidateRoleMatch[])
    .filter((match) => !!match.candidates)
    .map((match) => ({
      ...(match.candidates as Candidate),
      match_id: match.id,
      match_score: Number(match.match_score || 0),
      match_status: match.status,
      match_reasons: match.reasons || [],
      match_risks: match.risks || [],
      match_next_step: match.next_step,
      submitted_at: match.submitted_at,
    }));
}

export async function updateCandidateMatchStatus(matchId: string, status: CandidateRoleMatchStatus) {
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'submitted') patch.submitted_at = new Date().toISOString();
  const { error } = await supabase
    .from('candidate_role_matches')
    .update(patch)
    .eq('id', matchId);
  if (error) throw error;
}
