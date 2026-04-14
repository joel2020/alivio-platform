import { randomUUID } from 'node:crypto';
import { AgentName, AgentRunLog } from '../models/types';
import { MonitoringProvider } from '../providers/monitoringProvider';

export class MonitoringService {
  constructor(private provider: MonitoringProvider) {}

  startTimer(): number {
    return Date.now();
  }

  logRun(params: {
    agentName: AgentName;
    input: unknown;
    outputSummary: unknown;
    startedAt: number;
    status: 'success' | 'error';
    error?: string;
  }): AgentRunLog {
    const log: AgentRunLog = {
      id: randomUUID(),
      agentName: params.agentName,
      input: params.input,
      outputSummary: params.outputSummary,
      durationMs: Date.now() - params.startedAt,
      status: params.status,
      timestamp: new Date().toISOString(),
      error: params.error
    };
    this.provider.logRun(log);
    return log;
  }

  getLogs() {
    return this.provider.getLogs();
  }

  getSummary() {
    return this.provider.getSummary();
  }
}
