import type { Candidate, Role } from './types';

export type CandidateMatchLabel = 'Strong match' | 'Review' | 'Low fit';

export type CandidateMatchResult = Candidate & {
  computedScore: number;
  matchedSkills: string[];
  missingMustHaves: string[];
  matchLabel: CandidateMatchLabel;
};

function normalize(value?: string | null) {
  return (value || '').toLowerCase().trim();
}

function tokenSet(items?: string[] | null) {
  return new Set((items || []).map((item) => normalize(item)).filter(Boolean));
}

export function scoreCandidateForRole(candidate: Candidate, role: Role): CandidateMatchResult {
  const candidateSkills = tokenSet(candidate.skills);
  const mustHaves = role.must_have_requirements || [];
  const niceHaves = role.nice_to_have_requirements || [];
  const matchedMust = mustHaves.filter((skill) => candidateSkills.has(normalize(skill)));
  const matchedNice = niceHaves.filter((skill) => candidateSkills.has(normalize(skill)));
  const missingMustHaves = mustHaves.filter((skill) => !candidateSkills.has(normalize(skill)));

  const mustScore = mustHaves.length ? matchedMust.length / mustHaves.length : 0.55;
  const niceScore = niceHaves.length ? matchedNice.length / niceHaves.length : 0.2;
  const experienceScore = candidate.experience_years && role.experience_min
    ? Math.min(candidate.experience_years / Math.max(role.experience_min, 1), 1)
    : 0.5;
  const storedScore = typeof candidate.score === 'number' ? candidate.score : 0;

  const computedScore = Math.min(
    1,
    Math.max(0, mustScore * 0.45 + niceScore * 0.2 + experienceScore * 0.2 + storedScore * 0.15),
  );

  return {
    ...candidate,
    computedScore,
    matchedSkills: [...matchedMust, ...matchedNice],
    missingMustHaves,
    matchLabel: computedScore >= 0.75 ? 'Strong match' : computedScore >= 0.5 ? 'Review' : 'Low fit',
  };
}

export function rankCandidatesForRole(candidates: Candidate[], role: Role) {
  return candidates
    .map((candidate) => scoreCandidateForRole(candidate, role))
    .sort((a, b) => b.computedScore - a.computedScore);
}
