"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Search, ChevronLeft, ChevronRight, MessageCircle, Settings, Gauge, Calendar, ShieldCheck, Fuel, Cog, Disc3, Palette } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

/* ─────────────────────────────────────────────
   CAR DETAIL VIEW
───────────────────────────────────────────── */
function CarDetail({ id }: { id: string }) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCar() {
      try {
        const data = await fetchApi(`/inventory/${id}`);
        setCar(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load vehicle');
      } finally {
        setLoading(false);
      }
    }
    loadCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 text-lg">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Vehicle not found'}</p>
          <button onClick={() => router.push('/inventory')} className="text-amber-500 hover:text-amber-400 underline">
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : [car.image].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => router.push('/inventory')}
          className="inline-flex items-center gap-2 text-white/60 hover:text-amber-400 transition-colors duration-200 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Inventory
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              {images.length > 0 && (
                <img src={images[activeImage]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImage(i => (i + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_: string, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${i === activeImage ? 'bg-amber-500' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${i === activeImage ? 'border-amber-500' : 'border-white/10 hover:border-white/30'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${car.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {car.status || 'Available'}
                </span>
                <span className="text-white/40 text-sm">{car.year}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{car.brand} {car.model}</h1>
              {car.trim && <p className="text-amber-400 text-lg font-medium">{car.trim}</p>}
            </div>

            <div className="text-4xl font-bold text-amber-400">${car.price?.toLocaleString()}</div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: <Calendar className="w-5 h-5" />, label: 'Year', value: car.year },
                { icon: <Gauge className="w-5 h-5" />, label: 'Mileage', value: car.mileage ? `${car.mileage.toLocaleString()} mi` : 'N/A' },
                { icon: <Fuel className="w-5 h-5" />, label: 'Fuel', value: car.fuelType || 'N/A' },
                { icon: <Cog className="w-5 h-5" />, label: 'Transmission', value: car.transmission || 'N/A' },
                { icon: <Settings className="w-5 h-5" />, label: 'Engine', value: car.engine || 'N/A' },
                { icon: <Palette className="w-5 h-5" />, label: 'Color', value: car.color || 'N/A' },
              ].map((spec, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-amber-400 mb-1">
                    {spec.icon}
                    <span className="text-xs text-white/40 uppercase tracking-wider">{spec.label}</span>
                  </div>
                  <p className="text-white font-medium text-sm">{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              {car.vin && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Disc3 className="w-4 h-4" />
                  <span>VIN: {car.vin}</span>
                </div>
              )}
              {car.condition && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{car.condition} condition</span>
                </div>
              )}
            </div>

            {car.description && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">About this vehicle</h3>
                <p className="text-white/70 text-sm leading-relaxed">{car.description}</p>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <a
                href={`https://wa.me/1234567890?text=I'm interested in the ${car.year} ${car.brand} ${car.model}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Us
              </a>
              <Link href="/contact" className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 px-6 rounded-xl transition-colors duration-200">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   INVENTORY LIST VIEW
───────────────────────────────────────────── */
function InventoryList() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadVehicles() {
      try {
        const data = await fetchApi('/inventory');
        setVehicles(data);
      } catch (error) {
        console.error('Failed to load vehicles:', error);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  const filtered = vehicles.filter((car: any) => {
    const q = search.toLowerCase();
    return (
      car.brand?.toLowerCase().includes(q) ||
      car.model?.toLowerCase().includes(q) ||
      String(car.year).includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-wider mb-2 text-white">Virtual Showroom</h1>
          <div className="w-24 h-1 bg-gold"></div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-dark-card border border-white/20 text-white px-6 py-3 hover:border-gold transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-dark-card border border-white/20 text-white pl-10 pr-4 py-3 focus:outline-none focus:border-gold"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((car: any) => (
            <div key={car.id} className="group bg-dark-card border border-white/10 overflow-hidden hover:border-gold/50 transition-colors flex flex-col">
              <div className="relative h-56 overflow-hidden">
                {car.status === 'Available' && (
                  <div className="absolute top-4 left-4 z-10 bg-gold text-black text-xs font-bold uppercase px-3 py-1 rounded-sm shadow-lg">Available</div>
                )}
                {car.status === 'Reserved' && (
                  <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-sm shadow-lg">Reserved</div>
                )}
                {car.status === 'Sold Out' && (
                  <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="border-2 border-red-500 text-red-500 font-bold uppercase tracking-widest px-6 py-2 rotate-[-15deg] text-xl">Sold Out</span>
                  </div>
                )}
                <img
                  src={car.image}
                  alt={`${car.year} ${car.brand} ${car.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-white mb-1">
                  {car.brand} <span className="text-gray-400 font-normal">{car.model}</span>
                  {car.trim && <span className="text-gold font-normal text-sm ml-1">{car.trim}</span>}
                </h2>
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-xl font-bold text-white">${car.price?.toLocaleString()}</span>
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
  );
}

/* ─────────────────────────────────────────────
   ROOT PAGE — switches between list & detail
───────────────────────────────────────────── */
function InventoryPageInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (id) return <CarDetail id={id} />;
  return <InventoryList />;
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    }>
      <InventoryPageInner />
    </Suspense>
  );
}
