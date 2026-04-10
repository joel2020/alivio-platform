import { Zap } from 'lucide-react';

const agents = [
  {
    name: 'Scout',
    color: '#3B82F6',
    status: 'Active',
    statusColor: '#10B981',
    description: 'Continuously searches 40+ talent networks to discover matching candidates for your open roles.',
  },
  {
    name: 'Enrich',
    color: '#10B981',
    status: 'Active',
    statusColor: '#10B981',
    description: 'Enriches candidate profiles with additional data from public sources for a complete picture.',
  },
  {
    name: 'Signal',
    color: '#F59E0B',
    status: 'Processing',
    statusColor: '#F59E0B',
    description: 'Scores every candidate across four dimensions — skills, experience, trajectory, and engagement propensity.',
  },
  {
    name: 'Engage',
    color: '#EC4899',
    status: 'Ready',
    statusColor: '#2563EB',
    description: 'Drafts personalized outreach messages and manages follow-up sequences for each candidate.',
  },
  {
    name: 'Monitor',
    color: '#06B6D4',
    status: 'Active',
    statusColor: '#10B981',
    description: 'Tracks candidate responses, stage changes, and pipeline health in real time.',
  },
];

export default function AgentsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
          Agents
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
            }}
          />
          <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 500 }}>All systems operational</span>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: '720px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#09090B', marginBottom: '4px' }}>
            Your AI Recruiting Team
          </h2>
          <p style={{ fontSize: '14px', color: '#71717A' }}>
            Five specialized agents working around the clock to fill your roles.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="card"
              style={{ padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: agent.color + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Zap size={16} style={{ color: agent.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#09090B' }}>{agent.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: agent.statusColor,
                        }}
                      />
                      <span style={{ fontSize: '12px', color: agent.statusColor, fontWeight: 500 }}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#71717A', lineHeight: 1.6, margin: 0 }}>
                    {agent.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
