import { MatchScore } from '../models/types';
import { CandidateSearchService } from './candidateSearchService';
import { FitScoringService } from './fitScoringService';
import { JobSearchService } from './jobSearchService';

export class MatchingService {
  constructor(
    private candidates: CandidateSearchService,
    private jobs: JobSearchService,
    private fitScoring: FitScoringService
  ) {}

  async matchByJob(jobId: string): Promise<MatchScore[]> {
    const [job] = await this.jobs.search({ limit: 50 });
    if (!job || job.id !== jobId) {
      const allJobs = await this.jobs.search({ limit: 50 });
      const target = allJobs.find((j) => j.id === jobId);
      if (!target) throw new Error('Job not found');
      const candidates = await this.candidates.search({ role: target.title, geography: target.location.split(', ')[1], limit: 40 });
      return candidates.map((c) => this.fitScoring.scoreCandidateForJob(c, target)).sort((a, b) => b.score - a.score);
    }
    const candidates = await this.candidates.search({ role: job.title, geography: job.location.split(', ')[1], limit: 40 });
    return candidates.map((c) => this.fitScoring.scoreCandidateForJob(c, job)).sort((a, b) => b.score - a.score);
  }
}
