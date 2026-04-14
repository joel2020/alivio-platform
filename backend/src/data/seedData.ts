import { Candidate, Client, Job } from '../models/types';

const states = ['NY', 'NJ', 'PA', 'FL', 'TX'];
const titles = [
  'Director of Nursing',
  'MDS Coordinator',
  'Nurse Manager',
  'Assistant Director of Nursing',
  'Regional Clinical Director',
  'Infection Preventionist'
];
const specialties = ['Long-Term Care', 'Skilled Nursing', 'Rehab', 'Memory Care', 'Hospice'];
const settings = ['SNF', 'LTC', 'Post-Acute', 'Home Health'];
const licenses = ['RN', 'BSN', 'MSN', 'NHA', 'LPN'];

const firstNames = ['Avery', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Drew', 'Parker', 'Skyler', 'Jamie'];
const lastNames = ['Bennett', 'Rivera', 'Patel', 'Collins', 'Nguyen', 'Brooks', 'Watson', 'Diaz', 'Khan', 'Foster'];

export const clients: Client[] = Array.from({ length: 10 }, (_, i) => ({
  id: `client-${i + 1}`,
  name: `Alivio Partner Health Group ${i + 1}`,
  headquarters: `${states[i % states.length]}, USA`,
  facilities: [`${states[i % states.length]} SNF Network`, `${states[(i + 1) % states.length]} Post-Acute Center`],
  preferredRoles: [titles[i % titles.length], titles[(i + 2) % titles.length]],
  notes: 'Prefers fast turnaround and leadership-ready candidates.'
}));

export const candidates: Candidate[] = Array.from({ length: 40 }, (_, i) => {
  const state = states[i % states.length];
  const title = titles[i % titles.length];
  const specialty = specialties[i % specialties.length];
  const setting = settings[i % settings.length];
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[(i * 3) % lastNames.length];

  return {
    id: `cand-${i + 1}`,
    fullName: `${fn} ${ln}`,
    title,
    location: `${['New York', 'Newark', 'Philadelphia', 'Miami', 'Dallas'][i % 5]}, ${state}`,
    licenses: [licenses[i % licenses.length], 'RN'].filter((v, idx, arr) => arr.indexOf(v) === idx),
    specialties: [specialty, specialties[(i + 2) % specialties.length]],
    yearsExperience: 4 + (i % 16),
    careSettings: [setting, settings[(i + 1) % settings.length]],
    leadershipExperience: i % 3 !== 0,
    summary: `${title} with deep ${specialty} operations background across multi-site teams.`,
    recentEmployers: [`Care Network ${(i % 6) + 1}`, `Health System ${(i % 8) + 1}`],
    preferredStates: [state, states[(i + 1) % states.length]],
    compensationRange: { min: 90000 + i * 1500, max: 120000 + i * 2000, currency: 'USD' },
    status: i % 9 === 0 ? 'passive' : 'active',
    email: i % 7 === 0 ? undefined : `${fn.toLowerCase()}.${ln.toLowerCase()}${i + 1}@example.com`,
    phone: i % 8 === 0 ? undefined : `+1-555-010-${String(i + 1).padStart(4, '0')}`,
    source: i % 2 === 0 ? 'Internal CRM' : 'Professional Network',
    sourceUrl: `https://talent.example.com/candidates/${i + 1}`,
    lastSeenAt: new Date(Date.now() - i * 86400000).toISOString(),
    completenessScore: 0
  };
});

export const jobs: Job[] = Array.from({ length: 20 }, (_, i) => {
  const state = states[i % states.length];
  const title = titles[i % titles.length];
  const client = clients[i % clients.length];

  return {
    id: `job-${i + 1}`,
    title,
    client: client.name,
    location: `${['Albany', 'Jersey City', 'Pittsburgh', 'Orlando', 'Houston'][i % 5]}, ${state}`,
    salaryRange: { min: 95000 + i * 2500, max: 140000 + i * 3000, currency: 'USD' },
    setting: settings[i % settings.length],
    requiredLicenses: ['RN', licenses[i % licenses.length]].filter((v, idx, arr) => arr.indexOf(v) === idx),
    requiredExperience: 5 + (i % 10),
    mustHaveKeywords: [specialties[i % specialties.length], 'leadership', settings[i % settings.length]],
    description: `${title} needed for ${client.name} to lead quality outcomes and compliance programs.`,
    priority: i % 4 === 0 ? 'critical' : i % 3 === 0 ? 'high' : 'medium',
    status: 'open'
  };
});
