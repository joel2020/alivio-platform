import { useState, useCallback } from 'react';
import { Copy, RefreshCw, Wand2, Check, Loader2, Send } from 'lucide-react';
import type { Channel, Tone, GeneratedMessage } from './messageTemplates';
import { getNextTone } from './messageTemplates';
import type { Role } from '../../../lib/types';
import { generateOutreachEmail, type OutreachTone } from '../../../lib/ai';
import Toast from '../Toast';

interface OutreachCandidate {
  id: string;
  name: string;
  title?: string | null;
  company?: string | null;
  experience: number;
  skills: string[];
}

interface OutreachGeneratorProps {
  candidate: OutreachCandidate;
  role: Role;
  senderName: string;
  onSend: (payload: {
    candidateName: string;
    roleTitle: string;
    channel: Channel;
    tone: Tone;
    message: GeneratedMessage;
  }) => Promise<void>;
  onGenerated?: (payload: { tone: Tone; channel: Channel; subject: string }) => Promise<void> | void;
}

const CHANNELS: Channel[] = ['Email', 'LinkedIn', 'InMail'];
const TONES: Tone[] = ['Professional', 'Conversational', 'Casual'];

function toOutreachTone(tone: Tone): OutreachTone {
  if (tone === 'Professional') return 'professional';
  if (tone === 'Conversational') return 'conversational';
  return 'direct';
}

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
    <div style={{ display: 'inline-flex', gap: '4px', padding: '3px', backgroundColor: 'var(--bg-subtle)', borderRadius: '10px' }}>
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
  onSend,
  onGenerated,
}: OutreachGeneratorProps) {
  const [channel, setChannel] = useState<Channel>('Email');
  const [tone, setTone] = useState<Tone>('Professional');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<GeneratedMessage | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const generate = useCallback(
    async (tn: Tone) => {
      setLoading(true);
      setMessage(null);
      try {
        const aiResult = await generateOutreachEmail(
          {
            id: candidate.id,
            name: candidate.name,
            experienceYears: candidate.experience,
            skills: candidate.skills,
            notes: `${candidate.title || 'Candidate'} at ${candidate.company || 'Unknown org'}`,
          },
          `${role.title}${role.description ? ` - ${role.description}` : ''}`,
          toOutreachTone(tn),
        );

        setMessage({
          subject: aiResult.data.subject,
          body: aiResult.data.body,
        });
        await onGenerated?.({ tone: tn, channel, subject: aiResult.data.subject });
      } catch (error) {
        console.error('Failed to generate outreach', error);
        setToast('Unable to generate outreach right now. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [candidate, role, onGenerated, channel],
  );

  async function handleGenerate() {
    await generate(tone);
  }

  async function handleRegenerate() {
    await generate(tone);
  }

  async function handleDifferentTone() {
    const nextTone = getNextTone(tone);
    setTone(nextTone);
    await generate(nextTone);
  }

  async function handleCopy() {
    if (!message) return;
    const text = message.subject ? `Subject: ${message.subject}\n\n${message.body}` : message.body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast('Clipboard not available in this browser.');
    }
  }

  async function handleSend() {
    if (!message) return;
    setSending(true);
    try {
      await onSend({
        candidateName: candidate.name,
        roleTitle: role.title,
        channel,
        tone,
        message,
      });
      setToast('Outreach sent and logged.');
    } catch (error) {
      console.error(error);
      setToast('Unable to send outreach email.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', letterSpacing: '-0.01em' }}>
        Generate Outreach
      </h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Channel</span>
          <PillToggle options={CHANNELS} selected={channel} onChange={setChannel} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tone</span>
          <PillToggle options={TONES} selected={tone} onChange={setTone} />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', height: '44px', backgroundColor: 'var(--accent)', color: '#ffffff', fontSize: '14px', fontWeight: 600, border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1, marginBottom: '10px' }}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} strokeWidth={2} />}
        {loading ? 'Generating...' : 'Generate Outreach'}
      </button>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '24px' }}>Powered by AI</p>

      {message && !loading && (
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-surface)' }}>
          {message.subject && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Subject</p>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>{message.subject}</p>
            </div>
          )}
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'Inter, sans-serif', color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '14px' }}>
            {message.body}\n\n— {senderName}
          </pre>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button onClick={handleRegenerate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 600 }}>
              <RefreshCw size={14} /> Regenerate
            </button>
            <button onClick={handleDifferentTone} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 600 }}>
              <Wand2 size={14} /> Try Different Tone
            </button>
            <button onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)', background: copied ? 'var(--success-subtle)' : 'var(--bg-surface)', color: copied ? 'var(--success)' : 'var(--text-secondary)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 600 }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleSend} disabled={sending} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 700, opacity: sending ? 0.7 : 1 }}>
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>Preview generated by AI before sending.</p>
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
