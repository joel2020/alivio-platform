import { Job, SearchQuery } from '../models/types';
import { RetrievalProvider } from '../providers/retrievalProvider';

export class JobSearchService {
  constructor(private retrievalProvider: RetrievalProvider) {}

  async search(query: SearchQuery): Promise<Job[]> {
    return this.retrievalProvider.searchJobs(query);
  }
}
