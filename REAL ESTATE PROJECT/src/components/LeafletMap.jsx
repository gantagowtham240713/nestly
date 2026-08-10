import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Train, GraduationCap, HeartPulse, MapPin } from 'lucide-react';

// Reset leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom div icon builder
const buildHtmlIcon = (color, type, isSelected = false) => {
  let innerIconSvg = '';
  if (type === 'home') {
    innerIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  } else if (type === 'metro') {
    innerIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><path d="M12 17v4"/><path d="m8 21 8-8"/></svg>`;
  } else if (type === 'school') {
    innerIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`;
  } else if (type === 'hospital') {
    innerIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.66 0 3-1.34 3-3V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v6c0 1.66 1.34 3 3 3"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>`;
  }

  const border = isSelected ? 'border: 3px solid #ff7a00; scale: 1.25; z-index: 1000;' : 'border: 2px solid white;';

  return new L.DivIcon({
    html: `
      <div class="flex flex-col items-center justify-center" style="width: 40px; height: 40px;">
        <div class="flex items-center justify-center rounded-xl shadow-lg transition-transform duration-300" 
             style="background: ${color}; ${border} width: 32px; height: 32px; padding: 5px;">
          ${innerIconSvg}
        </div>
        <div class="w-1.5 h-1.5 rotate-45 -mt-0.5" style="background: ${color};"></div>
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
};

// Map center update hook
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 14, { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
}

export default function LeafletMap({ properties = [], selectedProperty = null, height = "100%" }) {
  // Determine initial center
  // Default to Hyderabad or the first property in search results
  let defaultCenter = [17.4375, 78.4482]; // Ameerpet, Hyd
  
  if (selectedProperty && selectedProperty.latitude) {
    defaultCenter = [selectedProperty.latitude, selectedProperty.longitude];
  } else if (properties.length > 0 && properties[0].latitude) {
    defaultCenter = [properties[0].latitude, properties[0].longitude];
  }

  // Create list of auxiliary markers for selected property connectivity pathing
  const pathLines = [];
  const nearbyMarkers = [];

  if (selectedProperty && selectedProperty.latitude) {
    const propCoords = [selectedProperty.latitude, selectedProperty.longitude];

    // Add Metro Marker if exists
    if (selectedProperty.distanceToMetro) {
      // Calculate offset coordinate to make it look realistic (approx 100m = 0.001 deg)
      // We offset slightly to place it on map
      const metroCoords = [
        selectedProperty.latitude + 0.002, 
        selectedProperty.longitude - 0.002
      ];
      nearbyMarkers.push({
        id: 'metro-aux',
        name: selectedProperty.nearbyMetroStation || 'Metro Station',
        type: 'metro',
        color: '#8b5cf6', // Violet
        coords: metroCoords,
        distance: `${selectedProperty.distanceToMetro}m`
      });
      pathLines.push({
        coords: [propCoords, metroCoords],
        color: '#8b5cf6'
      });
    }

    // Add School Marker
    if (selectedProperty.distanceToSchool) {
      const schoolCoords = [
        selectedProperty.latitude - 0.002, 
        selectedProperty.longitude + 0.003
      ];
      nearbyMarkers.push({
        id: 'school-aux',
        name: selectedProperty.nearbySchool || 'Public School',
        type: 'school',
        color: '#06b6d4', // Cyan
        coords: schoolCoords,
        distance: `${selectedProperty.distanceToSchool}m`
      });
      pathLines.push({
        coords: [propCoords, schoolCoords],
        color: '#06b6d4'
      });
    }

    // Add Hospital Marker
    if (selectedProperty.distanceToHospital) {
      const hospitalCoords = [
        selectedProperty.latitude + 0.003, 
        selectedProperty.longitude + 0.001
      ];
      nearbyMarkers.push({
        id: 'hospital-aux',
        name: selectedProperty.nearbyHospital || 'Hospital',
        type: 'hospital',
        color: '#ef4444', // Red
        coords: hospitalCoords,
        distance: `${selectedProperty.distanceToHospital}m`
      });
      pathLines.push({
        coords: [propCoords, hospitalCoords],
        color: '#ef4444'
      });
    }
  }

  return (
    <div style={{ height: height, width: '100%', borderRadius: '16px', overflow: 'hidden' }} className="border border-slate-200 shadow-inner">
      <MapContainer 
        center={defaultCenter} 
        zoom={14} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeMapView center={defaultCenter} />

        {/* 1. Main properties markers */}
        {properties.map((prop) => {
          const isSelected = selectedProperty && selectedProperty.id === prop.id;
          const pinColor = isSelected 
            ? '#f97316' // Orange highlighted
            : prop.matchScore >= 90 
              ? '#10b981' // Green high score
              : '#2563eb'; // Blue normal

          return (
            <Marker 
              key={prop.id}
              position={[prop.latitude, prop.longitude]}
              icon={buildHtmlIcon(pinColor, 'home', isSelected)}
            >
              <Popup>
                <div className="text-left font-sans space-y-1">
                  <p className="font-bold text-xs text-slate-800 line-clamp-1">{prop.title}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{prop.locality}, {prop.city}</p>
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
                    <span className="font-bold text-xs text-primary">
                      {prop.purpose === 'rent' 
                        ? `₹${prop.price.toLocaleString('en-IN')}/mo`
                        : `₹${(prop.price / 100000).toFixed(0)} L`
                      }
                    </span>
                    {prop.matchScore !== undefined && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                        {prop.matchScore}% Match
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 2. Auxiliary connectivity markers */}
        {nearbyMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.coords}
            icon={buildHtmlIcon(marker.color, marker.type)}
          >
            <Popup>
              <div className="text-left font-sans">
                <p className="font-bold text-xs text-slate-800">{marker.name}</p>
                <p className="text-[10px] font-semibold text-slate-500 capitalize">{marker.type} • {marker.distance} from property</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Distance connecting lines */}
        {pathLines.map((line, idx) => (
          <Polyline
            key={idx}
            positions={line.coords}
            pathOptions={{ color: line.color, dashArray: '5, 8', weight: 2.5 }}
          />
        ))}

      </MapContainer>
    </div>
  );
}
