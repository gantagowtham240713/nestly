import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Welcome from './pages/auth/Welcome';

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
  const { currentUser, initApp } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initApp();
      setLoading(false);
    };
    init();
  }, [initApp]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 w-full">
        {/* Scroll helper */}
        <ScrollToTop />

        {/* Global Navbar - only visible when logged in */}
        {currentUser && <Navbar />}

        {/* Main Routes Sandbox */}
        <main className="flex-grow w-full">
          <Routes>
            {!currentUser ? (
              // Unauthenticated routes
              <>
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/welcome" replace />} />
              </>
            ) : (
              // Authenticated routes
              <>
                <Route path="/" element={<LandingPage />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/calculator" element={<AffordabilityCalculatorPage />} />
                <Route path="/saved" element={<SavedPropertiesPage />} />
                <Route path="/chats" element={<ChatsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<DashboardUser />} />
                <Route path="/owner/dashboard" element={<DashboardOwner />} />
                <Route path="/dashboard-owner" element={<DashboardOwner />} />
                <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                <Route path="/dashboard-admin" element={<DashboardAdmin />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                
                {/* Redirect auth routes to home when logged in */}
                <Route path="/welcome" element={<Navigate to="/" replace />} />
                <Route path="/signin" element={<Navigate to="/" replace />} />
                <Route path="/signup" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>

        {/* Global Footer - only visible when logged in */}
        {currentUser && <Footer />}
      </div>
    </BrowserRouter>
  );
}
