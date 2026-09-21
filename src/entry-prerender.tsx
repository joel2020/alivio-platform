import { renderToString } from 'react-dom/server';
import { Suspense } from 'react';
import { StaticRouter, Routes, Route } from 'react-router-dom';
import MarketingLayout from './components/marketing/MarketingLayout';
import LatamPage from './pages/marketing/LatamPage';
import OffshorePage from './pages/marketing/OffshorePage';
import MedellinPage from './pages/marketing/MedellinPage';
import WestchesterPage from './pages/marketing/WestchesterPage';
import HomePage from './pages/marketing/HomePage';
import ServicesPage from './pages/marketing/ServicesPage';
import AboutPage from './pages/marketing/AboutPage';
import EmployersPage from './pages/marketing/EmployersPage';
import CandidatesPage from './pages/marketing/CandidatesPage';
import ContactPage from './pages/marketing/ContactPage';
import CareersPage from './pages/marketing/CareersPage';
import IndustriesPage from './pages/marketing/IndustriesPage';
import PrivacyPage from './pages/marketing/PrivacyPage';
import TermsPage from './pages/marketing/TermsPage';
import AccessibilityPage from './pages/marketing/AccessibilityPage';
import NotFoundPage from './pages/NotFoundPage';
export { getPageSeo } from './lib/pageSeo';

// Only stable public content: never snapshot jobs, client reports, or CRM data.
const pages = {
  '/': <HomePage />,
  '/nearshore-latam-recruiting': <LatamPage />,
  '/offshore-recruitment': <OffshorePage />,
  '/recruiting-agency-medellin': <MedellinPage />,
  '/recruiting-agency-westchester': <WestchesterPage />,
  '/services': <ServicesPage />,
  '/about': <AboutPage />,
  '/employers': <EmployersPage />,
  '/candidates': <CandidatesPage />,
  '/contact': <ContactPage />,
  '/jobs': <CareersPage />,
  '/industries': <IndustriesPage />,
  '/industries/executive': <IndustriesPage />,
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
