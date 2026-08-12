import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { authService } from '../../services/supabaseAuth';
import { ChevronLeft, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';

const RESEND_COOLDOWN_SECONDS = 60;

export default function EmailVerification() {
  const navigate = useNavigate();
  const { setRole } = useAppStore();

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer — counts down every second
  const cooldownRef = useRef(null);

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    cooldownRef.current = setTimeout(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(cooldownRef.current);
  }, [resendCooldown]);

  // Read pending user — never triggers API calls
  const pendingUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('hm_pending_verify_user') || 'null');
    } catch {
      return null;
    }
  })();

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (isVerifying || isResending) return; // Prevent double-click
    if (otp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit code.');
      return;
    }

    const targetEmail = pendingUser?.email;
    if (!targetEmail) {
      setErrorMsg('No pending registration session found. Please sign up again.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await authService.verifyOtp({ email: targetEmail, token: otp });

      if (error) {
        setErrorMsg(error.message);
        setIsVerifying(false);
        return;
      }

      setSuccessMsg('Email verified! Signing you in…');
      setRole(data.role);
      setIsVerifying(false);

      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      console.error('verifyOtp exception:', err);
      setErrorMsg('Failed to verify the code. Please try again.');
      setIsVerifying(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  // Only called manually by the user. Never called automatically.
  const handleResend = async () => {
    if (isVerifying || isResending || resendCooldown > 0) return;

    const targetEmail = pendingUser?.email;
    if (!targetEmail) {
      setErrorMsg('No pending session found. Please sign up again.');
      return;
    }

    setIsResending(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await authService.resendOtp(targetEmail);

      if (error) {
        if (error.rate_limit) {
          setErrorMsg('Too many verification emails were requested. Please wait a while before requesting another OTP.');
        } else {
          setErrorMsg(error.message);
        }
        setIsResending(false);
        return;
      }

      setSuccessMsg('A new verification code has been sent to your email.');
      startCooldown();
      setIsResending(false);
    } catch (err) {
      console.error('resendOtp exception:', err);
      setErrorMsg('Failed to resend the code. Please try again later.');
      setIsResending(false);
    }
  };

  const isBusy = isVerifying || isResending;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F8F5ED] py-12 px-4 sm:px-6 lg:px-8 text-left animate-fade-in">

      <div className="max-w-md w-full bg-white border border-[#d4af37]/15 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">

        {/* Glow */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gold/5 blur-2xl"></div>

        {/* Back link */}
        <Link
          to="/signin"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Login
        </Link>

        <div className="space-y-6">

          {/* Icon + heading */}
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-gold/10 border-2 border-gold/20 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-gold animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">Verify Your Email</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-xs mx-auto text-center">
                We sent a 6-digit verification code to{' '}
                <strong className="text-gold">{pendingUser?.email || 'your registered email'}</strong>.
                {' '}Enter it below to activate your account.
              </p>
            </div>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* Success message */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* OTP form */}
          <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                id="otp-input"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                disabled={isBusy}
                onChange={(e) => {
                  // Accept only digits
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setErrorMsg('');
                }}
                placeholder="000000"
                autoComplete="one-time-code"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 text-center text-2xl font-black focus:outline-none focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-slate-700 tracking-[0.25em]"
              />
            </div>

            <button
              type="submit"
              id="otp-verify-btn"
              disabled={isBusy || otp.length !== 6}
              className="w-full py-3.5 bg-gradient-to-r from-gold to-luxury-gold-dark hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0e1a] text-xs font-black tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              id="otp-resend-btn"
              onClick={handleResend}
              disabled={isBusy || resendCooldown > 0}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending new code…
                </>
              ) : resendCooldown > 0 ? (
                `Resend OTP (${resendCooldown}s)`
              ) : (
                'Resend OTP'
              )}
            </button>
            <p className="text-center text-[10px] text-slate-600 font-semibold pt-1">
              You can request a new code once every {RESEND_COOLDOWN_SECONDS} seconds.
            </p>
          </div>

          <p className="text-[10px] text-slate-500 font-semibold text-center leading-normal pt-2 border-t border-white/5">
            Didn't receive the email? Check your spam/junk folder, or click Resend OTP above.
          </p>

        </div>
      </div>
    </div>
  );
}
