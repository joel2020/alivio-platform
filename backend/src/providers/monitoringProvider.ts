import { AgentRunLog, MonitoringSummary } from '../models/types';

export interface MonitoringProvider {
  logRun(log: AgentRunLog): void;
  getLogs(): AgentRunLog[];
  getSummary(): MonitoringSummary;
}

export class InMemoryMonitoringProvider implements MonitoringProvider {
  private logs: AgentRunLog[] = [];

  logRun(log: AgentRunLog): void {
    this.logs.unshift(log);
    this.logs = this.logs.slice(0, 500);
  }

  getLogs(): AgentRunLog[] {
    return this.logs;
  }

  getSummary(): MonitoringSummary {
    const requestCount = this.logs.length;
    const errors = this.logs.filter((l) => l.status === 'error').length;
    const averageLatencyMs = requestCount
      ? Math.round(this.logs.reduce((sum, l) => sum + l.durationMs, 0) / requestCount)
      : 0;

    const matchScores = this.logs
      .map((l) => (l.outputSummary as { fitScore?: unknown } | undefined)?.fitScore)
      .filter((s): s is number => typeof s === 'number');
    const dist = {
      low: matchScores.filter((s) => s < 50).length,
      medium: matchScores.filter((s) => s >= 50 && s < 75).length,
      high: matchScores.filter((s) => s >= 75).length
    };

    const enrichRuns = this.logs.filter((l) => l.agentName === 'EnrichReady');
    const enrichmentCompletionRate = enrichRuns.length
      ? enrichRuns.filter((l) => (((l.outputSummary as { completenessScore?: number } | undefined)?.completenessScore) ?? 0) >= 0.8).length / enrichRuns.length
      : 0;

    const recommendedAction: MonitoringSummary['recommendedAction'] =
      dist.low > dist.high ? 'enrich_more' : errors / Math.max(requestCount, 1) > 0.1 ? 'manual_review' : 'engage_now';

    return {
      requestCount,
      errorRate: requestCount ? errors / requestCount : 0,
      averageLatencyMs,
      matchScoreDistribution: dist,
      enrichmentCompletionRate,
      recommendedAction
    };
  }
}
