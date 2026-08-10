import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { parseNaturalLanguageQuery } from '../services/aiParser';
import { 
  Sparkles, Search, Mic, MicOff, Building2, Home, 
  Milestone, Layers, ShieldCheck, Check, ChevronRight, 
  Star, ChevronDown, Landmark, Users, Building, Heart
} from 'lucide-react';
import { mockCities, mockCategories } from '../data/mockProperties';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setSearchQuery } = useAppStore();
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

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
    <div className="flex flex-col items-center w-full min-h-screen bg-slate-50 animate-fade-in">
      
      {/* 1. Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 py-20 px-4">
        {/* Glow Spheres */}
        <div className="absolute top-12 left-1/4 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"></div>
        <div className="absolute bottom-6 right-1/4 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          
          {/* AI Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold shadow-sm">
            <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
            AI-POWERED REAL ESTATE SEARCH
          </div>

          {/* Heading */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight text-slate-900 leading-[1.1] max-w-3xl mx-auto">
            Find Your Perfect Home Using <span className="text-primary bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-semibold">
            Describe your dream home in one sentence and let our AI engine find, rank, and explain the best matches instantly.
          </p>

          {/* AI Search Box */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="w-full max-w-3xl mx-auto bg-white p-2 rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-500/5 border border-slate-200 flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center px-4 gap-3">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try: "2BHK under ₹25k near metro with good schools."'
                className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 text-sm font-semibold focus:outline-none py-3"
              />
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-2 rounded-xl transition shrink-0 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-primary hover:bg-slate-50'
                }`}
                title="Voice Search"
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="flex gap-2 p-1 sm:p-0">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl sm:rounded-2xl gradient-bg-ai text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 hover:opacity-95 hover:scale-[1.01] transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-4 w-4" />
                AI Search
              </button>
              <button
                type="button"
                onClick={() => navigate('/search')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
              >
                Explore
              </button>
            </div>
          </form>

          {/* Voice status */}
          {isListening && (
            <p className="text-xs text-red-500 font-bold animate-pulse">
              Listening... Speak now.
            </p>
          )}

          {/* Suggestion Tags */}
          <div className="pt-2 text-left max-w-3xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 block sm:inline mb-2 sm:mb-0">
              Example Searches:
            </span>
            <div className="flex flex-wrap gap-2 inline-flex">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickSearch(s)}
                  className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-primary border border-slate-200 hover:border-blue-200 text-slate-600 px-3 py-1.5 rounded-full transition font-semibold text-left leading-normal"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="w-full py-12 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center mb-3 border border-slate-100 shadow-sm">
                  {stat.icon}
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">{stat.count}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How AI Works */}
      <section className="w-full py-20 bg-slate-50 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <h2 className="font-display font-bold text-3xl text-slate-900">How Nestly Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm font-semibold">
              Skip applying dozens of search filters. We process requirements like a human expert would.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-left relative flex flex-col justify-between hover:shadow-md transition duration-300"
              >
                <div>
                  <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm mb-6">
                    {step.icon}
                  </div>
                  <h4 className="font-display font-bold text-lg text-slate-800 mb-2">{step.title}</h4>
                  <p className="text-xs leading-relaxed text-slate-500 font-semibold">{step.desc}</p>
                </div>
                <div className="absolute top-8 right-8 font-display font-black text-4xl text-slate-100">
                  0{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Popular Cities */}
      <section className="w-full py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h2 className="font-display font-bold text-3xl text-slate-900">Search by Popular Cities</h2>
              <p className="text-slate-500 text-sm font-semibold">Explore verified listings in India's top residential and commercial hubs.</p>
            </div>
            <button 
              onClick={() => navigate('/search')}
              className="text-primary hover:text-primary-hover font-bold text-sm flex items-center gap-1 group transition"
            >
              See all properties 
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {mockCities.map((city, idx) => (
              <div 
                key={idx}
                onClick={() => handleQuickSearch(`Properties in ${city.name}`)}
                className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition duration-300"
              >
                <img 
                  src={city.image} 
                  alt={city.name}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="font-display font-bold text-sm tracking-wide">{city.name}</h4>
                  <p className="text-[10px] text-slate-300 font-medium mt-0.5">{city.count} Listings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Property Categories */}
      <section className="w-full py-16 bg-slate-50 px-4 border-t border-slate-100">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-display font-bold text-3xl text-slate-900">Explore Property Categories</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm font-semibold">Filter your perfect match by structural classifications.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mockCategories.map((cat, idx) => {
              // Standard rendering mapping to icons
              let iconNode = <Building2 className="h-6 w-6 text-primary" />;
              if (cat.name === "Villas") iconNode = <Home className="h-6 w-6 text-emerald-600" />;
              if (cat.name === "Independent Houses") iconNode = <Milestone className="h-6 w-6 text-orange-600" />;
              if (cat.name === "Builder Floors") iconNode = <Layers className="h-6 w-6 text-indigo-600" />;

              return (
                <div 
                  key={idx}
                  onClick={() => handleQuickSearch(`Find a ${cat.value} for rent`)}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-100 transition group flex flex-col items-center text-center"
                >
                  <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition border border-slate-100">
                    {iconNode}
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-800">{cat.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-1">{cat.count} listings available</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="w-full py-20 bg-white px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-display font-bold text-3xl text-slate-900">What Our Users Say</h2>
            <p className="text-slate-500 max-w-sm mx-auto text-sm font-semibold">Hear from home-seekers who bypassed manual filters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-slate-50/60 border border-slate-100 p-8 rounded-2xl relative shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed italic text-slate-600 font-medium">"{test.quote}"</p>
                </div>
                <div className="flex items-center gap-3 pt-6 mt-4 border-t border-slate-100">
                  <img src={test.avatar} alt={test.name} className="h-10 w-10 rounded-full border border-slate-200 bg-white" />
                  <div>
                    <h5 className="font-display font-bold text-xs text-slate-800">{test.name}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQs */}
      <section className="w-full py-20 bg-slate-50 px-4 border-t border-slate-100">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-display font-bold text-3xl text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm font-semibold">Got questions about Nestly? We've got answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50/50 transition focus:outline-none"
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-800">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-slate-500 leading-relaxed font-semibold border-t border-slate-100 animate-fade-in bg-slate-50/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
