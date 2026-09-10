import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import { isSupabaseConfigured, supabaseConfigError } from './lib/supabase';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import MarketingLayout from './components/marketing/MarketingLayout';
const AppLayout = lazy(() => import('./components/app/AppLayout'));

import HomePage from './pages/marketing/HomePage';
const LatamPage = lazy(() => import('./pages/marketing/LatamPage'));
const MedellinPage = lazy(() => import('./pages/marketing/MedellinPage'));
const WestchesterPage = lazy(() => import('./pages/marketing/WestchesterPage'));
const EmployersPage = lazy(() => import('./pages/marketing/EmployersPage'));
const CandidatesPage = lazy(() => import('./pages/marketing/CandidatesPage'));
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
const ApplicationsPage = lazy(() => import('./pages/app/ApplicationsPage'));
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
import { getPageSeo } from './lib/pageSeo';

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

function SeoManager() {
  const { pathname, search } = useLocation();
  // Article metadata is owned by the current article, including SSR hydration.
  return /^\/blog\/[^/]+\/?$/.test(pathname) ? null : <DefaultRouteSeo pathname={pathname} search={search} />;
}

function DefaultRouteSeo({ pathname, search }: { pathname: string; search: string }) {
  useSeo(getPageSeo(pathname, search));
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
              <Route path="/nearshore-latam-recruiting" element={<LatamPage />} />
              <Route path="/recruiting-agency-medellin" element={<MedellinPage />} />
              <Route path="/pricing" element={<Navigate to="/employers#engagement-models" replace />} />
              <Route path="/recruiting-agency-westchester" element={<WestchesterPage />} />
              <Route path="/product" element={<Navigate to="/employers" replace />} />
              <Route path="/employers" element={<EmployersPage />} />
              <Route path="/candidates" element={<CandidatesPage />} />
              <Route path="/industries" element={<IndustriesPage />} />
              <Route path="/jobs" element={<CareersPage />} />
              <Route path="/developers" element={<DevelopersPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/careers" element={<Navigate to="/jobs" replace />} />
              <Route path="/careers/:id" element={<CareersJobPage />} />
              <Route path="/industries/:slug" element={<IndustriesPage />} />
              <Route path="/start" element={<StartPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
            </Route>
            <Route path="/nearshore-latam-talent" element={<Navigate to="/nearshore-latam-recruiting" replace />} />
            <Route path="/recruiters-ny-medellin" element={<Navigate to="/recruiting-agency-medellin" replace />} />
            <Route path="/platform" element={<Navigate to="/employers" replace />} />
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
              <Route path="/applications" element={<ApplicationsPage />} />
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
