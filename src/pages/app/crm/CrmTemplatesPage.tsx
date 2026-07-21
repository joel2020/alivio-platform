import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import type { OutreachTemplate } from '../../../lib/types';
import Toast from '../../../components/app/Toast';
import { canAccessCrm } from './crmShared';

const SAMPLE = { contact_name: 'Jordan Lee', hospital_name: 'North Star Medical Center' };

export default function CrmTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user?.org_id || !canAccessCrm(user.role)) return;
    supabase.from('outreach_templates').select('*').eq('org_id', user.org_id).order('sequence_step', { ascending: true }).then(({ data }) => setTemplates((data || []) as OutreachTemplate[]));
  }, [user?.org_id, user?.role]);

  async function updateTemplate(template: OutreachTemplate) {
    const { error } = await supabase.from('outreach_templates').update({ name: template.name, subject: template.subject, body: template.body }).eq('id', template.id);
    setToast(error ? `Save failed: ${error.message}` : 'Template saved.');
  }

  async function addTemplate() {
    if (!user?.org_id) return;
    setCreating(true);
    const nextStep = templates.reduce((max, item) => Math.max(max, item.sequence_step ?? 0), 0) + 1;
    const { data, error } = await supabase
      .from('outreach_templates')
      .insert({
        org_id: user.org_id,
        name: `New template (step ${nextStep})`,
        subject: 'Quick question, {{contact_name}}',
        body: 'Hi {{contact_name}},\n\nWrite your message here.\n\nBest,\nAlivio Search Partners',
        sequence_step: nextStep,
      })
      .select('*')
      .single();
    setCreating(false);
    if (error) {
      setToast(`Could not create template: ${error.message}`);
      return;
    }
    setTemplates((prev) => [...prev, data as OutreachTemplate]);
    setToast('Template created.');
  }

  async function deleteTemplate(templateId: string) {
    const { error } = await supabase.from('outreach_templates').delete().eq('id', templateId);
    if (error) {
      setToast(`Delete failed: ${error.message}`);
      return;
    }
    setTemplates((prev) => prev.filter((item) => item.id !== templateId));
    setToast('Template deleted.');
  }

  function preview(text: string) {
    return text.replace(/{{contact_name}}/g, SAMPLE.contact_name).replace(/{{hospital_name}}/g, SAMPLE.hospital_name);
  }

  if (!canAccessCrm(user?.role)) return <div className="min-h-screen p-8">CRM templates are available only to admin/owner accounts.</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>CRM Templates</h1>
        <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }} onClick={() => void addTemplate()} disabled={creating}>
          <Plus size={14} /> {creating ? 'Creating…' : 'New template'}
        </button>
      </div>
      <div style={{ padding: 24, display: 'grid', gap: 12 }}>
        {templates.map((template, index) => (
          <div key={template.id} className="card p-4" style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontWeight: 700 }}>Sequence step {template.sequence_step}</p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-ghost" style={{ height: 32, padding: '0 12px' }} onClick={() => updateTemplate(template)}>Save</button>
                <button className="btn-ghost" style={{ height: 32, padding: '0 10px', color: 'var(--error)' }} aria-label="Delete template" onClick={() => void deleteTemplate(template.id)}><Trash2 size={14} /></button>
              </div>
            </div>
            <input value={template.name} onChange={(e) => setTemplates((prev) => prev.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} style={{ height: 36, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px' }} />
            <input value={template.subject} onChange={(e) => setTemplates((prev) => prev.map((item, i) => i === index ? { ...item, subject: e.target.value } : item))} style={{ height: 36, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px' }} />
            <textarea rows={6} value={template.body} onChange={(e) => setTemplates((prev) => prev.map((item, i) => i === index ? { ...item, body: e.target.value } : item))} style={{ borderRadius: 8, border: '1px solid var(--border)', padding: 10 }} />
            <div style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: 10, whiteSpace: 'pre-wrap', fontSize: 13, color: 'var(--text-secondary)' }}>{preview(template.subject)}{"\n\n"}{preview(template.body)}</div>
          </div>
        ))}
        {templates.length === 0 ? (
          <div className="card p-6 text-center">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No templates yet. Create your first outreach template to power sequences.</p>
          </div>
        ) : null}
      </div>
      {toast ? <Toast message={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  );
}
