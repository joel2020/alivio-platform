import { useEffect, useRef, useState } from 'react';
import { AGENT_COLORS } from '../../lib/types';
import type { AgentActivityLog, AgentName } from '../../lib/types';

interface LiveEntry extends Partial<AgentActivityLog> {
  id: string;
  agent_name: AgentName;
  action: string;
  detail?: string | null;
  created_at: string;
  simulated?: boolean;
}

const SIMULATED_EVENTS: Array<{ agent_name: AgentName; action: string; detail: string }> = [
  { agent_name: 'scout', action: 'Found 14 new candidates', detail: 'Nurse Manager — ICU · Doximity + LinkedIn scan' },
  { agent_name: 'signal', action: 'Scored Maria Santos, RN at 96%', detail: 'ICU experience, ACLS, Epic EMR · all hard quals confirmed' },
  { agent_name: 'engage', action: 'Drafted outreach for Dr. Robert Kim', detail: 'Email · professional tone · credential-specific' },
  { agent_name: 'scout', action: 'Found 8 new candidates', detail: 'Nurse Practitioner — Primary Care · specialty network scan' },
  { agent_name: 'enrich', action: 'Profile assembled', detail: 'IL license verified · state board API · active, no restrictions' },
  { agent_name: 'voice', action: 'Call initiated', detail: 'Angela Washington, RN · Attempt 1 of 3 · outbound' },
  { agent_name: 'signal', action: 'Batch scored 7 candidates', detail: '5 above threshold · range 73–94%' },
  { agent_name: 'enrich', action: 'Credentials extracted', detail: 'CCRN, ACLS, BLS confirmed · NPI lookup completed' },
  { agent_name: 'voice', action: 'Voicemail left', detail: 'Patricia Hernandez, DNP · follow-up scheduled in 48h' },
  { agent_name: 'engage', action: 'Follow-up queued', detail: 'No reply in 72h · second touch scheduled' },
  { agent_name: 'schedule', action: 'Interview confirmed', detail: 'Maria Santos — Thursday 2pm CT · Zoom link dispatched' },
  { agent_name: 'cortex', action: 'Weights updated', detail: 'CCRN certification weight increased · +0.12x multiplier' },
  { agent_name: 'voice', action: 'Call qualified', detail: 'James Mitchell, FNP-C · all verification points passed' },
  { agent_name: 'signal', action: 'Score revised to 79%', detail: 'Michael Chen, PA-C · license gap flagged · hard_qual adjusted' },
  { agent_name: 'engage', action: 'Reply detected', detail: 'Rachel Foster, RN · expressed interest · moving to voice queue' },
  { agent_name: 'scout', action: '4 duplicates excluded', detail: 'Already in pipeline — deduplication complete' },
  { agent_name: 'cortex', action: 'Insight generated', detail: 'CCRN candidates convert 31% higher — pipeline signal' },
  { agent_name: 'enrich', action: 'License verified', detail: 'Sandra Williams, CCRN · state board confirmed active' },
];

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

interface Props {
  initialEntries: AgentActivityLog[];
  simulate?: boolean;
  maxVisible?: number;
}

export default function LiveActivityFeed({ initialEntries, simulate = true, maxVisible = 16 }: Props) {
  const [entries, setEntries] = useState<LiveEntry[]>(
    initialEntries.map(e => ({ ...e, simulated: false }))
  );
  const [newestId, setNewestId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventIndexRef = useRef(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    setEntries(initialEntries.map(e => ({ ...e, simulated: false })));
  }, [initialEntries]);

  useEffect(() => {
    const relativeTimer = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(relativeTimer);
  }, []);

  useEffect(() => {
    if (!simulate) return;
    const delay = 3500 + Math.random() * 3000;
    const timeout = setTimeout(() => {
      pushEvent();
    }, delay);

    intervalRef.current = setInterval(() => {
      pushEvent();
    }, 9000 + Math.random() * 5000);

    function pushEvent() {
      const event = SIMULATED_EVENTS[eventIndexRef.current % SIMULATED_EVENTS.length];
      eventIndexRef.current += 1;
      const newEntry: LiveEntry = {
        id: `sim-${Date.now()}-${Math.random()}`,
        agent_name: event.agent_name,
        action: event.action,
        detail: event.detail,
        created_at: new Date().toISOString(),
        simulated: true,
      };
      setEntries(prev => [newEntry, ...prev].slice(0, maxVisible));
      setNewestId(newEntry.id);
      setTimeout(() => setNewestId(null), 3000);
    }

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simulate, maxVisible]);

  if (entries.length === 0) {
    return (
      <div
        className="card flex flex-col items-center justify-center py-12 text-center"
      >
        <div
          className="w-8 h-8 rounded-lg mb-4 flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-subtle)' }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--border-strong)' }}
          />
        </div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Agents standing by
        </p>
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          Activity appears here once roles are active.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {entries.map((log, idx) => {
          const isNew = log.id === newestId;
          const color = AGENT_COLORS[log.agent_name];
          return (
            <div
              key={log.id}
              className="flex items-start gap-3 transition-colors duration-500"
              style={{
                padding: '10px 14px',
                backgroundColor: isNew ? `${color}09` : idx % 2 === 0 ? 'var(--bg-surface)' : 'transparent',
              }}
            >
              <div className="flex-shrink-0 mt-1">
                {isNew ? (
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-1.5 w-1.5"
                      style={{ backgroundColor: color }}
                    />
                  </span>
                ) : (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color, opacity: 0.7 }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color,
                      textTransform: 'capitalize',
                    }}
                  >
                    {log.agent_name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {log.action}
                  </span>
                </div>
                {log.detail && (
                  <p
                    className="truncate"
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      marginTop: '1px',
                      lineHeight: 1.4,
                    }}
                  >
                    {log.detail}
                  </p>
                )}
              </div>

              <span
                className="flex-shrink-0"
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                  paddingTop: '1px',
                }}
              >
                {formatTime(log.created_at)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
