import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { authService } from '../../services/supabaseAuth';
import {
  Sparkles, Mail, Lock, Eye, EyeOff,
  ArrowRight, AlertTriangle, RefreshCw
} from 'lucide-react';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { initApp } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingVerificationBanner, setPendingVerificationBanner] = useState(false);

  const validateEmail = (str) => /\S+@\S+\.\S+/.test(str);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg('');
    setPendingVerificationBanner(false);

    if (!email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authService.signIn({ email, password });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      // Refresh Zustand store (sets currentUser, role, favorites, etc.)
      await initApp();
      const profile = data.profile || data;

      if (profile.role === 'owner' && profile.verification_status === 'pending') {
        setPendingVerificationBanner(true);
        setIsLoading(false);
        setTimeout(() => navigate('/owner/dashboard'), 3000);
        return;
      }

      const searchParams = new URLSearchParams(location.search);
      const redirectTo = searchParams.get('redirect');

      setIsLoading(false);
      if (redirectTo) {
        navigate(redirectTo);
      } else if (profile.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (profile.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error('SignIn exception:', err);
      setErrorMsg('An unexpected authentication error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F8F5ED] py-12 px-4 sm:px-6 lg:px-8 text-left animate-fade-in">

      <div className="max-w-5xl w-full bg-white border border-[#d4af37]/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">

        {/* Left column – decorative */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#0a0e1a] via-[#121826] to-[#0a0e1a] border-r border-gold/10 p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-gold/5 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-gold/5 blur-3xl"></div>

          <div className="flex items-center gap-2 relative z-10">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-gold animate-pulse" />
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

          <div className="text-xs text-slate-500 font-semibold relative z-10 border-t border-white/5 pt-6">
            © {new Date().getFullYear()} Nestly Inc. Developed for startup speed.
          </div>
        </div>

        {/* Right column – form */}
        <div className="flex-1 p-8 sm:p-12 bg-white flex flex-col justify-center relative">

          {pendingVerificationBanner && (
            <div className="mb-6 p-4 bg-gold/10 border border-gold/20 text-gold rounded-2xl flex gap-3 items-start animate-pulse text-xs font-semibold">
              <AlertTriangle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Your owner account is awaiting verification.</p>
                <p className="opacity-90 mt-0.5">Property publishing will be available after approvals. Redirecting you to owner panel…</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400 font-semibold">Sign in to continue your AI-powered property search.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSignIn} noValidate>

            {errorMsg && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
                <input
                  type="email"
                  id="signin-email"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gowtham@example.com"
                  className="w-full bg-white border border-[#E8E1D5] rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#d4af37] text-[#2D2A26] placeholder-[#9A948A]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <label className="text-slate-400 uppercase tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-gold hover:underline lowercase">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signin-password"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#E8E1D5] rounded-xl py-3 pl-11 pr-11 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#d4af37] text-[#2D2A26] placeholder-[#9A948A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-400 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="rounded border-white/10 text-gold h-4.5 w-4.5 cursor-pointer bg-white/5 accent-gold"
              />
              Keep me signed in
            </label>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                id="signin-submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-gold to-luxury-gold-dark hover:opacity-95 disabled:bg-slate-700 disabled:opacity-60 text-[#0a0e1a] text-xs font-black tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-[#0a0e1a]" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-8 border-t border-white/5 mt-8 text-xs font-semibold text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-gold hover:underline font-bold">
              Create Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
