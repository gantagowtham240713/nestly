import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/supabaseAuth';
import { Sparkles, Mail, ArrowRight, ShieldCheck, RefreshCw, ChevronLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successSent, setSuccessSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authService.requestPasswordReset(email);
      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      setSuccessSent(true);
      setIsLoading(false);
    } catch (err) {
      setErrorMsg("Failed to initiate password reset.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left animate-fade-in">
      
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 sm:p-10 rounded-3xl shadow-xl shadow-blue-500/5 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl"></div>

        {/* Back Link */}
        <Link 
          to="/signin" 
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-800 transition mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Sign In
        </Link>

        {successSent ? (
          /* Success Screen */
          <div className="space-y-6 text-center py-4">
            <div className="h-16 w-16 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <ShieldCheck className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-xl text-slate-800">Check Your Inbox</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-xs mx-auto">
                A password reset link has been successfully sent to <strong className="text-slate-700">{email}</strong>.
              </p>
            </div>

            <p className="text-[11px] text-slate-400 font-semibold leading-normal">
              Didn't receive the email? Check spam folders or try requesting another link.
            </p>
          </div>
        ) : (
          /* Form Screen */
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-2xl text-slate-800 tracking-tight">Forgot Password</h2>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Enter your email address and we'll send you an link to reset your account credentials.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending link
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
