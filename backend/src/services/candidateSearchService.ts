import { Candidate, SearchQuery } from '../models/types';
import { RetrievalProvider } from '../providers/retrievalProvider';

export class CandidateSearchService {
  constructor(private retrievalProvider: RetrievalProvider) {}

  async search(query: SearchQuery): Promise<Candidate[]> {
    const candidates = await this.retrievalProvider.searchCandidates(query);
    const seen = new Set<string>();
    return candidates.filter((candidate) => {
      const dedupeKey = `${candidate.fullName.toLowerCase()}-${candidate.location.toLowerCase()}`;
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    });
  }
}
