import {
  EngageReadyAgent,
  EnrichReadyAgent,
  MatchReadyAgent,
  MonitorReadyAgent,
  ParseResumeAgent,
  ScoutReadyAgent,
  SignalReadyAgent
} from '../agents/agents';

export class AgentOrchestratorService {
  constructor(
    public scoutReady: ScoutReadyAgent,
    public matchReady: MatchReadyAgent,
    public enrichReady: EnrichReadyAgent,
    public signalReady: SignalReadyAgent,
    public engageReady: EngageReadyAgent,
    public monitorReady: MonitorReadyAgent,
    public parseResume: ParseResumeAgent
  ) {}
}
