import type { ClientStatus } from '../../../lib/types';

export const CRM_STATUS_COLUMNS: Array<{ status: ClientStatus; label: string }> = [
  { status: 'prospect', label: 'Prospect' },
  { status: 'contacted', label: 'Contacted' },
  { status: 'meeting_scheduled', label: 'Meeting' },
  { status: 'proposal_sent', label: 'Proposal' },
  { status: 'active_client', label: 'Active' },
];

export const ALL_CRM_STATUSES: Array<{ status: ClientStatus; label: string }> = [
  ...CRM_STATUS_COLUMNS,
  { status: 'closed_lost', label: 'Closed Lost' },
];

export const canAccessCrm = (role?: string | null) => role === 'admin' || role === 'owner';
