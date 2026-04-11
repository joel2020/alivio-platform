const team = [
  { name: 'Jordan Merritt', title: 'CEO', background: 'Previously SVP Product at Workday, Stanford MBA' },
  { name: 'Priya Nair', title: 'CTO', background: 'Previously Principal Engineer at Stripe, MIT CSAIL' },
  { name: 'Marcus Chen', title: 'Head of Product', background: 'Previously PM at Notion, First Principles Health' },
];

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: '#0A0A0A' }}>
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 border-b" style={{ borderColor: '#1E1E1E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#4F46E5' }}>About</p>
        <h1 className="font-bold text-white mb-6" style={{ fontSize: '56px', lineHeight: '1.05' }}>About Alivio</h1>
        <h2 className="font-medium mb-8 text-xl" style={{ color: '#A0A0A0', maxWidth: '640px' }}>
          We're building the infrastructure layer for how companies hire.
        </h2>
        <div className="space-y-6 max-w-2xl">
          <p style={{ color: '#A0A0A0', lineHeight: '1.8' }}>
            Alivio was founded on a simple observation: recruiting has been one of the last major business functions to be truly automated. Not augmented. Not assisted. Automated.
          </p>
          <p style={{ color: '#A0A0A0', lineHeight: '1.8' }}>
            Every other critical business pipeline — sales, marketing, finance — has been rebuilt on software that executes, learns, and scales independently. Hiring hasn't.
          </p>
          <p style={{ color: '#A0A0A0', lineHeight: '1.8' }}>
            Alivio is an AI-native talent operating system. Our platform deploys autonomous agents that execute the full hiring pipeline — from candidate discovery through voice qualification to interview scheduling — without human bottlenecks.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 border-b" style={{ borderColor: '#1E1E1E' }}>
        <h2 className="font-semibold text-white mb-6" style={{ fontSize: '32px' }}>System-led execution with human oversight.</h2>
        <p className="mb-8 max-w-2xl" style={{ color: '#A0A0A0', lineHeight: '1.8' }}>
          Our agents are designed to own their execution domain — to run end-to-end with full context and continuous learning. Humans set objectives, adjust parameters, review outputs, and make final hiring decisions. This is not full automation. It is autonomous execution with human governance.
        </p>
        <div className="grid md:grid-cols-2 gap-3 max-w-3xl">
          {[
            'Agents run on LLM orchestration, not rules engines',
            'Scoring uses embedding-based semantic models, not keyword matching',
            'Outreach is generated and contextual, not templated',
            'Voice qualification provides consistent, auditable candidate evaluation',
            'The system learns from every cycle',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 p-4 rounded-lg border" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
              <span className="mt-0.5 flex-shrink-0 text-xs" style={{ color: '#4F46E5' }}>→</span>
              <p className="text-sm" style={{ color: '#A0A0A0' }}>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-semibold text-white mb-10" style={{ fontSize: '32px' }}>Team</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mb-8">
          {team.map((member) => (
            <div key={member.name} className="p-6 rounded-xl border" style={{ backgroundColor: '#141414', borderColor: '#1E1E1E' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mb-4" style={{ backgroundColor: '#1E1E1E' }}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <p className="font-semibold text-white mb-0.5">{member.name}</p>
              <p className="text-sm mb-3" style={{ color: '#4F46E5' }}>{member.title}</p>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>Previously {member.background}</p>
            </div>
          ))}
        </div>
        <p className="text-sm" style={{ color: '#6B6B6B' }}>
          We're a small, technical team.{' '}
          <a href="#" className="underline" style={{ color: '#A0A0A0' }}>See Open Roles →</a>
        </p>
      </section>
    </div>
  );
}
