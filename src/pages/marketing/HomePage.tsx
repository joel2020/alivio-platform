import HeroSection from '../../components/marketing/sections/HeroSection';
import LogoBarSection from '../../components/marketing/sections/LogoBarSection';
import ProblemSection from '../../components/marketing/sections/ProblemSection';
import HowItWorksSection from '../../components/marketing/sections/HowItWorksSection';
import FeatureShowcaseSection from '../../components/marketing/sections/FeatureShowcaseSection';
import ComparisonSection from '../../components/marketing/sections/ComparisonSection';
import MetricsSection from '../../components/marketing/sections/MetricsSection';
import PricingSection from '../../components/marketing/sections/PricingSection';
import FinalCTASection from '../../components/marketing/sections/FinalCTASection';
import { useSeo } from '../../lib/seo';

export default function HomePage() {
  useSeo({
    title: 'Alivio — AI-Powered Healthcare Staffing Platform',
    description: 'Alivio is an AI-powered healthcare staffing platform that sources, scores, and engages qualified nurses, clinicians, and healthcare leaders. Fill roles faster with AI recruiting agents.',
    keywords: 'AI healthcare staffing, nurse recruiting software, clinician sourcing platform, director of nursing hiring, healthcare talent acquisition',
  });

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
