import Link from 'next/link';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-card border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-2xl font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-white">
              NACCASH<span className="text-white"> MOTORS</span>
            </span>
            <p className="text-gray-400 max-w-xs mt-4">
              Car Dealer & Importer. Discover the finest selection of premium vehicles.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold uppercase tracking-wider text-white mb-6">Showroom</h3>
            <ul className="space-y-3">
              <li><Link href="/inventory" className="text-gray-400 hover:text-gold transition-colors">Latest Arrivals</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-gold transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold uppercase tracking-wider text-white mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-gray-400">
                <MapPin className="h-5 w-5 mr-3 text-red-500 shrink-0 mt-0.5" />
                <span>Lebanon</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 mr-3 text-red-500 shrink-0" />
                <a href="https://wa.me/96181877675" className="hover:text-red-400 transition-colors">+961 81 877 675</a>
              </li>
            </ul>
            
            <div className="flex space-x-4 mt-6">
              {/* WhatsApp */}
              <a href="https://wa.me/96181877675" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#25D366] hover:text-white transition-all">
                <MessageCircle className="h-5 w-5" />
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/naccashmotors" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#E1306C] hover:text-white transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/share/1BiMics1NN/" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* TikTok */}
              <a href="https://www.tiktok.com/@naccashmotors" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.33-5.01 1.95-6.84 1.55-1.74 3.8-2.73 6.13-2.74v4.06c-1.35.12-2.55.85-3.3 1.95-.76 1.14-.99 2.64-.61 3.94.39 1.25 1.45 2.29 2.71 2.64 1.34.36 2.8-.02 3.82-.94.94-.85 1.5-2.07 1.5-3.35.03-4.63.01-9.26.02-13.89z"/></svg>
              </a>
            </div>
          </div>

        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Naccash Motors. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
