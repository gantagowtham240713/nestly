import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useForm } from 'react-hook-form';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { 
  PieChart, LayoutGrid, PlusCircle, FileText, CheckCircle, 
  Trash2, Eye, ShieldAlert, ArrowUpRight, MessageSquare, Heart, Upload, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardOwner() {
  const { properties, addListing, deleteListing, markAsSoldOrRented, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'listings' | 'upload'
  const [successMsg, setSuccessMsg] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      purpose: 'rent',
      propertyType: 'apartment',
      title: '',
      description: '',
      price: '',
      city: 'Hyderabad',
      locality: '',
      latitude: '17.4435',
      longitude: '78.3772',
      bhk: '2',
      bathrooms: '2',
      area: '',
      furnishing: 'semi-furnished',
      parking: false,
      gym: false,
      balcony: false,
      petFriendly: false,
      gatedCommunity: false,
      bachelorFriendly: false,
      distanceToMetro: '400',
      nearbyMetroStation: 'Hitec City Metro Station',
      distanceToSchool: '900',
      nearbySchool: 'Oakridge School',
      distanceToHospital: '1200',
      nearbyHospital: 'Care Hospital',
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    }
  });

  // Fetch only this owner's properties (or mock properties that are owned by this owner)
  // Let's filter properties where owner ID matches current owner, or fallback to properties having owner.id === 'owner-1' (just to populate)
  const myProperties = useMemo(() => {
    return properties.filter(p => p.owner?.id === 'owner-1' || p.owner?.name === currentUser.name);
  }, [properties, currentUser]);

  // Aggregate stats
  const stats = useMemo(() => {
    let views = 0;
    let favorites = 0;
    let inquiries = 0;
    myProperties.forEach(p => {
      views += p.views || 0;
      favorites += p.favorites || 0;
      inquiries += p.inquiries || 0;
    });

    return {
      totalListings: myProperties.length,
      views,
      favorites,
      inquiries
    };
  }, [myProperties]);

  // Mock analytics charts data
  const viewsOverTime = [
    { name: 'Mon', Views: 42, Inquiries: 8 },
    { name: 'Tue', Views: 58, Inquiries: 12 },
    { name: 'Wed', Views: 98, Inquiries: 19 },
    { name: 'Thu', Views: 74, Inquiries: 14 },
    { name: 'Fri', Views: 110, Inquiries: 24 },
    { name: 'Sat', Views: 156, Inquiries: 38 },
    { name: 'Sun', Views: 184, Inquiries: 45 }
  ];

  const conversionData = [
    { name: 'Views', Count: stats.views, fill: '#2563eb' },
    { name: 'Bookmarks', Count: stats.favorites * 10, fill: '#f97316' }, // scaled to show nicely
    { name: 'Inquiries', Count: stats.inquiries * 20, fill: '#10b981' }
  ];

  const onSubmit = (data) => {
    const propertyPayload = {
      title: data.title,
      description: data.description,
      purpose: data.purpose,
      propertyType: data.propertyType,
      price: parseFloat(data.price),
      city: data.city,
      locality: data.locality,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      bhk: parseInt(data.bhk, 10),
      bathrooms: parseInt(data.bathrooms, 10),
      area: parseInt(data.area, 10),
      furnishing: data.furnishing,
      parking: !!data.parking,
      gym: !!data.gym,
      balcony: !!data.balcony,
      petFriendly: !!data.petFriendly,
      gatedCommunity: !!data.gatedCommunity,
      bachelorFriendly: !!data.bachelorFriendly,
      distanceToMetro: parseInt(data.distanceToMetro, 10),
      nearbyMetroStation: data.nearbyMetroStation,
      distanceToSchool: parseInt(data.distanceToSchool, 10),
      nearbySchool: data.nearbySchool,
      distanceToHospital: parseInt(data.distanceToHospital, 10),
      nearbyHospital: data.nearbyHospital,
      images: [data.imageUrl],
      owner: {
        id: 'owner-1',
        name: currentUser.name,
        phone: '+91 99000 11000',
        email: currentUser.email,
        avatar: currentUser.avatar,
        role: 'owner',
        verified: true
      }
    };

    addListing(propertyPayload);
    setSuccessMsg("Property Listing Uploaded Successfully! Admin verification is now pending.");
    reset();
    setActiveTab('listings');
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20 animate-fade-in text-left">
      
      {/* Upper banner */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-emerald-500/20">
              Listing Provider Mode
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-slate-400 text-xs font-semibold">Track listing analytics, manage active listings, and upload real estate documents.</p>
          </div>
          
          {/* Quick tab switches */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'overview' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'listings' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              My Listings ({myProperties.length})
            </button>
            <button 
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'upload' ? 'bg-primary text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              Add Property
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Success alerts */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB CONTENT: Overview / Analytics */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* KPI Cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Listings</p>
                  <h3 className="font-display font-black text-2xl text-slate-800">{stats.totalListings}</h3>
                </div>
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <LayoutGrid className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Visitor Views</p>
                  <h3 className="font-display font-black text-2xl text-slate-800">{stats.views}</h3>
                </div>
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-blue-500">
                  <Eye className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Messages/Chats</p>
                  <h3 className="font-display font-black text-2xl text-slate-800">{stats.inquiries}</h3>
                </div>
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-emerald-500">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Favorites count</p>
                  <h3 className="font-display font-black text-2xl text-slate-800">{stats.favorites}</h3>
                </div>
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-rose-500">
                  <Heart className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Graphs panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Area Chart */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
                <h4 className="font-display font-bold text-sm text-slate-800 mb-4">Traffic Performance over Time</h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewsOverTime}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Area type="monotone" dataKey="Views" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
                      <Area type="monotone" dataKey="Inquiries" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Conversion bar chart */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h4 className="font-display font-bold text-sm text-slate-800 mb-4">Interest Conversion funnel</h4>
                <div className="h-72 flex flex-col justify-between">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conversionData}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="Count" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-lg text-center leading-normal border border-slate-100">
                    💡 Users are saving your listings at a high conversion rate. Promote properties with verified document audits to boost inquiries!
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB CONTENT: Listings management */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            {myProperties.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
                <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="font-display font-bold text-slate-800 text-base">No active listings posted</h3>
                <p className="text-slate-500 text-xs font-semibold">Click 'Add Property' above to create your first real estate listing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myProperties.map(p => (
                  <div 
                    key={p.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col sm:flex-row"
                  >
                    <div className="w-full sm:w-44 h-36 shrink-0 bg-slate-900">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${
                            p.verifiedProperty 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : 'bg-orange-50 border-orange-200 text-orange-700 animate-pulse'
                          }`}>
                            {p.verifiedProperty ? 'Verified ✓' : 'Approval Pending'}
                          </span>
                          <span className="text-slate-800 font-extrabold text-sm">
                            {p.purpose === 'rent' ? `₹${p.price.toLocaleString()}/mo` : `₹${(p.price / 100000).toFixed(0)} Lakhs`}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-xs sm:text-sm text-slate-800 line-clamp-1">{p.title}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{p.locality}, {p.city}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                        <div className="flex gap-1.5 items-center">
                          {p.availability === 'available' ? (
                            <button
                              onClick={() => markAsSoldOrRented(p.id)}
                              className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 px-3 rounded-lg transition"
                            >
                              Mark as Sold/Rented
                            </button>
                          ) : (
                            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-400 py-1.5 px-3 rounded-lg font-bold capitalize">
                              {p.availability}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          <Link
                            to={`/property/${p.id}`}
                            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition"
                            title="Preview property details"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => deleteListing(p.id)}
                            className="p-2 border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                            title="Delete Listing"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: Upload listing form */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
              <PlusCircle className="h-6 w-6 text-primary animate-pulse-slow" />
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base">Post a New Property Listing</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Fields are processed by the AI recommendation parser instantly.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Row 1: Purpose & Property Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Purpose</label>
                  <select 
                    {...register('purpose')} 
                    className="w-full border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  >
                    <option value="rent">Rent Out</option>
                    <option value="buy">Sell (For Sale)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Property Type</label>
                  <select 
                    {...register('propertyType')} 
                    className="w-full border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  >
                    <option value="apartment">Apartment / Flat</option>
                    <option value="villa">Villa / Independent Bungalow</option>
                    <option value="independent_house">Independent House</option>
                    <option value="builder_floor">Builder Floor</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Title & Price */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Listing Title</label>
                  <input 
                    type="text" 
                    {...register('title', { required: 'Title is required' })} 
                    placeholder="e.g. Modern 2BHK Near Gachibowli Metro"
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  />
                  {errors.title && <span className="text-[10px] text-red-500 font-bold">{errors.title.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Price (₹ INR)</label>
                  <input 
                    type="number" 
                    {...register('price', { required: 'Price is required', min: 1000 })} 
                    placeholder="e.g. 25000 or 7500000"
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  />
                  {errors.price && <span className="text-[10px] text-red-500 font-bold">{errors.price.message}</span>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Listing Description</label>
                <textarea 
                  {...register('description')} 
                  placeholder="Describe your property. List proximity details, ventilation, features..."
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-xs font-semibold h-24"
                />
              </div>

              {/* Location details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">City</label>
                  <select 
                    {...register('city')} 
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  >
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Locality</label>
                  <input 
                    type="text" 
                    {...register('locality', { required: 'Locality is required' })} 
                    placeholder="e.g. Gachibowli"
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  />
                  {errors.locality && <span className="text-[10px] text-red-500 font-bold">{errors.locality.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Latitude (OSM marker)</label>
                  <input 
                    type="text" 
                    {...register('latitude')} 
                    placeholder="e.g. 17.4435"
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Longitude (OSM marker)</label>
                  <input 
                    type="text" 
                    {...register('longitude')} 
                    placeholder="e.g. 78.3772"
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  />
                </div>
              </div>

              {/* BHK & Specs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">BHK</label>
                  <select 
                    {...register('bhk')} 
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  >
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bathrooms</label>
                  <select 
                    {...register('bathrooms')} 
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  >
                    <option value="1">1 Bath</option>
                    <option value="2">2 Baths</option>
                    <option value="3">3 Baths</option>
                    <option value="4">4 Baths</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Super Area (sqft)</label>
                  <input 
                    type="number" 
                    {...register('area', { required: 'Area is required', min: 100 })} 
                    placeholder="e.g. 1200"
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  />
                  {errors.area && <span className="text-[10px] text-red-500 font-bold">{errors.area.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Furnishing</label>
                  <select 
                    {...register('furnishing')} 
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                  >
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="furnished">Fully Furnished</option>
                  </select>
                </div>
              </div>

              {/* Amenities Boolean checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Amenities & Rules</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-xs font-bold select-none">
                    <input type="checkbox" {...register('parking')} className="rounded border-slate-300 text-primary h-4.5 w-4.5 cursor-pointer" />
                    Covered Parking
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-xs font-bold select-none">
                    <input type="checkbox" {...register('gym')} className="rounded border-slate-300 text-primary h-4.5 w-4.5 cursor-pointer" />
                    Gym Access
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-xs font-bold select-none">
                    <input type="checkbox" {...register('balcony')} className="rounded border-slate-300 text-primary h-4.5 w-4.5 cursor-pointer" />
                    Balcony
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-xs font-bold select-none">
                    <input type="checkbox" {...register('petFriendly')} className="rounded border-slate-300 text-primary h-4.5 w-4.5 cursor-pointer" />
                    Pet Friendly
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-xs font-bold select-none">
                    <input type="checkbox" {...register('gatedCommunity')} className="rounded border-slate-300 text-primary h-4.5 w-4.5 cursor-pointer" />
                    Gated Gated
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-xs font-bold select-none">
                    <input type="checkbox" {...register('bachelorFriendly')} className="rounded border-slate-300 text-primary h-4.5 w-4.5 cursor-pointer" />
                    Bachelors Welcome
                  </label>
                </div>
              </div>

              {/* Image Upload placeholder link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  Property Image URL
                </label>
                <input 
                  type="text" 
                  {...register('imageUrl')}
                  placeholder="URL pointing to high quality picture..." 
                  className="w-full border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-xs font-semibold"
                />
              </div>

              {/* Row 4: Connectivity distances */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Distance to Metro (meters)</label>
                  <input type="number" {...register('distanceToMetro')} className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Distance to School (meters)</label>
                  <input type="number" {...register('distanceToSchool')} className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Distance to Hospital (meters)</label>
                  <input type="number" {...register('distanceToHospital')} className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none" />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 justify-end pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setActiveTab('listings')} 
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs tracking-wider uppercase rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4 animate-spin-slow" />
                  Publish Listing
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

    </div>
  );
}
