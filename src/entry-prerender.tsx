import { renderToString } from 'react-dom/server';
import { Suspense } from 'react';
import { StaticRouter, Routes, Route } from 'react-router-dom';
import MarketingLayout from './components/marketing/MarketingLayout';
import HomePage from './pages/marketing/HomePage';
import ServicesPage from './pages/marketing/ServicesPage';
import AboutPage from './pages/marketing/AboutPage';
import ProductPage from './pages/marketing/ProductPage';
import IndustriesPage from './pages/marketing/IndustriesPage';
import PrivacyPage from './pages/marketing/PrivacyPage';
import TermsPage from './pages/marketing/TermsPage';
import AccessibilityPage from './pages/marketing/AccessibilityPage';
import NotFoundPage from './pages/NotFoundPage';
export { getPageSeo } from './lib/pageSeo';

// Only stable public content: never snapshot jobs, client reports, or CRM data.
const pages = {
  '/': <HomePage />,
  '/services': <ServicesPage />,
  '/about': <AboutPage />,
  '/product': <ProductPage />,
  '/industries/healthcare': <IndustriesPage />,
  '/industries/technology': <IndustriesPage />,
  '/privacy': <PrivacyPage />,
  '/terms': <TermsPage />,
  '/accessibility': <AccessibilityPage />,
};
export const routes = Object.keys(pages);

export function render(path: string) {
  return renderToString(
    <StaticRouter location={path}>
      <Suspense fallback={null}>
      <Routes>
        <Route element={<MarketingLayout />}>
          {Object.entries(pages).filter(([route]) => !route.startsWith('/industries/')).map(([route, element]) => <Route key={route} path={route} element={element} />)}
          <Route path="/industries/:slug" element={<IndustriesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      </Suspense>
    </StaticRouter>,
  );
}
