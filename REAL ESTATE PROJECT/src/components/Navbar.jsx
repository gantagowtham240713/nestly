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
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E8E1D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#b8962e] flex items-center justify-center text-white shadow-md shadow-[#d4af37]/20">
                <Sparkles className="h-5 w-5 animate-pulse-slow" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight gradient-text-ai">
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
                  className={`text-sm font-semibold transition-colors duration-200 pb-1 pt-1 ${
                    isActive 
                      ? 'text-[#d4af37] font-bold border-b-2 border-[#d4af37]' 
                      : 'text-[#6F6A61] hover:text-[#d4af37]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Sell Link */}
            <Link 
              to={currentUser ? "/owner/dashboard" : "/signin?redirect=/owner/dashboard"}
              className={`text-sm font-semibold transition-colors duration-200 pb-1 pt-1 ${
                location.pathname === '/owner/dashboard'
                  ? 'text-[#d4af37] font-bold border-b-2 border-[#d4af37]' 
                  : 'text-[#6F6A61] hover:text-[#d4af37]'
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
                className="relative p-2 text-[#6F6A61] hover:text-[#d4af37] rounded-xl hover:bg-[#F8F5ED] transition"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </Link>
            )}

            {/* Saved Wishlist Icon */}
            {currentUser && (
              <Link 
                to="/saved" 
                title="Saved Properties"
                className="relative p-2 text-[#6F6A61] hover:text-[#d4af37] rounded-xl hover:bg-[#F8F5ED] transition"
              >
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#d4af37] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                    {favorites.length}
                  </span>
                )}
              </Link>
            )}

            {/* Chats Icon */}
            <Link 
              to="/chats" 
              title="Conversations"
              className="relative p-2 text-[#6F6A61] hover:text-[#d4af37] rounded-xl hover:bg-[#F8F5ED] transition"
            >
              <MessageSquare className="h-5 w-5" />
              {unreadChats > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#d4af37] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {unreadChats}
                </span>
              )}
            </Link>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={toggleNotifDropdown}
                title="Notifications"
                className="p-2 text-[#6F6A61] hover:text-[#d4af37] rounded-xl hover:bg-[#F8F5ED] transition relative"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#d4af37] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-[#E8E1D5] shadow-xl py-2 z-50 animate-fade-in text-left">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-[#E8E1D5]">
                    <span className="font-bold text-sm text-[#2D2A26]">Notifications</span>
                    <button 
                      onClick={clearNotifications}
                      className="text-xs font-semibold text-[#6F6A61] hover:text-[#d4af37]"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-[#9A948A] text-xs">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`px-4 py-3 hover:bg-[#FFFDF7] transition border-b border-[#E8E1D5] flex gap-3 items-start ${!notif.read ? 'bg-[#d4af37]/5' : ''}`}
                        >
                          <div className="mt-0.5">
                            {notif.type === 'recommend' ? (
                              <div className="p-1 rounded bg-[#d4af37]/10 text-[#d4af37]"><Sparkles className="h-3 w-3" /></div>
                            ) : notif.type === 'chat' ? (
                              <div className="p-1 rounded bg-[#d4af37]/10 text-[#d4af37]"><MessageSquare className="h-3 w-3" /></div>
                            ) : (
                              <div className="p-1 rounded bg-[#d4af37]/10 text-[#d4af37]"><CheckCircle className="h-3 w-3" /></div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-[#2D2A26]">{notif.title}</p>
                            <p className="text-[11px] text-[#6F6A61] mt-0.5 leading-snug">{notif.message}</p>
                            <span className="text-[9px] text-[#9A948A] block mt-1">
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
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#F8F5ED] hover:bg-[#F3EDE0] border border-[#E8E1D5] transition"
            >
              <img 
                src={currentUser?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=user"} 
                alt="Profile" 
                className="h-7 w-7 rounded-full bg-[#F3EDE0] border border-[#d4af37]/20"
              />
              <span className="text-xs font-bold text-[#2D2A26]">{currentUser?.name}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-[#6F6A61] hover:text-[#d4af37] hover:bg-[#F8F5ED] focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-[#E8E1D5] bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-[#6F6A61] hover:bg-[#F8F5ED] hover:text-[#d4af37] rounded-xl"
              >
                {link.name}
              </Link>
            ))}
            {/* Sell Link */}
            <Link 
              to={currentUser ? "/owner/dashboard" : "/signin?redirect=/owner/dashboard"}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-base font-semibold text-[#6F6A61] hover:bg-[#F8F5ED] hover:text-[#d4af37] rounded-xl"
            >
              Sell
            </Link>
          </div>

          <div className="pt-4 border-t border-[#E8E1D5] space-y-4">

            <div className="flex justify-around items-center pt-2">
              <Link 
                to="/compare" 
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center gap-1 text-[#6F6A61] hover:text-[#d4af37]"
              >
                <ArrowLeftRight className="h-5 w-5" />
                <span className="text-[10px] font-semibold">Compare</span>
              </Link>

              <Link 
                to="/saved" 
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center gap-1 text-[#6F6A61] hover:text-[#d4af37] relative"
              >
                <Heart className="h-5 w-5" />
                <span className="text-[10px] font-semibold">Wishlist</span>
                {favorites.length > 0 && (
                  <span className="absolute top-0 right-3 bg-[#d4af37] text-white text-[9px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">
                    {favorites.length}
                  </span>
                )}
              </Link>

              <Link 
                to="/chats" 
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center gap-1 text-[#6F6A61] hover:text-[#d4af37] relative"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-[10px] font-semibold">Chats</span>
                {unreadChats > 0 && (
                  <span className="absolute top-0 right-2 bg-[#d4af37] text-white text-[9px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">
                    {unreadChats}
                  </span>
                )}
              </Link>
            </div>

            <div className="pt-2">
              <Link 
                to="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-2 rounded-xl bg-[#F8F5ED] border border-[#E8E1D5]"
              >
                <img 
                  src={currentUser?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=user"} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full bg-[#F3EDE0] border border-[#d4af37]/20"
                />
                <div>
                  <p className="text-xs font-bold text-[#2D2A26]">{currentUser?.name}</p>
                  <p className="text-[10px] text-[#6F6A61]">{currentUser?.email}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
