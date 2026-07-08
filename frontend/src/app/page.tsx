"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { BRANDS, getModels } from '@/lib/car-data';
export default function Home() {
  const [latestVehicles, setLatestVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  useEffect(() => {
    async function loadLatest() {
      try {
        const data = await fetchApi('/inventory');
        // Only show up to 3 cars on home page
        setLatestVehicles(data.slice(0, 3));
      } catch (error) {
        console.error('Failed to load latest vehicles:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLatest();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Fallback gradient if no image */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-dark-bg/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight max-w-3xl">
            Experience <span className="text-gold italic">Excellence</span> on Every Road.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10">
            Discover our curated collection of world-class luxury vehicles. Uncompromising performance meets unparalleled comfort.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/inventory" 
              className="bg-gold text-black px-8 py-4 font-semibold uppercase tracking-wider hover:bg-gold-hover transition-colors flex items-center justify-center gap-2"
            >
              Explore Showroom <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact" 
              className="glass px-8 py-4 font-semibold uppercase tracking-wider hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Search Bar */}
      <section className="bg-dark-card border-b border-white/10 py-8 relative z-20 -mt-10 mx-4 lg:mx-auto max-w-6xl w-full rounded-t-lg shadow-2xl">
        <div className="px-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Brand</label>
            <select 
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setModel('');
              }}
              className="w-full bg-dark-bg border border-white/20 text-white rounded px-4 py-3 focus:outline-none focus:border-gold"
            >
              <option value="">All Brands</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Model</label>
            <select 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!brand}
              className="w-full bg-dark-bg border border-white/20 text-white rounded px-4 py-3 focus:outline-none focus:border-gold"
            >
              <option value="">Any Model</option>
              {brand && getModels(brand).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="w-full md:w-1/3 flex">
            {(() => {
              const params = new URLSearchParams();
              if (brand) params.append('brand', brand);
              if (model) params.append('model', model);
              const queryString = params.toString();
              return (
                <Link href={`/inventory${queryString ? `?${queryString}` : ''}`} className="w-full bg-white text-black font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors rounded">
                  <Search className="w-5 h-5" /> Search
                </Link>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-wider mb-2">Latest Arrivals</h2>
            <div className="w-20 h-1 bg-gold"></div>
          </div>
          <Link href="/latest-arrivals" className="text-gold hover:text-white transition-colors uppercase tracking-widest text-sm font-semibold flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestVehicles.map((car: any) => {
              const isNew = new Date().getTime() - new Date(car.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
              return (
              <div key={car.id} className="group bg-dark-card border border-white/10 overflow-hidden hover:border-gold/50 transition-colors">
                <div className="relative h-64 overflow-hidden">
                  {isNew && (
                    <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-sm shadow">
                      NEW
                    </div>
                  )}
                  {car.status === 'Available' && (
                    <div className="absolute top-4 left-4 z-10 bg-gold text-black text-xs font-bold uppercase px-3 py-1 rounded-sm">
                      Available
                    </div>
                  )}
                  {car.status === 'Coming Soon' && (
                    <div className="absolute top-4 left-4 z-10 bg-purple-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-sm">
                      Coming Soon
                    </div>
                  )}
                  <img 
                    src={car.image || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80"} 
                    alt={`${car.brand} ${car.model}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{car.year} {car.brand} {car.model}</h3>
                  <p className="text-gray-400 text-sm mb-4">{car.transmission || 'Auto'} • {car.condition || 'Used'}</p>
                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
                    <span className="text-2xl font-bold text-white">${car.price?.toLocaleString() || 'POA'}</span>
                    <Link href={`/inventory?id=${car.id}`} className="text-gold uppercase tracking-wider text-sm font-semibold hover:text-white transition-colors">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </section>
    </div>
  );
}
