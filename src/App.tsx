import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import { isSupabaseConfigured, supabaseConfigError } from './lib/supabase';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import MarketingLayout from './components/marketing/MarketingLayout';
const AppLayout = lazy(() => import('./components/app/AppLayout'));

import HomePage from './pages/marketing/HomePage';
const ProductPage = lazy(() => import('./pages/marketing/ProductPage'));
const DevelopersPage = lazy(() => import('./pages/marketing/DevelopersPage'));
const PrivacyPage = lazy(() => import('./pages/marketing/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/marketing/TermsPage'));
const BlogPage = lazy(() => import('./pages/marketing/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/marketing/BlogPostPage'));
const ContactPage = lazy(() => import('./pages/marketing/ContactPage'));
const ServicesPage = lazy(() => import('./pages/marketing/ServicesPage'));
const AboutPage = lazy(() => import('./pages/marketing/AboutPage'));
const CareersPage = lazy(() => import('./pages/marketing/CareersPage'));
const CareersJobPage = lazy(() => import('./pages/marketing/CareersJobPage'));
const IndustriesPage = lazy(() => import('./pages/marketing/IndustriesPage'));
const StartPage = lazy(() => import('./pages/marketing/StartPage'));
const AccessibilityPage = lazy(() => import('./pages/marketing/AccessibilityPage'));

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
import { RequireLoggedOut, RequireOnboarding } from './components/auth/RouteGuards';

const OnboardingOrgPage = lazy(() => import('./pages/app/OnboardingOrgPage'));
const OnboardingRolePage = lazy(() => import('./pages/app/OnboardingRolePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const OGImagePage = lazy(() => import('./pages/OGImagePage'));
const ClientShortlistPage = lazy(() => import('./pages/client/ClientShortlistPage'));
const ClientReportPage = lazy(() => import('./pages/client/ClientReportPage'));

const DashboardPage = lazy(() => import('./pages/app/DashboardPage'));
const RolesPage = lazy(() => import('./pages/app/RolesPage'));
const RoleNewPage = lazy(() => import('./pages/app/RoleNewPage'));
const PipelinePage = lazy(() => import('./pages/app/PipelinePage'));
const PipelineOverviewPage = lazy(() => import('./pages/app/PipelineOverviewPage'));
const OutreachPage = lazy(() => import('./pages/app/OutreachPage'));
const ShortlistsPage = lazy(() => import('./pages/app/ShortlistsPage'));
const AgentsPage = lazy(() => import('./pages/app/AgentsPage'));
const CandidatePage = lazy(() => import('./pages/app/CandidatePage'));
const RoleSettingsPage = lazy(() => import('./pages/app/RoleSettingsPage'));
const SettingsPage = lazy(() => import('./pages/app/SettingsPage'));
const CallsPage = lazy(() => import('./pages/app/CallsPage'));
const EmailInboxPage = lazy(() => import('./pages/app/admin/EmailInboxPage'));
const CrmPage = lazy(() => import('./pages/app/crm/CrmPage'));
const CrmTemplatesPage = lazy(() => import('./pages/app/crm/CrmTemplatesPage'));
const CrmClientPage = lazy(() => import('./pages/app/crm/CrmClientPage'));
import { useSeo } from './lib/seo';

import AdminRoute from './components/admin/AdminRoute';
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminOrganizationsPage = lazy(() => import('./pages/admin/AdminOrganizationsPage'));
const AdminBlogPage = lazy(() => import('./pages/admin/AdminBlogPage'));
const AdminBlogEditorPage = lazy(() => import('./pages/admin/AdminBlogEditorPage'));
const AdminAiMonitorPage = lazy(() => import('./pages/admin/AdminAiMonitorPage'));
const AdminTasksPage = lazy(() => import('./pages/admin/AdminTasksPage'));
const AdminLeadsPage = lazy(() => import('./pages/admin/AdminLeadsPage'));
const AdminSystemCheckPage = lazy(() => import('./pages/admin/AdminSystemCheckPage'));

const SITE_URL = 'https://aliviosearchpartners.com';
const DEFAULT_KEYWORDS = 'ai recruitment, healthcare recruiting, healthcare staffing, nurse recruitment, clinician sourcing, tech leadership hiring, AI talent engine';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

function SeoManager() {
  const location = useLocation();
  const pathname = location.pathname;
  const canonicalUrl = `${SITE_URL}${pathname}`;
  let title = 'Alivio Search Partners | AI-Powered Recruitment for Healthcare & Technology';
  let description = 'Recruit physicians, healthcare leaders, engineers, and operators with Alivio Search Partners. AI-enabled sourcing, recruiter-reviewed shortlists, and a search plan tailored to your roles.';
  let keywords = DEFAULT_KEYWORDS;
  let robots = 'index, follow';
  if (pathname === '/product') {
    title = 'Alivio Talent Engine | AI-Powered Hiring System';
    description = 'Explore the Alivio Talent Engine: AI agents for autonomous sourcing, fit scoring, outreach orchestration, and human-validated shortlist delivery.';
  } else if (pathname === '/developers') {
    title = 'Healthcare Recruiting API & Integrations | Alivio Search Partners';
    description = 'Connect Alivio Search Partners to your ATS and healthcare recruiting stack with API-first workflows and automation.';
    robots = 'noindex, nofollow';
  } else if (pathname === '/contact') {
    title = 'Contact Alivio Search Partners | Healthcare Recruiting Experts';
    description = 'Talk with Alivio Search Partners about healthcare recruiting strategy, candidate pipelines, and AI-enabled staffing support.';
  } else if (pathname === '/blog') {
    title = 'Healthcare Recruiting Insights | Alivio Search Partners Blog';
    description = 'Expert insights on healthcare recruiting, nursing shortage solutions, and AI-powered clinical staffing strategies.';
  } else if (pathname.startsWith('/blog/')) {
    title = 'Healthcare Recruiting Insights | Alivio Search Partners Blog';
    description = 'Explore expert content on healthcare recruiting, staffing operations, and talent acquisition performance.';
    keywords = `${DEFAULT_KEYWORDS}, healthcare recruiting blog, nurse hiring strategies`;
    if (location.search) robots = 'noindex, follow';
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
  } else if (pathname.startsWith('/onboarding') || pathname.startsWith('/dashboard') || pathname.startsWith('/crm') || pathname.startsWith('/pipeline') || pathname.startsWith('/roles') || pathname.startsWith('/outreach') || pathname.startsWith('/calls') || pathname.startsWith('/agents') || pathname.startsWith('/candidates') || pathname.startsWith('/settings') || pathname.startsWith('/admin')) {
    title = 'Alivio Platform | Healthcare Recruiting Workspace';
    description = 'Manage healthcare recruiting campaigns, role requirements, and clinician pipelines inside the Alivio platform.';
    robots = 'noindex, nofollow';
  } else if (pathname === '/og') {
    title = 'Alivio Open Graph Preview';
    description = 'Open Graph image generator for Alivio Search Partners.';
    robots = 'noindex, nofollow';
  }
  const structuredData: Record<string, unknown>[] = [{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonicalUrl, inLanguage: 'en-US' }];
  if (pathname === '/' || pathname === '/product') structuredData.push({ '@context': 'https://schema.org', '@type': 'Organization', name: 'Alivio Search Partners', url: SITE_URL, description: 'AI-powered recruitment infrastructure for healthcare and tech organizations', contactPoint: { '@type': 'ContactPoint', email: 'hello@aliviosearchpartners.com', contactType: 'sales' } });
  if (pathname === '/product') structuredData.push({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Alivio AI Candidate Engine', applicationCategory: 'BusinessApplication', description: 'AI-powered hiring system for healthcare and tech recruiting teams' });
  useSeo({ title, description, keywords, ogTitle: title, ogDescription: description, canonicalUrl, ogImage: DEFAULT_OG_IMAGE, ogType: pathname.startsWith('/blog/') ? 'article' : 'website', robots, structuredData });
  return null;
}

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-base)' }}>
          <div className="max-w-xl w-full rounded-xl border p-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h1 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Supabase environment not configured</h1>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{supabaseConfigError}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Create a local <code>.env</code> file from <code>.env.example</code>, then restart the dev server.</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SeoManager />
          <RouteErrorBoundary>
          <Suspense fallback={<div role="status" style={{ padding: '120px 24px', color: '#102344', background: '#fff', minHeight: '70vh' }}>Loading page…</div>}>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/developers" element={<DevelopersPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/careers/:id" element={<CareersJobPage />} />
              <Route path="/industries/:slug" element={<IndustriesPage />} />
              <Route path="/start" element={<StartPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
            </Route>
            <Route path="/pricing" element={<Navigate to="/product" replace />} />
            <Route path="/platform" element={<Navigate to="/product" replace />} />
            <Route path="/team/*" element={<Navigate to="/about" replace />} />
            <Route path="/case-studies/*" element={<Navigate to="/services" replace />} />
            <Route path="/industries/*" element={<Navigate to="/" replace />} />
            <Route path="/resources/*" element={<Navigate to="/blog" replace />} />
            <Route element={<RequireLoggedOut />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
            <Route path="/client/shortlist/:token" element={<ClientShortlistPage />} />
            <Route path="/client/report/:token" element={<ClientReportPage />} />
            <Route element={<RequireOnboarding />}>
              <Route path="/onboarding/org" element={<OnboardingOrgPage />} />
              <Route path="/onboarding/role" element={<OnboardingRolePage />} />
            </Route>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/pipeline" element={<Navigate to="/pipeline" replace />} />
              <Route path="/pipeline" element={<PipelineOverviewPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/roles/new" element={<RoleNewPage />} />
              <Route path="/roles/:id/pipeline" element={<PipelinePage />} />
              <Route path="/roles/:id/settings" element={<RoleSettingsPage />} />
              <Route path="/outreach" element={<OutreachPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/candidates/:id" element={<CandidatePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/calls" element={<CallsPage />} />
              <Route path="/tasks" element={<AdminTasksPage />} />
              <Route path="/shortlists" element={<ShortlistsPage />} />
              <Route path="/crm" element={<Navigate to="/dashboard/crm" replace />} />
              <Route path="/crm/templates" element={<Navigate to="/dashboard/crm/templates" replace />} />
              <Route path="/dashboard/crm" element={<CrmPage />} />
              <Route path="/dashboard/crm/templates" element={<CrmTemplatesPage />} />
              <Route path="/dashboard/crm/:id" element={<CrmClientPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/organizations" element={<AdminOrganizationsPage />} />
                <Route path="/admin/crm" element={<Navigate to="/dashboard/crm" replace />} />
                <Route path="/admin/blog" element={<AdminBlogPage />} />
                <Route path="/admin/blog/new" element={<AdminBlogEditorPage />} />
                <Route path="/admin/blog/:id/edit" element={<AdminBlogEditorPage />} />
                <Route path="/admin/ai-monitor" element={<AdminAiMonitorPage />} />
                <Route path="/admin/email-inbox" element={<EmailInboxPage />} />
                <Route path="/admin/emails" element={<Navigate to="/admin/email-inbox" replace />} />
                <Route path="/admin/tasks" element={<AdminTasksPage />} />
              <Route path="/admin/leads" element={<AdminLeadsPage />} />
                <Route path="/admin/system-check" element={<AdminSystemCheckPage />} />
              </Route>
            </Route>
            <Route path="/og" element={<OGImagePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
          </RouteErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
