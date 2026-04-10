import { useState } from 'react';
import { Copy, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { Channel, Tone, GeneratedMessage } from './messageTemplates';

export interface OutreachRecord {
  id: string;
  candidateName: string;
  roleTitle: string;
  channel: Channel;
  tone: Tone;
  message: GeneratedMessage;
  generatedAt: Date;
}

interface OutreachHistoryProps {
  records: OutreachRecord[];
}

const CHANNEL_COLORS: Record<Channel, { bg: string; text: string }> = {
  Email: { bg: '#EFF6FF', text: '#2563EB' },
  LinkedIn: { bg: '#EFF6FF', text: '#0A66C2' },
  InMail: { bg: '#F0FDF4', text: '#059669' },
};

const TONE_COLORS: Record<Tone, { bg: string; text: string }> = {
  Professional: { bg: '#F4F4F5', text: '#71717A' },
  Conversational: { bg: '#FFFBEB', text: '#D97706' },
  Casual: { bg: '#FEF2F2', text: '#DC2626' },
};

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function HistoryItem({ record }: { record: OutreachRecord }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = record.message.subject
      ? `Subject: ${record.message.subject}\n\n${record.message.body}`
      : record.message.body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  }

  const chColor = CHANNEL_COLORS[record.channel];
  const toneColor = TONE_COLORS[record.tone];

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        paddingTop: '14px',
        paddingBottom: '14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '180px' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {record.candidateName}
          </span>
          <span
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginLeft: '8px',
            }}
          >
            — {record.roleTitle}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '5px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: chColor.bg,
              color: chColor.text,
            }}
          >
            {record.channel}
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '5px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: toneColor.bg,
              color: toneColor.text,
            }}
          >
            {record.tone}
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginLeft: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            {formatRelativeTime(record.generatedAt)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '30px',
              padding: '0 10px',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#E4E4E7';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-subtle)';
            }}
          >
            {expanded ? <ChevronUp size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}
            {expanded ? 'Hide' : 'View'}
          </button>

          <button
            onClick={handleCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '30px',
              padding: '0 10px',
              backgroundColor: copied ? 'var(--success-subtle)' : 'transparent',
              color: copied ? 'var(--success)' : 'var(--accent)',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!copied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-subtle)';
            }}
            onMouseLeave={(e) => {
              if (!copied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
          >
            {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={2} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: '12px',
            padding: '16px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        >
          {record.message.subject && (
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}
              >
                Subject:
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {record.message.subject}
              </span>
            </div>
          )}
          <pre
            style={{
              fontSize: '13px',
              color: 'var(--text-primary)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              fontFamily: 'Inter, sans-serif',
              margin: 0,
            }}
          >
            {record.message.body}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function OutreachHistory({ records }: OutreachHistoryProps) {
  const recent = records.slice(0, 5);

  return (
    <div>
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '4px',
          letterSpacing: '-0.01em',
        }}
      >
        Recent Outreach
      </h2>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginBottom: '20px',
        }}
      >
        Messages generated this session
      </p>

      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '0 20px',
          overflow: 'hidden',
        }}
      >
        {recent.length === 0 ? (
          <div
            style={{
              padding: '40px 0',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: '4px',
              }}
            >
              No outreach generated yet.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Select a candidate above to get started.
            </p>
          </div>
        ) : (
          recent.map((record) => <HistoryItem key={record.id} record={record} />)
        )}
      </div>
    </div>
  );
}
