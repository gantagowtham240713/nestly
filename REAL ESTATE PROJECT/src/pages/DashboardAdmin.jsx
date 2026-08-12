import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { 
  ShieldCheck, ShieldAlert, Users, Home, Trash2, 
  Check, X, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardAdmin() {
  const { properties, verifyPropertyListing, verifyOwnerListing, deleteListing } = useAppStore();
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'analytics' | 'moderation'

  // Filter listings pending verification (either property docs or owner is unverified)
  const pendingVerifications = useMemo(() => {
    return properties.filter(p => !p.verifiedProperty || !p.verifiedOwner);
  }, [properties]);

  // Platform statistics calculations
  const platformStats = useMemo(() => {
    const total = properties.length;
    const rent = properties.filter(p => p.purpose === 'rent').length;
    const buy = properties.filter(p => p.purpose === 'buy').length;
    const verified = properties.filter(p => p.verifiedProperty).length;
    const unverified = total - verified;

    return {
      total,
      rent,
      buy,
      verified,
      unverified
    };
  }, [properties]);

  // Recharts: Cities listings distribution data
  const cityDistributionData = useMemo(() => {
    const map = {};
    properties.forEach(p => {
      map[p.city] = (map[p.city] || 0) + 1;
    });
    return Object.keys(map).map(city => ({
      name: city,
      Count: map[city]
    }));
  }, [properties]);

  // Recharts: User registration growth
  const userGrowthData = [
    { month: 'Jan', Users: 120, Owners: 45 },
    { month: 'Feb', Users: 190, Owners: 62 },
    { month: 'Mar', Users: 280, Owners: 89 },
    { month: 'Apr', Users: 410, Owners: 120 },
    { month: 'May', Users: 620, Owners: 175 },
    { month: 'Jun', Users: 890, Owners: 210 },
    { month: 'Jul', Users: 1240, Owners: 280 }
  ];

  const rentBuyData = [
    { name: 'For Rent', value: platformStats.rent, color: '#d4af37' },
    { name: 'For Sale', value: platformStats.buy, color: '#aa841e' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#FFFDF7] pb-20 animate-fade-in text-left text-[#2D2A26]">
      
      {/* Upper banner */}
      <div className="bg-[#F8F5ED] border-b border-[#E8E1D5] text-[#2D2A26] py-10 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-gold/10 text-gold text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-gold/20">
              Administrative Console
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#2D2A26]">
              Nestly Admin Panel
            </h1>
            <p className="text-slate-400 text-xs font-semibold">Verify new listings, check owner identities, moderate reports, and review growth metrics.</p>
          </div>

          {/* Quick tab switches */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'verification' 
                  ? 'bg-gradient-to-r from-gold to-luxury-gold-dark text-[#0a0e1a]' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Verification Queue ({pendingVerifications.length})
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'analytics' 
                  ? 'bg-gradient-to-r from-gold to-luxury-gold-dark text-[#0a0e1a]' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Platform Metrics
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* TAB CONTENT: Verification Queue */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-[#2D2A26] text-lg">Pending Listing Audits</h3>
            
            {pendingVerifications.length === 0 ? (
              <div className="bg-[#F8F5ED] rounded-3xl border border-[#E8E1D5] p-12 text-center max-w-lg mx-auto space-y-4">
                <ShieldCheck className="h-10 w-10 text-[#d4af37] mx-auto animate-pulse" />
                <h3 className="font-display font-bold text-[#2D2A26] text-base">All listings verified</h3>
                <p className="text-[#8B857A] text-xs font-semibold">There are no pending listings or owner verifications in the pipeline.</p>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                {pendingVerifications.map(p => (
                  <div 
                    key={p.id}
                    className="bg-white rounded-3xl border border-[#E8E1D5] p-6 flex flex-col md:flex-row justify-between gap-6 shadow-md items-start md:items-center"
                  >
                    {/* Listing Summary */}
                    <div className="flex gap-4 items-start">
                      <img src={p.images[0]} alt={p.title} className="h-16 w-24 object-cover rounded-xl border border-white/10 shrink-0" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs sm:text-sm text-[#2D2A26] line-clamp-1 hover:text-[#d4af37]">{p.title}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{p.locality}, {p.city} • Posted by {p.owner.name}</p>
                        
                        {/* Pending indicator labels */}
                        <div className="flex gap-1.5 pt-1">
                          {!p.verifiedProperty && (
                            <span className="text-[9px] font-bold bg-gold/10 text-gold px-2 py-0.5 rounded border border-gold/20 uppercase">
                              Docs Pending Audit
                            </span>
                          )}
                          {!p.verifiedOwner && (
                            <span className="text-[9px] font-bold bg-white/5 text-slate-300 px-2 py-0.5 rounded border border-white/10 uppercase">
                              Owner ID Verification
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Verification Action Buttons */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      {!p.verifiedProperty && (
                        <button
                          onClick={() => verifyPropertyListing(p.id)}
                          className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-gold to-luxury-gold-dark text-[#0a0e1a] rounded-xl text-xs font-black transition flex items-center justify-center gap-1 hover:opacity-95"
                        >
                          <Check className="h-4 w-4 text-[#0a0e1a]" /> Verify Property
                        </button>
                      )}
                      {!p.verifiedOwner && (
                        <button
                          onClick={() => verifyOwnerListing(p.id)}
                          className="flex-1 md:flex-none px-4 py-2 bg-[#F8F5ED] hover:bg-[#F3EDE0] text-[#6F6A61] rounded-xl text-xs font-bold border border-[#E8E1D5] transition flex items-center justify-center gap-1"
                        >
                          <Check className="h-4 w-4" /> Verify Owner
                        </button>
                      )}
                      <button
                        onClick={() => deleteListing(p.id)}
                        className="px-3 py-2 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition"
                        title="Delete listing as spam"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: Platform Metrics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            
            {/* Numeric overview cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-3xl border border-[#E8E1D5] shadow-md text-left">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Listings</p>
                <h3 className="font-display font-black text-2xl text-[#2D2A26]">{platformStats.total}</h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-[#E8E1D5] shadow-md text-left">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Rent vs Buy Ratio</p>
                <h3 className="font-display font-black text-xl text-[#2D2A26]">{platformStats.rent} : {platformStats.buy}</h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-[#E8E1D5] shadow-md text-left">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Verified properties</p>
                <h3 className="font-display font-black text-2xl text-gold animate-pulse">
                  {platformStats.verified} <span className="text-xs text-slate-400 font-semibold">({Math.round((platformStats.verified / platformStats.total) * 100)}%)</span>
                </h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-[#E8E1D5] shadow-md text-left">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Seekers</p>
                <h3 className="font-display font-black text-2xl text-[#2D2A26]">1,240</h3>
              </div>
            </div>

            {/* Recharts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* User growth line graph */}
              <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 shadow-md lg:col-span-2 text-left">
                <h4 className="font-display font-bold text-sm text-[#2D2A26] mb-4">User Registration Growth (YTD)</h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#121826', borderColor: 'rgba(212,175,55,0.2)', borderRadius: '12px', color: '#fff' }} />
                      <Legend />
                      <Line type="monotone" dataKey="Users" stroke="#d4af37" strokeWidth={2.5} name="Seekers" />
                      <Line type="monotone" dataKey="Owners" stroke="#f3e5ab" strokeWidth={2} name="Owners/Brokers" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Rent vs Buy ratios pie graph */}
              <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 shadow-md text-left">
                <h4 className="font-display font-bold text-sm text-[#2D2A26] mb-4">Rent vs Sale Distribution</h4>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rentBuyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {rentBuyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#121826', borderColor: 'rgba(212,175,55,0.2)', borderRadius: '12px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-1 shrink-0 w-24 pl-2">
                    {rentBuyData.map((item, idx) => (
                      <div key={idx} className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span>{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* City Distribution Bar graph */}
            <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 shadow-md text-left">
              <h4 className="font-display font-bold text-sm text-[#2D2A26] mb-4">Listings Distribution by City</h4>
              <div className="h-64">
                {cityDistributionData.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold text-center py-10">No city statistics available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cityDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#121826', borderColor: 'rgba(212,175,55,0.2)', borderRadius: '12px', color: '#fff' }} />
                      <Bar dataKey="Count" fill="#d4af37" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
