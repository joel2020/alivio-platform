import HeroSection from '../../components/marketing/sections/HeroSection';
import LogoBarSection from '../../components/marketing/sections/LogoBarSection';
import ProblemSection from '../../components/marketing/sections/ProblemSection';
import HowItWorksSection from '../../components/marketing/sections/HowItWorksSection';
import FeatureShowcaseSection from '../../components/marketing/sections/FeatureShowcaseSection';
import ComparisonSection from '../../components/marketing/sections/ComparisonSection';
import MetricsSection from '../../components/marketing/sections/MetricsSection';
import FinalCTASection from '../../components/marketing/sections/FinalCTASection';

export default function HomePage() {

  return (
    <>
      <HeroSection />
      <LogoBarSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeatureShowcaseSection />
      <ComparisonSection />
      <MetricsSection />
      <section style={{ padding: '24px 0', background: '#FFFFFF' }}>
        <div className="mkt-container" style={{ textAlign: 'center' }}>
          <a href="/pricing" style={{ color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none' }}>
            Flat monthly pricing. No per-hire fees. No agency commissions. See pricing →
          </a>
        </div>
      </section>
      <FinalCTASection />
    </>
  );
}
