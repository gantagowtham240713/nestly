import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  Sparkles, Bell, MessageSquare, Heart, ArrowLeftRight, 
  User, CheckCircle, ShieldAlert, Menu, X, Landmark, PieChart, PlusCircle, LayoutGrid
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    userRole, 
    setRole, 
    notifications, 
    markNotificationsRead, 
    clearNotifications,
    conversations,
    favorites,
    currentUser
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadChats = conversations.filter(c => c.unreadCount > 0).length;

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const toggleNotifDropdown = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark read when opening dropdown
      markNotificationsRead();
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Homes', path: '/search' },
    { name: 'Affordability AI', path: '/calculator' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl gradient-bg-ai flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sparkles className="h-6 w-6 animate-pulse-slow" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Nestly
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive 
                      ? 'text-primary font-bold border-b-2 border-primary pb-1 pt-1' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Sell Link */}
            <Link 
              to={currentUser ? "/owner/dashboard" : "/signin?redirect=/owner/dashboard"}
              className={`text-sm font-semibold transition-colors duration-200 ${
                location.pathname === '/owner/dashboard'
                  ? 'text-primary font-bold border-b-2 border-primary pb-1 pt-1' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sell
            </Link>
          </div>

          {/* User Controls & Dropdowns */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Compare Icon */}
            {currentUser && (
              <Link 
                to="/compare" 
                title="Compare Properties"
                className="relative p-2 text-slate-600 hover:text-primary rounded-xl hover:bg-slate-100 transition"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </Link>
            )}

            {/* Saved Wishlist Icon */}
            {currentUser && (
              <Link 
                to="/saved" 
                title="Saved Properties"
                className="relative p-2 text-slate-600 hover:text-rose-500 rounded-xl hover:bg-slate-100 transition"
              >
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                    {favorites.length}
                  </span>
                )}
              </Link>
            )}

            {/* Chats Icon */}
            <Link 
              to="/chats" 
              title="Conversations"
              className="relative p-2 text-slate-600 hover:text-primary rounded-xl hover:bg-slate-100 transition"
            >
              <MessageSquare className="h-5 w-5" />
              {unreadChats > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {unreadChats}
                </span>
              )}
            </Link>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={toggleNotifDropdown}
                title="Notifications"
                className="p-2 text-slate-600 hover:text-primary rounded-xl hover:bg-slate-100 transition relative"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-fade-in text-left">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-800">Notifications</span>
                    <button 
                      onClick={clearNotifications}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-slate-400 text-xs">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`px-4 py-3 hover:bg-slate-50 transition border-b border-slate-50 flex gap-3 items-start ${!notif.read ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="mt-0.5">
                            {notif.type === 'recommend' ? (
                              <div className="p-1 rounded bg-orange-100 text-orange-600"><Sparkles className="h-3 w-3" /></div>
                            ) : notif.type === 'chat' ? (
                              <div className="p-1 rounded bg-blue-100 text-blue-600"><MessageSquare className="h-3 w-3" /></div>
                            ) : (
                              <div className="p-1 rounded bg-slate-100 text-slate-600"><CheckCircle className="h-3 w-3" /></div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-slate-800">{notif.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">
                              {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <Link 
              to="/profile" 
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
            >
              <img 
                src={currentUser?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=guest"} 
                alt="Profile" 
                className="h-7 w-7 rounded-full bg-blue-100 border border-slate-300"
              />
              <span className="text-xs font-bold text-slate-700">{currentUser?.name || "Guest"}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary rounded-xl"
              >
                {link.name}
              </Link>
            ))}
            {/* Sell Link */}
            <Link 
              to={currentUser ? "/owner/dashboard" : "/signin?redirect=/owner/dashboard"}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary rounded-xl"
            >
              Sell
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">

            <div className="flex justify-around items-center pt-2">
              <Link 
                to="/compare" 
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center gap-1 text-slate-600 hover:text-primary"
              >
                <ArrowLeftRight className="h-5 w-5" />
                <span className="text-[10px] font-semibold">Compare</span>
              </Link>

              <Link 
                to="/saved" 
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center gap-1 text-slate-600 hover:text-rose-500 relative"
              >
                <Heart className="h-5 w-5" />
                <span className="text-[10px] font-semibold">Wishlist</span>
                {favorites.length > 0 && (
                  <span className="absolute top-0 right-3 bg-rose-500 text-white text-[9px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">
                    {favorites.length}
                  </span>
                )}
              </Link>

              <Link 
                to="/chats" 
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center gap-1 text-slate-600 hover:text-primary relative"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-[10px] font-semibold">Chats</span>
                {unreadChats > 0 && (
                  <span className="absolute top-0 right-2 bg-blue-600 text-white text-[9px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">
                    {unreadChats}
                  </span>
                )}
              </Link>
            </div>

            <div className="pt-2">
              <Link 
                to="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200"
              >
                <img 
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=gowtham" 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full bg-blue-100"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Gowtham</p>
                  <p className="text-[10px] text-slate-500">gowtham@example.com</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
