import { candidates, jobs } from '../data/seedData';
import { Candidate, FitSignal, Job, MatchScore, MonitoringSummary, OutreachDraft, SearchQuery } from '../models/types';
import { CandidateSearchService } from '../services/candidateSearchService';
import { EnrichmentService } from '../services/enrichmentService';
import { FitScoringService } from '../services/fitScoringService';
import { JobSearchService } from '../services/jobSearchService';
import { MatchingService } from '../services/matchingService';
import { MonitoringService } from '../services/monitoringService';
import { OutreachService } from '../services/outreachService';
import { ResumeParsingService } from '../services/resumeParsingService';

export class ScoutReadyAgent {
  constructor(private candidateSearch: CandidateSearchService, private monitoring: MonitoringService) {}

  async run(input: SearchQuery) {
    const startedAt = this.monitoring.startTimer();
    try {
      const found = await this.candidateSearch.search(input);
      const leads = found.map((candidate) => ({
        candidate,
        freshnessSignal: Math.max(0, 100 - Math.floor((Date.now() - new Date(candidate.lastSeenAt).getTime()) / 86400000)),
        confidenceSignal: Math.min(95, 60 + candidate.specialties.length * 5 + candidate.licenses.length * 5)
      }));
      this.monitoring.logRun({
        agentName: 'ScoutReady',
        input,
        outputSummary: { count: leads.length },
        startedAt,
        status: 'success'
      });
      return { leads };
    } catch (error) {
      this.monitoring.logRun({
        agentName: 'ScoutReady',
        input,
        outputSummary: { error: 'failed' },
        startedAt,
        status: 'error',
        error: String(error)
      });
      throw error;
    }
  }
}

export class MatchReadyAgent {
  constructor(private matching: MatchingService, private monitoring: MonitoringService) {}

  async run(input: { jobId: string }) {
    const startedAt = this.monitoring.startTimer();
    try {
      const ranked = await this.matching.matchByJob(input.jobId);
      this.monitoring.logRun({
        agentName: 'MatchReady',
        input,
        outputSummary: { topScore: ranked[0]?.score ?? 0 },
        startedAt,
        status: 'success'
      });
      return { ranked };
    } catch (error) {
      this.monitoring.logRun({ agentName: 'MatchReady', input, outputSummary: {}, startedAt, status: 'error', error: String(error) });
      throw error;
    }
  }
}

export class EnrichReadyAgent {
  constructor(private enrichment: EnrichmentService, private monitoring: MonitoringService) {}

  async run(input: { candidate: Candidate }) {
    const startedAt = this.monitoring.startTimer();
    const result = await this.enrichment.enrich(input.candidate);
    this.monitoring.logRun({
      agentName: 'EnrichReady',
      input: { candidateId: input.candidate.id },
      outputSummary: { completenessScore: result.completenessScore },
      startedAt,
      status: 'success'
    });
    return result;
  }
}

export class SignalReadyAgent {
  constructor(private fitScoring: FitScoringService, private monitoring: MonitoringService) {}

  async run(input: { candidate: Candidate; job: Job }): Promise<FitSignal> {
    const startedAt = this.monitoring.startTimer();
    const match: MatchScore = this.fitScoring.scoreCandidateForJob(input.candidate, input.job);
    const signal = await this.fitScoring.buildFitSignal(input.candidate, input.job, match);
    this.monitoring.logRun({ agentName: 'SignalReady', input, outputSummary: { fitScore: signal.fitScore }, startedAt, status: 'success' });
    return signal;
  }
}

export class EngageReadyAgent {
  constructor(private outreach: OutreachService, private monitoring: MonitoringService) {}

  async run(input: { candidate: Candidate; job: Job }): Promise<OutreachDraft> {
    const startedAt = this.monitoring.startTimer();
    const draft = await this.outreach.generate(input.candidate, input.job);
    this.monitoring.logRun({ agentName: 'EngageReady', input, outputSummary: { candidateId: draft.candidateId }, startedAt, status: 'success' });
    return draft;
  }
}

export class MonitorReadyAgent {
  constructor(private monitoring: MonitoringService) {}

  async run(): Promise<MonitoringSummary> {
    const startedAt = this.monitoring.startTimer();
    const summary = this.monitoring.getSummary();
    this.monitoring.logRun({ agentName: 'MonitorReady', input: {}, outputSummary: summary, startedAt, status: 'success' });
    return summary;
  }
}

export class ParseResumeAgent {
  constructor(
    private resumeParsing: ResumeParsingService,
    private enrichReady: EnrichReadyAgent,
    private signalReady: SignalReadyAgent,
    private monitoring: MonitoringService
  ) {}

  async run(input: { resumeText: string; jobId?: string }) {
    const startedAt = this.monitoring.startTimer();
    const parsed = await this.resumeParsing.parse(input.resumeText);
    const enriched = await this.enrichReady.run({ candidate: parsed.candidate });
    const job = jobs.find((j) => j.id === input.jobId) ?? jobs[0];
    const fit = await this.signalReady.run({ candidate: enriched.normalizedCandidate, job });
    this.monitoring.logRun({
      agentName: 'Parse Resume',
      input: { jobId: input.jobId },
      outputSummary: { confidence: parsed.confidence, fitScore: fit.fitScore },
      startedAt,
      status: 'success'
    });
    return { parsed, enriched, fit };
  }
}

export const defaults = { candidates, jobs };
