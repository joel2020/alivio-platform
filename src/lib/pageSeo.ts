const SITE_URL = 'https://aliviosearchpartners.com';
const DEFAULT_KEYWORDS = 'specialized recruiting firm, healthcare recruiting, technology recruiting, executive search, professional search, contingency search, retained search, direct sourcing, candidate vetting';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function getPageSeo(path: string, search = '') {
  const pathname = path === '/' ? '/' : path.replace(/\/+$/, '');
  const canonicalUrl = `${SITE_URL}${pathname}`;
  let title = 'Healthcare & Technology Recruiting | Alivio Search Partners';
  let description = 'Recruit physicians, healthcare leaders, engineers, and operators with Alivio Search Partners. Direct sourcing, hands-on candidate vetting, and a search plan tailored to your roles.';
  let keywords = DEFAULT_KEYWORDS;
  let robots = 'index, follow';
  if (pathname === '/nearshore-latam-recruiting') {
    title = 'Nearshore LATAM Recruiting | Alivio Search Partners';
    description = 'Source and assess LATAM talent for U.S. technology and operations teams. Plan role requirements, language assessment, working hours and recruiter-reviewed shortlists.';
  } else if (pathname === '/recruiting-agency-medellin') {
    title = 'Medellín Recruiting Agency | Alivio Search Partners';
    description = 'Recruit bilingual, technical and operations talent in Medellín, Colombia. Alivio helps U.S. teams define the search, source candidates and assess role fit.';
  } else if (pathname === '/pricing') {
    title = 'Recruiting Pricing & Engagements | Alivio Search Partners';
    description = 'Compare retained search, pipeline programs and project recruiting support. Learn what shapes an Alivio quote and request a search plan for your hiring needs.';
  } else if (pathname === '/recruiting-agency-westchester') {
    title = 'Westchester Recruiting Agency | Alivio Search Partners';
    description = 'Healthcare and technology recruiting for Westchester employers. Explore supported roles, local and regional search planning, and recruiter-reviewed shortlists.';
  } else if (pathname === '/product') {
    title = 'Recruiting Services | Alivio Search Partners';
    description = 'Specialized recruiting, direct sourcing, candidate vetting, and professional search for healthcare and technology teams.';
  } else if (pathname === '/developers') {
    title = 'Healthcare Recruiting API & Integrations | Alivio Search Partners';
    description = 'Connect Alivio Search Partners to your ATS and healthcare recruiting stack with API-first workflows and automation.';
    robots = 'noindex, nofollow';
  } else if (pathname === '/contact') {
    title = 'Contact Alivio | Healthcare & Technology Recruiting';
    description = 'Book a recruiting call with Alivio Search Partners. Discuss your open roles, market, timeline, and the recruiting support that fits your hiring needs.';
  } else if (pathname === '/blog') {
    title = 'Healthcare Recruiting Insights | Alivio Search Partners Blog';
    description = 'Insights on healthcare and technology recruiting, candidate experience, and talent acquisition.';
  } else if (pathname.startsWith('/blog/')) {
    title = 'Healthcare Recruiting Insights | Alivio Search Partners Blog';
    description = 'Explore expert content on healthcare recruiting, staffing operations, and talent acquisition performance.';
    keywords = `${DEFAULT_KEYWORDS}, healthcare recruiting blog, nurse hiring strategies`;
    if (search) robots = 'noindex, follow';
  } else if (pathname === '/services' || pathname === '/employers') {
    title = 'Recruitment Services | Alivio Search Partners';
    description = 'Contingency, retained, executive, and contract recruiting for healthcare and technology teams. Targeted sourcing, candidate vetting, and hands-on search management.';
  } else if (pathname === '/about') {
    title = 'About | Alivio Search Partners';
    description = 'Meet Alivio Search Partners and founder Joel Carias. Specialist healthcare and technology recruiting with human judgment, intelligent research, and clear search reporting.';
  } else if (pathname === '/careers' || pathname === '/jobs') {
    title = 'Open Jobs | Alivio Search Partners';
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
    description = 'Review the Alivio Search Partners privacy policy for our recruiting services.';
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
  } else if (pathname.startsWith('/onboarding') || pathname.startsWith('/dashboard') || pathname.startsWith('/crm') || pathname.startsWith('/pipeline') || pathname.startsWith('/roles') || pathname.startsWith('/outreach') || pathname.startsWith('/calls') || pathname.startsWith('/agents') || pathname.startsWith('/candidates/') || pathname.startsWith('/settings') || pathname.startsWith('/admin') || pathname.startsWith('/tasks') || pathname.startsWith('/shortlists')) {
    title = 'Alivio Platform | Healthcare Recruiting Workspace';
    description = 'Manage healthcare recruiting campaigns, role requirements, and clinician pipelines inside the Alivio platform.';
    robots = 'noindex, nofollow';
  } else if (pathname === '/og') {
    title = 'Alivio Open Graph Preview';
    description = 'Open Graph image generator for Alivio Search Partners.';
    robots = 'noindex, nofollow';
  }
  if (pathname === '/candidates') {
    title = 'For Candidates | Alivio Search Partners';
    description = 'Explore healthcare, technology, and professional roles that match your experience and goals. Confidential career conversations and guidance through interviews and offers.';
    robots = 'index, follow';
  } else if (pathname === '/industries') {
    title = 'Recruiting Industries | Alivio Search Partners';
    description = 'Specialized healthcare, technology, executive, and professional search. Explore the industries and roles we recruit for across the U.S.';
  } else if (pathname === '/industries/executive') {
    title = 'Executive & Leadership Search | Alivio Search Partners';
    description = 'Focused executive and professional search for leadership, operations, and sales roles. Direct sourcing and candidate vetting for long-term fit.';
  } else if (pathname === '/industries/healthcare') {
    title = 'Physician & Healthcare Leadership Recruiting | Alivio';
    description = 'Recruit physicians, medical directors, nursing leaders, and healthcare operators with Alivio. Explore supported roles and our recruiter-led search process.';
  } else if (pathname === '/industries/technology') {
    title = 'Technology & Healthtech Recruiting | Alivio Search Partners';
    description = 'Recruit software engineers, AI and data specialists, product leaders, and CTOs with Alivio. Recruiting for technology and healthtech teams.';
  }
  const publicPaths = ['/nearshore-latam-recruiting', '/recruiting-agency-medellin', '/pricing', '/recruiting-agency-westchester', '/', '/product', '/contact', '/blog', '/services', '/employers', '/candidates', '/industries', '/industries/executive', '/jobs', '/about', '/careers', '/industries/healthcare', '/industries/technology', '/start', '/accessibility', '/privacy', '/terms'];
  const publicDetail = /^\/blog\/[^/]+$/.test(pathname) || /^\/careers\/\d+$/.test(pathname);
  if (!publicPaths.includes(pathname) && !publicDetail && robots === 'index, follow') {
    title = 'Page Not Found | Alivio Search Partners';
    description = 'This page is unavailable. Explore Alivio recruitment services or contact our team.';
    robots = 'noindex, follow';
  }
  const structuredData: Record<string, unknown>[] = [{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonicalUrl, inLanguage: 'en-US' }];
  if (['/nearshore-latam-recruiting', '/recruiting-agency-medellin', '/', '/product', '/pricing', '/recruiting-agency-westchester'].includes(pathname)) structuredData.push({ '@context': 'https://schema.org', '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Alivio Search Partners', url: SITE_URL, description: 'Specialized recruiting firm for healthcare, technology, and professional search', contactPoint: { '@type': 'ContactPoint', email: 'hello@aliviosearchpartners.com', contactType: 'sales' } });
  return { title, description, keywords, ogTitle: title, ogDescription: description, canonicalUrl, ogImage: DEFAULT_OG_IMAGE, ogType: pathname.startsWith('/blog/') ? 'article' : 'website', robots, structuredData };
}
