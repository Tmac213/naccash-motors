"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Gauge, Fuel, Cog } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function LatestArrivalsPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLatestArrivals() {
      try {
        const data = await fetchApi('/inventory');
        // Filter for vehicles added within last 3 days and available
        const latest = data.filter((car: any) => {
          if (!car.createdAt) return false;
          const createdAt = new Date(car.createdAt);
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          return createdAt >= threeDaysAgo && car.status === 'Available';
        });
        setVehicles(latest);
      } catch (error) {
        console.error('Failed to load latest arrivals:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLatestArrivals();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-white/60 hover:text-amber-400 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Home
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-wider mb-2 text-white">Latest Arrivals</h1>
          <div className="w-24 h-1 bg-gold mb-4"></div>
          <p className="text-gray-400">Discover our newest additions to the showroom - vehicles added within the last 3 days</p>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No latest arrivals at the moment. Check back soon!</p>
            <Link href="/inventory" className="inline-block mt-4 text-gold hover:text-white transition-colors">
              View All Inventory
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((car: any) => (
              <div key={car.id} className="group bg-dark-card border border-gold/30 overflow-hidden hover:border-gold transition-colors flex flex-col relative">
                <div className="absolute top-3 right-3 z-10 bg-gold text-black text-xs font-bold uppercase px-3 py-1 rounded-sm shadow-lg animate-pulse">
                  New
                </div>
                <div className="relative h-56 overflow-hidden">
                  {car.image ? (
                    <img
                      src={car.image}
                      alt={`${car.year} ${car.brand} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-gray-500">
                      <div className="w-12 h-12 mb-2 opacity-20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.64 5H8.4a2 2 0 0 0-1.9 1.3L5 10 3 8"/><path d="M1 11.5 3 10l-1.5-1.5"/><path d="m23 11.5-2-1.5 1.5-1.5"/><path d="M5.5 10h13l1.5 3.5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3.5L5.5 10z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-white mb-1">
                    {car.brand} <span className="text-gray-400 font-normal">{car.model}</span>
                    {car.trim && <span className="text-gold font-normal text-sm ml-1">{car.trim}</span>}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{car.year}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <Gauge className="w-3 h-3" />
                      <span>{car.mileage ? `${car.mileage.toLocaleString()} mi` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <Fuel className="w-3 h-3" />
                      <span>{car.fuelType || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <Cog className="w-3 h-3" />
                      <span>{car.transmission || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-xl font-bold text-white">{car.price ? `$${car.price.toLocaleString()}` : 'POA'}</span>
                    <button
                      onClick={() => router.push(`/inventory?id=${car.id}`)}
                      className="text-gold uppercase tracking-wider text-xs font-bold hover:text-white transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
