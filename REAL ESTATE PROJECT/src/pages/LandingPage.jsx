import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { parseNaturalLanguageQuery } from '../services/aiParser';
import PropertyCard from '../components/PropertyCard';
import CitySelector from '../components/CitySelector';
import { 
  Sparkles, Search, Mic, MicOff, Building2, Home, 
  Milestone, Layers, ShieldCheck, Check, ChevronRight, 
  Star, ChevronDown, Landmark, Users, Building, Heart,
  Navigation, MapPin, AlertCircle, LocateFixed, Compass, ArrowRight
} from 'lucide-react';
import { mockCities, mockCategories } from '../data/mockProperties';

export default function LandingPage() {
  const navigate = useNavigate();
  const { properties, setSearchQuery } = useAppStore();
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  // Location & City Discovery States
  const [selectedCity, setSelectedCity] = useState("Hyderabad");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [locationError, setLocationError] = useState("");
  const [activeDiscoveryMode, setActiveDiscoveryMode] = useState("city"); // 'nearby' | 'city'

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'en-IN'; // Indian English
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const handleVoiceSearch = () => {
    if (!recognition) {
      alert("Voice search is not supported in this browser. Please try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const parsed = parseNaturalLanguageQuery(query);
    setSearchQuery(query, parsed);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleQuickSearch = (suggestionText) => {
    setQuery(suggestionText);
    const parsed = parseNaturalLanguageQuery(suggestionText);
    setSearchQuery(suggestionText, parsed);
    navigate(`/search?q=${encodeURIComponent(suggestionText)}`);
  };

  // Location detection handler
  const handleFindHomesNearMe = () => {
    setIsDetectingLocation(true);
    setLocationError("");
    setLocationStatus("Requesting browser location permission...");

    if (!navigator.geolocation) {
      setIsDetectingLocation(false);
      setLocationError("Location access is unavailable. Search by city instead.");
      setActiveDiscoveryMode("city");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocationStatus("Location detected! Finding available properties near you...");

        // Try reverse geocode via Nominatim API with quick timeout fallback
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          const cityFound = data?.address?.city || data?.address?.town || data?.address?.county || data?.address?.state_district;
          if (cityFound) {
            setSelectedCity(cityFound);
            setLocationStatus(`Detected location: ${cityFound}. Showing available properties nearby.`);
          } else {
            setLocationStatus("Detected your coordinates! Showing available properties.");
          }
        } catch {
          // Fallback coordinate proximity matching
          if (lat >= 17.0 && lat <= 17.7 && lon >= 78.0 && lon <= 78.8) {
            setSelectedCity("Hyderabad");
          } else if (lat >= 16.3 && lat <= 16.7 && lon >= 80.4 && lon <= 80.8) {
            setSelectedCity("Vijayawada");
          } else if (lat >= 17.5 && lat <= 17.9 && lon >= 83.0 && lon <= 83.4) {
            setSelectedCity("Visakhapatnam");
          }
          setLocationStatus("Detected coordinates successfully!");
        }

        setIsDetectingLocation(false);
        setActiveDiscoveryMode("nearby");
      },
      (error) => {
        console.warn("Geolocation permission error:", error);
        setIsDetectingLocation(false);
        setLocationError("Location access is unavailable. Search by city instead.");
        setActiveDiscoveryMode("city");
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // Filter available properties (excluding rented & sold properties)
  const availableLocationProperties = useMemo(() => {
    return properties.filter(p => {
      // Exclude rented / sold
      if (p.availability === 'rented' || p.availability === 'sold') {
        return false;
      }
      // If city is selected, filter by city (case insensitive partial match)
      if (selectedCity && selectedCity.trim()) {
        const c1 = p.city?.toLowerCase() || '';
        const c2 = selectedCity.trim().toLowerCase();
        if (!c1.includes(c2) && !c2.includes(c1)) {
          // If no properties match exact city, we still include properties in the list
          return true;
        }
      }
      return true;
    });
  }, [properties, selectedCity]);

  // Exact city match list for highlight
  const exactCityProperties = useMemo(() => {
    return availableLocationProperties.filter(p => {
      if (!selectedCity) return true;
      const c1 = p.city?.toLowerCase() || '';
      const c2 = selectedCity.trim().toLowerCase();
      return c1.includes(c2) || c2.includes(c1);
    });
  }, [availableLocationProperties, selectedCity]);

  const displayedProperties = exactCityProperties.length > 0 ? exactCityProperties : availableLocationProperties;

  const stats = [
    { label: 'Properties Listed', count: '1,200+', icon: <Building className="h-5 w-5 text-blue-600" /> },
    { label: 'Verified Owners', count: '450+', icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> },
    { label: 'Cities Covered', count: '6+', icon: <Landmark className="h-5 w-5 text-orange-600" /> },
    { label: 'Happy Customers', count: '5,000+', icon: <Users className="h-5 w-5 text-indigo-600" /> },
  ];

  const suggestions = [
    "2BHK under ₹25k in Hyderabad near metro with balcony",
    "Villa to buy in Hyderabad under 80 Lakhs with parking",
    "Pet friendly apartment for rent in Bangalore near tech park"
  ];

  const steps = [
    {
      title: "1. Talk to Nestly",
      desc: "Describe what you need in plain simple English—budget, BHK layout, city, proximity to schools, hospitals, or transit.",
      icon: <Sparkles className="h-6 w-6 text-orange-500" />
    },
    {
      title: "2. Confirm Extracted Tags",
      desc: "Our AI extracts your preferences into interactive chips. Refine, add, or delete tags before running the search.",
      icon: <Layers className="h-6 w-6 text-blue-500" />
    },
    {
      title: "3. Explore Ranked Results",
      desc: "Instantly see matching listings ranked with a percentage compatibility score. Hover over reasons to understand recommendations.",
      icon: <Check className="h-6 w-6 text-emerald-500" />
    }
  ];

  const testimonials = [
    {
      name: "Rohit Deshmukh",
      role: "Software Architect",
      quote: "Finding a pet-friendly flat near Hitec city was a nightmare until I typed it into Nestly. The score accuracy was incredible—it matched my commute time and budget exactly!",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=rohit"
    },
    {
      name: "Ananya Sen",
      role: "College Professor",
      quote: "I wanted an independent house close to standard public schools in Bangalore. Instead of applying 15 different filters, I just spoke my mind and found the perfect place in Indiranagar in minutes.",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=ananya"
    }
  ];

  const faqs = [
    {
      q: "How does the AI search engine extract my requirements?",
      a: "Our conversational search uses structured NLP parsers to extract intent. It identifies key phrases like 'under 25k' as budget constraints, 'near metro' as transit requirements, and matches locations with geocoded databases."
    },
    {
      q: "What is the 'Compatibility Score'?",
      a: "The score represents how closely a property matches your preferences. It weighs budget match, spatial proximity to transit or hospitals, rooms size, and amenities. Verified listings receive a score boost."
    },
    {
      q: "How do I list my property as an Owner?",
      a: "Simply switch your role to 'Owner' in the header navigation, click 'Owner Portal' or go to your dashboard, and fill out the upload form. You can add geolocations, amenities, and verify documentation."
    }
  ];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FFFDF7] animate-fade-in text-[#2D2A26]">
      
      {/* 1. Hero Section & Find Homes */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#F8F5ED] via-[#FFFDF7] to-[#FFFDF7] py-24 px-4 border-b border-[#E8E1D5]">
        {/* Glow Spheres */}
        <div className="absolute top-12 left-1/4 h-72 w-72 rounded-full bg-[#d4af37]/5 blur-3xl"></div>
        <div className="absolute bottom-6 right-1/4 h-72 w-72 rounded-full bg-[#d4af37]/5 blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          
          {/* AI Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#b8962e] text-xs font-bold shadow-md shadow-[#d4af37]/5">
            <Sparkles className="h-3.5 w-3.5 animate-spin-slow text-[#d4af37]" />
            SMART PROPERTY DISCOVERY
          </div>

          {/* Heading */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight text-[#2D2A26] leading-[1.1] max-w-3xl mx-auto">
            Find Your Perfect Home <span className="gradient-text-ai">Near You</span>
          </h1>

          <p className="text-base sm:text-lg text-[#6F6A61] max-w-2xl mx-auto leading-relaxed font-semibold">
            Search homes by location, explore cities across Andhra Pradesh & Telangana, or let our AI engine rank recommendations.
          </p>

          {/* Location & City Discovery Controls */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-xl border border-[#E8E1D5] max-w-3xl mx-auto space-y-4 text-left">
            
            {/* Top Toggle Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-3 border-b border-[#E8E1D5]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFindHomesNearMe}
                  disabled={isDetectingLocation}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                    activeDiscoveryMode === 'nearby' 
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-white shadow-md' 
                      : 'bg-[#F8F5ED] hover:bg-[#F3EDE0] text-[#2D2A26] border border-[#E8E1D5]'
                  }`}
                >
                  <LocateFixed className={`h-4 w-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  {isDetectingLocation ? 'Detecting Location...' : 'Properties Near My Location'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDiscoveryMode('city')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeDiscoveryMode === 'city' 
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-white shadow-md' 
                      : 'bg-[#F8F5ED] hover:bg-[#F3EDE0] text-[#2D2A26] border border-[#E8E1D5]'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  Search By City
                </button>
              </div>

              <span className="text-[11px] font-bold text-[#b8962e] bg-[#d4af37]/10 px-2.5 py-1 rounded-full border border-[#d4af37]/20 flex items-center gap-1">
                <Compass className="h-3.5 w-3.5" />
                Normal + AI Search
              </span>
            </div>

            {/* City Selector & Search Bar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-5">
                <label className="text-[10px] font-bold text-[#9A948A] uppercase tracking-wider block mb-1">
                  Select / Search City (AP & Telangana)
                </label>
                <CitySelector 
                  id="landing-city-selector"
                  value={selectedCity} 
                  onChange={(val) => {
                    setSelectedCity(val);
                    setLocationError("");
                    setLocationStatus(`Showing properties in ${val}`);
                    setActiveDiscoveryMode('city');
                  }} 
                />
              </div>

              {/* AI Query Input */}
              <div className="sm:col-span-7 space-y-1">
                <label className="text-[10px] font-bold text-[#9A948A] uppercase tracking-wider block">
                  Or Describe Need to AI Search
                </label>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="flex-1 flex items-center bg-[#F8F5ED] border border-[#E8E1D5] rounded-xl px-3 py-1.5 focus-within:border-[#d4af37]">
                    <Search className="h-4 w-4 text-[#d4af37] shrink-0 mr-2" />
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder='e.g. "2BHK under ₹25k near metro"'
                      className="w-full bg-transparent border-none text-[#2D2A26] placeholder-[#9A948A] text-xs font-semibold focus:outline-none py-1"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceSearch}
                      className="text-[#9A948A] hover:text-[#d4af37]"
                    >
                      {isListening ? <MicOff className="h-4 w-4 text-red-500 animate-pulse" /> : <Mic className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1 shrink-0 hover:opacity-95"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Search
                  </button>
                </form>
              </div>
            </div>

            {/* Geolocation Feedback Messages */}
            {locationStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <LocateFixed className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{locationStatus}</span>
              </div>
            )}

            {locationError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

          </div>

          {/* Voice status */}
          {isListening && (
            <p className="text-xs text-red-500 font-bold animate-pulse">
              Listening... Speak now.
            </p>
          )}

          {/* Suggestion Tags */}
          <div className="pt-2 text-left max-w-3xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A948A] mr-2 block sm:inline mb-2 sm:mb-0">
              Example Searches:
            </span>
            <div className="flex flex-wrap gap-2 inline-flex">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickSearch(s)}
                  className="text-xs bg-[#F8F5ED] hover:bg-[#d4af37]/10 hover:text-[#b8962e] border border-[#E8E1D5] hover:border-[#d4af37]/30 text-[#6F6A61] px-3 py-1.5 rounded-full transition font-semibold text-left leading-normal"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Location-Based Properties Discovery Grid */}
      <section className="w-full py-16 bg-[#FFFDF7] px-4 sm:px-6 lg:px-8 border-b border-[#E8E1D5]">
        <div className="max-w-7xl mx-auto space-y-8 text-left">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 text-[#b8962e] text-[11px] font-bold uppercase tracking-wider mb-2">
                <MapPin className="h-3.5 w-3.5 text-[#d4af37]" />
                Available Properties in {selectedCity}
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#2D2A26]">
                Normal Location Discovery ({displayedProperties.length} Properties)
              </h2>
              <p className="text-xs sm:text-sm text-[#6F6A61] font-semibold mt-1">
                Showing available houses, apartments, and villas currently listed in {selectedCity}. Rented/Sold properties are excluded.
              </p>
            </div>

            <button 
              onClick={() => navigate(`/search?q=${encodeURIComponent(selectedCity)}`)}
              className="px-4 py-2.5 bg-[#F8F5ED] hover:bg-[#F3EDE0] border border-[#E8E1D5] text-[#2D2A26] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              View all in {selectedCity}
              <ArrowRight className="h-4 w-4 text-[#d4af37]" />
            </button>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProperties.slice(0, 6).map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
