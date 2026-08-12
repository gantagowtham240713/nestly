import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/supabaseAuth';
import { useAppStore } from '../../store/useAppStore';
import {
  Sparkles, Mail, Lock, User, Phone, Globe,
  MapPin, FileText, RefreshCw, ChevronLeft
} from 'lucide-react';

import CitySelector from '../../components/CitySelector';

export default function SignUp() {
  const navigate = useNavigate();
  const { initApp } = useAppStore();

  const selectedRole = 'user'; // Always register as user
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      city: 'Hyderabad',
      language: 'English'
    }
  });

  const selectedCity = watch('city');

  // Password strength
  const passwordStrength = useMemo(() => {
    if (!tempPassword) return { score: 0, label: 'Empty', color: 'bg-slate-200', barWidth: 'w-0' };
    let met = 0;
    if (tempPassword.length >= 8) met++;
    if (/[A-Z]/.test(tempPassword)) met++;
    if (/[a-z]/.test(tempPassword)) met++;
    if (/[0-9]/.test(tempPassword)) met++;
    if (/[^A-Za-z0-9]/.test(tempPassword)) met++;

    if (met >= 5) return { score: met, label: 'Strong', color: 'bg-emerald-500', barWidth: 'w-full' };
    if (met >= 3) return { score: met, label: 'Medium', color: 'bg-orange-500', barWidth: 'w-2/3' };
    return { score: met, label: 'Weak', color: 'bg-red-500', barWidth: 'w-1/3' };
  }, [tempPassword]);

  const onSubmit = async (data) => {
    // Guard: prevent double-submission
    if (isLoading) return;

    setErrorMsg('');

    // Client-side validation
    if (!data.fullName || !data.email || !data.password || !data.confirmPassword || !data.phone) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (data.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (data.password !== data.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (passwordStrength.score < 3) {
      setErrorMsg('Please choose a stronger password (at least Medium strength).');
      return;
    }

    setIsLoading(true);

    try {
      const { data: user, error } = await authService.signUp({
        email: data.email.trim(),
        password: data.password,
        metadata: {
          full_name: data.fullName,
          phone: data.phone,
          role: selectedRole,
          city: data.city || 'Hyderabad',
          language: data.language || 'English'
        }
      });

      if (error) {
        if (error.already_exists) {
          setErrorMsg('Email already exists. Please login instead.');
        } else {
          setErrorMsg(error.message);
        }
        setIsLoading(false);
        return;
      }

      // Success — session active, refresh store then go to dashboard
      await initApp();
      setIsLoading(false);
      navigate('/');
    } catch (err) {
      console.error('SignUp exception:', err);
      setErrorMsg('An unexpected registration error occurred. Please try again.');
      setIsLoading(false);
    }

  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F8F5ED] py-12 px-4 sm:px-6 lg:px-8 text-left animate-fade-in">

      {/* Container */}
      <div className="max-w-2xl w-full bg-white border border-[#d4af37]/15 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gold/5 blur-2xl"></div>

        <div className="space-y-6">

          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b border-white/5">
            <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
              Create Your Account
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Join Nestly to find and list properties. A verification code will be sent to your email.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Row 1: Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
                  <input
                    type="text"
                    id="signup-name"
                    {...register('fullName', { required: 'Name is required' })}
                    placeholder="e.g. Gowtham"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-gold text-white placeholder-slate-500"
                  />
                </div>
                {errors.fullName && <span className="text-[10px] text-red-500 font-bold">{errors.fullName.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
                  <input
                    type="email"
                    id="signup-email"
                    {...register('email', { required: 'Email is required' })}
                    placeholder="gowtham@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-gold text-white placeholder-slate-500"
                  />
                </div>
                {errors.email && <span className="text-[10px] text-red-500 font-bold">{errors.email.message}</span>}
              </div>
            </div>

            {/* Row 2: Phone & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
                  <input
                    type="tel"
                    id="signup-phone"
                    {...register('phone', { required: 'Phone is required' })}
                    placeholder="+91 99999 88888"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-gold text-white placeholder-slate-500"
                  />
                </div>
                {errors.phone && <span className="text-[10px] text-red-500 font-bold">{errors.phone.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6F6A61] uppercase tracking-wide">City</label>
                <CitySelector 
                  id="signup-city"
                  value={selectedCity} 
                  onChange={(val) => setValue('city', val)} 
                />
              </div>
            </div>

            {/* Preferred Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Preferred Language</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
                <select
                  {...register('language')}
                  className="w-full bg-white border border-[#E8E1D5] rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-[#d4af37] text-[#2D2A26] placeholder-[#9A948A]"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
                  <input
                    type="password"
                    id="signup-password"
                    {...register('password', { required: 'Password is required' })}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-gold text-white placeholder-slate-500"
                  />
                </div>
                {errors.password && <span className="text-[10px] text-red-500 font-bold">{errors.password.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
                  <input
                    type="password"
                    id="signup-confirm-password"
                    {...register('confirmPassword', { required: 'Please confirm your password' })}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-gold text-white placeholder-slate-500"
                  />
                </div>
                {errors.confirmPassword && <span className="text-[10px] text-red-500 font-bold">{errors.confirmPassword.message}</span>}
              </div>
            </div>

            {/* Password strength indicator */}
            {tempPassword && (
              <div className="space-y-2 p-3 bg-white/[0.01] border border-white/5 rounded-xl text-left">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>Password Strength: <span className="text-white uppercase">{passwordStrength.label}</span></span>
                  <span>{passwordStrength.score}/5 Criteria met</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${passwordStrength.color} ${passwordStrength.barWidth} transition-all duration-300`}></div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] font-semibold text-slate-500">
                  <span className={tempPassword.length >= 8 ? 'text-emerald-400' : ''}>✓ Min 8 characters</span>
                  <span className={/[A-Z]/.test(tempPassword) ? 'text-emerald-400' : ''}>✓ Upper Case letter</span>
                  <span className={/[a-z]/.test(tempPassword) ? 'text-emerald-400' : ''}>✓ Lower Case letter</span>
                  <span className={/[0-9]/.test(tempPassword) ? 'text-emerald-400' : ''}>✓ Number (0-9)</span>
                  <span className={/[^A-Za-z0-9]/.test(tempPassword) ? 'text-emerald-400' : ''}>✓ Special symbol</span>
                </div>
              </div>
            )}

            {/* Terms checkbox */}
            <label className="flex items-start gap-2 cursor-pointer text-xs font-semibold text-slate-400 select-none pt-2">
              <input
                type="checkbox"
                required
                className="rounded border-white/10 text-gold h-4.5 w-4.5 cursor-pointer mt-0.5 bg-white/5 accent-gold"
              />
              <span>By ticking this box, you accept the Nestly Terms of Service, Privacy Policies, and Cookie requirements.</span>
            </label>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                id="signup-submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-gold to-luxury-gold-dark hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed text-[#0a0e1a] text-xs font-black tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-[#0a0e1a]" />
                    Creating Account…
                  </>
                ) : (
                  <>
                    Create Account
                    <Sparkles className="h-4 w-4 text-[#0a0e1a] animate-pulse" />
                  </>
                )}
              </button>
            </div>

          </form>

          <div className="text-center pt-4 border-t border-white/5 text-xs font-semibold text-slate-400">
            Already have an account?{' '}
            <Link to="/signin" className="text-gold hover:underline font-bold">Sign In</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
