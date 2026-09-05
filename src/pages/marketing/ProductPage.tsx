import { ArrowRight, BarChart3, Bot, Brain, CheckCircle2, Gauge, MessageSquare, Search, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { CAL_COM_BOOKING_URL } from '../../lib/demoBooking';

const engineModules = [
  ['Source', Search, 'Build target lists across technology, physician, healthcare leadership, and nearshore markets.'],
  ['Score', Target, 'Apply role-specific scorecards for fit, compensation alignment, seniority, geography, and motivation.'],
  ['Engage', MessageSquare, 'Launch personalized outreach workflows with human review before candidate-facing messages.'],
  ['Prioritize', Gauge, 'Rank candidates by match quality, response signals, and search-stage readiness.'],
  ['Report', BarChart3, 'Turn activity into pipeline dashboards, shortlist reports, and hiring-market feedback.'],
  ['Optimize', Brain, 'Review results monthly and tune searches, messaging, scorecards, and market assumptions.'],
];

const offers = [
  ['Retained search', 'A critical hire', 'A dedicated search with calibrated scorecards, recruiter-reviewed shortlists, weekly reporting, and support through the offer.'],
  ['Pipeline program', 'Ongoing hiring', 'For healthcare and technology teams that want Alivio to run sourcing, outreach, screening support, pipeline review, and optimization.'],
  ['Project / RPO support', 'A defined hiring initiative', 'A recruiting team for a launch, expansion, or hiring backlog, with an agreed scope, reporting cadence, and handover.'],
];

const useCases = [
  'VC-backed AI startup hiring full-stack engineers, AI/ML engineers, technical product managers, and GTM leaders.',
  'Physician group recruiting emergency medicine physicians, hospitalists, medical directors, and specialists in competitive markets.',
  'Multi-site healthcare operator hiring DONs, LNHAs, MDS coordinators, revenue cycle leaders, and clinical operations leadership.',
  'Healthtech company building recurring talent pipelines across product, engineering, data, customer success, and implementation roles.',
];

export default function ProductPage() {
  return (
    <div style={{ background: '#fff', color: '#071226' }}>
      <section className="mkt-dark" style={{ padding: '86px 0 70px', background: 'radial-gradient(circle at 78% 18%, rgba(85,130,255,.2), transparent 30%), linear-gradient(135deg,#061636 0%,#081F4A 55%,#020A1A 100%)', color: '#fff', overflow: 'hidden' }}>
        <div className="mkt-container" style={{ maxWidth: 1240 }}>
          <div className="engine-hero" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.95fr) minmax(0,1.05fr)', gap: 40, alignItems: 'center' }}>
            <div>
              <p className="mkt-label" style={{ color: '#9DBBFF', letterSpacing: '.3em' }}>ALIVIO AI CANDIDATE ENGINE</p>
              <h1 style={{ fontSize: 'clamp(44px,5.6vw,78px)', lineHeight: .96, letterSpacing: '-.055em', margin: '16px 0 22px' }}>The technology behind your next great hire.</h1>
              <p style={{ fontSize: 19, lineHeight: 1.75, color: 'rgba(255,255,255,.76)', maxWidth: 720 }}>Our AI Candidate Engine supports Alivio recruiters with sourcing, matching, outreach, and pipeline reporting. Engage our team for a search or an ongoing program, with human review at every shortlist.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
                <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ background: '#fff', color: '#061636' }}>Book a Hiring Strategy Call <ArrowRight size={18} /></a>
                <a href="#pricing" className="mkt-btn-secondary mkt-btn-on-dark" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}>View Engine Options</a>
              </div>
            </div>
            <div style={{ border: '1px solid rgba(157,187,255,.25)', background: 'rgba(255,255,255,.045)', borderRadius: 24, padding: 22, boxShadow: '0 28px 70px rgba(0,0,0,.28)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><strong>Engine Command Center</strong><span style={{ color: '#7EE6A6' }}>Sample data</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }} className="engine-metrics">
                {[
                  ['Target Accounts', '186'], ['Candidate Matches', '742'], ['Outreach Queued', '328'], ['Shortlists', '18'], ['Interview Ready', '41'], ['Avg Match', '91%'],
                ].map(([k, v]) => <div key={k} style={{ border: '1px solid rgba(157,187,255,.18)', borderRadius: 14, padding: 14, background: 'rgba(5,16,40,.48)' }}><p style={{ margin: 0, color: 'rgba(255,255,255,.8)', fontSize: 12 }}>{k}</p><p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800 }}>{v}</p></div>)}
              </div>
              <p style={{ color: '#C1D0EB', fontSize: 13, lineHeight: 1.6 }}>Illustrative product preview. Figures and activity below are sample data.</p>
              <div style={{ marginTop: 16, border: '1px solid rgba(157,187,255,.18)', borderRadius: 16, padding: 16, background: 'rgba(5,16,40,.48)' }}>
                {['AI/ML Engineer search calibrated', 'Emergency Medicine Physician target list built', 'DON shortlist report generated', 'Technical PM outreach sequence approved'].map((item) => <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0', color: 'rgba(255,255,255,.82)' }}><CheckCircle2 size={16} color="#7EE6A6" />{item}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 0 8px' }}>
        <div className="mkt-container" style={{ maxWidth: 1000 }}>
          <p className="mkt-label" style={{ color: '#1D55C6', textAlign: 'center' }}>SEE IT IN ACTION</p>
          <h2 style={{ fontSize: 'clamp(28px,3.4vw,44px)', letterSpacing: '-.035em', margin: '10px 0 22px', textAlign: 'center' }}>A 60-second walkthrough of the platform.</h2>
          <video
            controls
            preload="metadata"
            poster="/walkthrough-poster.jpg"
            style={{ width: '100%', borderRadius: 20, border: '1px solid #DCE4F2', boxShadow: '0 18px 46px rgba(8,19,48,0.18)', display: 'block' }}
          >
            <source src="/alivio-walkthrough.mp4" type="video/mp4" />
            Your browser does not support embedded video. Download it at /alivio-walkthrough.mp4
          </video>
        </div>
      </section>

      <section style={{ padding: '70px 0' }}>
        <div className="mkt-container">
          <div style={{ maxWidth: 850 }}>
            <p className="mkt-label" style={{ color: '#1D55C6' }}>WHAT THE ENGINE DOES</p>
            <h2 style={{ fontSize: 'clamp(34px,4vw,56px)', lineHeight: 1.02, letterSpacing: '-.04em', margin: '12px 0 18px' }}>A recruiting operating system for sourcing, scoring, outreach, and shortlist delivery.</h2>
            <p style={{ color: '#4D5E7B', fontSize: 18, lineHeight: 1.75 }}>The AI Candidate Engine is built for companies that need consistent candidate flow without depending on random job applicants or disconnected spreadsheets. It can support individual searches or become the foundation for a monthly candidate pipeline program.</p>
          </div>
          <div className="engine-modules" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 18, marginTop: 34 }}>
            {engineModules.map(([title, Icon, copy]) => <div key={String(title)} style={{ border: '1px solid #DCE4F2', borderRadius: 20, padding: 24, background: '#fff', boxShadow: '0 10px 32px rgba(7,25,62,.06)' }}><Icon size={26} color="#1D55C6" /><h3 style={{ fontSize: 22, margin: '16px 0 8px' }}>{String(title)}</h3><p style={{ color: '#4D5E7B', lineHeight: 1.7 }}>{String(copy)}</p></div>)}
          </div>
        </div>
      </section>

      <section style={{ padding: '72px 0', background: '#F6F9FF' }}>
        <div className="mkt-container engine-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div style={{ border: '1px solid #DCE4F2', borderRadius: 24, padding: 30, background: '#fff' }}>
            <Bot size={30} color="#1D55C6" />
            <h2>AI where it speeds the work.</h2>
            <p style={{ color: '#4D5E7B', lineHeight: 1.75 }}>AI supports research, data normalization, profile summarization, fit scoring, outreach drafting, pipeline prioritization, and reporting. It gives the recruiting process more speed and structure.</p>
          </div>
          <div style={{ border: '1px solid #DCE4F2', borderRadius: 24, padding: 30, background: '#fff' }}>
            <ShieldCheck size={30} color="#1D55C6" />
            <h2>Humans where judgment matters.</h2>
            <p style={{ color: '#4D5E7B', lineHeight: 1.75 }}>Human recruiters validate search strategy, candidate motivation, compensation alignment, communication quality, and client-specific fit before candidates are advanced.</p>
          </div>
        </div>
      </section>

      <section className="mkt-dark" style={{ padding: '72px 0', background: '#061636', color: '#fff' }}>
        <div className="mkt-container">
          <h2 style={{ fontSize: 'clamp(34px,4vw,54px)', letterSpacing: '-.04em', marginTop: 0 }}>Built for high-value searches and repeatable pipeline creation.</h2>
          <div className="use-cases" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16, marginTop: 28 }}>
            {useCases.map((useCase) => <div key={useCase} style={{ border: '1px solid rgba(157,187,255,.22)', borderRadius: 18, padding: 22, background: 'rgba(255,255,255,.045)', color: 'rgba(255,255,255,.8)', lineHeight: 1.65 }}>{useCase}</div>)}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: '72px 0' }}>
        <div className="mkt-container">
          <p className="mkt-label" style={{ color: '#1D55C6' }}>ENGAGEMENT MODELS</p>
          <h2 style={{ fontSize: 'clamp(34px,4vw,54px)', letterSpacing: '-.04em', margin: '12px 0 10px' }}>One recruiting engine. Three ways to engage.</h2>
          <p style={{ color: '#4D5E7B', fontSize: 17, lineHeight: 1.7, maxWidth: 680, margin: '0 0 28px' }}>Pricing reflects your roles, hiring volume, and timeline. Each model includes the engine and human recruiter review. For internal teams that need an engine setup, we can scope a separate implementation.</p>
          <div className="offers" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 18 }}>
            {offers.map(([name, price, copy]) => <div key={name} style={{ border: '1px solid #DCE4F2', borderRadius: 22, padding: 28, background: '#fff', boxShadow: '0 10px 32px rgba(7,25,62,.06)' }}><h3 style={{ marginTop: 0, fontSize: 24 }}>{name}</h3><p style={{ color: '#1D55C6', fontWeight: 800, fontSize: 22 }}>{price}</p><p style={{ color: '#4D5E7B', lineHeight: 1.7 }}>{copy}</p></div>)}
          </div>
        </div>
      </section>

      <section style={{ padding: '34px 0 78px' }}>
        <div className="mkt-container mkt-dark" style={{ borderRadius: 28, background: '#061636', color: '#fff', padding: '54px 34px', textAlign: 'center' }}>
          <Sparkles size={34} color="#9DBBFF" />
          <h2 style={{ fontSize: 'clamp(34px,4vw,54px)', letterSpacing: '-.04em', margin: '16px 0' }}>Want to see how the AI Engine would run your searches?</h2>
          <p style={{ color: 'rgba(255,255,255,.74)', fontSize: 18, lineHeight: 1.75, maxWidth: 760, margin: '0 auto 26px' }}>Book a short call and we will map your roles, target market, candidate sources, outreach workflows, and reporting structure.</p>
          <a href={CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn-primary-lg" style={{ background: '#fff', color: '#061636', display: 'inline-flex' }}>Book a Hiring Strategy Call <ArrowRight size={18} /></a>
        </div>
      </section>

      <style>{`@media(max-width:1100px){.engine-hero,.engine-two-col,.offers{grid-template-columns:1fr!important}.engine-modules,.use-cases{grid-template-columns:1fr!important}}@media(max-width:760px){.engine-metrics{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
