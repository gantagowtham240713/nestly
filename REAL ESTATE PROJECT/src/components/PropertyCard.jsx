import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  Heart, ArrowLeftRight, MessageSquare, ChevronLeft, 
  ChevronRight, Shield, Award, MapPin, Building, BedDouble, Bath, Maximize, Sparkles
} from 'lucide-react';

export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const { 
    favorites, 
    toggleFavorite, 
    comparedProperties, 
    addComparedProperty, 
    removeComparedProperty,
    startConversation
  } = useAppStore();

  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const isFavorite = favorites.includes(property.id);
  const isCompared = comparedProperties.some(p => p.id === property.id);

  const handleNextImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIdx((prev) => (prev + 1) % property.images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIdx((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const handleCompareToggle = (e) => {
    e.stopPropagation();
    if (isCompared) {
      removeComparedProperty(property.id);
    } else {
      addComparedProperty(property);
    }
  };

  const handleQuickChat = (e) => {
    e.stopPropagation();
    e.preventDefault();
    startConversation(property);
    navigate('/chats');
  };

  // Format price
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

  return (
    <div className="bg-white rounded-2xl border border-[#E8E1D5] overflow-hidden shadow-md hover:shadow-xl hover:border-[#d4af37]/30 transition-all duration-300 flex flex-col md:flex-row relative group">
      
      {/* 1. Image Carousel (Left side on desktop) */}
      <div className="relative w-full md:w-72 h-52 shrink-0 overflow-hidden bg-[#F3EDE0]">
        <img 
          src={property.images[currentImgIdx]} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Navigation arrows (shown on hover) */}
        {property.images.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-[#2D2A26] transition opacity-0 group-hover:opacity-100 z-10 shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-[#2D2A26] transition opacity-0 group-hover:opacity-100 z-10 shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Carousel Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
          {property.images.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 w-1.5 rounded-full transition ${idx === currentImgIdx ? 'bg-[#d4af37] scale-125' : 'bg-white/70'}`}
            ></div>
          ))}
        </div>

        {/* AI Score Tag Overlay */}
        {property.matchScore !== undefined && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-extrabold shadow-md flex items-center gap-1 bg-white/90 backdrop-blur-md border border-[#d4af37]/20 text-[#d4af37]">
            <Award className="h-3.5 w-3.5" />
            <span>{property.matchRating} • {property.matchScore}% AI MATCH</span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavorite(property.id); }}
          className={`absolute top-3 right-3 p-2 rounded-xl border transition ${
            isFavorite 
              ? 'bg-rose-500 border-rose-500 text-white shadow-md' 
              : 'bg-white/80 backdrop-blur-sm border-[#E8E1D5] text-[#6F6A61] hover:text-rose-500'
          }`}
          title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className="h-4 w-4 fill-current" />
        </button>

      </div>

      {/* 2. Content Details (Right side on desktop) */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        
        <div className="space-y-2">
          
          {/* Header row: Price & Badges */}
          <div className="flex justify-between items-start">
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#d4af37]">
              {formatPrice(property.price, property.purpose)}
            </h3>
            
            <div className="flex gap-1.5">
              {property.verifiedProperty && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <Shield className="h-3 w-3 fill-current" />
                  Property
                </span>
              )}
              {property.verifiedOwner && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[#d4af37]/10 text-[#b8962e] text-[10px] font-bold border border-[#d4af37]/20">
                  <Shield className="h-3 w-3 fill-current" />
                  Owner
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <Link 
            to={`/property/${property.id}`} 
            className="font-display font-bold text-[#2D2A26] hover:text-[#d4af37] transition block line-clamp-1"
          >
            {property.title}
          </Link>

          {/* Locality */}
          <p className="text-[#6F6A61] text-xs font-semibold flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-[#9A948A] shrink-0" />
            {property.locality}, {property.city}
          </p>

          {/* Quick Specifications */}
          <div className="flex flex-wrap items-center gap-4 py-2 border-y border-[#E8E1D5] text-[#6F6A61] text-xs font-semibold">
            <div className="flex items-center gap-1">
              <BedDouble className="h-4 w-4 text-[#d4af37]" />
              <span>{property.bhk} BHK</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-[#d4af37]" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4 text-[#d4af37]" />
              <span>{property.area} sqft</span>
            </div>
            <div className="capitalize px-2 py-0.5 rounded bg-[#F3EDE0] border border-[#E8E1D5] text-[10px] text-[#6F6A61] font-bold">
              {property.furnishing}
            </div>
          </div>

          {/* Recommendation Reasons Checkmarks */}
          {property.matchReasons && property.matchReasons.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#d4af37] flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse" />
                AI COMMENDED REASONS:
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 text-[11px] font-semibold text-[#6F6A61]">
                {property.matchReasons.map((reason, index) => (
                  <span key={index} className="line-clamp-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#d4af37] shrink-0" />
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between border-t border-[#E8E1D5] pt-4 mt-4">
          
          {/* Compare Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#6F6A61] hover:text-[#d4af37] transition select-none">
            <input 
              type="checkbox" 
              checked={isCompared}
              onChange={handleCompareToggle}
              className="rounded border-[#E8E1D5] bg-white text-[#d4af37] focus:ring-[#d4af37] h-4 w-4 cursor-pointer"
            />
            <ArrowLeftRight className="h-3.5 w-3.5 text-[#9A948A]" />
            Compare
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleQuickChat}
              className="p-2.5 rounded-xl border border-[#E8E1D5] text-[#6F6A61] hover:text-[#d4af37] hover:bg-[#F8F5ED] transition"
              title="Chat with owner"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <Link
              to={`/property/${property.id}`}
              className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8962e] hover:opacity-95 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-[#d4af37]/10"
            >
              View Details
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
