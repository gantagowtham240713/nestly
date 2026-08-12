import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Mail } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F8F5ED] py-12 px-4 sm:px-6 lg:px-8 text-left animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-white border border-[#d4af37]/15 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden text-center">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gold/5 blur-2xl"></div>

        {/* Brand Logo & Taglines */}
        <div className="space-y-4 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-gold to-luxury-gold-dark flex items-center justify-center text-[#0a0e1a] shadow-lg shadow-gold/20 mx-auto">
            <Sparkles className="h-8 w-8 animate-pulse-slow" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display font-extrabold text-3xl tracking-tight text-[#2D2A26]">
              Nestly
            </h1>
            <h2 className="font-display font-bold text-lg text-[#2D2A26]">
              Welcome to Nestly
            </h2>
            <p className="text-xs text-[#6F6A61] font-semibold leading-relaxed max-w-xs mx-auto">
              Find a place that feels like home. Sign in or create an account to get started.
            </p>
          </div>
        </div>

        {/* Email notice badge */}
        <div className="flex items-center justify-center gap-2 bg-gold/5 border border-gold/15 rounded-xl px-4 py-2.5 relative z-10">
          <Mail className="h-3.5 w-3.5 text-gold shrink-0" />
          <span className="text-[10px] text-[#6F6A61] font-semibold">Sign up with your email — a verification code will be sent</span>
        </div>

        {/* Authentication Choices */}
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <button
            onClick={() => navigate('/signin')}
            className="py-3.5 bg-gradient-to-r from-gold to-luxury-gold-dark hover:opacity-95 text-[#0a0e1a] text-xs font-bold tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            Sign In
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="py-3.5 bg-[#F8F5ED] border border-[#E8E1D5] hover:bg-[#F3EDE0] text-[#2D2A26] text-xs font-bold tracking-wider uppercase rounded-xl transition"
          >
            Sign Up
          </button>
        </div>

        <p className="text-[10px] text-slate-600 font-semibold relative z-10">
          © {new Date().getFullYear()} Nestly Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}
