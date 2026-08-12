import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { calculateMatchScore } from '../services/recommendation';
import GoogleMap from '../components/GoogleMap';
import { 
  Sparkles, Award, Shield, Phone, MessageSquare, Heart, 
  ArrowLeftRight, MapPin, BedDouble, Bath, Maximize, 
  Calendar, Check, X, ShieldCheck, ChevronRight, Eye, Info
} from 'lucide-react';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    properties, 
    favorites, 
    toggleFavorite, 
    comparedProperties, 
    addComparedProperty, 
    removeComparedProperty,
    startConversation,
    parsedPreferences
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'amenities' | 'documents'
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  // Retrieve property
  const property = useMemo(() => {
    return properties.find(p => p.id === id);
  }, [properties, id]);

  // Compute AI Match details specifically for this property based on last active preference
  const matchDetails = useMemo(() => {
    if (!property) return null;
    return calculateMatchScore(property, parsedPreferences || {});
  }, [property, parsedPreferences]);

  // Related properties (same city, excluding current)
  const relatedProperties = useMemo(() => {
    if (!property) return [];
    return properties
      .filter(p => p.city === property.city && p.id !== property.id)
      .slice(0, 3);
  }, [properties, property]);

  if (!property) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#2D2A26]">Property Listing Not Found</h2>
        <p className="text-[#6F6A61]">The property you are looking for does not exist or has been removed.</p>
        <Link to="/search" className="inline-block px-5 py-2.5 bg-[#2D2A26] text-white rounded-xl text-xs font-bold font-sans">
          Back to Listings
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.includes(property.id);
  const isCompared = comparedProperties.some(p => p.id === property.id);

  const handleCompareToggle = () => {
    if (isCompared) {
      removeComparedProperty(property.id);
    } else {
      addComparedProperty(property);
    }
  };

  const handleStartChat = () => {
    startConversation(property);
    navigate('/chats');
  };

  // Format price
  const formatPrice = (val, purpose) => {
    if (purpose === 'rent') {
      return `₹${val.toLocaleString('en-IN')}/month`;
    } else {
      if (val >= 10000000) {
        return `₹${(val / 10000000).toFixed(2)} Crore`;
      }
      return `₹${(val / 100000).toFixed(0)} Lakhs`;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFDF7] pb-16 animate-fade-in text-[#2D2A26]">
      
      {/* Detail Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex justify-between items-center text-xs font-bold text-[#9A948A] mb-6 uppercase tracking-wider text-left">
          <div className="flex items-center gap-1.5">
            <Link to="/" className="hover:text-[#d4af37]">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/search" className="hover:text-[#d4af37]">Listings</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#6F6A61] truncate max-w-[200px]">{property.title}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCompareToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition font-semibold ${
                isCompared 
                  ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#b8962e]' 
                  : 'bg-[#F8F5ED] border-[#E8E1D5] text-[#6F6A61] hover:bg-[#F3EDE0]'
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              {isCompared ? 'Comparing' : 'Compare'}
            </button>
            <button 
              onClick={() => toggleFavorite(property.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition font-semibold ${
                isFavorite 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : 'bg-[#F8F5ED] border-[#E8E1D5] text-[#6F6A61] hover:bg-[#F3EDE0]'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* 1. Header Grid: Title and Price */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 text-left">
          <div className="space-y-1">
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[#2D2A26] leading-tight">
              {property.title}
            </h1>
            <p className="text-[#6F6A61] text-xs sm:text-sm font-semibold flex items-center gap-1">
              <MapPin className="h-4 w-4 text-[#d4af37] shrink-0" />
              {property.locality}, {property.city}
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#9A948A]">Asking Price</p>
            <p className="font-display font-black text-2xl sm:text-3xl text-[#d4af37]">
              {formatPrice(property.price, property.purpose)}
            </p>
          </div>
        </div>

        {/* 2. Image Gallery & Side AI recommendations panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 text-left">
          
          {/* Main gallery (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="w-full h-80 sm:h-[420px] rounded-3xl overflow-hidden bg-[#F3EDE0] relative border border-[#E8E1D5]">
              <img 
                src={property.images[activeImageIdx]} 
                alt={property.title} 
                className="w-full h-full object-cover"
              />
              
              {/* Image indices indicators overlay */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-[#2D2A26] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#E8E1D5] shadow-sm">
                {activeImageIdx + 1} / {property.images.length}
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`h-16 w-24 sm:h-20 sm:w-28 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    idx === activeImageIdx ? 'border-[#d4af37] shadow-md scale-[0.98]' : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* AI Compatibility Panel (1/3 width) */}
          <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
            {/* Design Watermark */}
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#d4af37]/5 blur-2xl"></div>

            <div className="space-y-6">
              
              {/* Badge */}
              <div className="flex justify-between items-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d4af37]/10 text-[#b8962e] text-xs font-bold border border-[#d4af37]/20">
                  <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
                  AI RECOMMENDATION
                </div>
                <div className="text-[10px] font-bold text-[#6F6A61] flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-[#d4af37]" />
                  {property.views} Views
                </div>
              </div>

              {/* Match circle */}
              {matchDetails && (
                <div className="flex items-center gap-4 py-2">
                  <div className="h-20 w-20 rounded-full border-4 border-[#d4af37]/15 flex items-center justify-center relative shrink-0">
                    {/* Glowing ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-[#d4af37] border-t-transparent animate-spin-slow"></div>
                    <span className="font-display font-black text-2xl text-[#d4af37]">{matchDetails.score}%</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-[#2D2A26]">{matchDetails.rating}</h4>
                    <p className="text-[11px] text-[#6F6A61] font-semibold mt-0.5 leading-snug">Based on compatibility matching criteria.</p>
                  </div>
                </div>
              )}

              {/* Explainers check list */}
              {matchDetails && (
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A948A] flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-[#9A948A]" />
                    Compatibility Details:
                  </p>
                  <div className="space-y-2">
                    {matchDetails.reasons.map((reason, index) => (
                      <div key={index} className="flex gap-2 text-xs font-semibold text-[#6F6A61] items-start">
                        <span className="shrink-0">{reason.startsWith('✓') ? '✅' : reason.startsWith('⚠') ? '⚠️' : '❌'}</span>
                        <span>{reason.substring(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Owner quick card */}
            <div className="border-t border-[#E8E1D5] pt-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={property.owner.avatar} 
                  alt={property.owner.name} 
                  className="h-11 w-11 rounded-full border border-[#d4af37]/20 bg-[#F3EDE0]"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="font-display font-bold text-xs text-[#2D2A26]">{property.owner.name}</h4>
                    {property.owner.verified && <ShieldCheck className="h-3.5 w-3.5 text-[#d4af37] fill-current" />}
                  </div>
                  <p className="text-[10px] text-[#6F6A61] font-semibold capitalize">{property.owner.role} • Verified Owner</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleStartChat}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-white text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-md shadow-[#d4af37]/10"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat with Owner
                </button>
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="p-3 border border-[#E8E1D5] rounded-xl text-[#6F6A61] hover:text-[#d4af37] hover:bg-[#F8F5ED] transition"
                  title="Show Phone Number"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
              {showPhone && (
                <p className="text-center font-bold text-xs text-emerald-700 mt-2 p-1.5 bg-emerald-50 rounded-lg animate-fade-in border border-emerald-200">
                  Call: {property.owner.phone}
                </p>
              )}
            </div>

          </div>

        </div>

        {/* 3. Detailed Specifications Grid (Tabs layout on left, custom Leaflet Map on right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16 text-left">
          
          {/* Details Tabs Panel (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tab Navigators */}
            <div className="flex border-b border-[#E8E1D5]">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`py-3.5 px-6 font-display font-bold text-sm border-b-2 transition ${
                  activeTab === 'overview' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-[#9A948A] hover:text-[#2D2A26]'
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('amenities')}
                className={`py-3.5 px-6 font-display font-bold text-sm border-b-2 transition ${
                  activeTab === 'amenities' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-[#9A948A] hover:text-[#2D2A26]'
                }`}
              >
                Amenities & Interior
              </button>
              <button 
                onClick={() => setActiveTab('documents')}
                className={`py-3.5 px-6 font-display font-bold text-sm border-b-2 transition ${
                  activeTab === 'documents' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-[#9A948A] hover:text-[#2D2A26]'
                }`}
              >
                Verification Documents
              </button>
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in bg-white rounded-3xl p-6 border border-[#E8E1D5] shadow-sm">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#E8E1D5]">
                    <BedDouble className="h-6 w-6 text-[#d4af37] mx-auto mb-1.5" />
                    <p className="font-extrabold text-sm text-[#2D2A26]">{property.bhk} BHK</p>
                    <p className="text-[10px] text-[#9A948A] font-bold uppercase mt-0.5">Bedrooms</p>
                  </div>
                  <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#E8E1D5]">
                    <Bath className="h-6 w-6 text-[#d4af37] mx-auto mb-1.5" />
                    <p className="font-extrabold text-sm text-[#2D2A26]">{property.bathrooms} Bathrooms</p>
                    <p className="text-[10px] text-[#9A948A] font-bold uppercase mt-0.5">Baths</p>
                  </div>
                  <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#E8E1D5]">
                    <Maximize className="h-6 w-6 text-[#d4af37] mx-auto mb-1.5" />
                    <p className="font-extrabold text-sm text-[#2D2A26]">{property.area} sqft</p>
                    <p className="text-[10px] text-[#9A948A] font-bold uppercase mt-0.5">Super Area</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-display font-bold text-lg text-[#2D2A26]">Property Description</h3>
                  <p className="text-xs sm:text-sm text-[#6F6A61] leading-relaxed font-semibold">
                    {property.description}
                  </p>
                </div>

                {/* Floor Plan representation */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-display font-bold text-lg text-[#2D2A26]">Interior Floor Plan</h3>
                  <div className="border border-dashed border-[#E8E1D5] rounded-2xl p-4 bg-[#FFFDF7] flex items-center justify-center">
                    {/* SVG architectural blueprint representation */}
                    <svg className="w-full max-w-md h-52 text-[#E8E1D5]" viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {/* Outer boundary */}
                      <rect x="10" y="10" width="180" height="80" rx="4" strokeWidth="2" stroke="rgba(212, 175, 55, 0.3)" />
                      {/* Room splits */}
                      <line x1="70" y1="10" x2="70" y2="90" stroke="rgba(212, 175, 55, 0.3)" />
                      <line x1="70" y1="50" x2="130" y2="50" stroke="rgba(212, 175, 55, 0.3)" />
                      <line x1="130" y1="10" x2="130" y2="90" stroke="rgba(212, 175, 55, 0.3)" />
                      {/* Doors indications */}
                      <path d="M 60 90 A 10 10 0 0 0 70 80" stroke="rgba(212, 175, 55, 0.5)" />
                      <path d="M 120 50 A 10 10 0 0 0 130 40" stroke="rgba(212, 175, 55, 0.5)" />
                      {/* Room labels */}
                      <text x="35" y="45" fill="#6F6A61" fontSize="6" fontWeight="bold" textAnchor="middle">MASTER BEDROOM</text>
                      <text x="35" y="55" fill="#d4af37" fontSize="5" textAnchor="middle">12' x 14'</text>

                      <text x="100" y="30" fill="#6F6A61" fontSize="6" fontWeight="bold" textAnchor="middle">LIVING ROOM</text>
                      <text x="100" y="40" fill="#d4af37" fontSize="5" textAnchor="middle">16' x 12'</text>

                      <text x="100" y="70" fill="#6F6A61" fontSize="6" fontWeight="bold" textAnchor="middle">KITCHEN</text>
                      <text x="100" y="80" fill="#d4af37" fontSize="5" textAnchor="middle">10' x 8'</text>

                      <text x="160" y="45" fill="#6F6A61" fontSize="6" fontWeight="bold" textAnchor="middle">BEDROOM 2</text>
                      <text x="160" y="55" fill="#d4af37" fontSize="5" textAnchor="middle">10' x 11'</text>
                    </svg>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: Amenities */}
            {activeTab === 'amenities' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in bg-white rounded-3xl p-6 border border-[#E8E1D5] shadow-sm">
                <div className={`p-4 border rounded-2xl text-center flex flex-col items-center justify-center ${property.parking ? 'border-[#d4af37]/20 bg-[#d4af37]/5' : 'border-[#E8E1D5] bg-[#F8F5ED] opacity-50'}`}>
                  <span className="text-xl mb-1">{property.parking ? '🚗' : '❌'}</span>
                  <p className="font-bold text-xs text-[#2D2A26]">Parking</p>
                  <p className="text-[10px] text-[#6F6A61] font-semibold">{property.parking ? 'Covered Spot' : 'Not Available'}</p>
                </div>

                <div className={`p-4 border rounded-2xl text-center flex flex-col items-center justify-center ${property.gym ? 'border-[#d4af37]/20 bg-[#d4af37]/5' : 'border-[#E8E1D5] bg-[#F8F5ED] opacity-50'}`}>
                  <span className="text-xl mb-1">{property.gym ? '🏋️' : '❌'}</span>
                  <p className="font-bold text-xs text-[#2D2A26]">Gymnasium</p>
                  <p className="text-[10px] text-[#6F6A61] font-semibold">{property.gym ? 'Common Access' : 'Not Available'}</p>
                </div>

                <div className={`p-4 border rounded-2xl text-center flex flex-col items-center justify-center ${property.balcony ? 'border-[#d4af37]/20 bg-[#d4af37]/5' : 'border-[#E8E1D5] bg-[#F8F5ED] opacity-50'}`}>
                  <span className="text-xl mb-1">{property.balcony ? '🌅' : '❌'}</span>
                  <p className="font-bold text-xs text-[#2D2A26]">Balcony</p>
                  <p className="text-[10px] text-[#6F6A61] font-semibold">{property.balcony ? 'Spacious Balcony' : 'None'}</p>
                </div>

                <div className={`p-4 border rounded-2xl text-center flex flex-col items-center justify-center ${property.petFriendly ? 'border-[#d4af37]/20 bg-[#d4af37]/5' : 'border-[#E8E1D5] bg-[#F8F5ED] opacity-50'}`}>
                  <span className="text-xl mb-1">{property.petFriendly ? '🐾' : '❌'}</span>
                  <p className="font-bold text-xs text-[#2D2A26]">Pet Friendly</p>
                  <p className="text-[10px] text-[#6F6A61] font-semibold">{property.petFriendly ? 'Allowed' : 'Not Allowed'}</p>
                </div>

                <div className={`p-4 border rounded-2xl text-center flex flex-col items-center justify-center ${property.gatedCommunity ? 'border-[#d4af37]/20 bg-[#d4af37]/5' : 'border-[#E8E1D5] bg-[#F8F5ED] opacity-50'}`}>
                  <span className="text-xl mb-1">{property.gatedCommunity ? '🛡️' : '❌'}</span>
                  <p className="font-bold text-xs text-[#2D2A26]">Gated Community</p>
                  <p className="text-[10px] text-[#6F6A61] font-semibold">{property.gatedCommunity ? '24/7 Security' : 'Open Access'}</p>
                </div>

                <div className={`p-4 border rounded-2xl text-center flex flex-col items-center justify-center ${property.bachelorFriendly ? 'border-[#d4af37]/20 bg-[#d4af37]/5' : 'border-[#E8E1D5] bg-[#F8F5ED] opacity-50'}`}>
                  <span className="text-xl mb-1">{property.bachelorFriendly ? '🎓' : '❌'}</span>
                  <p className="font-bold text-xs text-[#2D2A26]">Bachelors Allowed</p>
                  <p className="text-[10px] text-[#6F6A61] font-semibold">{property.bachelorFriendly ? 'Bachelors Welcome' : 'Families Only'}</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Documents */}
            {activeTab === 'documents' && (
              <div className="space-y-4 animate-fade-in bg-white rounded-3xl p-6 border border-[#E8E1D5] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-[#d4af37]" />
                  <h3 className="font-display font-bold text-[#2D2A26] text-sm sm:text-base">Document Verification Ledger</h3>
                </div>
                <div className="space-y-3">
                  {property.documents.map((doc, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3.5 bg-[#FFFDF7] border border-[#E8E1D5] rounded-xl text-xs sm:text-sm font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
                        <span className="text-[#6F6A61]">{doc.name}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: OpenStreetMap nearby context panel */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-[#2D2A26] px-1">Nearby Connectivity Map</h3>
            <div className="h-80 w-full rounded-3xl overflow-hidden relative border border-[#E8E1D5]">
              <GoogleMap 
                properties={[property]} 
                selectedProperty={property} 
                height="100%" 
              />
            </div>
            
            {/* Distances keycard */}
            <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 space-y-2 shadow-sm text-xs font-semibold text-[#6F6A61]">
              {property.distanceToMetro && (
                <div className="flex justify-between items-center p-1">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500"></span> Metro Station</span>
                  <span className="text-[#2D2A26] font-bold">{property.distanceToMetro}m ({property.nearbyMetroStation})</span>
                </div>
              )}
              {property.distanceToSchool && (
                <div className="flex justify-between items-center p-1">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-500"></span> Public School</span>
                  <span className="text-[#2D2A26] font-bold">{property.distanceToSchool}m ({property.nearbySchool})</span>
                </div>
              )}
              {property.distanceToHospital && (
                <div className="flex justify-between items-center p-1">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500"></span> Hospital</span>
                  <span className="text-[#2D2A26] font-bold">{property.distanceToHospital}m ({property.nearbyHospital})</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 4. Related Properties section */}
        {relatedProperties.length > 0 && (
          <div className="space-y-6 border-t border-[#E8E1D5] pt-12 text-left">
            <h3 className="font-display font-bold text-xl text-[#2D2A26]">Similar Properties in {property.city}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProperties.map((related) => {
                // Determine format
                const priceLabel = related.purpose === 'rent' 
                  ? `₹${related.price.toLocaleString('en-IN')}/mo` 
                  : `₹${(related.price / 100000).toFixed(0)} Lakhs`;

                return (
                  <Link 
                    key={related.id}
                    to={`/property/${related.id}`}
                    onClick={() => { window.scrollTo(0, 0); setActiveImageIdx(0); }}
                    className="bg-white border border-[#E8E1D5] rounded-2xl overflow-hidden shadow-sm hover:border-[#d4af37]/20 hover:shadow-md hover:scale-[1.01] transition duration-200 flex flex-col"
                  >
                    <div className="h-44 w-full bg-[#F3EDE0] overflow-hidden relative">
                      <img src={related.images[0]} alt={related.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[#2D2A26] text-[10px] font-bold border border-[#E8E1D5]">
                        {related.bhk} BHK
                      </div>
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-[#2D2A26] line-clamp-1">{related.title}</h4>
                        <p className="text-[10px] text-[#6F6A61] font-semibold">{related.locality}, {related.city}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#E8E1D5]">
                        <span className="font-black text-xs text-[#d4af37]">{priceLabel}</span>
                        <span className="text-[9px] font-bold text-[#b8962e] bg-[#d4af37]/10 px-2 py-0.5 rounded">
                          View details
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
