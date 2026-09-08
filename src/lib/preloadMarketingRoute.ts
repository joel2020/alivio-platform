/** Keep static HTML visible until the matching lazy page can hydrate. */
export function preloadMarketingRoute(path: string): Promise<unknown> {
  if (/^\/blog\/[^/]+$/.test(path)) return import('../pages/marketing/BlogPostPage');
  switch (path) {
    case '/nearshore-latam-recruiting': return import('../pages/marketing/LatamPage');
    case '/recruiting-agency-medellin': return import('../pages/marketing/MedellinPage');
    case '/pricing': return import('../pages/marketing/PricingPage');
    case '/recruiting-agency-westchester': return import('../pages/marketing/WestchesterPage');
    case '/services': return import('../pages/marketing/ServicesPage');
    case '/about': return import('../pages/marketing/AboutPage');
    case '/product': return import('../pages/marketing/ProductPage');
    case '/industries/healthcare':
    case '/industries/technology': return import('../pages/marketing/IndustriesPage');
    case '/privacy': return import('../pages/marketing/PrivacyPage');
    case '/terms': return import('../pages/marketing/TermsPage');
    case '/accessibility': return import('../pages/marketing/AccessibilityPage');
    default: return Promise.resolve();
  }
}
