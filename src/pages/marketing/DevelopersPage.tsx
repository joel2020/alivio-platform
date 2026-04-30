import { useSeo } from '../../lib/seo';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

const endpoints = `POST   /roles                           Create a new role
GET    /roles/{id}                      Get role details
PATCH  /roles/{id}                      Update role
DELETE /roles/{id}                      Deactivate role

GET    /roles/{id}/candidates           Get scored pipeline
GET    /roles/{id}/candidates/{id}      Get candidate profile
POST   /roles/{id}/candidates/{id}/feedback  Submit rating

GET    /agents/status                   All agent statuses
GET    /agents/{agent}/logs             Agent action log

POST   /voice/call/initiate             Trigger qualification call
GET    /voice/call/{id}                 Get call metadata
GET    /voice/call/{id}/transcript      Get transcript
GET    /voice/call/{id}/audio           Get recording URL
POST   /voice/call/{id}/escalate        Escalate to human
GET    /voice/calls?role_id={id}        List calls for role

POST   /outreach/{id}/approve           Approve outreach
POST   /outreach/{id}/edit              Edit outreach

GET    /analytics/pipeline/{role_id}    Pipeline metrics
GET    /analytics/scoring/{role_id}     Scoring data

POST   /webhooks                        Register webhook
GET    /webhooks                        List webhooks
DELETE /webhooks/{id}                   Remove webhook`;

const webhookEvents = `role.created
role.updated
candidate.discovered
candidate.scored
voice.call.started
voice.call.completed
voice.candidate.qualified
voice.candidate.disqualified
voice.candidate.needs_review
voice.candidate.escalated
voice.candidate.declined
outreach.sent
outreach.replied
candidate.scheduled
feedback.received
agent.error`;

const quickstart = `import alivio

client = alivio.Client(api_key="your_api_key")

# Create a role and deploy agents
role = client.roles.create(
    title="Registered Nurse - ICU",
    location="Chicago, IL",
    requirements={
        "licenses": ["RN", "BLS", "ACLS"],
        "experience_years": 3,
        "setting": "acute care"
    },
    agents=["scout", "enrich", "signal", "voice", "engage", "schedule"]
)

# Retrieve scored candidates
candidates = client.candidates.list(
    role_id=role.id,
    min_score=0.75,
    sort="score_desc"
)

for c in candidates:
    print(f"{c.name} — Score: {c.score}")

# Check voice call results
calls = client.voice.list(role_id=role.id)
for call in calls:
    print(f"{call.candidate_name} — {call.qualification_status}")`;

const useCases = [
  'Embed Alivio into an internal hiring portal',
  'Trigger pipelines from your HRIS',
  'Feed candidate data into your data warehouse',
  'Custom outreach and voice approval workflows',
  'Build custom scoring dashboards',
];

const security = [
  'HTTPS/TLS 1.3', 'Scoped API keys', 'SOC 2 Type II', 'GDPR-ready', 'Audit logs',
];

export default function DevelopersPage() {
  useSeo({
    title: 'Developers | Alivio Search Partners',
    description: 'Developer APIs for Alivio Search Partners.',
    robots: 'noindex, nofollow',
  });

  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 border-b" style={{ borderColor: '#1E1E1E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#4F46E5' }}>Developers</p>
        <h1 className="font-bold text-white mb-4" style={{ fontSize: '56px', lineHeight: '1.05' }}>Developers</h1>
        <p className="text-xl" style={{ color: '#A0A0A0', maxWidth: '560px', lineHeight: '1.6' }}>
          Build on Alivio. Integrate hiring intelligence into your infrastructure.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 border-b" style={{ borderColor: '#1E1E1E' }}>
        <h2 className="font-semibold text-white mb-6" style={{ fontSize: '24px' }}>API Overview</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Base URL', val: 'https://api.alivio.dev/v1' },
            { label: 'Authentication', val: 'Bearer token' },
            { label: 'Rate Limits', val: 'Tier-dependent' },
            { label: 'Response Format', val: 'JSON' },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-lg border" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
              <p className="text-xs mb-1" style={{ color: '#6B6B6B' }}>{item.label}</p>
              <p className="text-sm font-medium text-white font-mono">{item.val}</p>
            </div>
          ))}
        </div>
        <pre className="p-4 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: '#141414', color: '#A0A0A0', fontFamily: 'JetBrains Mono, monospace', border: '1px solid #1E1E1E' }}>
          https://api.alivio.dev/v1
        </pre>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 border-b" style={{ borderColor: '#1E1E1E' }}>
        <h2 className="font-semibold text-white mb-6" style={{ fontSize: '24px' }}>Core Endpoints</h2>
        <pre className="p-6 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: '#141414', color: '#A0A0A0', fontFamily: 'JetBrains Mono, monospace', border: '1px solid #1E1E1E', lineHeight: '2' }}>
          {endpoints}
        </pre>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 border-b" style={{ borderColor: '#1E1E1E' }}>
        <h2 className="font-semibold text-white mb-6" style={{ fontSize: '24px' }}>Webhook Events</h2>
        <pre className="p-6 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: '#141414', color: '#A0A0A0', fontFamily: 'JetBrains Mono, monospace', border: '1px solid #1E1E1E', lineHeight: '2' }}>
          {webhookEvents}
        </pre>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 border-b" style={{ borderColor: '#1E1E1E' }}>
        <h2 className="font-semibold text-white mb-6" style={{ fontSize: '24px' }}>Use Cases</h2>
        <ol className="space-y-3">
          {useCases.map((uc, i) => (
            <li key={i} className="flex items-start gap-3 p-4 rounded-lg border" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
              <span className="font-mono text-sm flex-shrink-0" style={{ color: '#4F46E5' }}>{i + 1}.</span>
              <p className="text-sm" style={{ color: '#A0A0A0' }}>{uc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 border-b" style={{ borderColor: '#1E1E1E' }}>
        <h2 className="font-semibold text-white mb-6" style={{ fontSize: '24px' }}>Quickstart</h2>
        <pre className="p-6 rounded-lg text-sm overflow-x-auto" style={{ backgroundColor: '#141414', color: '#A0A0A0', fontFamily: 'JetBrains Mono, monospace', border: '1px solid #1E1E1E', lineHeight: '1.8' }}>
          {quickstart}
        </pre>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="font-semibold text-white mb-6" style={{ fontSize: '24px' }}>Security</h2>
        <div className="flex flex-wrap gap-3 mb-10">
          {security.map((s) => (
            <span key={s} className="px-4 py-2 rounded border text-sm" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E', color: '#A0A0A0' }}>{s}</span>
          ))}
        </div>
        <div className="flex gap-4">
          <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded font-medium text-white" style={{ backgroundColor: '#4F46E5' }}>
            Book an Intro Call →
          </a>
          <a href="#" className="px-6 py-3 rounded font-medium border" style={{ color: '#FFFFFF', borderColor: '#1E1E1E' }}>
            Read Full Documentation →
          </a>
        </div>
      </section>
    </div>
  );
}
