import { Suspense } from 'react';
import MarketingRouteContent from './MarketingRouteContent';
import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';

export default function MarketingLayout() {
  return (
    <div className="marketing-site" style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <MarketingNav />
      <main id="main-content" tabIndex={-1} style={{ paddingTop: '72px' }}>
        <Suspense fallback={<div role="status" style={{ padding: '64px 24px', minHeight: '60vh' }}>Loading page…</div>}>
          <MarketingRouteContent />
        </Suspense>
      </main>
      <MarketingFooter />
    </div>
  );
}
