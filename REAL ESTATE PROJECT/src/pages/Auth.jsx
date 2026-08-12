import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

import CitySelector from '../components/CitySelector';

export default function Auth() {
  const navigate = useNavigate();
  const { setRole } = useAppStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [roleType, setRoleType] = useState("user"); // 'user' | 'owner'

  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    // Simulate Auth
    setSuccessMsg(isSignUp ? "Account Created! Logging you in..." : "Logged in successfully!");
    
    // Switch role in state if requested
    setRole(roleType);

    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F8F5ED] py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-white border border-[#E8E1D5] p-8 sm:p-10 rounded-3xl shadow-xl shadow-[#d4af37]/5 relative overflow-hidden text-left">
        {/* Glow Spheres */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#d4af37]/5 blur-2xl"></div>

        <div className="text-center space-y-2 relative z-10">
          <div className="h-12 w-12 rounded-2xl gradient-bg-ai flex items-center justify-center text-white shadow-md shadow-blue-500/20 mx-auto mb-4">
            <Sparkles className="h-6 w-6 animate-pulse-slow" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-[#2D2A26] tracking-tight">
            {isSignUp ? 'Create your Nestly account' : 'Sign in to Nestly'}
          </h2>
          <p className="text-xs text-[#6F6A61] font-semibold leading-relaxed">
            {isSignUp 
              ? 'Join thousands of house hunters leveraging AI-powered searches.' 
              : 'Access your favorited flats, messages, and calculator records.'
            }
          </p>
        </div>

        {successMsg ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2 animate-bounce">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6F6A61] uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#9A948A]" />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Gowtham"
                      className="w-full border border-[#E8E1D5] rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-[#2D2A26] placeholder-[#9A948A] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6F6A61] uppercase tracking-wide">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#9A948A]" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gowtham@example.com"
                    className="w-full border border-[#E8E1D5] rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-[#2D2A26] placeholder-[#9A948A] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6F6A61] uppercase tracking-wide block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#9A948A]" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-[#E8E1D5] rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-[#2D2A26] placeholder-[#9A948A] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6F6A61] uppercase tracking-wide block">City</label>
                  <CitySelector 
                    id="auth-signup-city"
                    value={city}
                    onChange={(val) => setCity(val)}
                  />
                </div>
              )}

              {isSignUp && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-[#6F6A61] uppercase tracking-wide block">Are you a Home Seeker or Owner?</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-[#F8F5ED] text-xs font-bold select-none ${
                      roleType === 'user' ? 'border-[#d4af37] bg-[#d4af37]/5 text-[#b8962e]' : 'border-[#E8E1D5] text-[#6F6A61]'
                    }`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="user" 
                        checked={roleType === 'user'} 
                        onChange={() => setRoleType('user')}
                        className="text-[#d4af37] focus:ring-[#d4af37] h-4 w-4 cursor-pointer accent-[#d4af37]" 
                      />
                      Home Seeker
                    </label>
                    <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-[#F8F5ED] text-xs font-bold select-none ${
                      roleType === 'owner' ? 'border-emerald-500 bg-emerald-50/20 text-emerald-700' : 'border-[#E8E1D5] text-[#6F6A61]'
                    }`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="owner" 
                        checked={roleType === 'owner'} 
                        onChange={() => setRoleType('owner')}
                        className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer" 
                      />
                      Owner / Broker
                    </label>
                  </div>
                </div>
              )}

            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-white text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-1.5 hover:opacity-95"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-[#E8E1D5] text-xs font-semibold text-[#6F6A61]">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsSignUp(false)} className="text-[#d4af37] hover:underline font-bold">
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setIsSignUp(true)} className="text-[#d4af37] hover:underline font-bold">
                Create one now
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
