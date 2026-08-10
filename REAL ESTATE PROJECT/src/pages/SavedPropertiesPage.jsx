import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Heart, Folder, FileText, Share2, Plus, 
  Trash2, ArrowRight, ExternalLink, Edit3, Save, Check
} from 'lucide-react';

export default function SavedPropertiesPage() {
  const navigate = useNavigate();
  const { properties, favorites, toggleFavorite } = useAppStore();

  // Custom Local Folder Collections
  const [folders, setFolders] = useState([
    { id: 'fold-1', name: 'Work Commute Flats' },
    { id: 'fold-2', name: 'Weekend Villa Searches' }
  ]);
  const [activeFolderId, setActiveFolderId] = useState(null); // null means all saved
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Notes on saved items (indexed by propertyId)
  const [propertyNotes, setPropertyNotes] = useState({
    'prop-1': 'Spoke with Satish. Available for visiting this Saturday at 11 AM.',
    'prop-3': 'Excellent pet friendly policy. Whitefield metro is nearby.'
  });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNoteText, setTempNoteText] = useState("");

  // Folders properties mappings (e.g. property-1 resides in folder-1)
  const [propertyFolderMap, setPropertyFolderMap] = useState({
    'prop-1': 'fold-1',
    'prop-3': 'fold-1',
    'prop-2': 'fold-2'
  });

  const [copiedShareId, setCopiedShareId] = useState(null);

  // Retrieve actual property objects that are favorited
  const savedProperties = useMemo(() => {
    return properties.filter(p => favorites.includes(p.id));
  }, [properties, favorites]);

  // Filtered by folder
  const filteredProperties = useMemo(() => {
    if (!activeFolderId) return savedProperties;
    return savedProperties.filter(p => propertyFolderMap[p.id] === activeFolderId);
  }, [savedProperties, activeFolderId, propertyFolderMap]);

  function useMemo(fn, deps) {
    return React.useMemo(fn, deps);
  }

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newFold = {
      id: `fold-${Date.now()}`,
      name: newFolderName
    };
    setFolders([...folders, newFold]);
    setNewFolderName("");
    setShowAddFolder(false);
  };

  const handleDeleteFolder = (folderId) => {
    setFolders(folders.filter(f => f.id !== folderId));
    // Clear items mapped to this folder
    const updatedMap = { ...propertyFolderMap };
    Object.keys(updatedMap).forEach(key => {
      if (updatedMap[key] === folderId) {
        delete updatedMap[key];
      }
    });
    setPropertyFolderMap(updatedMap);
    if (activeFolderId === folderId) {
      setActiveFolderId(null);
    }
  };

  const handleStartEditingNote = (propId, currentNote = "") => {
    setEditingNoteId(propId);
    setTempNoteText(currentNote);
  };

  const handleSaveNote = (propId) => {
    setPropertyNotes({
      ...propertyNotes,
      [propId]: tempNoteText
    });
    setEditingNoteId(null);
  };

  const handleAssignFolder = (propId, folderId) => {
    setPropertyFolderMap({
      ...propertyFolderMap,
      [propId]: folderId || null
    });
  };

  const handleShareFolder = (folderName) => {
    const mockLink = `${window.location.origin}/shared-collection?name=${encodeURIComponent(folderName)}`;
    navigator.clipboard.writeText(mockLink);
    setCopiedShareId(folderName);
    setTimeout(() => setCopiedShareId(null), 2000);
  };

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
    <div className="w-full min-h-screen bg-slate-50 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-800 flex items-center gap-2">
            <Heart className="h-7 w-7 text-rose-500 fill-current" />
            Saved Listings & Collections
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold">
            Organize bookmarks in folders, add personal annotations, and share shortlisted collections.
          </p>
        </div>

        {/* Double layout columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Folders list (1/4 width) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">Folders</h3>
                <button 
                  onClick={() => setShowAddFolder(!showAddFolder)}
                  className="p-1 rounded bg-slate-100 text-slate-500 hover:text-primary transition"
                  title="Add Folder"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add folder mini-form */}
              {showAddFolder && (
                <form onSubmit={handleCreateFolder} className="space-y-2 animate-fade-in">
                  <input 
                    type="text" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name..."
                    className="w-full border border-slate-200 rounded-lg text-xs font-semibold py-2 px-3 focus:outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-1.5 bg-slate-900 text-white rounded text-[10px] font-bold">Add</button>
                    <button type="button" onClick={() => setShowAddFolder(false)} className="flex-1 py-1.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">Cancel</button>
                  </div>
                </form>
              )}

              {/* Folders links list */}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveFolderId(null)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition ${
                    activeFolderId === null ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    All Saved Listings
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-500 font-bold">
                    {savedProperties.length}
                  </span>
                </button>

                {folders.map(f => {
                  const count = savedProperties.filter(p => propertyFolderMap[p.id] === f.id).length;
                  return (
                    <div 
                      key={f.id}
                      className={`group flex items-center justify-between rounded-xl transition ${
                        activeFolderId === f.id ? 'bg-blue-50 text-primary' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <button
                        onClick={() => setActiveFolderId(f.id)}
                        className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-bold text-left"
                      >
                        <Folder className="h-4 w-4" />
                        <span className="truncate max-w-[130px]">{f.name}</span>
                      </button>
                      <div className="flex items-center pr-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-500 font-bold mr-1.5">
                          {count}
                        </span>
                        <button 
                          onClick={() => handleDeleteFolder(f.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition"
                          title="Delete folder"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Collection Actions helper */}
            {activeFolderId && (
              <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-5 shadow-sm space-y-3 text-left">
                <h4 className="font-display font-bold text-xs text-orange-800 flex items-center gap-1">
                  <Share2 className="h-4 w-4 text-orange-500" />
                  Share Collection
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                  You can share this curated collection with friends, spouses, or roommates to review together.
                </p>
                <button
                  onClick={() => handleShareFolder(folders.find(f => f.id === activeFolderId)?.name)}
                  className="w-full py-2 bg-white hover:bg-slate-50 border border-orange-200 text-orange-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  {copiedShareId ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600 animate-bounce" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      Copy Shareable Link
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Listings with annotation cards (3/4 width) */}
          <div className="lg:col-span-3 space-y-6">
            
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
                <Heart className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="font-display font-bold text-slate-800 text-base">No items found in this section</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Go to search listings and add properties to favorites, then categorize them using folder options.
                </p>
                <Link to="/search" className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-wide">
                  Explore Listings
                </Link>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {filteredProperties.map(p => {
                  const hasNote = propertyNotes[p.id];
                  const activeFolderName = folders.find(f => f.id === propertyFolderMap[p.id])?.name || '';
                  
                  return (
                    <div 
                      key={p.id}
                      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row gap-5 items-start"
                    >
                      
                      {/* Property Mini info */}
                      <div className="w-full md:w-56 shrink-0 space-y-2">
                        <div className="h-36 rounded-2xl overflow-hidden border border-slate-200 relative">
                          <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                          <button 
                            onClick={() => toggleFavorite(p.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-rose-500 border border-slate-200"
                            title="Remove bookmark"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{p.title}</h4>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-xs font-extrabold">
                          <span className="text-primary">{formatPrice(p.price, p.purpose)}</span>
                          <span className="text-slate-400">{p.bhk} BHK • {p.area} sqft</span>
                        </div>
                      </div>

                      {/* Folder & Notes Annotation Panel */}
                      <div className="flex-1 w-full space-y-4 text-left">
                        
                        {/* Folder mapping selector */}
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-slate-400" />
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1">Organized in:</span>
                          <select
                            value={propertyFolderMap[p.id] || ''}
                            onChange={(e) => handleAssignFolder(p.id, e.target.value)}
                            className="border border-slate-200 text-xs font-bold text-slate-600 rounded-lg py-1 px-2.5 bg-slate-50 focus:outline-none cursor-pointer"
                          >
                            <option value="">No Folder (General)</option>
                            {folders.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Note card editor */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 relative">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              My Personal Notes:
                            </span>
                            {editingNoteId !== p.id && (
                              <button 
                                onClick={() => handleStartEditingNote(p.id, hasNote)}
                                className="text-slate-400 hover:text-primary transition p-0.5"
                                title="Edit Note"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {editingNoteId === p.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={tempNoteText}
                                onChange={(e) => setTempNoteText(e.target.value)}
                                placeholder="Add reminder, scheduling details, negotiation figures..."
                                className="w-full bg-white border border-slate-200 rounded-lg text-xs font-semibold py-2 px-3 focus:outline-none h-20"
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleSaveNote(p.id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-bold"
                                >
                                  <Save className="h-3 w-3" /> Save Note
                                </button>
                                <button 
                                  onClick={() => setEditingNoteId(null)}
                                  className="px-3 py-1 bg-slate-200 text-slate-600 rounded text-[10px] font-bold"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                              {hasNote ? hasNote : <span className="text-slate-400 italic">No notes added yet. Add checklist questions or negotiation items.</span>}
                            </p>
                          )}
                        </div>

                        {/* Route to details link */}
                        <div className="flex justify-end pt-2">
                          <Link 
                            to={`/property/${p.id}`}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            Go to Details Page 
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
