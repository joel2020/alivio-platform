import { Candidate, FitSignal, Job, MatchScore } from '../models/types';
import { LLMProvider } from '../providers/llmProvider';

export class FitScoringService {
  constructor(private llm: LLMProvider) {}

  private overlap(a: string[], b: string[]): number {
    if (!a.length || !b.length) return 0;
    const set = new Set(a.map((x) => x.toLowerCase()));
    return b.filter((x) => set.has(x.toLowerCase())).length / Math.max(1, b.length);
  }

  scoreCandidateForJob(candidate: Candidate, job: Job): MatchScore {
    const titleSimilarity = candidate.title.toLowerCase().includes(job.title.toLowerCase()) ? 1 : 0.5;
    const geographyMatch = candidate.preferredStates.some((s) => job.location.includes(s)) ? 1 : 0.3;
    const licenseMatch = this.overlap(candidate.licenses, job.requiredLicenses);
    const settingMatch = candidate.careSettings.some((s) => job.setting.toLowerCase().includes(s.toLowerCase())) ? 1 : 0.4;
    const experienceMatch = Math.min(candidate.yearsExperience / Math.max(1, job.requiredExperience), 1);
    const keywordMatch = this.overlap(candidate.specialties, job.mustHaveKeywords);
    const leadershipMatch = candidate.leadershipExperience ? 1 : 0.4;

    const factors = {
      titleSimilarity,
      geographyMatch,
      licenseMatch,
      careSettingMatch: settingMatch,
      yearsExperience: experienceMatch,
      keywordOverlap: keywordMatch,
      leadershipLevel: leadershipMatch
    };

    const score = Math.round(
      100 *
        (titleSimilarity * 0.2 +
          geographyMatch * 0.12 +
          licenseMatch * 0.2 +
          settingMatch * 0.12 +
          experienceMatch * 0.14 +
          keywordMatch * 0.12 +
          leadershipMatch * 0.1)
    );

    const strengths = Object.entries(factors)
      .filter(([, v]) => v >= 0.75)
      .map(([k]) => k);
    const risks = Object.entries(factors)
      .filter(([, v]) => v < 0.5)
      .map(([k]) => k);

    return {
      candidateId: candidate.id,
      jobId: job.id,
      score,
      strengths,
      risks,
      explanation: `Candidate scored ${score}/100 for ${job.title} with strongest signals in ${strengths.join(', ') || 'baseline alignment'}.`,
      factors
    };
  }

  async buildFitSignal(candidate: Candidate, job: Job, match: MatchScore): Promise<FitSignal> {
    const explanation = await this.llm.generate(
      `Explain healthcare recruiting fit for candidate ${candidate.fullName} vs role ${job.title}. Strengths: ${match.strengths.join(', ')} Risks: ${match.risks.join(', ')} Score: ${match.score}`
    );

    return {
      candidateId: candidate.id,
      jobId: job.id,
      fitScore: match.score,
      strengths: match.strengths,
      risks: match.risks,
      explanation
    };
  }
}
