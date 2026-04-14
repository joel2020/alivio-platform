import { candidates, jobs } from '../data/seedData';
import { Candidate, Job, SearchQuery } from '../models/types';
import { RetrievalProvider } from './retrievalProvider';

const contains = (text: string, query?: string) =>
  !query || text.toLowerCase().includes(query.toLowerCase());

const hasAny = (arr: string[], query?: string) =>
  !query || arr.some((item) => item.toLowerCase().includes(query.toLowerCase()));

export class MockRetrievalProvider implements RetrievalProvider {
  async searchCandidates(query: SearchQuery): Promise<Candidate[]> {
    return candidates
      .filter(
        (candidate) =>
          contains(candidate.title, query.role) &&
          contains(candidate.location, query.geography) &&
          hasAny(candidate.specialties, query.specialty) &&
          hasAny(candidate.careSettings, query.careSetting)
      )
      .slice(0, query.limit ?? 25);
  }

  async searchJobs(query: SearchQuery): Promise<Job[]> {
    return jobs
      .filter(
        (job) =>
          contains(job.title, query.role) &&
          contains(job.location, query.geography) &&
          hasAny(job.mustHaveKeywords, query.specialty) &&
          contains(job.setting, query.careSetting)
      )
      .slice(0, query.limit ?? 25);
  }
}
