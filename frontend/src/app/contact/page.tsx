"use client";

import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-6 text-white">Visit Our Showroom</h1>
        <p className="text-lg text-gray-400">
          Experience automotive perfection in person. Our dedicated team of luxury specialists is ready to provide you with a bespoke consultation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Information & Form */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-dark-card p-6 border border-white/10 rounded">
              <MapPin className="text-gold w-8 h-8 mb-4" />
              <h3 className="text-white font-bold mb-2 uppercase tracking-wider">Location</h3>
              <p className="text-gray-400 text-sm">Lebanon</p>
            </div>
            
            <div className="bg-dark-card p-6 border border-white/10 rounded">
              <Phone className="text-gold w-8 h-8 mb-4" />
              <h3 className="text-white font-bold mb-2 uppercase tracking-wider">Contact</h3>
              <p className="text-gray-400 text-sm mb-1">+961 81 877 675</p>
              <p className="text-gray-400 text-sm">info@naccashmotors.com</p>
            </div>

            <div className="bg-dark-card p-6 border border-white/10 rounded md:col-span-2">
              <Clock className="text-gold w-8 h-8 mb-4" />
              <h3 className="text-white font-bold mb-2 uppercase tracking-wider">Business Hours</h3>
              <div className="flex justify-between text-gray-400 text-sm border-b border-white/5 pb-2 mb-2">
                <span>Monday - Friday</span>
                <span>9:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm border-b border-white/5 pb-2 mb-2">
                <span>Saturday</span>
                <span>10:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </div>

          <form className="space-y-6 bg-dark-card p-8 border border-white/10 rounded">
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">Send an Inquiry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">First Name</label>
                <input type="text" className="w-full bg-dark-bg border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Last Name</label>
                <input type="text" className="w-full bg-dark-bg border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-gold" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
              <input type="email" className="w-full bg-dark-bg border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Message</label>
              <textarea rows={4} className="w-full bg-dark-bg border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-gold"></textarea>
            </div>
            <button type="submit" className="w-full bg-gold text-black font-bold uppercase tracking-wider py-4 hover:bg-gold-hover transition-colors">
              Submit Inquiry
            </button>
          </form>
        </div>

        {/* Google Maps Integration */}
        <div className="h-[500px] lg:h-auto rounded border border-white/10 overflow-hidden">
          {/* Embedding a stylized Google Map (placeholder location: Dubai Autodrome for example) */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.112615456209!2d55.23707831500645!3d25.030250683975546!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6e5c54ce5b1f%3A0x6b306fc6af53db5!2sDubai%20Autodrome!5e0!3m2!1sen!2sae!4v1629800000000!5m2!1sen!2sae" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }} 
            allowFullScreen={false} 
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
