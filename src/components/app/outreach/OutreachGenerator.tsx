import { useState, useCallback } from 'react';
import { Copy, RefreshCw, Wand2, Check } from 'lucide-react';
import type { FakeCandidate, Channel, Tone, GeneratedMessage } from './messageTemplates';
import { generateMessage, getNextTone } from './messageTemplates';
import type { Role } from '../../../lib/types';

interface OutreachGeneratorProps {
  candidate: FakeCandidate;
  role: Role;
  senderName: string;
  onMessageGenerated: (msg: {
    candidateName: string;
    roleTitle: string;
    channel: Channel;
    tone: Tone;
    message: GeneratedMessage;
  }) => void;
}

const CHANNELS: Channel[] = ['Email', 'LinkedIn', 'InMail'];
const TONES: Tone[] = ['Professional', 'Conversational', 'Casual'];

function PillToggle<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: T[];
  selected: T;
  onChange: (val: T) => void;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: '4px',
        padding: '3px',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: '10px',
      }}
    >
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: active ? 600 : 500,
              backgroundColor: active ? 'var(--accent)' : 'transparent',
              color: active ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function OutreachGenerator({
  candidate,
  role,
  senderName,
  onMessageGenerated,
}: OutreachGeneratorProps) {
  const [channel, setChannel] = useState<Channel>('Email');
  const [tone, setTone] = useState<Tone>('Professional');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<GeneratedMessage | null>(null);
  const [variationIndex, setVariationIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(
    async (ch: Channel, tn: Tone, varIdx: number) => {
      setLoading(true);
      setMessage(null);
      await new Promise((r) => setTimeout(r, 1800));
      const msg = generateMessage(
        candidate,
        role.title,
        role.description,
        ch,
        tn,
        senderName,
        varIdx
      );
      setMessage(msg);
      setLoading(false);
      onMessageGenerated({
        candidateName: candidate.name,
        roleTitle: role.title,
        channel: ch,
        tone: tn,
        message: msg,
      });
    },
    [candidate, role, senderName, onMessageGenerated]
  );

  async function handleGenerate() {
    setVariationIndex(0);
    await generate(channel, tone, 0);
  }

  async function handleRegenerate() {
    const nextIdx = variationIndex + 1;
    setVariationIndex(nextIdx);
    await generate(channel, tone, nextIdx);
  }

  async function handleDifferentTone() {
    const nextTone = getNextTone(tone);
    setTone(nextTone);
    setVariationIndex(0);
    await generate(channel, nextTone, 0);
  }

  async function handleCopy() {
    if (!message) return;
    const text = message.subject
      ? `Subject: ${message.subject}\n\n${message.body}`
      : message.body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silent fail
    }
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '20px',
          letterSpacing: '-0.01em',
        }}
      >
        Generate Outreach
      </h2>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Channel
          </span>
          <PillToggle options={CHANNELS} selected={channel} onChange={setChannel} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Tone
          </span>
          <PillToggle options={TONES} selected={tone} onChange={setTone} />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          height: '44px',
          backgroundColor: loading ? 'var(--accent)' : 'var(--accent)',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 600,
          border: 'none',
          borderRadius: '10px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.75 : 1,
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          marginBottom: '24px',
        }}
        onMouseEnter={(e) => {
          if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)';
        }}
      >
        <Wand2 size={15} strokeWidth={2} />
        Generate Message
      </button>

      {loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '20px 24px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  animation: 'bounce 1.2s infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Generating personalized outreach...
          </span>
        </div>
      )}

      {message && !loading && (
        <div>
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '12px',
            }}
          >
            {message.subject && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Subject:
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    lineHeight: 1.4,
                  }}
                >
                  {message.subject}
                </span>
              </div>
            )}
            <pre
              style={{
                fontSize: '15px',
                fontWeight: 400,
                color: 'var(--text-primary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                fontFamily: 'Inter, sans-serif',
                margin: 0,
              }}
            >
              {message.body}
            </pre>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 14px',
                backgroundColor: 'transparent',
                color: copied ? 'var(--success)' : 'var(--accent)',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-subtle)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>

            <button
              onClick={handleRegenerate}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 14px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-subtle)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              <RefreshCw size={13} strokeWidth={2} />
              Regenerate
            </button>

            <button
              onClick={handleDifferentTone}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 14px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-subtle)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              <Wand2 size={13} strokeWidth={2} />
              Try Different Tone
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
