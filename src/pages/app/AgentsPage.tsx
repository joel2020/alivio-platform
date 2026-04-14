import { useMemo, useState } from 'react';
import { Loader2, Play, Zap } from 'lucide-react';
import { matchCandidates, parseResume, scoreCandidates, sourceCandidates } from '../../lib/ai';
import Toast from '../../components/app/Toast';

const baseAgents = [
  { key: 'scout', name: 'Scout', color: '#3B82F6', description: 'Continuously searches talent sources for matching candidates.' },
  { key: 'enrich', name: 'Enrich', color: '#10B981', description: 'Extracts structured data and verifies profile completeness.' },
  { key: 'signal', name: 'Signal', color: '#F59E0B', description: 'Scores candidate fit and explains strengths and risks.' },
  { key: 'engage', name: 'Engage', color: '#EC4899', description: 'Drafts personalized outreach and follow-up content.' },
  { key: 'monitor', name: 'Monitor', color: '#06B6D4', description: 'Monitors matching quality and recommends next actions.' },
] as const;

export default function AgentsPage() {
  const [running, setRunning] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  async function triggerAgent(agentKey: string) {
    setRunning(agentKey);
    try {
      if (agentKey === 'scout') {
        await sourceCandidates('Nurse Manager role in Chicago', ['ICU', 'BSN', '7+ years leadership']);
      } else if (agentKey === 'enrich') {
        await parseResume('Jane Doe, RN. ICU nurse leader with 10 years experience, ACLS, CCRN.');
      } else if (agentKey === 'signal') {
        await scoreCandidates('Nurse Manager', [{ id: 'demo-candidate', name: 'Jane Doe', experienceYears: 10, skills: ['ICU', 'Leadership', 'Staffing'] }]);
      } else if (agentKey === 'engage') {
        await scoreCandidates('Outreach readiness', [{ id: 'demo-candidate', name: 'Jane Doe', experienceYears: 10, skills: ['Communication', 'ICU'] }]);
      } else if (agentKey === 'monitor') {
        await matchCandidates('Nurse Manager', [{ id: 'demo-candidate', name: 'Jane Doe', experienceYears: 10, skills: ['ICU', 'Leadership'] }]);
      }

      setStatuses((prev) => ({ ...prev, [agentKey]: 'Active' }));
      setToast('Agent run completed successfully.');
    } catch (error) {
      console.error(error);
      setStatuses((prev) => ({ ...prev, [agentKey]: 'Error' }));
      setToast('Agent execution failed. Please try again.');
    } finally {
      setRunning(null);
    }
  }

  const agents = useMemo(
    () => baseAgents.map((agent) => ({ ...agent, status: statuses[agent.key] ?? 'Ready' })),
    [statuses],
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Agents</h1>
        <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 500 }}>AI agent controls</span>
      </div>

      <div className="page-content" style={{ maxWidth: '760px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#09090B', marginBottom: '4px' }}>Your AI Recruiting Team</h2>
          <p style={{ fontSize: '14px', color: '#71717A' }}>Check status and trigger each agent manually.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {agents.map((agent) => {
            const isRunning = running === agent.key;
            const statusColor = agent.status === 'Active' ? '#10B981' : agent.status === 'Error' ? '#EF4444' : '#2563EB';

            return (
              <div key={agent.key} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: agent.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={16} style={{ color: agent.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#09090B' }}>{agent.name}</span>
                      <span style={{ fontSize: '12px', color: statusColor, fontWeight: 600 }}>{agent.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#71717A', lineHeight: 1.6, margin: 0 }}>{agent.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerAgent(agent.key)}
                    disabled={isRunning}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ border: '1px solid var(--border)', backgroundColor: isRunning ? 'var(--bg-subtle)' : 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                  >
                    {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                    {isRunning ? 'Running...' : 'Run now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
