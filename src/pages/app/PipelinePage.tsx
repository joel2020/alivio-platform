// UPDATED VERSION (core change only shown for clarity)
// Replace candidate loading with match-based loading

import { fetchMatchedCandidates, updateCandidateMatchStatus } from '../../lib/candidateMatches';

// inside loadData
const [roleRes, matchRes, callsRes] = await Promise.all([
  supabase.from('roles').select('*').eq('id', id).single(),
  fetchMatchedCandidates(id!),
  supabase.from('voice_calls').select('*').eq('role_id', id),
]);

setRole(roleRes.data);
setCandidates(matchRes || []);

// replace score usage
<ScoreBadge score={c.match_score * 100} />

// add status control
<select
  value={c.match_status}
  onChange={(e) => updateCandidateMatchStatus(c.match_id, e.target.value as any)}
>
  <option value="matched">Matched</option>
  <option value="shortlisted">Shortlisted</option>
  <option value="submitted">Submitted</option>
  <option value="interview">Interview</option>
  <option value="offer">Offer</option>
  <option value="hired">Hired</option>
  <option value="rejected">Rejected</option>
</select>

// show reasons
<p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
  {c.match_reasons?.[0]}
</p>
