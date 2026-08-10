import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { parseNaturalLanguageQuery, getChipsFromParsedQuery } from '../services/aiParser';
import { rankProperties } from '../services/recommendation';
import PropertyCard from '../components/PropertyCard';
import LeafletMap from '../components/LeafletMap';
import { 
  Sparkles, Search, SlidersHorizontal, Map, List, 
  Trash2, X, RefreshCw, AlertTriangle
} from 'lucide-react';

export default function SearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    properties, 
    activeSearchQuery, 
    parsedPreferences, 
    setSearchQuery 
  } = useAppStore();

  const [inputVal, setInputVal] = useState("");
  const [activeChips, setActiveChips] = useState([]);
  const [activePreferences, setActivePreferences] = useState({});
  const [sortBy, setSortBy] = useState('matchScore'); // 'matchScore' | 'priceAsc' | 'priceDesc' | 'distanceMetro'
  const [isMobileMapOpen, setIsMobileMapOpen] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState(null);
  
  // Loading state to simulate AI computation
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5); // For infinite scroll

  // Synchronize state from URL query parameter or store
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlQuery = params.get('q') || '';
    
    if (urlQuery) {
      setInputVal(urlQuery);
      setIsAiThinking(true);
      
      const timer = setTimeout(() => {
        const parsed = parseNaturalLanguageQuery(urlQuery);
        setSearchQuery(urlQuery, parsed);
        setActivePreferences(parsed);
        setIsAiThinking(false);
      }, 800); // realistic delay for AI processing
      
      return () => clearTimeout(timer);
    } else {
      // Default initial query if none provided
      setInputVal(activeSearchQuery);
      setActivePreferences(parsedPreferences || {});
    }
  }, [location.search]);

  // Regenerate chips whenever parsed preferences change
  useEffect(() => {
    if (activePreferences) {
      setActiveChips(getChipsFromParsedQuery(activePreferences));
    }
  }, [activePreferences]);

  // Handle removing a preference chip
  const handleRemoveChip = (chipId, chipType) => {
    setIsAiThinking(true);
    
    setTimeout(() => {
      const updatedPrefs = { ...activePreferences };
      
      // Reset preference value
      if (typeof updatedPrefs[chipType] === 'boolean') {
        updatedPrefs[chipType] = false;
      } else {
        updatedPrefs[chipType] = null;
      }
      
      setActivePreferences(updatedPrefs);
      
      // Re-create query string representation
      const remainingChips = getChipsFromParsedQuery(updatedPrefs);
      const newQuery = remainingChips.map(c => c.label).join(", ");
      setSearchQuery(newQuery, updatedPrefs);
      setInputVal(newQuery);

      // Update URL without reloading
      const params = new URLSearchParams(location.search);
      params.set('q', newQuery);
      navigate({ search: params.toString() }, { replace: true });
      
      setIsAiThinking(false);
    }, 450);
  };

  // Clear all filters
  const handleClearAll = () => {
    setIsAiThinking(true);
    setTimeout(() => {
      const emptyPrefs = {
        purpose: null,
        propertyType: null,
        budget: null,
        bhk: null,
        city: null,
        locality: null,
        metro: false,
        schools: false,
        hospitals: false,
        parking: false,
        gym: false,
        balcony: false,
        petFriendly: false,
        gatedCommunity: false,
        bachelorFriendly: false,
        furnishing: null
      };
      setActivePreferences(emptyPrefs);
      setSearchQuery("", emptyPrefs);
      setInputVal("");
      navigate('/search', { replace: true });
      setIsAiThinking(false);
    }, 400);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    navigate(`/search?q=${encodeURIComponent(inputVal)}`);
  };

  // Filter & rank properties based on active preference parameters
  const rankedResults = useMemo(() => {
    // 1. Initial filter based on hard constraints if specified (like Purpose: Rent/Buy, City)
    let filtered = properties.filter(prop => {
      if (activePreferences.purpose && prop.purpose !== activePreferences.purpose) {
        return false;
      }
      if (activePreferences.city && prop.city.toLowerCase() !== activePreferences.city.toLowerCase()) {
        return false;
      }
      return true;
    });

    // 2. Score properties
    let scored = rankProperties(filtered, activePreferences);

    // 3. Apply custom sorting if selected
    if (sortBy === 'priceAsc') {
      scored.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      scored.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'distanceMetro') {
      scored.sort((a, b) => (a.distanceToMetro || 9999) - (b.distanceToMetro || 9999));
    } else if (sortBy === 'newest') {
      scored.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
    } // default is ranked by matchScore in rankProperties

    return scored;
  }, [properties, activePreferences, sortBy]);

  // Paginated/Infinite scroll items
  const paginatedProperties = useMemo(() => {
    return rankedResults.slice(0, visibleCount);
  }, [rankedResults, visibleCount]);

  const loadMore = () => {
    setIsAiThinking(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 5);
      setIsAiThinking(false);
    }, 600);
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50">
      
      {/* 1. Header AI Input Form */}
      <header className="w-full bg-white border-b border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl flex bg-slate-100/80 hover:bg-slate-100 border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-1.5 transition duration-300">
            <div className="flex-1 flex items-center px-3 gap-2">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder='Search: "2BHK under ₹25k in Gachibowli near metro"'
                className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 text-sm font-semibold focus:outline-none py-2.5"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-orange-400 animate-pulse-slow" />
              AI Match
            </button>
          </form>

          {/* Quick Stats Summary */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">AI Ranked Matches</p>
              <p className="text-sm font-extrabold text-slate-800">{rankedResults.length} properties found</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Extracted Chips & Refinement toolbar */}
      <section className="w-full bg-slate-100/50 border-b border-slate-200 py-3.5 px-4 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 items-center justify-between">
          
          {/* Active tags / chips */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              AI Tags:
            </span>

            {activeChips.length === 0 ? (
              <span className="text-xs text-slate-400 font-semibold italic">No active search criteria. Try typing something above.</span>
            ) : (
              activeChips.map((chip) => (
                <div 
                  key={chip.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs font-bold text-slate-600 transition shadow-sm"
                >
                  <span>{chip.label}</span>
                  <button 
                    onClick={() => handleRemoveChip(chip.id, chip.type)}
                    className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition focus:outline-none"
                    title="Remove filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}

            {activeChips.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 hover:underline flex items-center gap-0.5 transition ml-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Sort:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 py-1.5 px-3 focus:outline-none cursor-pointer"
            >
              <option value="matchScore">🏆 Best Match (AI Score)</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="distanceMetro">Distance to Metro</option>
              <option value="newest">Newest Listings</option>
            </select>
          </div>

        </div>
      </section>

      {/* 3. Search Content Layout (Double-column on desktop) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-6 relative">
        
        {/* Left Column: Properties list */}
        <div className="flex-1 flex flex-col gap-6 max-w-full">
          
          {/* AI Thinking Animation */}
          {isAiThinking && (
            <div className="w-full bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex items-center gap-3 text-orange-600 animate-pulse">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">AI is processing details and scoring listings...</span>
            </div>
          )}

          {/* Skeleton Loaders */}
          {isAiThinking && paginatedProperties.length === 0 && (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-sm">
                  <div className="w-full md:w-72 h-52 shrink-0 rounded-xl shimmer-loader"></div>
                  <div className="flex-1 space-y-4 py-2">
                    <div className="h-6 w-1/4 rounded shimmer-loader"></div>
                    <div className="h-4 w-3/4 rounded shimmer-loader"></div>
                    <div className="h-4 w-1/2 rounded shimmer-loader"></div>
                    <div className="h-10 rounded shimmer-loader"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actual Property Cards */}
          {(!isAiThinking || paginatedProperties.length > 0) && (
            <div className="space-y-6">
              {paginatedProperties.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-2xl mx-auto space-y-4">
                  <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto animate-bounce" />
                  <h3 className="font-display font-bold text-xl text-slate-800">No properties matched directly</h3>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-md mx-auto">
                    Try refining your search query by shortening the description, broadening the budget, or listing fewer connectivity requirements.
                  </p>
                  <button 
                    onClick={handleClearAll}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide rounded-xl transition inline-flex items-center gap-1.5"
                  >
                    Reset Search Parameters
                  </button>
                </div>
              ) : (
                paginatedProperties.map((prop) => (
                  <div 
                    key={prop.id}
                    onMouseEnter={() => setHoveredProperty(prop)}
                    onMouseLeave={() => setHoveredProperty(null)}
                  >
                    <PropertyCard property={prop} />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Load More Button */}
          {rankedResults.length > paginatedProperties.length && (
            <div className="text-center py-6">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs tracking-wider uppercase rounded-xl transition shadow-sm flex items-center gap-2 mx-auto"
              >
                Load More Properties
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Map Overlay (Desktop only) */}
        <div className={`hidden lg:block w-[420px] xl:w-[480px] shrink-0 h-[calc(100vh-230px)] sticky top-[210px] z-20`}>
          <LeafletMap 
            properties={rankedResults} 
            selectedProperty={hoveredProperty} 
            height="100%" 
          />
        </div>

      </main>

      {/* Floating Map Toggle (Mobile view only) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMobileMapOpen(!isMobileMapOpen)}
          className="flex items-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-2xl transition"
        >
          {isMobileMapOpen ? (
            <>
              <List className="h-4.5 w-4.5" />
              Show List
            </>
          ) : (
            <>
              <Map className="h-4.5 w-4.5" />
              Show Map
            </>
          )}
        </button>
      </div>

      {/* Full Screen Map Overlay (Mobile view only) */}
      {isMobileMapOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-30 bg-white">
          <LeafletMap 
            properties={rankedResults} 
            selectedProperty={hoveredProperty} 
            height="100%" 
          />
        </div>
      )}

    </div>
  );
}
