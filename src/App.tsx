import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import MarketingLayout from './components/marketing/MarketingLayout';
import AppLayout from './components/app/AppLayout';

import HomePage from './pages/marketing/HomePage';
import ProductPage from './pages/marketing/ProductPage';
import PricingPage from './pages/marketing/PricingPage';
import DevelopersPage from './pages/marketing/DevelopersPage';
import AboutPage from './pages/marketing/AboutPage';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

import OnboardingOrgPage from './pages/app/OnboardingOrgPage';
import OnboardingRolePage from './pages/app/OnboardingRolePage';
import NotFoundPage from './pages/NotFoundPage';
import OGImagePage from './pages/OGImagePage';

import DashboardPage from './pages/app/DashboardPage';
import RolesPage from './pages/app/RolesPage';
import RoleNewPage from './pages/app/RoleNewPage';
import PipelinePage from './pages/app/PipelinePage';
import PipelineOverviewPage from './pages/app/PipelineOverviewPage';
import OutreachPage from './pages/app/OutreachPage';
import AgentsPage from './pages/app/AgentsPage';
import CandidatePage from './pages/app/CandidatePage';
import RoleSettingsPage from './pages/app/RoleSettingsPage';
import SettingsPage from './pages/app/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/developers" element={<DevelopersPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/onboarding" element={<OnboardingOrgPage />} />
          <Route path="/onboarding/first-role" element={<OnboardingRolePage />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pipeline" element={<PipelineOverviewPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/roles/new" element={<RoleNewPage />} />
            <Route path="/roles/:id/pipeline" element={<PipelinePage />} />
            <Route path="/roles/:id/settings" element={<RoleSettingsPage />} />
            <Route path="/outreach" element={<OutreachPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/candidates/:id" element={<CandidatePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="/og" element={<OGImagePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}
