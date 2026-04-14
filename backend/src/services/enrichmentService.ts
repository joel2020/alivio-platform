import { Candidate, EnrichmentResult } from '../models/types';
import { LLMProvider } from '../providers/llmProvider';

export class EnrichmentService {
  constructor(private llm: LLMProvider) {}

  private normalizeTitle(title: string): string {
    return title
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/don/i, 'Director of Nursing')
      .replace(/mds coord/i, 'MDS Coordinator');
  }

  async enrich(candidate: Candidate): Promise<EnrichmentResult> {
    const normalizedCandidate = {
      ...candidate,
      title: this.normalizeTitle(candidate.title),
      location: candidate.location.replace('N.Y.', 'NY').replace('N.J.', 'NJ')
    };

    const missingFields = [
      !normalizedCandidate.email && 'email',
      !normalizedCandidate.phone && 'phone',
      normalizedCandidate.licenses.length === 0 && 'license',
      !normalizedCandidate.yearsExperience && 'yearsExperience',
      normalizedCandidate.careSettings.length === 0 && 'careSettings'
    ].filter(Boolean) as string[];

    const score = 1 - missingFields.length / 8;
    normalizedCandidate.completenessScore = Number(score.toFixed(2));

    const suggestions = [
      'Validate active license status with state board lookup.',
      ...(await this.llm.generate(
        `Provide two concise enrichment suggestions for missing fields: ${missingFields.join(', ') || 'none'}.`
      )).split('.').filter(Boolean).slice(0, 2)
    ];

    return {
      candidateId: normalizedCandidate.id,
      normalizedCandidate,
      missingFields,
      completenessScore: normalizedCandidate.completenessScore,
      suggestions
    };
  }
}
