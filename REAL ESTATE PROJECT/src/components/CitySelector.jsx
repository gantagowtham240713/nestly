import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Check } from 'lucide-react';
import { 
  TELANGANA_CITIES, 
  ANDHRA_PRADESH_CITIES, 
  OTHER_MAJOR_INDIAN_CITIES,
  searchCities 
} from '../data/citiesData';

export default function CitySelector({ 
  value, 
  onChange, 
  placeholder = "Select City",
  className = "",
  showIcon = true,
  id = "city-selector"
}) {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpenSuggestions, setIsOpenSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  // Sync state if value is not in standard list or if "Other City" was chosen
  useEffect(() => {
    if (isSearchMode && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchMode]);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__OTHER_CITY__') {
      setIsSearchMode(true);
      setSearchQuery("");
      setSuggestions(searchCities(""));
      setIsOpenSuggestions(true);
    } else {
      setIsSearchMode(false);
      onChange(val);
    }
  };

  const handleSearchInputChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    const matches = searchCities(q);
    setSuggestions(matches);
    setIsOpenSuggestions(true);
    // Also notify parent if user typed custom city
    if (q.trim()) {
      onChange(q.trim());
    }
  };

  const handleSelectSuggestion = (city) => {
    setSearchQuery(city);
    onChange(city);
    setIsOpenSuggestions(false);
  };

  const handleClearSearch = () => {
    setIsSearchMode(false);
    setSearchQuery("");
    setIsOpenSuggestions(false);
    onChange(TELANGANA_CITIES[0]); // default to Hyderabad
  };

  return (
    <div className={`relative ${className}`}>
      {isSearchMode ? (
        <div className="relative">
          {showIcon && (
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#d4af37]" />
          )}
          <input
            ref={searchInputRef}
            type="text"
            id={`${id}-search-input`}
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => {
              setSuggestions(searchCities(searchQuery));
              setIsOpenSuggestions(true);
            }}
            placeholder="Search your city... (e.g. hyd, mum, beng)"
            className={`w-full bg-white border border-[#d4af37] rounded-xl py-2.5 ${showIcon ? 'pl-11' : 'pl-4'} pr-10 text-xs font-semibold text-[#2D2A26] placeholder-[#9A948A] focus:outline-none shadow-sm`}
          />
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-3 text-[#9A948A] hover:text-[#2D2A26] p-0.5 rounded-full"
            title="Back to list"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Autocomplete Suggestions Dropdown */}
          {isOpenSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E8E1D5] rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto text-left py-1 divide-y divide-[#F8F5ED]">
              {suggestions.map((city, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(city)}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#F8F5ED] text-xs font-bold text-[#2D2A26] flex items-center justify-between transition"
                >
                  <span>{city}</span>
                  {value?.toLowerCase() === city.toLowerCase() && (
                    <Check className="h-3.5 w-3.5 text-[#d4af37]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {showIcon && (
            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#d4af37] pointer-events-none" />
          )}
          <select
            id={id}
            value={value || ""}
            onChange={handleSelectChange}
            className={`w-full bg-white border border-[#E8E1D5] rounded-xl py-2.5 ${showIcon ? 'pl-11' : 'pl-4'} pr-8 text-xs font-semibold text-[#2D2A26] focus:outline-none focus:border-[#d4af37] appearance-none cursor-pointer`}
          >
            <option value="" disabled>{placeholder}</option>
            
            <optgroup label="── TELANGANA ──">
              {TELANGANA_CITIES.map(c => (
                <option key={`ts-${c}`} value={c}>{c}</option>
              ))}
            </optgroup>

            <optgroup label="── ANDHRA PRADESH ──">
              {ANDHRA_PRADESH_CITIES.map(c => (
                <option key={`ap-${c}`} value={c}>{c}</option>
              ))}
            </optgroup>

            <optgroup label="── OTHER METROS ──">
              {OTHER_MAJOR_INDIAN_CITIES.map(c => (
                <option key={`other-${c}`} value={c}>{c}</option>
              ))}
            </optgroup>

            <option value="__OTHER_CITY__" className="font-bold text-[#d4af37] bg-[#F8F5ED]">
              🔍 Search another city...
            </option>
          </select>

          {/* Custom Chevron icon */}
          <div className="absolute right-3 top-3.5 pointer-events-none text-[#9A948A]">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
