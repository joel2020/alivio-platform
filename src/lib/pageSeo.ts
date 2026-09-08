const SITE_URL = 'https://aliviosearchpartners.com';
const DEFAULT_KEYWORDS = 'ai recruitment, healthcare recruiting, healthcare staffing, nurse recruitment, clinician sourcing, tech leadership hiring, AI talent engine';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function getPageSeo(path: string, search = '') {
  const pathname = path === '/' ? '/' : path.replace(/\/+$/, '');
  const canonicalUrl = `${SITE_URL}${pathname}`;
  let title = 'Alivio Search Partners | AI-Powered Recruitment for Healthcare & Technology';
  let description = 'Recruit physicians, healthcare leaders, engineers, and operators with Alivio Search Partners. AI-enabled sourcing, recruiter-reviewed shortlists, and a search plan tailored to your roles.';
  let keywords = DEFAULT_KEYWORDS;
  let robots = 'index, follow';
  if (pathname === '/pricing') {
    title = 'Recruiting Pricing & Engagements | Alivio Search Partners';
    description = 'Compare retained search, pipeline programs and project recruiting support. Learn what shapes an Alivio quote and request a search plan for your hiring needs.';
  } else if (pathname === '/recruiting-agency-westchester') {
    title = 'Westchester Recruiting Agency | Alivio Search Partners';
    description = 'Healthcare and technology recruiting for Westchester employers. Explore supported roles, local and regional search planning, and recruiter-reviewed shortlists.';
  } else if (pathname === '/product') {
    title = 'Alivio Talent Engine | AI-Powered Hiring System';
    description = 'Explore the Alivio Talent Engine: AI agents for autonomous sourcing, fit scoring, outreach orchestration, and human-validated shortlist delivery.';
  } else if (pathname === '/developers') {
    title = 'Healthcare Recruiting API & Integrations | Alivio Search Partners';
    description = 'Connect Alivio Search Partners to your ATS and healthcare recruiting stack with API-first workflows and automation.';
    robots = 'noindex, nofollow';
  } else if (pathname === '/contact') {
    title = 'Contact Alivio | Healthcare & Technology Recruiting';
    description = 'Discuss a healthcare or technology search with Alivio Search Partners. Tell us about your hiring needs or book a hiring strategy call.';
  } else if (pathname === '/blog') {
    title = 'Healthcare Recruiting Insights | Alivio Search Partners Blog';
    description = 'Expert insights on healthcare recruiting, nursing shortage solutions, and AI-powered clinical staffing strategies.';
  } else if (pathname.startsWith('/blog/')) {
    title = 'Healthcare Recruiting Insights | Alivio Search Partners Blog';
    description = 'Explore expert content on healthcare recruiting, staffing operations, and talent acquisition performance.';
    keywords = `${DEFAULT_KEYWORDS}, healthcare recruiting blog, nurse hiring strategies`;
    if (search) robots = 'noindex, follow';
  } else if (pathname === '/services') {
    title = 'Recruitment Services | Alivio Search Partners';
    description = 'Retained search, pipeline programs, and AI-powered recruiting for healthcare and technology teams.';
  } else if (pathname === '/about') {
    title = 'About | Alivio Search Partners';
    description = 'The AI-enabled recruiting firm for healthcare and technology teams: an AI Candidate Engine paired with senior recruiters.';
  } else if (pathname === '/careers') {
    title = 'Careers & Open Positions | Alivio Search Partners';
    description = 'Open clinical, technical, and recruiting positions with Alivio Search Partners and our clients. Apply online.';
  } else if (pathname.startsWith('/careers/')) {
    title = 'Open Position | Alivio Search Partners';
    description = 'Apply for an open position with Alivio Search Partners.';
  } else if (pathname.startsWith('/industries/')) {
    title = 'Industry Recruiting Practices | Alivio Search Partners';
    description = 'Healthcare and technology recruiting practices at Alivio Search Partners.';
  } else if (pathname === '/start') {
    title = 'Request a Search Plan | Alivio Search Partners';
    description = 'Tell us about the roles you need to fill and get a search plan with market mapping and timeline.';
  } else if (pathname === '/accessibility') {
    title = 'Accessibility Statement | Alivio Search Partners';
    description = 'Our commitment to an accessible website and platform, and how to report an accessibility issue.';
  } else if (pathname === '/privacy') {
    title = 'Privacy Policy | Alivio Search Partners';
    description = 'Review the Alivio Search Partners privacy policy for our healthcare recruiting platform.';
  } else if (pathname === '/terms') {
    title = 'Terms of Service | Alivio Search Partners';
    description = 'Read the terms of service for Alivio Search Partners healthcare recruiting solutions.';
  } else if (pathname === '/login') {
    title = 'Login | Alivio Search Partners';
    description = 'Log in to Alivio Search Partners to manage healthcare recruiting pipelines and candidate outreach.';
    robots = 'noindex, nofollow';
  } else if (pathname === '/signup') {
    title = 'Sign Up | Alivio Search Partners';
    description = 'Create your Alivio Search Partners account to accelerate healthcare recruiting and staffing workflows.';
    robots = 'noindex, nofollow';
  } else if (pathname.startsWith('/client/')) {
    title = 'Client Candidate Shortlist | Alivio Search Partners';
    description = 'Review AI-ranked candidate shortlists prepared by Alivio Search Partners.';
    robots = 'noindex, nofollow';
  } else if (pathname.startsWith('/onboarding') || pathname.startsWith('/dashboard') || pathname.startsWith('/crm') || pathname.startsWith('/pipeline') || pathname.startsWith('/roles') || pathname.startsWith('/outreach') || pathname.startsWith('/calls') || pathname.startsWith('/agents') || pathname.startsWith('/candidates') || pathname.startsWith('/settings') || pathname.startsWith('/admin') || pathname.startsWith('/tasks') || pathname.startsWith('/shortlists')) {
    title = 'Alivio Platform | Healthcare Recruiting Workspace';
    description = 'Manage healthcare recruiting campaigns, role requirements, and clinician pipelines inside the Alivio platform.';
    robots = 'noindex, nofollow';
  } else if (pathname === '/og') {
    title = 'Alivio Open Graph Preview';
    description = 'Open Graph image generator for Alivio Search Partners.';
    robots = 'noindex, nofollow';
  }
  if (pathname === '/industries/healthcare') {
    title = 'Physician & Healthcare Leadership Recruiting | Alivio';
    description = 'Recruit physicians, medical directors, nursing leaders, and healthcare operators with Alivio. Explore supported roles and our recruiter-led search process.';
  } else if (pathname === '/industries/technology') {
    title = 'Technology & Healthtech Recruiting | Alivio Search Partners';
    description = 'Recruit software engineers, AI and data specialists, product leaders, and CTOs with Alivio. Recruiting for technology and healthtech teams.';
  }
  const publicPaths = ['/pricing', '/recruiting-agency-westchester', '/', '/product', '/contact', '/blog', '/services', '/about', '/careers', '/industries/healthcare', '/industries/technology', '/start', '/accessibility', '/privacy', '/terms'];
  const publicDetail = /^\/blog\/[^/]+$/.test(pathname) || /^\/careers\/\d+$/.test(pathname);
  if (!publicPaths.includes(pathname) && !publicDetail && robots === 'index, follow') {
    title = 'Page Not Found | Alivio Search Partners';
    description = 'This page is unavailable. Explore Alivio recruitment services or contact our team.';
    robots = 'noindex, follow';
  }
  const structuredData: Record<string, unknown>[] = [{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonicalUrl, inLanguage: 'en-US' }];
  if (['/', '/product', '/pricing', '/recruiting-agency-westchester'].includes(pathname)) structuredData.push({ '@context': 'https://schema.org', '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Alivio Search Partners', url: SITE_URL, description: 'AI-powered recruitment infrastructure for healthcare and tech organizations', contactPoint: { '@type': 'ContactPoint', email: 'hello@aliviosearchpartners.com', contactType: 'sales' } });
  if (pathname === '/product') structuredData.push({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Alivio AI Candidate Engine', applicationCategory: 'BusinessApplication', description: 'AI-powered hiring system for healthcare and tech recruiting teams' });
  return { title, description, keywords, ogTitle: title, ogDescription: description, canonicalUrl, ogImage: DEFAULT_OG_IMAGE, ogType: pathname.startsWith('/blog/') ? 'article' : 'website', robots, structuredData };
}
