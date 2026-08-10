import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, Search, MessageSquare, Landmark, Sparkles, 
  ArrowRight, ShieldCheck, ChevronRight, User, Eye, Bookmark
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';

export default function DashboardUser() {
  const navigate = useNavigate();
  const { properties, favorites, savedSearches, conversations, currentUser } = useAppStore();

  // Favorited properties
  const myFavorites = useMemo(() => {
    return properties.filter(p => favorites.includes(p.id));
  }, [properties, favorites]);

  // Simulated AI Recommendations (listings with match score >= 90 based on default/pre-set user preferences)
  const aiRecommendations = useMemo(() => {
    // Generate dummy scoring criteria based on Ameerpet & Whitefield matches
    return properties
      .map(p => {
        let score = 91;
        let rating = "Very Good Match";
        let badgeColor = "bg-primary text-white";
        let reasons = ["✓ Close to metro station", "✓ Within target budget"];

        if (p.id === 'prop-1') {
          score = 97;
          rating = "Excellent Match";
          badgeColor = "bg-emerald-600 text-white animate-pulse-slow";
          reasons = ["✓ Within budget", "✓ 300m from metro station", "✓ High-end gym included"];
        } else if (p.id === 'prop-3') {
          score = 95;
          rating = "Excellent Match";
          badgeColor = "bg-emerald-600 text-white animate-pulse-slow";
          reasons = ["✓ Close to Whitefield tech parks", "✓ Pet friendly", "✓ Vydehi Hospital near"];
        }

        return {
          ...p,
          matchScore: score,
          matchRating: rating,
          matchBadgeColor: badgeColor,
          matchReasons: reasons
        };
      })
      .filter(p => p.matchScore >= 95)
      .slice(0, 2);
  }, [properties]);

  const handleRunSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20 animate-fade-in text-left">
      
      {/* Banner header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-blue-500/20">
              Seeker Control Panel
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
              My Real Estate Dashboard
            </h1>
            <p className="text-slate-400 text-xs font-semibold">Track saved properties, view compatibility matches, and run saved searches.</p>
          </div>
          
          <Link
            to="/search"
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Search className="h-4 w-4" />
            Find New Properties
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Statistics grids */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Bookmarks</p>
              <h3 className="font-display font-black text-2xl text-slate-800">{favorites.length}</h3>
            </div>
            <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-rose-500">
              <Heart className="h-5 w-5 fill-current" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Inquiries Sent</p>
              <h3 className="font-display font-black text-2xl text-slate-800">{conversations.length}</h3>
            </div>
            <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-blue-500">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Saved Searches</p>
              <h3 className="font-display font-black text-2xl text-slate-800">{savedSearches.length + 2}</h3>
            </div>
            <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-orange-500">
              <Search className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Calculated Rent</p>
              <h3 className="font-display font-black text-xl text-slate-800">₹22,000/mo</h3>
            </div>
            <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-emerald-500">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Double-column layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Saved listings (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Wishlist segment */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-1.5">
                  <Heart className="h-5 w-5 text-rose-500 fill-current" />
                  My Shortlisted Properties
                </h3>
                <Link to="/saved" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                  Manage collections <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {myFavorites.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                  <Bookmark className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-slate-500 text-xs font-semibold">You haven't favorited any property listings yet.</p>
                  <Link to="/search" className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                    Explore Listings
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {myFavorites.map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </div>

            {/* Custom AI recommendations */}
            <div className="space-y-4 border-t border-slate-200 pt-8">
              <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-orange-500 animate-pulse-slow" />
                Top AI Recommendations (95%+ Matches)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiRecommendations.map(p => (
                  <Link 
                    key={p.id}
                    to={`/property/${p.id}`}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-200 flex flex-col"
                  >
                    <div className="h-44 w-full relative bg-slate-900">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                        <Sparkles className="h-3 w-3" />
                        {p.matchScore}% Match
                      </div>
                    </div>
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-800 line-clamp-1">{p.title}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{p.locality}, {p.city}</p>
                        
                        <div className="mt-2.5 space-y-1">
                          {p.matchReasons.slice(0, 2).map((r, idx) => (
                            <p key={idx} className="text-[11px] text-slate-500 font-semibold">{r}</p>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2 text-xs font-extrabold">
                        <span className="text-primary">{p.purpose === 'rent' ? `₹${p.price.toLocaleString()}/mo` : `₹${(p.price / 100000).toFixed(0)} L`}</span>
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">View match</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Right Columns: Sidebar utilities (1/3 width) */}
          <div className="space-y-6">
            
            {/* Quick searches launcher */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-800 text-sm mb-4 flex items-center gap-1.5">
                <Search className="h-4.5 w-4.5 text-primary" />
                Quick Saved Searches
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleRunSearch("2BHK under ₹25k in Ameerpet near metro")}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/20 text-left transition flex justify-between items-center group font-semibold text-xs text-slate-700"
                >
                  <span className="truncate max-w-[200px]">"2BHK under ₹25k in Ameerpet"</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition group-hover:translate-x-0.5" />
                </button>

                <button
                  onClick={() => handleRunSearch("Villa in Kompally under 80 Lakhs with parking")}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/20 text-left transition flex justify-between items-center group font-semibold text-xs text-slate-700"
                >
                  <span className="truncate max-w-[200px]">"Villa in Kompally under 80 L"</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Calculator parameters overview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-xs font-semibold text-slate-500 space-y-4">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Landmark className="h-4.5 w-4.5 text-emerald-500" />
                Affordability Budget
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span>Gross Monthly Income</span>
                  <span className="text-slate-800 font-bold">₹80,000</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span>Target Savings Target</span>
                  <span className="text-slate-800 font-bold">₹15,000</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span>Simulated Rent Cap</span>
                  <span className="text-primary font-bold">₹22,000/mo</span>
                </div>
              </div>

              <Link 
                to="/calculator"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center block transition uppercase tracking-wider"
              >
                Recalculate Budget
              </Link>
            </div>

            {/* Verification Checkmark */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 shadow-sm text-left flex gap-3 items-start">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse-slow" />
              <div className="space-y-1">
                <h5 className="font-display font-bold text-xs text-emerald-800">Phone & Email Verified</h5>
                <p className="text-[11px] text-slate-500 leading-normal font-semibold">Your seeker profile has undergone standard verified registration.</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
