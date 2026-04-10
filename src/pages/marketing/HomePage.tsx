import HeroSection from '../../components/marketing/sections/HeroSection';
import LogoBarSection from '../../components/marketing/sections/LogoBarSection';
import ProblemSection from '../../components/marketing/sections/ProblemSection';
import HowItWorksSection from '../../components/marketing/sections/HowItWorksSection';
import FeatureShowcaseSection from '../../components/marketing/sections/FeatureShowcaseSection';
import ComparisonSection from '../../components/marketing/sections/ComparisonSection';
import MetricsSection from '../../components/marketing/sections/MetricsSection';
import PricingSection from '../../components/marketing/sections/PricingSection';
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
      <PricingSection />
      <FinalCTASection />
    </>
  );
}
