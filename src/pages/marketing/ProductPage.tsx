import { Link } from 'react-router-dom';

const agents = [
  {
    name: 'SCOUT', subtitle: 'Autonomous Sourcing Agent',
    what: 'Discovers qualified candidates across 40+ structured and unstructured data sources.',
    how: ['Ingests role requirements → constructs search ontology', 'Executes parallel queries across 40+ data sources', 'Deduplicates and surfaces net-new candidates', 'Runs continuously on configurable cadence'],
    key: "Scout doesn't search a database. It builds one — per role, per run.",
    color: '#3B82F6',
  },
  {
    name: 'ENRICH', subtitle: 'Profile Assembly Agent',
    what: 'Assembles comprehensive structured profiles from multiple sources.',
    how: ['Cross-references professional history across platforms', 'Constructs normalized candidate object', 'Validates credentials and license information', 'Outputs enriched profile to scoring pipeline'],
    key: 'Turns fragmented web signals into unified candidate intelligence.',
    color: '#8B5CF6',
  },
  {
    name: 'SIGNAL', subtitle: 'Scoring & Ranking Agent',
    what: 'Evaluates and ranks candidates using multi-dimensional scoring models.',
    how: ['Generates candidate embeddings from enriched profile', 'Computes similarity against role requirement vectors', 'Fuses qualification match, trajectory, skills adjacency, engagement propensity', 'Outputs ranked pipeline with explainable score breakdowns'],
    key: "Signal doesn't filter. It understands.",
    color: '#F59E0B',
  },
  {
    name: 'VOICE', subtitle: 'Qualification Agent',
    what: 'Handles qualification calls — credential verification, availability, compensation, scheduling.',
    how: ['Triggered when candidate score exceeds configured threshold', 'Initiates outbound call or accepts callback from candidate', 'Structured conversation with LLM reasoning layer', 'Extracts structured data: credentials, availability, compensation', 'Routes qualified candidates forward; escalates ambiguous cases'],
    key: 'Every candidate above threshold is contacted within hours, not days.',
    color: '#22C55E',
  },
  {
    name: 'ENGAGE', subtitle: 'Outreach Sequencing Agent',
    what: 'Generates and executes personalized multi-channel outreach.',
    how: ['Constructs candidate-specific messaging via RAG on profile data', 'Deploys sequences across email and LinkedIn channels', 'Manages follow-up timing and channel logic', 'Optimizes sequence based on response pattern feedback'],
    key: 'Every message is unique, contextual, and generated — not templated.',
    color: '#EC4899',
  },
  {
    name: 'SCHEDULE', subtitle: 'Coordination Agent',
    what: 'Manages all interview logistics autonomously.',
    how: ['Parses calendar availability across all parties', 'Proposes and confirms meeting times', 'Sends confirmation and reminder messages', 'Handles rescheduling requests without human intervention'],
    key: 'Zero human involvement in coordination.',
    color: '#06B6D4',
  },
  {
    name: 'CORTEX', subtitle: 'System Intelligence Layer',
    what: 'Learns from every pipeline execution to improve all agents.',
    how: ['Ingests feedback signals from recruiter and hiring manager actions', 'Retrains scoring parameters based on hiring outcomes', 'Surfaces pipeline health insights and anomaly detection', 'Compounds organizational intelligence across every hire'],
    key: 'Your hiring data becomes your competitive advantage.',
    color: '#6366F1',
  },
];

const dashboardModules = [
  'Pipeline View', 'Candidate Intelligence Cards', 'Voice Call Transcripts & Data',
  'Agent Activity Log', 'Analytics & Reporting', 'Feedback Interface', 'Settings & Configuration',
];

const compliance = [
  'AI disclosure on every voice call — candidates always know',
  'Full call recording and transcript audit trail',
  'Candidate opt-out available at any time',
  'Human fallback always accessible',
  'SOC 2 Type II compliant infrastructure',
  'GDPR-ready data handling',
  'TCPA-compliant voice outreach',
  'State-specific recording consent enforcement',
];

export default function ProductPage() {
  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 border-b" style={{ borderColor: '#1E1E1E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#4F46E5' }}>The Platform</p>
        <h1 className="font-bold text-white mb-6" style={{ fontSize: '56px', lineHeight: '1.05' }}>The Platform</h1>
        <p className="text-xl mb-6" style={{ color: '#A0A0A0', maxWidth: '600px', lineHeight: '1.6' }}>
          Alivio is an AI-native talent operating system built on autonomous agent architecture.
        </p>
        <p style={{ color: '#A0A0A0', maxWidth: '700px', lineHeight: '1.7' }}>
          It replaces the fragmented stack of sourcing tools, applicant tracking systems, outreach platforms, and scheduling software with a single intelligent system that executes the full hiring pipeline.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {agents.map((agent, idx) => (
          <section key={agent.name} className="py-20 border-b" style={{ borderColor: '#1E1E1E' }}>
            <div className={`grid md:grid-cols-2 gap-16 items-start ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className={idx % 2 !== 0 ? 'order-2 md:order-1' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: agent.color }} />
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: agent.color }}>Agent</p>
                </div>
                <h3 className="font-semibold text-white mb-1" style={{ fontSize: '26px' }}>{agent.name}</h3>
                <p className="text-base mb-6" style={{ color: '#6B6B6B' }}>{agent.subtitle}</p>
                <p className="mb-6" style={{ color: '#A0A0A0', lineHeight: '1.7' }}>{agent.what}</p>
                <div className="p-4 rounded-lg border-l-2" style={{ backgroundColor: '#141414', borderColor: agent.color }}>
                  <p className="text-sm font-semibold text-white">"{agent.key}"</p>
                </div>
              </div>
              <div className={`p-6 rounded-lg border ${idx % 2 !== 0 ? 'order-1 md:order-2' : ''}`} style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#6B6B6B' }}>How it works</p>
                <ul className="space-y-3">
                  {agent.how.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm" style={{ color: '#A0A0A0' }}>
                      <span className="font-mono text-xs mt-0.5 flex-shrink-0" style={{ color: agent.color }}>0{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        <section className="py-20 border-b" style={{ borderColor: '#1E1E1E' }}>
          <h2 className="font-semibold text-white mb-4" style={{ fontSize: '32px' }}>Your command center.</h2>
          <p className="mb-8" style={{ color: '#A0A0A0', maxWidth: '500px' }}>
            Everything you need to manage your hiring pipeline in one place. Clear, dense, and built for operators.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {dashboardModules.map((mod) => (
              <div key={mod} className="flex items-center gap-3 p-4 rounded-lg border" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4F46E5' }} />
                <p className="text-sm text-white">{mod}</p>
              </div>
            ))}
          </div>
          <Link to="/signup" className="inline-block px-6 py-3 rounded font-medium text-white" style={{ backgroundColor: '#4F46E5' }}>
            Watch Platform Demo (3 min) →
          </Link>
        </section>

        <section className="py-20">
          <h2 className="font-semibold text-white mb-8" style={{ fontSize: '32px' }}>Enterprise-Ready. Compliance-First.</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {compliance.map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 rounded-lg border" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
                <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }}>✓</span>
                <p className="text-sm" style={{ color: '#A0A0A0' }}>{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
