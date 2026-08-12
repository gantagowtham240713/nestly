import React from 'react';

export default function GoogleMap({
  properties = [],
  selectedProperty = null,
  selectedCity = null,
  userLocation = null,
  height = "100%",
  className = ""
}) {
  return (
    <div 
      style={{ height: height }} 
      className={`w-full rounded-3xl overflow-hidden border border-[#E8E1D5] shadow-sm bg-[#F8F5ED] relative ${className}`}
    >
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15303.633251856048!2d80.68746764999999!3d16.48017965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1786501421356!5m2!1sen!2sin"
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: '400px' }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        title="Google Maps Location Embed"
        className="w-full h-full rounded-3xl"
      ></iframe>
    </div>
  );
}
