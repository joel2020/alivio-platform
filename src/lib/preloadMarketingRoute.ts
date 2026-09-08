/** Keep static HTML visible until the matching lazy page can hydrate. */
export function preloadMarketingRoute(path: string): Promise<unknown> {
  switch (path) {
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
