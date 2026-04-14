import cors from 'cors';
import express from 'express';
import { defaults, EngageReadyAgent, EnrichReadyAgent, MatchReadyAgent, MonitorReadyAgent, ParseResumeAgent, ScoutReadyAgent, SignalReadyAgent } from './agents/agents';
import { env, isLiveMode } from './config/env';
import { MockRetrievalProvider } from './providers/mockRetrievalProvider';
import { InMemoryMonitoringProvider } from './providers/monitoringProvider';
import { MockLLMProvider, OpenAICompatibleLLMProvider } from './providers/openAiCompatibleLLMProvider';
import { MockResumeParserProvider } from './providers/resumeParserProvider';
import { VertexDiscoveryEngineProvider } from './providers/vertexDiscoveryEngineProvider';
import { AgentOrchestratorService } from './services/agentOrchestratorService';
import { CandidateSearchService } from './services/candidateSearchService';
import { EnrichmentService } from './services/enrichmentService';
import { FitScoringService } from './services/fitScoringService';
import { JobSearchService } from './services/jobSearchService';
import { MatchingService } from './services/matchingService';
import { MonitoringService } from './services/monitoringService';
import { OutreachService } from './services/outreachService';
import { ResumeParsingService } from './services/resumeParsingService';

const retrieval = isLiveMode ? new VertexDiscoveryEngineProvider() : new MockRetrievalProvider();
const llm = env.llmApiKey ? new OpenAICompatibleLLMProvider() : new MockLLMProvider();
const monitorProvider = new InMemoryMonitoringProvider();
const monitoringService = new MonitoringService(monitorProvider);

const candidateSearch = new CandidateSearchService(retrieval);
const jobSearch = new JobSearchService(retrieval);
const fitScoring = new FitScoringService(llm);
const matching = new MatchingService(candidateSearch, jobSearch, fitScoring);
const enrichment = new EnrichmentService(llm);
const outreach = new OutreachService(llm);
const resumeParsing = new ResumeParsingService(new MockResumeParserProvider());

const enrichReady = new EnrichReadyAgent(enrichment, monitoringService);
const signalReady = new SignalReadyAgent(fitScoring, monitoringService);

const orchestrator = new AgentOrchestratorService(
  new ScoutReadyAgent(candidateSearch, monitoringService),
  new MatchReadyAgent(matching, monitoringService),
  enrichReady,
  signalReady,
  new EngageReadyAgent(outreach, monitoringService),
  new MonitorReadyAgent(monitoringService),
  new ParseResumeAgent(resumeParsing, enrichReady, signalReady, monitoringService)
);

export const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', mode: isLiveMode ? 'live' : 'mock', llm: env.llmApiKey ? 'configured' : 'mock' });
});

app.post('/api/agents/scoutready/run', async (req, res) => {
  res.json(await orchestrator.scoutReady.run(req.body ?? {}));
});

app.post('/api/agents/matchready/run', async (req, res) => {
  const jobId = req.body?.jobId ?? defaults.jobs[0].id;
  res.json(await orchestrator.matchReady.run({ jobId }));
});

app.post('/api/agents/enrichready/run', async (req, res) => {
  const candidate = req.body?.candidate ?? defaults.candidates[0];
  res.json(await orchestrator.enrichReady.run({ candidate }));
});

app.post('/api/agents/signalready/run', async (req, res) => {
  const candidate = req.body?.candidate ?? defaults.candidates[0];
  const job = req.body?.job ?? defaults.jobs[0];
  res.json(await orchestrator.signalReady.run({ candidate, job }));
});

app.post('/api/agents/engageready/run', async (req, res) => {
  const candidate = req.body?.candidate ?? defaults.candidates[0];
  const job = req.body?.job ?? defaults.jobs[0];
  res.json(await orchestrator.engageReady.run({ candidate, job }));
});

app.post('/api/agents/monitorready/run', async (_req, res) => {
  res.json(await orchestrator.monitorReady.run());
});

app.post('/api/agents/parse-resume/run', async (req, res) => {
  const resumeText = req.body?.resumeText ?? 'Jordan Patel\nDirector of Nursing\nMiami, FL\nRN\n12 years experience';
  res.json(await orchestrator.parseResume.run({ resumeText, jobId: req.body?.jobId }));
});

app.get('/api/agents/logs', (_req, res) => {
  res.json(monitoringService.getLogs());
});

app.get('/api/metrics', (_req, res) => {
  res.json(monitoringService.getSummary());
});

app.get('/dashboard', (_req, res) => {
  res.type('html').send(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><style>
    body{font-family:Inter,Arial,sans-serif;background:#0b1220;color:#dbeafe;margin:0;padding:16px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
    .card{background:#111827;border:1px solid #1f2937;border-radius:12px;padding:12px}
    button{background:#2563eb;color:#fff;border:0;padding:8px 10px;border-radius:8px;cursor:pointer}
    pre{white-space:pre-wrap;background:#020617;padding:12px;border-radius:8px;max-height:300px;overflow:auto}
  </style></head><body><h2>Alivio AgentOps Dashboard</h2><p>Mode: ${isLiveMode ? 'LIVE (Vertex)' : 'MOCK'}</p>
  <div class="grid" id="cards"></div><h3>Health</h3><pre id="health"></pre><h3>Logs</h3><pre id="logs"></pre><h3>Results</h3><pre id="results"></pre>
<script>
const agents=['scoutready','matchready','enrichready','signalready','engageready','monitorready','parse-resume'];
const cards=document.getElementById('cards');
const results=document.getElementById('results');
agents.forEach(a=>{const c=document.createElement('div');c.className='card';c.innerHTML='<h4>'+a+'</h4><button>Run</button>';c.querySelector('button').onclick=async()=>{const r=await fetch('/api/agents/'+a+'/run',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});results.textContent=JSON.stringify(await r.json(),null,2);loadLogs();};cards.appendChild(c);});
async function loadLogs(){const r=await fetch('/api/agents/logs');document.getElementById('logs').textContent=JSON.stringify(await r.json(),null,2)}
async function loadHealth(){const r=await fetch('/api/health');document.getElementById('health').textContent=JSON.stringify(await r.json(),null,2)}
loadLogs();loadHealth();
</script></body></html>`);
});

export { orchestrator, monitoringService };
