import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Shield, Bell, Lock, History, 
  Sparkles, CheckCircle, Heart, Search, ArrowRight, Save
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, favorites, properties } = useAppStore();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [successMessage, setSuccessMessage] = useState("");

  // Notification states
  const [notifPreferences, setNotifPreferences] = useState({
    emailAlerts: true,
    smsAlerts: false,
    priceDrops: true,
    newMatches: true,
    chatAlerts: true
  });

  // Saved Searches
  const mockSavedSearches = [
    { id: 'ss-1', query: "2BHK under ₹25k in Ameerpet near metro" },
    { id: 'ss-2', query: "Villa to buy in Kompally under 80 Lakhs with parking" }
  ];

  // Recent Activity
  const mockActivity = [
    { type: 'view', text: "Viewed 'Modern 2BHK Apartment near Metro'", date: "Today, 11:20 AM" },
    { type: 'search', text: "Searched for 'Pet-friendly 2BHK near tech parks'", date: "Yesterday, 3:15 PM" },
    { type: 'chat', text: "Started conversation with Satish Kumar", date: "2 days ago" }
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleToggleNotif = (key) => {
    setNotifPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleRunSearch = (queryText) => {
    navigate(`/search?q=${encodeURIComponent(queryText)}`);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20 animate-fade-in text-left">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Banner header */}
        <div className="mb-8 flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="h-20 w-20 rounded-full border-2 border-primary bg-slate-50 shadow-md"
            />
            <div>
              <h1 className="font-display font-extrabold text-2xl text-slate-800 flex items-center gap-1.5 justify-center sm:justify-start">
                {name}
                <span className="text-[10px] bg-slate-100 border text-slate-500 font-bold uppercase py-0.5 px-2 rounded-full capitalize">
                  {currentUser.role}
                </span>
              </h1>
              <p className="text-slate-400 text-xs font-semibold">{email}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
              <p className="font-display font-black text-lg text-slate-800">{favorites.length}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Saved Homes</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
              <p className="font-display font-black text-lg text-slate-800">3</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Chats Opened</p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2 animate-pulse">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Profile Grid content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Edit Settings (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Edit details form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="font-display font-bold text-slate-800 text-base mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Details
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Save className="h-4 w-4" /> Save Profile Details
                  </button>
                </div>
              </form>
            </div>

            {/* Notification settings */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="font-display font-bold text-slate-800 text-base mb-6 flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Notification Preferences
              </h3>

              <div className="space-y-4 divide-y divide-slate-100">
                <div className="flex justify-between items-center py-3">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">Email Alerts</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Receive copy notifications via email account.</p>
                  </div>
                  <input type="checkbox" checked={notifPreferences.emailAlerts} onChange={() => handleToggleNotif('emailAlerts')} className="rounded text-primary h-4.5 w-4.5 cursor-pointer" />
                </div>

                <div className="flex justify-between items-center py-3">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">SMS Alerts</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Receive immediate OTP or details updates on phone.</p>
                  </div>
                  <input type="checkbox" checked={notifPreferences.smsAlerts} onChange={() => handleToggleNotif('smsAlerts')} className="rounded text-primary h-4.5 w-4.5 cursor-pointer" />
                </div>

                <div className="flex justify-between items-center py-3">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">Price Drops</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Alert if properties in wishlist drops asking price.</p>
                  </div>
                  <input type="checkbox" checked={notifPreferences.priceDrops} onChange={() => handleToggleNotif('priceDrops')} className="rounded text-primary h-4.5 w-4.5 cursor-pointer" />
                </div>

                <div className="flex justify-between items-center py-3">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">AI Compatibility Alerts</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Alert when new listings match active search criteria.</p>
                  </div>
                  <input type="checkbox" checked={notifPreferences.newMatches} onChange={() => handleToggleNotif('newMatches')} className="rounded text-primary h-4.5 w-4.5 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Security Section (Mock) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="font-display font-bold text-slate-800 text-base mb-6 flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-500" />
                Password & Security
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Current Password</label>
                  <input type="password" value="••••••••••••" readOnly className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs bg-slate-50 focus:outline-none" />
                </div>
                <div className="flex items-end">
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition">
                    Change Password
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Column 3: Saved searches & Recent activities (1/3 width) */}
          <div className="space-y-6">
            
            {/* Saved Searches */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-left">
              <h3 className="font-display font-bold text-slate-800 text-sm mb-4 flex items-center gap-1.5">
                <Search className="h-4.5 w-4.5 text-primary" />
                Saved Searches
              </h3>
              <div className="space-y-2">
                {mockSavedSearches.map(ss => (
                  <button
                    key={ss.id}
                    onClick={() => handleRunSearch(ss.query)}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/20 text-left transition flex justify-between items-center group font-semibold text-xs text-slate-700"
                  >
                    <span className="truncate max-w-[200px]">"{ss.query}"</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Activity History */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-left">
              <h3 className="font-display font-bold text-slate-800 text-sm mb-4 flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-slate-500" />
                Activity Ledger
              </h3>
              <div className="space-y-4">
                {mockActivity.map((act, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <span className="mt-1">
                      {act.type === 'view' ? '🏠' : act.type === 'search' ? '🔍' : '💬'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 font-semibold">{act.text}</p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{act.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
