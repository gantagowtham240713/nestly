import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/supabaseAuth';
import { useAppStore } from '../../store/useAppStore';
import { 
  Sparkles, Camera, MapPin, Building, 
  HelpCircle, RefreshCw, FileCheck, Check
} from 'lucide-react';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { setRole } = useAppStore();
  
  const [sessionUser, setSessionUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit } = useForm();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await authService.getCurrentSessionUser();
      if (!user) {
        // Redirect to sign in if no session
        navigate('/signin');
      } else {
        setSessionUser(user);
      }
    };
    fetchUser();
  }, [navigate]);

  const onSubmit = async (data) => {
    if (!sessionUser) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const updates = {
        city: data.city || sessionUser.city,
        language: data.language || 'English',
        avatar_url: data.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${sessionUser.full_name}`
      };

      if (sessionUser.role === 'user') {
        // Seeker preferences
        updates.preferred_property_type = data.preferredPropertyType;
        updates.budget_limit = parseFloat(data.budgetLimit) || 30000;
      } else if (sessionUser.role === 'owner') {
        // Owner business preferences
        updates.office_address = data.officeAddress;
        updates.business_details = data.businessDetails;
      }

      const { error } = await authService.completeUserProfile(sessionUser.id, updates);

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      // Sync role
      setRole(sessionUser.role);
      setIsLoading(false);

      // Route to correct dashboards
      if (sessionUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (sessionUser.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      setErrorMsg("An unexpected profile saving error occurred.");
      setIsLoading(false);
    }
  };

  if (!sessionUser) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left animate-fade-in">
      
      <div className="max-w-xl w-full bg-white border border-slate-200 p-8 sm:p-10 rounded-3xl shadow-xl shadow-blue-500/5 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl"></div>

        <div className="space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Step 2 of 2
            </div>
            <h2 className="font-display font-extrabold text-2xl text-slate-800 tracking-tight">Complete Your Profile</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Help us customize your Nestly recommendations layout.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Avatar image preview & URL input */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="h-16 w-16 bg-white border border-slate-200 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative group">
                <img 
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${sessionUser.full_name}`} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 text-white cursor-pointer">
                  <Camera className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 block">Avatar Seed Name</label>
                <input 
                  type="text"
                  {...register('avatarUrl')}
                  placeholder="e.g. Gowtham"
                  className="w-full border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold focus:outline-none focus:border-primary bg-white"
                />
              </div>
            </div>

            {/* Row: City & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">City</label>
                <select
                  {...register('city')}
                  defaultValue={sessionUser.city}
                  className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-primary bg-transparent"
                >
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Language</label>
                <select
                  {...register('language')}
                  defaultValue={sessionUser.language}
                  className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-primary bg-transparent"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                </select>
              </div>
            </div>

            {/* SEEKER EXTRAS FORM */}
            {sessionUser.role === 'user' && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-display font-bold text-xs text-primary uppercase tracking-wider">Seeker Preferences</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Preferred Property Type</label>
                    <select
                      {...register('preferredPropertyType')}
                      className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-primary bg-transparent"
                    >
                      <option value="apartment">Apartment / Flat</option>
                      <option value="villa">Villa</option>
                      <option value="independent_house">Independent House</option>
                      <option value="builder_floor">Builder Floor</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Monthly Budget Cap (₹)</label>
                    <input 
                      type="number" 
                      {...register('budgetLimit')}
                      placeholder="e.g. 25000"
                      defaultValue={25000}
                      className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* OWNER EXTRAS FORM */}
            {sessionUser.role === 'owner' && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-display font-bold text-xs text-emerald-600 uppercase tracking-wider">Business Preferences</h4>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Office Address</label>
                  <input 
                    type="text" 
                    {...register('officeAddress')}
                    placeholder="e.g. Block A, Cyber Towers, Hitec City"
                    className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Business Details</label>
                  <textarea 
                    {...register('businessDetails')}
                    placeholder="Brief description of your agency or brokerage firm..."
                    className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-primary h-16"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold tracking-wider uppercase rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving details
                </>
              ) : (
                <>
                  Save & Enter Dashboard
                  <Check className="h-4 w-4 text-emerald-400" />
                </>
              )}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}
