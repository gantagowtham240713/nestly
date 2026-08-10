import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/supabaseAuth';
import { 
  Sparkles, Mail, Lock, User, Phone, Globe, 
  MapPin, FileText, Check, ShieldAlert, RefreshCw, ChevronLeft
} from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();

  // Selection step: null means role selection screen, 'user' | 'owner' means active form
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Evaluate password strength in real-time
  const passwordStrength = useMemo(() => {
    if (!tempPassword) return { score: 0, label: "Empty", color: "bg-slate-200", barWidth: "w-0" };

    let metCriteria = 0;
    if (tempPassword.length >= 8) metCriteria++;
    if (/[A-Z]/.test(tempPassword)) metCriteria++;
    if (/[a-z]/.test(tempPassword)) metCriteria++;
    if (/[0-9]/.test(tempPassword)) metCriteria++;
    if (/[^A-Za-z0-9]/.test(tempPassword)) metCriteria++;

    let label = "Weak";
    let color = "bg-red-500";
    let barWidth = "w-1/3";

    if (metCriteria >= 5) {
      label = "Strong";
      color = "bg-emerald-500";
      barWidth = "w-full";
    } else if (metCriteria >= 3) {
      label = "Medium";
      color = "bg-orange-500";
      barWidth = "w-2/3";
    }

    return {
      score: metCriteria,
      label,
      color,
      barWidth
    };
  }, [tempPassword]);

  const onSubmit = async (data) => {
    setErrorMsg("");
    
    // Check password matches
    if (data.password !== data.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    // Check strength
    if (passwordStrength.score < 3) {
      setErrorMsg("Password is too weak. Please meet more security requirements.");
      return;
    }

    setIsLoading(true);

    try {
      const metadata = {
        full_name: data.fullName,
        phone: data.phone,
        role: selectedRole,
        city: data.city,
        language: data.language || 'English',
        governmentId: data.governmentId ? data.governmentId[0]?.name : 'simulated_upload.pdf'
      };

      const { data: user, error } = await authService.signUp({
        email: data.email,
        password: data.password,
        metadata
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      // Success, route to verification screen
      setIsLoading(false);
      navigate('/verify-email');

    } catch (err) {
      setErrorMsg("An unexpected registration error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left animate-fade-in">
      
      {/* Container */}
      <div className="max-w-2xl w-full bg-white border border-slate-200 p-8 sm:p-10 rounded-3xl shadow-xl shadow-blue-500/5 relative overflow-hidden">
        {/* Glow watermarks */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl"></div>

        {/* STEP 1: Role Selection Screen */}
        {selectedRole === null && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Step 1 of 2
              </div>
              <h2 className="font-display font-extrabold text-2xl text-slate-800 tracking-tight">
                Choose Account Type
              </h2>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-sm mx-auto">
                Are you looking to rent/buy properties, or are you an owner listing units?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Card User */}
              <div 
                onClick={() => setSelectedRole('user')}
                className="group p-6 border-2 border-slate-200 hover:border-primary rounded-2xl cursor-pointer bg-white transition hover:shadow-lg flex flex-col justify-between hover:scale-[1.01] min-h-[200px]"
              >
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100 font-sans text-xl group-hover:bg-primary group-hover:text-white transition">
                    👤
                  </div>
                  <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">Home Seeker</h3>
                  <p className="text-[11px] text-slate-400 font-semibold leading-normal">
                    Find and rent/buy houses, use conversational search, compare properties, and chat with landlords.
                  </p>
                </div>
                <div className="text-primary text-xs font-bold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform mt-6">
                  Select Seeker Profile <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                </div>
              </div>

              {/* Card Owner */}
              <div 
                onClick={() => setSelectedRole('owner')}
                className="group p-6 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl cursor-pointer bg-white transition hover:shadow-lg flex flex-col justify-between hover:scale-[1.01] min-h-[200px]"
              >
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 font-sans text-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                    🏠
                  </div>
                  <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">Owner / Broker</h3>
                  <p className="text-[11px] text-slate-400 font-semibold leading-normal">
                    Post properties, manage listings availability, upload documentation, and interact with leads.
                  </p>
                </div>
                <div className="text-emerald-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform mt-6">
                  Select Owner Profile <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                </div>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-slate-100 mt-6 text-xs font-semibold text-slate-500">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary hover:underline font-bold">
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: Sign Up Forms */}
        {selectedRole !== null && (
          <div className="space-y-6">
            
            {/* Form header details */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <button 
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-800 transition"
              >
                <ChevronLeft className="h-4 w-4" /> Account Type
              </button>
              <div className="text-right">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Signing Up as</span>
                <p className="text-xs font-bold text-slate-800 capitalize">{selectedRole === 'user' ? 'Seeker 👤' : 'Owner/Broker 🏠'}</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold animate-pulse">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      {...register('fullName', { required: 'Name is required' })}
                      placeholder="e.g. Gowtham"
                      className="w-full border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  {errors.fullName && <span className="text-[10px] text-red-500 font-bold">{errors.fullName.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="email" 
                      {...register('email', { required: 'Email is required' })}
                      placeholder="gowtham@example.com"
                      className="w-full border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  {errors.email && <span className="text-[10px] text-red-500 font-bold">{errors.email.message}</span>}
                </div>
              </div>

              {/* Row 2: Phone & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="tel" 
                      {...register('phone', { required: 'Phone is required' })}
                      placeholder="+91 99999 88888"
                      className="w-full border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  {errors.phone && <span className="text-[10px] text-red-500 font-bold">{errors.phone.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <select
                      {...register('city')}
                      className="w-full border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-primary bg-transparent"
                    >
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Pune">Pune</option>
                      <option value="Chennai">Chennai</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seeker extra: Language */}
              {selectedRole === 'user' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Preferred Language</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <select
                      {...register('language')}
                      className="w-full border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-primary bg-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Owner extras: Company, Business address, Doc Upload */}
              {selectedRole === 'owner' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Company Name (Optional)</label>
                      <input 
                        type="text" 
                        {...register('company')}
                        placeholder="e.g. Dream Properties Ltd"
                        className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">RERA Number (Optional)</label>
                      <input 
                        type="text" 
                        {...register('reraNumber')}
                        placeholder="e.g. PR/KN/170731/000001"
                        className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Business Address</label>
                    <input 
                      type="text" 
                      {...register('businessAddress', { required: 'Business address is required' })}
                      placeholder="e.g. Office 402, Signature Towers, Madhapur"
                      className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                    {errors.businessAddress && <span className="text-[10px] text-red-500 font-bold">{errors.businessAddress.message}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Upload Government ID (Aadhaar/PAN/RERA Doc)</label>
                    <input 
                      type="file" 
                      {...register('governmentId', { required: 'Government ID document upload is required' })}
                      className="w-full border border-dashed border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none bg-slate-50 cursor-pointer"
                    />
                    {errors.governmentId && <span className="text-[10px] text-red-500 font-bold">{errors.governmentId.message}</span>}
                  </div>
                </>
              )}

              {/* Password & Confirm Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="password" 
                      {...register('password', { required: 'Password is required' })}
                      onChange={(e) => setTempPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  {errors.password && <span className="text-[10px] text-red-500 font-bold">{errors.password.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="password" 
                      {...register('confirmPassword', { required: 'Password confirm is required' })}
                      placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  {errors.confirmPassword && <span className="text-[10px] text-red-500 font-bold">{errors.confirmPassword.message}</span>}
                </div>
              </div>

              {/* Live Password Strength indicator */}
              {tempPassword && (
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Password Strength: <span className="text-slate-800 uppercase">{passwordStrength.label}</span></span>
                    <span>{passwordStrength.score}/5 Criteria met</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} ${passwordStrength.barWidth} transition-all duration-300`}></div>
                  </div>

                  {/* Rules guidelines checklist */}
                  <div className="grid grid-cols-2 gap-1 text-[9px] font-semibold text-slate-400">
                    <span className={tempPassword.length >= 8 ? 'text-emerald-600' : ''}>✓ Min 8 characters</span>
                    <span className={/[A-Z]/.test(tempPassword) ? 'text-emerald-600' : ''}>✓ Upper Case letter</span>
                    <span className={/[a-z]/.test(tempPassword) ? 'text-emerald-600' : ''}>✓ Lower Case letter</span>
                    <span className={/[0-9]/.test(tempPassword) ? 'text-emerald-600' : ''}>✓ Number (0-9)</span>
                    <span className={/[^A-Za-z0-9]/.test(tempPassword) ? 'text-emerald-600' : ''}>✓ Special symbol</span>
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 cursor-pointer text-xs font-semibold text-slate-500 select-none pt-2">
                <input 
                  type="checkbox" 
                  required
                  className="rounded border-slate-300 text-primary h-4.5 w-4.5 cursor-pointer mt-0.5"
                />
                <span>By ticking this box, you accept the Nestly Terms of Service, Privacy Policies, and Cookie requirements.</span>
              </label>

              {/* Submit Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creating Account
                    </>
                  ) : (
                    <>
                      Create Account
                      <Sparkles className="h-4 w-4 text-orange-400" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

    </div>
  );
}
