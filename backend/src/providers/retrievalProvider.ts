import { Candidate, Job, SearchQuery } from '../models/types';

export interface RetrievalProvider {
  searchCandidates(query: SearchQuery): Promise<Candidate[]>;
  searchJobs(query: SearchQuery): Promise<Job[]>;
}
