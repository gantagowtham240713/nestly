import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F8F5ED] text-[#6F6A61] border-t border-[#E8E1D5] pt-16 pb-12 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#b8962e] flex items-center justify-center text-white shadow-md shadow-[#d4af37]/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-[#2D2A26]">
                Nestly
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[#6F6A61]">
              Transforming real estate searches with natural language AI. Describe your dream home in simple terms and let our intelligent engine match you instantly.
            </p>
            <div className="flex space-x-4 pt-2">
              {/* Twitter inline SVG */}
              <a href="#" className="hover:text-[#d4af37] transition text-[#9A948A]" aria-label="Twitter">
                <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              {/* Linkedin inline SVG */}
              <a href="#" className="hover:text-[#d4af37] transition text-[#9A948A]" aria-label="LinkedIn">
                <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              {/* Github inline SVG */}
              <a href="#" className="hover:text-[#d4af37] transition text-[#9A948A]" aria-label="GitHub">
                <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#2D2A26] text-xs font-bold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-[#d4af37] transition">Home</Link></li>
              <li><Link to="/search" className="hover:text-[#d4af37] transition">Find Properties</Link></li>
              <li><Link to="/calculator" className="hover:text-[#d4af37] transition">Affordability AI</Link></li>
              <li><Link to="/chats" className="hover:text-[#d4af37] transition">My Inquiries</Link></li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 className="text-[#2D2A26] text-xs font-bold uppercase tracking-wider mb-4">Popular Cities</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/search?q=Hyderabad" className="hover:text-[#d4af37] transition">Hyderabad</Link></li>
              <li><Link to="/search?q=Bangalore" className="hover:text-[#d4af37] transition">Bangalore</Link></li>
              <li><Link to="/search?q=Mumbai" className="hover:text-[#d4af37] transition">Mumbai</Link></li>
              <li><Link to="/search?q=Delhi" className="hover:text-[#d4af37] transition">Delhi</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-[#2D2A26] text-xs font-bold uppercase tracking-wider mb-4">Get In Touch</h4>
            <p className="flex items-center gap-2 text-xs">
              <Mail className="h-4 w-4 text-[#d4af37]" />
              support@nestly.com
            </p>
            <p className="flex items-center gap-2 text-xs">
              <Phone className="h-4 w-4 text-[#d4af37]" />
              +91 40 4567 8901
            </p>
            <p className="flex items-center gap-2 text-xs leading-relaxed">
              <MapPin className="h-5 w-5 text-[#d4af37] shrink-0" />
              T-Hub Phase 2, Madhapur, Hitec City, Hyderabad, 500081
            </p>
          </div>

        </div>

        {/* Separator */}
        <div className="border-t border-[#E8E1D5] pt-8 flex flex-col sm:flex-row justify-between items-center text-xs">
          <p>© {new Date().getFullYear()} Nestly. Developed for modern house hunters. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-[#d4af37] transition">Privacy Policy</a>
            <a href="#" className="hover:text-[#d4af37] transition">Terms of Service</a>
            <a href="#" className="hover:text-[#d4af37] transition">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
