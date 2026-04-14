import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import type { OutreachTemplate } from '../../../lib/types';
import { canAccessCrm } from './crmShared';

const SAMPLE = { contact_name: 'Jordan Lee', hospital_name: 'North Star Medical Center' };

export default function CrmTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);

  useEffect(() => {
    if (!user?.org_id || !canAccessCrm(user.role)) return;
    supabase.from('outreach_templates').select('*').eq('org_id', user.org_id).order('sequence_step', { ascending: true }).then(({ data }) => setTemplates((data || []) as OutreachTemplate[]));
  }, [user?.org_id, user?.role]);

  async function updateTemplate(template: OutreachTemplate) {
    await supabase.from('outreach_templates').update({ name: template.name, subject: template.subject, body: template.body }).eq('id', template.id);
  }

  function preview(text: string) {
    return text.replace(/{{contact_name}}/g, SAMPLE.contact_name).replace(/{{hospital_name}}/g, SAMPLE.hospital_name);
  }

  if (!canAccessCrm(user?.role)) return <div className="min-h-screen p-8">CRM templates are available only to admin/owner accounts.</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header"><h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>CRM Templates</h1></div>
      <div style={{ padding: 24, display: 'grid', gap: 12 }}>
        {templates.map((template, index) => (
          <div key={template.id} className="card p-4" style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontWeight: 700 }}>Sequence step {template.sequence_step}</p>
              <button className="btn-ghost" style={{ height: 32, padding: '0 12px' }} onClick={() => updateTemplate(template)}>Save</button>
            </div>
            <input value={template.name} onChange={(e) => setTemplates((prev) => prev.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} style={{ height: 36, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px' }} />
            <input value={template.subject} onChange={(e) => setTemplates((prev) => prev.map((item, i) => i === index ? { ...item, subject: e.target.value } : item))} style={{ height: 36, borderRadius: 8, border: '1px solid var(--border)', padding: '0 10px' }} />
            <textarea rows={6} value={template.body} onChange={(e) => setTemplates((prev) => prev.map((item, i) => i === index ? { ...item, body: e.target.value } : item))} style={{ borderRadius: 8, border: '1px solid var(--border)', padding: 10 }} />
            <div style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: 10, whiteSpace: 'pre-wrap', fontSize: 13, color: 'var(--text-secondary)' }}>{preview(template.subject)}{"\n\n"}{preview(template.body)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
