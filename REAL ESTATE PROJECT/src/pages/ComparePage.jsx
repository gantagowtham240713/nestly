import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { calculateMatchScore } from '../services/recommendation';
import { 
  ArrowLeftRight, Trash2, ShieldCheck, HelpCircle, 
  MapPin, Sparkles, Plus, Award, ChevronLeft
} from 'lucide-react';

export default function ComparePage() {
  const navigate = useNavigate();
  const { 
    comparedProperties, 
    removeComparedProperty, 
    clearComparison,
    parsedPreferences
  } = useAppStore();

  // Run AI scorer for compared items
  const propertiesWithScores = useMemo(() => {
    return comparedProperties.map(p => {
      const scoring = calculateMatchScore(p, parsedPreferences || {});
      return {
        ...p,
        aiScore: scoring.score,
        aiRating: scoring.rating
      };
    });
  }, [comparedProperties, parsedPreferences]);

  // Find winning indices for numeric specs to automate green highlight
  const winningSpecs = useMemo(() => {
    if (propertiesWithScores.length < 2) return {};

    const wins = {
      price: null,
      area: null,
      distanceMetro: null,
      aiScore: null
    };

    // Lowest Price wins
    let minPrice = Infinity;
    propertiesWithScores.forEach((p, idx) => {
      if (p.price < minPrice) {
        minPrice = p.price;
        wins.price = idx;
      }
    });

    // Largest Area wins
    let maxArea = -1;
    propertiesWithScores.forEach((p, idx) => {
      if (p.area > maxArea) {
        maxArea = p.area;
        wins.area = idx;
      }
    });

    // Shortest Metro Distance wins
    let minMetro = Infinity;
    propertiesWithScores.forEach((p, idx) => {
      const dist = p.distanceToMetro || 9999;
      if (dist < minMetro) {
        minMetro = dist;
        wins.distanceMetro = idx;
      }
    });

    // Highest AI Score wins
    let maxScore = -1;
    propertiesWithScores.forEach((p, idx) => {
      if (p.aiScore > maxScore) {
        maxScore = p.aiScore;
        wins.aiScore = idx;
      }
    });

    return wins;
  }, [propertiesWithScores]);

  // Price label format
  const formatPrice = (val, purpose) => {
    if (purpose === 'rent') {
      return `₹${val.toLocaleString('en-IN')}/mo`;
    } else {
      if (val >= 10000000) {
        return `₹${(val / 10000000).toFixed(2)} Cr`;
      }
      return `₹${(val / 100000).toFixed(0)} Lakhs`;
    }
  };

  if (propertiesWithScores.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 animate-fade-in">
        <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto border border-slate-200 shadow-inner text-slate-400">
          <ArrowLeftRight className="h-8 w-8" />
        </div>
        <h2 className="font-display font-extrabold text-2xl text-slate-800">Your Compare Tray is Empty</h2>
        <p className="text-slate-500 max-w-sm mx-auto text-xs font-semibold leading-relaxed">
          Select up to 3 properties from our search results page using the "Compare" checkbox to contrast pricing, locations, and AI match scores side-by-side.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8962e] hover:opacity-95 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition inline-flex items-center gap-1.5"
        >
          Browse Properties
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-1">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-primary transition"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-800 flex items-center gap-2">
              Compare Properties
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                {propertiesWithScores.length}/3 selected
              </span>
            </h1>
          </div>
          <button 
            onClick={clearComparison}
            className="text-xs font-bold text-slate-400 hover:text-red-500 hover:underline flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Clear Tray
          </button>
        </div>

        {/* Comparison grid wrapper */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
          
          <table className="w-full border-collapse text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                {/* Specs column header */}
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest w-48 shrink-0">Specifications</th>
                
                {/* Properties headers */}
                {propertiesWithScores.map((p, idx) => (
                  <th key={p.id} className="p-6 relative border-l border-slate-200 align-top w-72">
                    <button 
                      onClick={() => removeComparedProperty(p.id)}
                      className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                      title="Remove from comparison"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    <div className="space-y-4">
                      <div className="h-40 rounded-2xl overflow-hidden border border-slate-200">
                        <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-800 line-clamp-2 leading-snug">{p.title}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {p.locality}, {p.city}
                        </p>
                      </div>
                    </div>
                  </th>
                ))}

                {/* Add slot placeholder if less than 3 */}
                {propertiesWithScores.length < 3 && (
                  <th className="p-6 border-l border-slate-200 bg-slate-50/10 text-center align-middle w-72">
                    <Link 
                      to="/search"
                      className="inline-flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 group transition"
                    >
                      <div className="h-10 w-10 rounded-full bg-slate-100 group-hover:bg-blue-50 text-slate-400 group-hover:text-primary flex items-center justify-center transition">
                        <Plus className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 group-hover:text-primary transition">Add Property</span>
                    </Link>
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-semibold text-slate-700">
              
              {/* Row: Purpose */}
              <tr>
                <td className="p-6 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">Purpose</td>
                {propertiesWithScores.map(p => (
                  <td key={p.id} className="p-6 border-l border-slate-200 capitalize font-bold text-slate-700">
                    For {p.purpose}
                  </td>
                ))}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

              {/* Row: Price */}
              <tr className="hover:bg-slate-50/20 transition">
                <td className="p-6 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">Asking Price</td>
                {propertiesWithScores.map((p, idx) => {
                  const isWinner = winningSpecs.price === idx;
                  return (
                    <td 
                      key={p.id} 
                      className={`p-6 border-l border-slate-200 font-bold ${
                        isWinner ? 'bg-emerald-50/30 text-emerald-700' : ''
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {formatPrice(p.price, p.purpose)}
                        {isWinner && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Best Value</span>}
                      </span>
                    </td>
                  );
                })}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

              {/* Row: AI Compatibility Match */}
              <tr className="hover:bg-slate-50/20 transition">
                <td className="p-6 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">AI Compatibility</td>
                {propertiesWithScores.map((p, idx) => {
                  const isWinner = winningSpecs.aiScore === idx;
                  return (
                    <td 
                      key={p.id} 
                      className={`p-6 border-l border-slate-200 font-bold ${
                        isWinner ? 'bg-emerald-50/30 text-emerald-700' : ''
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-orange-500 animate-pulse-slow" />
                        <span>{p.aiScore}% ({p.aiRating})</span>
                        {isWinner && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">Highest Match</span>}
                      </span>
                    </td>
                  );
                })}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

              {/* Row: Layout */}
              <tr>
                <td className="p-6 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">Layout (BHK)</td>
                {propertiesWithScores.map(p => (
                  <td key={p.id} className="p-6 border-l border-slate-200">
                    {p.bhk} BHK
                  </td>
                ))}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

              {/* Row: Bathrooms */}
              <tr>
                <td className="p-6 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">Bathrooms</td>
                {propertiesWithScores.map(p => (
                  <td key={p.id} className="p-6 border-l border-slate-200">
                    {p.bathrooms} Baths
                  </td>
                ))}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

              {/* Row: Sqft Area */}
              <tr className="hover:bg-slate-50/20 transition">
                <td className="p-6 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">Super Area</td>
                {propertiesWithScores.map((p, idx) => {
                  const isWinner = winningSpecs.area === idx;
                  return (
                    <td 
                      key={p.id} 
                      className={`p-6 border-l border-slate-200 ${
                        isWinner ? 'bg-emerald-50/30 text-emerald-700 font-bold' : ''
                      }`}
                    >
                      {p.area} sqft
                      {isWinner && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold ml-1">Spaciest</span>}
                    </td>
                  );
                })}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

              {/* Row: Metro Distance */}
              <tr className="hover:bg-slate-50/20 transition">
                <td className="p-6 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">Metro Station</td>
                {propertiesWithScores.map((p, idx) => {
                  const isWinner = winningSpecs.distanceMetro === idx;
                  return (
                    <td 
                      key={p.id} 
                      className={`p-6 border-l border-slate-200 ${
                        isWinner ? 'bg-emerald-50/30 text-emerald-700 font-bold' : ''
                      }`}
                    >
                      {p.distanceToMetro}m ({p.nearbyMetroStation || 'Nearest'})
                      {isWinner && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold ml-1">Closest</span>}
                    </td>
                  );
                })}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

              {/* Row: School Distance */}
              <tr>
                <td className="p-6 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">Nearest School</td>
                {propertiesWithScores.map(p => (
                  <td key={p.id} className="p-6 border-l border-slate-200">
                    {p.distanceToSchool}m ({p.nearbySchool || 'School'})
                  </td>
                ))}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

              {/* Row: Hospital Distance */}
              <tr>
                <td className="p-6 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">Hospital</td>
                {propertiesWithScores.map(p => (
                  <td key={p.id} className="p-6 border-l border-slate-200">
                    {p.distanceToHospital}m ({p.nearbyHospital || 'Hospital'})
                  </td>
                ))}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

              {/* Row: Amenities */}
              <tr>
                <td className="p-6 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">Key Amenities</td>
                {propertiesWithScores.map(p => (
                  <td key={p.id} className="p-6 border-l border-slate-200 leading-relaxed text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span>{p.parking ? '✅' : '❌'}</span> <span>Parking</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{p.gym ? '✅' : '❌'}</span> <span>Gym Access</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{p.balcony ? '✅' : '❌'}</span> <span>Balcony</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{p.petFriendly ? '✅' : '❌'}</span> <span>Pet Friendly</span>
                      </div>
                    </div>
                  </td>
                ))}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

              {/* Row: Verification status */}
              <tr>
                <td className="p-6 bg-slate-50/30 text-slate-400 text-xs font-bold uppercase tracking-wider">Verifications</td>
                {propertiesWithScores.map(p => (
                  <td key={p.id} className="p-6 border-l border-slate-200">
                    <div className="flex flex-col gap-1.5">
                      {p.verifiedProperty ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 max-w-fit">
                          <ShieldCheck className="h-3 w-3 fill-current" />
                          Property Doc Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Property Doc Pending</span>
                      )}
                      {p.verifiedOwner ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 max-w-fit">
                          <ShieldCheck className="h-3 w-3 fill-current" />
                          Owner Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Owner ID Pending</span>
                      )}
                    </div>
                  </td>
                ))}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

              {/* Action Buttons Row */}
              <tr>
                <td className="p-6 bg-slate-50/30"></td>
                {propertiesWithScores.map(p => (
                  <td key={p.id} className="p-6 border-l border-slate-200 text-center">
                    <Link
                      to={`/property/${p.id}`}
                      className="inline-block px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8962e] hover:opacity-95 text-white text-xs font-bold rounded-xl transition w-full"
                    >
                      View Details
                    </Link>
                  </td>
                ))}
                {propertiesWithScores.length < 3 && <td className="border-l border-slate-200 bg-slate-50/10"></td>}
              </tr>

            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}
