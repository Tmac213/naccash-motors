"use client";

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Share2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await fetchApi('/settings');
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-6 text-white">Visit Our Showroom</h1>
        <p className="text-lg text-gray-400">
          Experience automotive perfection in person. Our dedicated team of luxury specialists is ready to provide you with a bespoke consultation.
        </p>
      </div>

      <div className="flex flex-col gap-16">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
          <div className="bg-dark-card p-6 border border-white/10 rounded">
            <MapPin className="text-gold w-8 h-8 mb-4" />
            <h3 className="text-white font-bold mb-2 uppercase tracking-wider">Location</h3>
            <p className="text-gray-400 text-sm whitespace-pre-line">{settings?.address || 'Lebanon'}</p>
          </div>
          
          <div className="bg-dark-card p-6 border border-white/10 rounded">
            <Phone className="text-gold w-8 h-8 mb-4" />
            <h3 className="text-white font-bold mb-2 uppercase tracking-wider">Contact</h3>
            <p className="text-gray-400 text-sm mb-1">{settings?.phoneNumber || '+961 81 877 675'}</p>
            <p className="text-gray-400 text-sm">{settings?.email || 'info@naccashmotors.com'}</p>
          </div>

          <div className="bg-dark-card p-6 border border-white/10 rounded">
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

          <div className="bg-dark-card p-6 border border-white/10 rounded">
            <Share2 className="text-gold w-8 h-8 mb-4" />
            <h3 className="text-white font-bold mb-2 uppercase tracking-wider">Social Media</h3>
            {settings?.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="block text-gray-400 text-sm hover:text-gold mb-2">
                Follow us on Instagram
              </a>
            )}
            {settings?.tiktokUrl && (
              <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" className="block text-gray-400 text-sm hover:text-gold">
                Follow us on TikTok
              </a>
            )}
            {!settings?.instagramUrl && !settings?.tiktokUrl && (
              <p className="text-gray-400 text-sm">Follow us on our social platforms</p>
            )}
          </div>
        </div>

        {/* Form */}
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
    </div>
  );
}
