export type Channel = 'Email' | 'LinkedIn' | 'InMail';
export type Tone = 'Professional' | 'Conversational' | 'Casual';

export interface FakeCandidate {
  id: string;
  name: string;
  score: number;
  skills: string[];
  experience: number;
  title: string;
  company: string;
  email?: string;
}

export interface GeneratedMessage {
  subject?: string;
  body: string;
}

export const FAKE_CANDIDATES: FakeCandidate[] = [
  {
    id: 'c1',
    name: 'Maria Santos',
    score: 96,
    skills: ['ICU', 'Critical Care', 'ACLS', 'BLS', 'Epic EMR'],
    experience: 10,
    title: 'ICU RN, BSN',
    company: 'Northwestern Memorial Hospital',
    email: 'm.santos@email.com',
  },
  {
    id: 'c2',
    name: 'James Mitchell',
    score: 94,
    skills: ['Family Practice', 'Primary Care', 'EHR Systems', 'Patient Assessment', 'Chronic Disease Management'],
    experience: 8,
    title: 'FNP-C',
    company: 'Chicago Health Partners',
    email: 'j.mitchell@email.com',
  },
  {
    id: 'c3',
    name: 'Angela Washington',
    score: 91,
    skills: ['Nurse Management', 'Staff Scheduling', 'Quality Improvement', 'Joint Commission Compliance', 'Budgeting'],
    experience: 12,
    title: 'Nurse Manager',
    company: 'Advocate Aurora Health',
    email: 'a.washington@email.com',
  },
  {
    id: 'c4',
    name: 'Dr. Robert Kim',
    score: 89,
    skills: ['Internal Medicine', 'Hospital Medicine', 'EMR', 'Patient Safety', 'Clinical Leadership'],
    experience: 15,
    title: 'Internal Medicine Physician',
    company: 'Rush University Medical Center',
    email: 'r.kim@email.com',
  },
  {
    id: 'c5',
    name: 'Patricia Hernandez',
    score: 87,
    skills: ['Acute Care', 'Nurse Practitioner', 'Ventilator Management', 'Central Line Insertion', 'ICU Protocols'],
    experience: 9,
    title: 'Acute Care NP, DNP',
    company: 'Regional Medical Center',
  },
  {
    id: 'c6',
    name: 'David Thompson',
    score: 85,
    skills: ['Emergency Department', 'Triage', 'Trauma', 'BLS', 'PALS'],
    experience: 6,
    title: 'Emergency RN, BSN',
    company: 'Level I Trauma Center',
  },
  {
    id: 'c7',
    name: 'Rachel Foster',
    score: 82,
    skills: ['Labor & Delivery', 'Postpartum', 'Fetal Monitoring', 'Neonatal Resuscitation', 'Patient Education'],
    experience: 7,
    title: 'Labor & Delivery RN',
    company: "Women's & Children's Hospital",
  },
  {
    id: 'c8',
    name: 'Michael Chen',
    score: 79,
    skills: ['Orthopedics', 'Surgical Assist', 'Casting/Splinting', 'Post-Op Care', 'Sports Medicine'],
    experience: 5,
    title: 'PA-C, Orthopedics',
    company: 'Sports Medicine & Orthopedics Group',
  },
  {
    id: 'c9',
    name: 'Sandra Williams',
    score: 76,
    skills: ['Cardiac ICU', 'Hemodynamic Monitoring', 'IABP', 'CRRT', 'Code Blue Response'],
    experience: 8,
    title: 'Cardiac ICU RN, CCRN',
    company: 'Cardiac Care Institute',
  },
  {
    id: 'c10',
    name: 'Dr. Lisa Park',
    score: 73,
    skills: ['Family Medicine', 'Outpatient Care', 'Preventive Medicine', 'Telemedicine', 'EHR Documentation'],
    experience: 11,
    title: 'Family Medicine Physician, DO',
    company: 'Family Practice Associates',
  },
];

function topSkills(skills: string[], count = 3): string {
  return skills.slice(0, count).join(', ');
}

function firstName(name: string): string {
  return name.split(' ').find(p => !p.startsWith('Dr.')) || name.split(' ')[0];
}

const EMAIL_PROFESSIONAL: Array<(c: FakeCandidate, role: string, desc: string, sender: string) => GeneratedMessage> = [
  (c, role, desc, sender) => ({
    subject: `${role} opportunity — your clinical background stood out`,
    body: `Hi ${firstName(c.name)},

I came across your background in ${topSkills(c.skills)} and was impressed by your ${c.experience} years of clinical experience${c.company ? `, particularly your work at ${c.company}` : ''}.

We're working with a healthcare organization looking for a ${role}${desc ? ` — ${desc}` : ''}. Based on your credentials and experience level, I believe there could be a strong fit worth exploring.

Would you be open to a brief conversation this week? I'd be happy to share more about the team, patient population, and growth opportunities before you commit any time.

Best regards,
${sender}`,
  }),
  (c, role, _desc, sender) => ({
    subject: `${topSkills(c.skills, 1)} background — ${role} opportunity`,
    body: `Hi ${firstName(c.name)},

Your clinical trajectory — ${c.experience} years in ${topSkills(c.skills, 2)}${c.company ? `, most recently at ${c.company}` : ''} — maps closely to what we're seeking in a ${role}.

We're specifically looking for candidates with depth in ${topSkills(c.skills, 2)}, which is clearly a core part of your practice. This role offers meaningful clinical leadership and the opportunity to directly shape patient outcomes.

I'd welcome the chance to share more details if you're open to a brief introductory call.

Best regards,
${sender}`,
  }),
];

const EMAIL_CONVERSATIONAL: Array<(c: FakeCandidate, role: string, desc: string, sender: string) => GeneratedMessage> = [
  (c, role, _desc, sender) => ({
    subject: `Quick question for you, ${firstName(c.name)}`,
    body: `Hey ${firstName(c.name)},

Hope you're doing well. I came across your profile while sourcing for a ${role} and your background in ${topSkills(c.skills)} really caught my attention.

${c.experience} years of clinical experience${c.company ? `, including your time at ${c.company}` : ''} — that's exactly the kind of profile we're looking for. The organization is doing great work and we're at a point where the clinicians we bring in will have real impact.

Would you be up for a quick 20-minute conversation to see if it's worth exploring further? No commitment, just a call.

${sender}`,
  }),
  (c, role, _desc, sender) => ({
    subject: `Your ${topSkills(c.skills, 1)} experience — have something relevant`,
    body: `Hey ${firstName(c.name)},

I know you probably get a lot of outreach, so I'll keep this brief.

We're hiring for a ${role} and your experience with ${topSkills(c.skills, 2)}${c.company ? ` at ${c.company}` : ''} is genuinely relevant — not just a keyword match. Your clinical background aligns with what the team is looking for.

If you're at all open to hearing more, I'd love to set up a casual conversation. If the timing isn't right, no worries at all.

${sender}`,
  }),
];

const EMAIL_CASUAL: Array<(c: FakeCandidate, role: string, _desc: string, sender: string) => GeneratedMessage> = [
  (c, role, _desc, sender) => ({
    subject: `${role} — think you'd be a great fit`,
    body: `Hi ${firstName(c.name)}!

Saw your experience with ${topSkills(c.skills)} — impressive clinical background. We're looking for a ${role} and your ${c.experience} years${c.company ? ` at places like ${c.company}` : ''} is exactly what we're after.

The team is strong, the patient population is interesting, and there's real room to make an impact. Worth a chat?

${sender}`,
  }),
  (c, role, _desc, sender) => ({
    subject: `You + ${role} — looks like a match`,
    body: `Hi ${firstName(c.name)}!

Quick note — we're hiring a ${role} and your ${topSkills(c.skills, 2)} background caught our eye. ${c.experience} years of clinical experience is no small thing.

Would love to tell you more about the opportunity. Want to grab 15 minutes?

${sender}`,
  }),
];

const LINKEDIN_PROFESSIONAL: Array<(c: FakeCandidate, role: string, desc: string, sender: string) => GeneratedMessage> = [
  (c, role) => ({
    body: `Hi ${firstName(c.name)}, your clinical experience in ${topSkills(c.skills, 2)}${c.company ? ` and your work at ${c.company}` : ''} caught my attention for a ${role} opportunity I'm working on. Your ${c.experience}-year track record is a strong match. Would you be open to a brief conversation to learn more?`,
  }),
  (c, role) => ({
    body: `${firstName(c.name)}, I came across your background in ${topSkills(c.skills, 2)} and wanted to reach out about a ${role} role. Your ${c.experience} years of clinical experience${c.company ? ` at ${c.company}` : ''} aligns closely with what we're hiring for. Happy to share details if you're open to it.`,
  }),
];

const LINKEDIN_CONVERSATIONAL: Array<(c: FakeCandidate, role: string, desc: string, sender: string) => GeneratedMessage> = [
  (c, role) => ({
    body: `Hey ${firstName(c.name)} — your experience in ${topSkills(c.skills, 2)}${c.company ? ` at ${c.company}` : ''} stood out to me. We're looking for a ${role} and I think you could be a great fit. Would you be up for a quick chat?`,
  }),
  (c, role) => ({
    body: `Hi ${firstName(c.name)}, saw your ${c.experience} years in ${topSkills(c.skills, 2)} — solid clinical career. We're hiring a ${role} and your background is genuinely relevant. Open to hearing more?`,
  }),
];

const LINKEDIN_CASUAL: Array<(c: FakeCandidate, role: string, desc: string, sender: string) => GeneratedMessage> = [
  (c, role) => ({
    body: `Hey ${firstName(c.name)}! Your ${topSkills(c.skills)} background really caught my eye. We've got a ${role} opening that seems like a great match. Want to hear more?`,
  }),
  (c, role) => ({
    body: `Hi ${firstName(c.name)}! Saw your ${c.experience} years with ${topSkills(c.skills, 2)} — impressive clinical background. We're building a strong care team and have a ${role} role open. Worth a quick chat?`,
  }),
];

const INMAIL_PROFESSIONAL: Array<(c: FakeCandidate, role: string, desc: string, sender: string) => GeneratedMessage> = [
  (c, role, desc, sender) => ({
    subject: `${role} — your clinical profile stood out`,
    body: `Hi ${firstName(c.name)},

I'm reaching out about a ${role} opportunity that aligns well with your expertise in ${topSkills(c.skills, 2)}.

Your ${c.experience}-year clinical track record${desc ? `, combined with the scope of this role — ${desc}` : ''} suggests there could be a compelling fit worth exploring.

I would welcome the opportunity to share more details at your convenience.

Best regards,
${sender}`,
  }),
  (c, role, _desc, sender) => ({
    subject: `Opportunity that matches your clinical background`,
    body: `Hi ${firstName(c.name)},

Your${c.company ? ` experience at ${c.company} and your` : ''} depth in ${topSkills(c.skills)} led me to reach out about a ${role} position we're actively hiring for.

Given your ${c.experience} years of clinical experience, you'd be stepping into a high-impact role with meaningful ownership from day one. I'd be glad to walk you through the details.

Would a brief call this week work for you?

${sender}`,
  }),
];

const INMAIL_CONVERSATIONAL: Array<(c: FakeCandidate, role: string, _desc: string, sender: string) => GeneratedMessage> = [
  (c, role, _desc, sender) => ({
    subject: `Quick intro — ${role} opportunity`,
    body: `Hey ${firstName(c.name)},

I came across your profile and had to reach out. Your experience in ${topSkills(c.skills, 2)}${c.company ? ` at ${c.company}` : ''} is exactly what we're looking for in a ${role}.

We're at an exciting stage of growth and I think you'd find the clinical scope genuinely interesting. Would you be open to a 20-minute call to learn more?

${sender}`,
  }),
  (c, role, _desc, sender) => ({
    subject: `${firstName(c.name)}, have something relevant for you`,
    body: `Hi ${firstName(c.name)},

Hope it's okay to reach out directly. Your ${c.experience} years in ${topSkills(c.skills, 2)}${c.company ? ` — especially your time at ${c.company}` : ''} — made you stand out for a ${role} we're hiring for.

I'll keep it short: I think there's a real match here and I'd love to share more. Open to a quick conversation?

${sender}`,
  }),
];

const INMAIL_CASUAL: Array<(c: FakeCandidate, role: string, _desc: string, sender: string) => GeneratedMessage> = [
  (c, role, _desc, sender) => ({
    subject: `Hey ${firstName(c.name)} — thought you'd want to see this`,
    body: `Hi ${firstName(c.name)}!

Your clinical background in ${topSkills(c.skills)}${c.company ? ` at ${c.company}` : ''} caught my attention. We're hiring a ${role} and I genuinely think you'd be a great fit — not just based on credentials.

Would you be up for a casual chat? I promise to keep it short and honest.

${sender}`,
  }),
  (c, role, _desc, sender) => ({
    subject: `${role} — seems like your kind of role`,
    body: `Hi ${firstName(c.name)}!

Your experience in ${topSkills(c.skills, 2)} — ${c.experience} years of clinical work is impressive. We've got a ${role} opening and I think you'd love the team and the patient population we serve.

Up for a quick call?

${sender}`,
  }),
];

const TEMPLATES: Record<Channel, Record<Tone, Array<(c: FakeCandidate, role: string, desc: string, sender: string) => GeneratedMessage>>> = {
  Email: {
    Professional: EMAIL_PROFESSIONAL,
    Conversational: EMAIL_CONVERSATIONAL,
    Casual: EMAIL_CASUAL,
  },
  LinkedIn: {
    Professional: LINKEDIN_PROFESSIONAL,
    Conversational: LINKEDIN_CONVERSATIONAL,
    Casual: LINKEDIN_CASUAL,
  },
  InMail: {
    Professional: INMAIL_PROFESSIONAL,
    Conversational: INMAIL_CONVERSATIONAL,
    Casual: INMAIL_CASUAL,
  },
};

export function generateMessage(
  candidate: FakeCandidate,
  roleTitle: string,
  roleDescription: string | null,
  channel: Channel,
  tone: Tone,
  senderName: string,
  variationIndex = 0
): GeneratedMessage {
  const variants = TEMPLATES[channel][tone];
  const fn = variants[variationIndex % variants.length];
  return fn(candidate, roleTitle, roleDescription || '', senderName);
}

export function getNextTone(current: Tone): Tone {
  const tones: Tone[] = ['Professional', 'Conversational', 'Casual'];
  return tones[(tones.indexOf(current) + 1) % tones.length];
}
