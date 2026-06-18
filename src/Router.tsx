import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { UserRole } from './types';

import AppLayout from './components/AppLayout';

// Public pages
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import AthletePublicProfilePage from './pages/AthletePublicProfilePage';
import CoachPublicProfilePage from './pages/CoachPublicProfilePage';
import ClubPublicProfilePage from './pages/ClubPublicProfilePage';
import ScoutPublicProfilePage from './pages/ScoutPublicProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import AthletesPage from './pages/AthletesPage';
import ClubsPage from './pages/ClubsPage';
import HighlightsPage from './pages/HighlightsPage';
import PlansPage from './pages/PlansPage';
import ResourcesPage from './pages/ResourcesPage';
import AboutPage from './pages/AboutPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import ClubLoginPage from './pages/auth/ClubLoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/auth/OnboardingPage';

// Athlete
import AthleteDashboard from './pages/athlete/DashboardPage';
import AthleteProfile from './pages/athlete/ProfilePage';
import AthleteMedia from './pages/athlete/MediaPage';
import AthletePerformance from './pages/athlete/PerformancePage';
import AthleteMedical from './pages/athlete/MedicalPage';
import AthleteAi from './pages/athlete/AiPage';
import AthleteCareer from './pages/athlete/CareerPage';
import AthleteMessages from './pages/athlete/MessagesPage';
import AthleteNetwork from './pages/athlete/NetworkPage';
import AthleteSettings from './pages/athlete/SettingsPage';
import AthleteOpportunities from './pages/athlete/OpportunitiesPage';
import AthleteAnalytics from './pages/athlete/AnalyticsPage';
import AthleteEvents from './pages/athlete/EventsPage';

// Recruiter
import RecruiterDashboard from './pages/recruiter/DashboardPage';
import RecruiterSearch from './pages/recruiter/SearchPage';
import RecruiterWatchlists from './pages/recruiter/WatchlistsPage';
import RecruiterAnalytics from './pages/recruiter/AnalyticsPage';
import RecruiterMessages from './pages/recruiter/MessagesPage';
import RecruiterSettings from './pages/recruiter/SettingsPage';

// Club
import ClubDashboard from './pages/club/DashboardPage';
import ClubSquad from './pages/club/SquadPage';
import ClubTrials from './pages/club/TrialsPage';
import ClubSearch from './pages/club/SearchPage';
import ClubAnalytics from './pages/club/AnalyticsPage';
import ClubMessages from './pages/club/MessagesPage';
import ClubSettings from './pages/club/SettingsPage';
import ClubVerifyPerformance from './pages/club/VerifyPerformancePage';

// Partner
import PartnerDashboard from './pages/partner/DashboardPage';
import PartnerInbox from './pages/partner/VerificationInboxPage';
import PartnerRequestDetail from './pages/partner/RequestDetailPage';
import PartnerRecords from './pages/partner/AthletesPage';
import PartnerClearances from './pages/partner/ClearancesPage';
import PartnerInjuries from './pages/partner/InjuriesPage';
import PartnerBookings from './pages/partner/BookingsPage';
import PartnerAnalytics from './pages/partner/AnalyticsPage';
import PartnerClinic from './pages/partner/ClinicProfilePage';

// Admin
import AdminDashboard from './pages/admin/DashboardPage';
import AdminUsers from './pages/admin/UsersPage';
import AdminVerification from './pages/admin/VerificationPage';
import AdminAnalytics from './pages/admin/AnalyticsPage';
import AdminSports from './pages/admin/SportsPage';
import AdminLeagues from './pages/admin/LeaguesPage';

function RoleRedirect() {
  const { role } = useAuth();
  if (role === 'athlete') return <Navigate to="/athlete/dashboard" replace />;
  if (role === 'scout') return <Navigate to="/recruiter/dashboard" replace />;
  if (role === 'club') return <Navigate to="/club/dashboard" replace />;
  if (role === 'medical_partner') return <Navigate to="/partner/dashboard" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/" replace />;
}

function RequireAuth({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-azure border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/athletes/:id" element={<AthletePublicProfilePage />} />
        <Route path="/coaches/:id" element={<CoachPublicProfilePage />} />
        <Route path="/clubs/:id" element={<ClubPublicProfilePage />} />
        <Route path="/scouts/:id" element={<ScoutPublicProfilePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/athletes" element={<AthletesPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/highlights" element={<HighlightsPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Auth */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/club-login" element={<ClubLoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/onboarding" element={<OnboardingPage />} />

        {/* Role-based redirect */}
        <Route path="/dashboard" element={<RequireAuth><RoleRedirect /></RequireAuth>} />

        {/* Athlete routes */}
        <Route path="/athlete" element={<RequireAuth allowedRoles={['athlete']}><AppLayout /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AthleteDashboard />} />
          <Route path="feed" element={<FeedPage hideHeader />} />
          <Route path="profile" element={<AthleteProfile />} />
          <Route path="media" element={<AthleteMedia />} />
          <Route path="performance" element={<AthletePerformance />} />
          <Route path="medical" element={<AthleteMedical />} />
          <Route path="ai" element={<AthleteAi />} />
          <Route path="career" element={<AthleteCareer />} />
          <Route path="events" element={<AthleteEvents />} />
          <Route path="messages" element={<AthleteMessages />} />
          <Route path="network" element={<AthleteNetwork />} />
          <Route path="opportunities" element={<AthleteOpportunities />} />
          <Route path="analytics" element={<AthleteAnalytics />} />
          <Route path="settings" element={<AthleteSettings />} />
          {/* Profile viewing within athlete portal */}
          <Route path="athletes/:id" element={<AthletePublicProfilePage hideHeader />} />
          <Route path="clubs/:id" element={<ClubPublicProfilePage hideHeader />} />
          <Route path="scouts/:id" element={<ScoutPublicProfilePage hideHeader />} />
          <Route path="coaches/:id" element={<CoachPublicProfilePage hideHeader />} />
        </Route>

        {/* Recruiter routes (scout only) */}
        <Route path="/recruiter" element={<RequireAuth allowedRoles={['scout']}><AppLayout /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="feed" element={<FeedPage hideHeader />} />
          <Route path="discover" element={<DiscoverPage hideHeader />} />
          <Route path="search" element={<RecruiterSearch />} />
          <Route path="watchlists" element={<RecruiterWatchlists />} />
          <Route path="analytics" element={<RecruiterAnalytics />} />
          <Route path="messages" element={<RecruiterMessages />} />
          <Route path="settings" element={<RecruiterSettings />} />
          {/* Profile viewing within recruiter portal */}
          <Route path="athletes/:id" element={<AthletePublicProfilePage hideHeader />} />
          <Route path="clubs/:id" element={<ClubPublicProfilePage hideHeader />} />
          <Route path="scouts/:id" element={<ScoutPublicProfilePage hideHeader />} />
          <Route path="coaches/:id" element={<CoachPublicProfilePage hideHeader />} />
        </Route>

        {/* Club routes */}
        <Route path="/club" element={<RequireAuth allowedRoles={['club']}><AppLayout /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClubDashboard />} />
          <Route path="feed" element={<FeedPage hideHeader />} />
          <Route path="squad" element={<ClubSquad />} />
          <Route path="trials" element={<ClubTrials />} />
          <Route path="search" element={<ClubSearch />} />
          <Route path="analytics" element={<ClubAnalytics />} />
          <Route path="messages" element={<ClubMessages />} />
          <Route path="settings" element={<ClubSettings />} />
          <Route path="verify-performance/:requestId" element={<ClubVerifyPerformance />} />
          <Route path="athletes/:id" element={<AthletePublicProfilePage hideHeader />} />
          <Route path="clubs/:id" element={<ClubPublicProfilePage hideHeader />} />
          <Route path="scouts/:id" element={<ScoutPublicProfilePage hideHeader />} />
          <Route path="coaches/:id" element={<CoachPublicProfilePage hideHeader />} />
        </Route>

        {/* Partner routes */}
        <Route path="/partner" element={<RequireAuth allowedRoles={['medical_partner']}><AppLayout /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PartnerDashboard />} />
          <Route path="inbox" element={<PartnerInbox />} />
          <Route path="inbox/:id" element={<PartnerRequestDetail />} />
          <Route path="records" element={<PartnerRecords />} />
          <Route path="clearances" element={<PartnerClearances />} />
          <Route path="injuries" element={<PartnerInjuries />} />
          <Route path="bookings" element={<PartnerBookings />} />
          <Route path="analytics" element={<PartnerAnalytics />} />
          <Route path="clinic" element={<PartnerClinic />} />
          <Route path="settings" element={<AthleteSettings />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<RequireAuth allowedRoles={['admin']}><AppLayout /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="verification" element={<AdminVerification />} />
          <Route path="sports" element={<AdminSports />} />
          <Route path="leagues" element={<AdminLeagues />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AthleteSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
