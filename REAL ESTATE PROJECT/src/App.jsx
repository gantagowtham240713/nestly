import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import SearchResults from './pages/SearchResults';
import PropertyDetails from './pages/PropertyDetails';
import ComparePage from './pages/ComparePage';
import AffordabilityCalculatorPage from './pages/AffordabilityCalculatorPage';
import SavedPropertiesPage from './pages/SavedPropertiesPage';
import ChatsPage from './pages/ChatsPage';
import Profile from './pages/Profile';

// Auth Pages
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import EmailVerification from './pages/auth/EmailVerification';
import CompleteProfile from './pages/auth/CompleteProfile';

// Dashboards
import DashboardUser from './pages/DashboardUser';
import DashboardOwner from './pages/DashboardOwner';
import DashboardAdmin from './pages/DashboardAdmin';

// ScrollToTop utility that triggers on page changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

import { useAppStore } from './store/useAppStore';

export default function App() {
  const initApp = useAppStore(state => state.initApp);

  useEffect(() => {
    initApp();
  }, [initApp]);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 w-full">
        {/* Scroll helper */}
        <ScrollToTop />

        {/* Global Navbar */}
        <Navbar />

        {/* Main Routes Sandbox */}
        <main className="flex-grow w-full">
          <Routes>
            {/* Core Listing Views */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/calculator" element={<AffordabilityCalculatorPage />} />
            <Route path="/saved" element={<SavedPropertiesPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/profile" element={<Profile />} />

            {/* Premium Auth Routing */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/auth" element={<SignIn />} /> {/* fallback */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />

            {/* Dashboard Redirect Portals */}
            <Route path="/dashboard" element={<DashboardUser />} />
            <Route path="/owner/dashboard" element={<DashboardOwner />} />
            <Route path="/dashboard-owner" element={<DashboardOwner />} /> {/* fallback */}
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/dashboard-admin" element={<DashboardAdmin />} /> {/* fallback */}
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
