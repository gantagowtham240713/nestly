import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { authService } from '../../services/supabaseAuth';
import { 
  Sparkles, Mail, Lock, Eye, EyeOff, 
  ArrowRight, ShieldCheck, RefreshCw, AlertTriangle
} from 'lucide-react';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setRole } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingVerificationBanner, setPendingVerificationBanner] = useState(false);

  const validateEmail = (emailStr) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setPendingVerificationBanner(false);

    if (!email) {
      setErrorMsg("Email address is required.");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Password is required.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authService.signIn({ email, password });
      
      if (error) {
        if (error.email_unverified) {
          // Redirect to verify-email
          navigate('/verify-email');
        } else {
          setErrorMsg(error.message);
        }
        setIsLoading(false);
        return;
      }

      // Successful login
      const profile = data.profile || data;
      setRole(profile.role);

      // Check owner status
      if (profile.role === 'owner' && profile.verification_status === 'pending') {
        setPendingVerificationBanner(true);
        setIsLoading(false);
        // Wait and route
        setTimeout(() => {
          navigate('/owner/dashboard');
        }, 3000);
        return;
      }

      // Role redirection router
      const searchParams = new URLSearchParams(location.search);
      const redirectTo = searchParams.get('redirect');

      setTimeout(() => {
        if (redirectTo) {
          navigate(redirectTo);
        } else if (profile.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (profile.role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 500);

    } catch (err) {
      setErrorMsg("An unexpected authentication error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left animate-fade-in">
      
      {/* Centered Auth Card Container */}
      <div className="max-w-5xl w-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left column (Desktop illustrations) */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 p-12 text-white flex-col justify-between relative overflow-hidden">
          {/* Glowing layout art */}
          <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl"></div>

          <div className="flex items-center gap-2 relative z-10">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-orange-400" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Nestly</span>
          </div>

          <div className="space-y-4 relative z-10">
            <h3 className="font-display font-extrabold text-3xl leading-tight">
              Unlock the power of Conversational House Hunting.
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold leading-relaxed">
              Log in to save lists, compare floor specs, and communicate directly with verified property owners using automated chat assistance.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold relative z-10 border-t border-slate-800 pt-6">
            © {new Date().getFullYear()} Nestly Inc. Developed for startup speed.
          </div>
        </div>

        {/* Right column (Login fields form) */}
        <div className="flex-1 p-8 sm:p-12 bg-white flex flex-col justify-center relative">
          
          {/* Pending verification message alert banner */}
          {pendingVerificationBanner && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl flex gap-3 items-start animate-pulse text-xs font-semibold">
              <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Your owner account is awaiting verification.</p>
                <p className="opacity-90 mt-0.5">Property publishing will be available after approvals. Redirecting you to owner panel...</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400 font-semibold">Sign in to continue your AI-powered property search.</p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSignIn}>
            
            {/* Error notifications */}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gowtham@example.com"
                  className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <label className="text-slate-500 uppercase tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-primary hover:underline lowercase">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-500 select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="rounded border-slate-300 text-primary h-4.5 w-4.5 cursor-pointer"
              />
              Keep me signed in
            </label>

            {/* Submit buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Authenticating
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setRole('user');
                    navigate('/dashboard');
                  }, 800);
                }}
                className="w-full py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-2"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>

          </form>

          {/* Create account trigger */}
          <div className="text-center pt-8 border-t border-slate-100 mt-8 text-xs font-semibold text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-bold">
              Create Account
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
