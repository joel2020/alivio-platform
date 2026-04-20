import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Check, CreditCard, Link2, Trash2, Upload, Users } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/app/Toast';

type SettingsTab = 'general' | 'team' | 'integrations' | 'billing';
type TeamRoleUi = 'admin' | 'member';

type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'owner';
  created_at: string;
  is_active?: boolean;
};

type IntegrationKey = 'linkedin' | 'indeed' | 'bullhorn' | 'greenhouse' | 'ats-generic';

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: 'general', label: 'General' },
  { id: 'team', label: 'Team Members' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'billing', label: 'Billing' },
];

const INTEGRATIONS: Array<{ key: IntegrationKey; name: string; logo: string; description: string; connected: boolean }> = [
  { key: 'linkedin', name: 'LinkedIn', logo: 'in', description: 'Source and sync professional profiles for outbound recruiting.', connected: true },
  { key: 'indeed', name: 'Indeed', logo: 'id', description: 'Push roles to Indeed and ingest top candidate applicants.', connected: false },
  { key: 'bullhorn', name: 'Bullhorn', logo: 'bh', description: 'Two-way ATS sync for jobs, contacts, and stage updates.', connected: false },
  { key: 'greenhouse', name: 'Greenhouse', logo: 'gh', description: 'Sync openings and pipeline status from Greenhouse.', connected: false },
  { key: 'ats-generic', name: 'ATS Generic', logo: 'ats', description: 'Use our generic connector for custom ATS platforms.', connected: false },
];

export default function SettingsPage() {
  const { user, org } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [orgForm, setOrgForm] = useState({
    name: '',
    industry: '',
    location: '',
    logo_url: '',
  });
  const [orgSaving, setOrgSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRoleUi>('member');
  const [teamBusy, setTeamBusy] = useState(false);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<TeamMember | null>(null);

  const [integrationModal, setIntegrationModal] = useState<{ open: boolean; key: IntegrationKey | null }>({
    open: false,
    key: null,
  });
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistBusy, setWaitlistBusy] = useState(false);

  const [usage, setUsage] = useState({ candidatesUsed: 0, rolesActive: 0, callsThisMonth: 0 });

  const isOrgAdmin = user?.role === 'admin' || user?.role === 'owner';

  useEffect(() => {
    setOrgForm({
      name: org?.name ?? '',
      industry: org?.industry ?? '',
      location: org?.location ?? '',
      logo_url: org?.logo_url ?? '',
    });
  }, [org]);

  const showSaved = useCallback(() => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }, []);

  const loadMembers = useCallback(async () => {
    if (!org?.id) return;
    setMembersLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at, is_active')
      .eq('org_id', org.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      setToast(error.message || 'Unable to load team members right now.');
    } else {
      setMembers((data || []) as TeamMember[]);
    }
    setMembersLoading(false);
  }, [org?.id]);

  const loadUsage = useCallback(async () => {
    if (!org?.id) return;

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const [candidateRes, roleRes, callRes] = await Promise.all([
      supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('org_id', org.id),
      supabase.from('roles').select('id', { count: 'exact', head: true }).eq('org_id', org.id).eq('status', 'active'),
      supabase
        .from('voice_calls')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', org.id)
        .gte('created_at', monthStart.toISOString()),
    ]);

    setUsage({
      candidatesUsed: candidateRes.count ?? 0,
      rolesActive: roleRes.count ?? 0,
      callsThisMonth: callRes.count ?? 0,
    });
  }, [org?.id]);

  useEffect(() => {
    if (!org?.id) return;
    void loadUsage();
  }, [loadUsage, org?.id]);

  useEffect(() => {
    if (activeTab === 'team' && org?.id) {
      void loadMembers();
    }
  }, [activeTab, loadMembers, org?.id]);

  const activeIntegration = useMemo(
    () => INTEGRATIONS.find((item) => item.key === integrationModal.key) || null,
    [integrationModal.key],
  );

  async function saveGeneralSettings() {
    if (!org?.id) return;

    if (!isOrgAdmin) {
      setToast('Only organization admins can update organization settings.');
      return;
    }

    const previous = {
      name: org?.name ?? '',
      industry: org?.industry ?? '',
      location: org?.location ?? '',
      logo_url: org?.logo_url ?? '',
    };

    const optimistic = { ...orgForm };
    setOrgSaving(true);

    const { error } = await supabase
      .from('organizations')
      .update({
        name: optimistic.name.trim(),
        industry: optimistic.industry.trim(),
        location: optimistic.location.trim() || null,
        logo_url: optimistic.logo_url || null,
      })
      .eq('id', org.id);

    if (error) {
      setOrgForm(previous);
      setToast(error.message || 'Unable to save organization settings. Changes were rolled back.');
    } else {
      showSaved();
      setToast('Organization settings saved.');
    }

    setOrgSaving(false);
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !org?.id) return;

    if (!isOrgAdmin) {
      setToast('Only organization admins can upload a logo.');
      return;
    }

    setUploadingLogo(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const objectPath = `${org.id}/logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('org-assets')
      .upload(objectPath, file, { cacheControl: '3600', upsert: true, contentType: file.type || undefined });

    if (uploadError) {
      setToast(uploadError.message || 'Logo upload failed.');
      setUploadingLogo(false);
      return;
    }

    const { data } = supabase.storage.from('org-assets').getPublicUrl(objectPath);
    setOrgForm((current) => ({ ...current, logo_url: data.publicUrl }));
    setUploadingLogo(false);
    setToast('Logo uploaded. Save changes to persist.');
  }

  async function inviteMember() {
    if (!inviteEmail.trim()) {
      setToast('Please provide an email address to invite.');
      return;
    }

    if (!isOrgAdmin) {
      setToast('Only organization admins can invite members.');
      return;
    }

    setTeamBusy(true);
    const { error } = await supabase.functions.invoke('settings-team-members', {
      body: { action: 'invite', email: inviteEmail.trim(), role: inviteRole },
    });
    setTeamBusy(false);

    if (error) {
      setToast(error.message || 'Unable to invite member right now.');
      return;
    }

    setInviteEmail('');
    setInviteRole('member');
    setToast('Invite sent successfully.');
    await loadMembers();
  }

  async function updateMemberRole(memberId: string, nextRole: TeamRoleUi) {
    if (!isOrgAdmin) {
      setToast('Only organization admins can change roles.');
      return;
    }

    const prevMembers = [...members];
    setMembers((current) =>
      current.map((member) =>
        member.id === memberId
          ? { ...member, role: nextRole === 'admin' ? 'admin' : 'viewer' }
          : member,
      ),
    );

    const { error } = await supabase.functions.invoke('settings-team-members', {
      body: { action: 'update_role', memberId, role: nextRole },
    });

    if (error) {
      setMembers(prevMembers);
      setToast(error.message || 'Unable to update member role.');
    } else {
      setToast('Member role updated.');
    }
  }

  async function removeMember() {
    if (!confirmRemoveMember || !isOrgAdmin) return;

    const memberToRemove = confirmRemoveMember;
    const prevMembers = [...members];

    setMembers((current) => current.filter((member) => member.id !== memberToRemove.id));
    setConfirmRemoveMember(null);

    const { error } = await supabase.functions.invoke('settings-team-members', {
      body: { action: 'deactivate', memberId: memberToRemove.id },
    });

    if (error) {
      setMembers(prevMembers);
      setToast(error.message || 'Unable to remove member.');
    } else {
      setToast('Member deactivated successfully.');
    }
  }

  async function joinIntegrationWaitlist() {
    if (!org?.id || !user?.id || !integrationModal.key || !waitlistEmail.trim()) {
      setToast('Please provide your email to join the waitlist.');
      return;
    }

    if (!isOrgAdmin) {
      setToast('Only organization admins can submit integration requests.');
      return;
    }

    setWaitlistBusy(true);
    const { error } = await supabase.from('integration_waitlist').insert({
      org_id: org.id,
      requested_by: user.id,
      integration_key: integrationModal.key,
      email: waitlistEmail.trim().toLowerCase(),
    });
    setWaitlistBusy(false);

    if (error) {
      setToast(error.message || 'Unable to join waitlist at the moment.');
      return;
    }

    setIntegrationModal({ open: false, key: null });
    setWaitlistEmail('');
    setToast('Thanks! You were added to the integration waitlist.');
  }

  const formatRole = (role: TeamMember['role']): TeamRoleUi => (role === 'admin' || role === 'owner' ? 'admin' : 'member');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Settings</h1>
        {saved && (
          <div className="flex items-center gap-1.5 animate-fade-in" style={{ color: 'var(--success)' }}>
            <Check size={13} strokeWidth={2.5} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Saved</span>
          </div>
        )}
      </div>

      <div className="page-content max-w-6xl">
        <div className="card p-2 mb-4 flex items-center gap-1.5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className="px-3 py-1.5 rounded-md text-xs font-medium"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--accent-subtle)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <div className="card p-6 max-w-3xl">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                <Building2 size={14} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Organization Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Organization name</label>
                <input value={orgForm.name} onChange={(e) => setOrgForm((current) => ({ ...current, name: e.target.value }))} className="input-base w-full" style={{ padding: '8px 12px' }} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Industry</label>
                  <input value={orgForm.industry} onChange={(e) => setOrgForm((current) => ({ ...current, industry: e.target.value }))} className="input-base w-full" style={{ padding: '8px 12px' }} />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Location</label>
                  <input value={orgForm.location} onChange={(e) => setOrgForm((current) => ({ ...current, location: e.target.value }))} className="input-base w-full" style={{ padding: '8px 12px' }} />
                </div>
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Organization logo</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
                    {orgForm.logo_url ? <img src={orgForm.logo_url} alt="Organization logo" className="w-full h-full object-cover" /> : <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No logo</span>}
                  </div>
                  <label className="btn-secondary" style={{ fontSize: '0.75rem', cursor: uploadingLogo ? 'not-allowed' : 'pointer' }}>
                    <Upload size={13} className="mr-1" />
                    {uploadingLogo ? 'Uploading...' : 'Upload logo'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>

              <div className="pt-1">
                <button onClick={saveGeneralSettings} className="btn-primary" disabled={orgSaving}>{orgSaving ? 'Saving...' : 'Save changes'}</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="card p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                <Users size={14} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Team Members</h2>
            </div>

            <div className="card p-4 mb-4" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Invite by email</label>
                  <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="input-base w-full" placeholder="teammate@hospital.org" style={{ padding: '8px 12px' }} />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Role</label>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as TeamRoleUi)} className="input-base w-full" style={{ padding: '8px 12px' }}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <button className="btn-primary" onClick={inviteMember} disabled={teamBusy}>{teamBusy ? 'Sending invite...' : 'Invite member'}</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left py-2 pr-3" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Name</th>
                    <th className="text-left py-2 pr-3" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Email</th>
                    <th className="text-left py-2 pr-3" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Role</th>
                    <th className="text-left py-2 pr-3" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Joined</th>
                    <th className="text-left py-2" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {membersLoading && (
                    <tr>
                      <td colSpan={5} className="py-4" style={{ color: 'var(--text-secondary)' }}>Loading team members...</td>
                    </tr>
                  )}
                  {!membersLoading && members.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4" style={{ color: 'var(--text-secondary)' }}>No active team members found.</td>
                    </tr>
                  )}
                  {!membersLoading && members.map((member) => (
                    <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2.5 pr-3" style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{member.full_name}</td>
                      <td className="py-2.5 pr-3" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{member.email}</td>
                      <td className="py-2.5 pr-3">
                        <select className="input-base" style={{ padding: '6px 10px', minWidth: 115 }} value={formatRole(member.role)} onChange={(e) => updateMemberRole(member.id, e.target.value as TeamRoleUi)} disabled={!isOrgAdmin || member.id === user?.id}>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-2.5 pr-3" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-2.5">
                        <button className="btn-secondary" style={{ fontSize: '0.72rem' }} onClick={() => setConfirmRemoveMember(member)} disabled={!isOrgAdmin || member.id === user?.id}>
                          <Trash2 size={12} className="mr-1" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {INTEGRATIONS.map((integration) => (
                <div key={integration.key} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 700 }}>{integration.logo}</div>
                    {integration.connected ? (
                      <span className="badge badge-success">Connected</span>
                    ) : (
                      <button className="btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => {
                        setIntegrationModal({ open: true, key: integration.key });
                        setWaitlistEmail(user?.email || '');
                      }}>
                        Connect
                      </button>
                    )}
                  </div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{integration.name}</h3>
                  <p style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{integration.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4 max-w-4xl">
            <div className="card p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                  <CreditCard size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Current Plan</h2>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Growth</p>
                    <span className="badge badge-success">Current plan</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starter / Growth / Enterprise options available</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href="mailto:billing@alivio.ai?subject=Upgrade%20Plan" className="btn-primary" style={{ fontSize: '0.75rem' }}>Upgrade Plan</a>
                  <a href="mailto:billing@alivio.ai?subject=Manage%20Billing" className="btn-secondary" style={{ fontSize: '0.75rem' }}>Manage Billing</a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-5">
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Candidates used</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>{usage.candidatesUsed}</p>
              </div>
              <div className="card p-5">
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Roles active</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>{usage.rolesActive}</p>
              </div>
              <div className="card p-5">
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Calls this month</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>{usage.callsThisMonth}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmRemoveMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="card p-5" style={{ maxWidth: 420, width: '100%' }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 8 }}>Remove team member?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
              {`Are you sure you want to deactivate ${confirmRemoveMember.full_name}? They will lose access to this organization.`}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button className="btn-secondary" onClick={() => setConfirmRemoveMember(null)}>Cancel</button>
              <button className="btn-primary" onClick={removeMember}>Deactivate member</button>
            </div>
          </div>
        </div>
      )}

      {integrationModal.open && activeIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="card p-5" style={{ maxWidth: 460, width: '100%' }}>
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={14} style={{ color: 'var(--accent)' }} />
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Coming Soon — Join the waitlist</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 14 }}>
              {`We'll notify you when the ${activeIntegration.name} integration is ready.`}
            </p>
            <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Notification email</label>
            <input className="input-base w-full" style={{ padding: '8px 12px' }} value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button className="btn-secondary" onClick={() => setIntegrationModal({ open: false, key: null })}>Cancel</button>
              <button className="btn-primary" onClick={joinIntegrationWaitlist} disabled={waitlistBusy}>{waitlistBusy ? 'Submitting...' : 'Join waitlist'}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} duration={4000} />}
    </div>
  );
}
