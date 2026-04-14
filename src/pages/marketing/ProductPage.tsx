import { CAL_COM_BOOKING_URL, DEMO_EVENT_DESCRIPTION, DEMO_EVENT_TITLE } from '../../lib/demoBooking';

const agents = [
  {
    name: 'SCOUT', subtitle: 'Autonomous Sourcing Agent',
    what: 'Discovers qualified RNs, nurse practitioners, clinical directors, and healthcare leaders across Doximity, Vivian Health, nursing networks, and 40+ healthcare-specific data sources.',
    how: ['Ingests role requirements including licensure, certifications, and specialty → constructs healthcare-specific search ontology', 'Executes parallel queries across 40+ data sources', 'Deduplicates and surfaces net-new credentialed candidates', 'Runs continuously on configurable cadence'],
    key: 'Scout builds a credentialed candidate pipeline — per role, per facility, per run.',
    color: '#3B82F6',
  },
  {
    name: 'ENRICH', subtitle: 'Profile Assembly Agent',
    what: 'Assembles comprehensive profiles including licenses, certifications, clinical experience, and facility history from multiple healthcare sources.',
    how: ['Cross-references professional history across platforms', 'Constructs normalized candidate object', 'Validates nursing licenses, board certifications, ACLS/BLS, and state-specific credentials', 'Outputs enriched profile to scoring pipeline'],
    key: 'Turns fragmented credentials and work history into unified clinical candidate intelligence.',
    color: '#8B5CF6',
  },
  {
    name: 'SIGNAL', subtitle: 'Scoring & Ranking Agent',
    what: 'Evaluates and ranks healthcare candidates using multi-dimensional scoring models including credential match, clinical experience, specialty fit, and engagement likelihood.',
    how: ['Generates candidate embeddings from enriched profile', 'Computes similarity against role requirement vectors', 'Fuses credential match, clinical trajectory, specialty adjacency, and engagement propensity', 'Outputs ranked pipeline with explainable score breakdowns'],
    key: 'Ranks every nurse and clinician by credential match, specialty fit, and location — so you see your best candidates first.',
    color: '#F59E0B',
  },
  {
    name: 'CORTEX', subtitle: 'System Intelligence Layer',
    what: 'Learns from every healthcare placement to improve sourcing, scoring, and outreach across your organization.',
    how: ['Ingests feedback signals from recruiter and hiring manager actions', 'Retrains scoring parameters based on hiring outcomes', 'Surfaces pipeline health insights and anomaly detection', 'Compounds organizational intelligence across every hire'],
    key: 'Every placement makes Alivio smarter — improving candidate scoring and sourcing accuracy across every future search.',
    color: '#6366F1',
  },
];

export default function ProductPage() {
  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 border-b" style={{ borderColor: '#1E1E1E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#4F46E5' }}>The Platform</p>
        <h1 className="font-bold text-white mb-6" style={{ fontSize: '56px', lineHeight: '1.05' }}>AI Agents for Healthcare Recruiting Teams</h1>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {agents.map((agent, idx) => {
          const light = idx % 2 === 1;
          return (
            <section key={agent.name} className="py-20 border-b" style={{ borderColor: light ? '#E4E4E7' : '#1E1E1E', backgroundColor: light ? '#FFFFFF' : 'transparent' }}>
              <div className="grid md:grid-cols-2 gap-16 items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: agent.color }}>Agent</p>
                  <h2 className="font-semibold mb-1" style={{ fontSize: '26px', color: light ? '#09090B' : '#FFFFFF' }}>{agent.name}</h2>
                  <p className="text-base mb-6" style={{ color: light ? '#52525B' : '#6B6B6B' }}>{agent.subtitle}</p>
                  <p className="mb-6" style={{ color: light ? '#3F3F46' : '#A0A0A0', lineHeight: '1.7' }}>{agent.what}</p>
                  <div className="p-4 rounded-lg border-l-2" style={{ backgroundColor: light ? '#F4F4F5' : '#141414', borderColor: agent.color }}>
                    <p className="text-sm font-semibold" style={{ color: light ? '#18181B' : '#FFFFFF' }}>&quot;{agent.key}&quot;</p>
                  </div>
                </div>
                <div className="p-6 rounded-lg border" style={{ backgroundColor: light ? '#F9FAFB' : '#141414', borderColor: light ? '#E4E4E7' : '#1E1E1E' }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: light ? '#71717A' : '#6B6B6B' }}>How it works</p>
                  <ul className="space-y-3">
                    {agent.how.map((step, i) => <li key={i} className="flex items-start gap-3 text-sm" style={{ color: light ? '#3F3F46' : '#A0A0A0' }}><span className="font-mono text-xs mt-0.5" style={{ color: agent.color }}>0{i + 1}</span>{step}</li>)}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}

        <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="font-semibold mb-4" style={{ fontSize: '32px', color: '#09090B' }}>Your command center.</h2>
          <p className="mb-8" style={{ color: '#3F3F46', maxWidth: '600px' }}>
            A single workspace for your entire clinical hiring pipeline. Designed for healthcare HR teams managing multiple facilities and roles.
          </p>
          <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 rounded font-medium text-white" style={{ backgroundColor: '#4F46E5' }} title={`${DEMO_EVENT_TITLE}: ${DEMO_EVENT_DESCRIPTION}`}>
            Book a Demo →
          </a>
        </section>
      </div>
    </div>
  );
}
