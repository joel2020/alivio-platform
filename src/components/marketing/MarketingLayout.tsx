import { Outlet } from 'react-router-dom';
import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';

export default function MarketingLayout() {
  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <MarketingNav />
      <main style={{ paddingTop: '64px' }}>
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
