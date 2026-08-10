import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/supabaseAuth';
import { useAppStore } from '../../store/useAppStore';
import { Mail, RefreshCw, ChevronLeft, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';

export default function EmailVerification() {
  const navigate = useNavigate();
  const { setRole } = useAppStore();

  const [pendingUser, setPendingUser] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Retrieve pending verification user session
  useEffect(() => {
    const data = localStorage.getItem('hm_pending_verify_user');
    if (data) {
      setPendingUser(JSON.parse(data));
    }
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const targetEmail = pendingUser?.email || "your email address";

    try {
      const { error } = await authService.resendVerificationEmail(targetEmail);
      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      setSuccessMsg("Verification email resent successfully!");
      setResendCooldown(60);
      setIsLoading(false);
    } catch (err) {
      setErrorMsg("Failed to resend verification link.");
      setIsLoading(false);
    }
  };

  // Mock Mode: Simulates verification approval
  const handleSimulateVerification = () => {
    if (!pendingUser) {
      setErrorMsg("No pending user session found to verify.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Approve mock email verified state
      authService.mockVerifyEmail(pendingUser.id);
      
      // Save active session
      localStorage.setItem('hm_session_user', JSON.stringify({
        ...pendingUser,
        email_verified: true
      }));

      setRole(pendingUser.role);
      setSuccessMsg("Email successfully verified! Redirecting you to complete your profile...");
      setIsLoading(false);

      setTimeout(() => {
        navigate('/complete-profile');
      }, 1500);
    }, 1200);
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left animate-fade-in">
      
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 sm:p-10 rounded-3xl shadow-xl shadow-blue-500/5 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl"></div>

        {/* Back link */}
        <Link 
          to="/signin" 
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-800 transition mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Login
        </Link>

        <div className="space-y-6">
          
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-blue-50 border-2 border-blue-100 text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Mail className="h-8 w-8 text-primary animate-pulse-slow" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-2xl text-slate-800 tracking-tight">Verify Your Email</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-xs mx-auto">
                We have sent a verification link to <strong className="text-slate-700">{pendingUser?.email || "your registered email"}</strong>.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-bounce">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleResend}
              disabled={isLoading || resendCooldown > 0}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Requesting link
                </>
              ) : (
                <>
                  {resendCooldown > 0 ? `Resend Link (${resendCooldown}s)` : 'Resend Email'}
                </>
              )}
            </button>

            {/* MOCK MODE SIMULATION TRIGGER */}
            <button
              onClick={handleSimulateVerification}
              disabled={isLoading}
              className="w-full py-3.5 bg-orange-50 hover:bg-orange-100 border-2 border-dashed border-orange-300 text-orange-800 text-xs font-bold tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-orange-500" />
              Simulate Email Verification
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-semibold text-center leading-normal pt-2 border-t border-slate-100">
            Please click on the link inside the email to complete the registration. If you did not register for this service, ignore the email.
          </p>

        </div>

      </div>

    </div>
  );
}
