"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Search, ChevronLeft, ChevronRight, MessageCircle, Settings, Gauge, Calendar, ShieldCheck, Fuel, Cog, Disc3, Palette, User, Key, Globe, Sun, Lightbulb, Package, Cpu } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { BRANDS } from '@/lib/car-data';

/* ─────────────────────────────────────────────
   CAR DETAIL VIEW
───────────────────────────────────────────── */
function CarDetail({ id }: { id: string }) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [car, setCar] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [carData, settingsData] = await Promise.all([
          fetchApi(`/inventory/${id}`),
          fetchApi('/settings').catch(() => null)
        ]);
        setCar(carData);
        setSettings(settingsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load vehicle');
      } finally {
        setLoading(false);
      }
    }
    loadData();
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

  // Safely parse arrays (backend now sends arrays, but guard against JSON strings as fallback)
  const parseArr = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    try { const p = JSON.parse(val); return Array.isArray(p) ? p.filter(Boolean) : []; } catch { return []; }
  };

  const images = parseArr(car.images).length > 0 ? parseArr(car.images) : [car.image].filter(Boolean);
  const videos = parseArr(car.videos);

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
              {images.length > 0 ? (
                <img src={images[activeImage]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="w-20 h-20 mb-4 opacity-20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.64 5H8.4a2 2 0 0 0-1.9 1.3L5 10 3 8"/><path d="M1 11.5 3 10l-1.5-1.5"/><path d="m23 11.5-2-1.5 1.5-1.5"/><path d="M5.5 10h13l1.5 3.5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3.5L5.5 10z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>
                  </div>
                  <span className="text-sm font-medium uppercase tracking-widest opacity-50">Coming Soon</span>
                </div>
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

            {/* Video Gallery */}
            {videos.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-400">Videos</h3>
                {videos.map((vid: string, i: number) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                    <video
                      src={vid}
                      controls
                      preload="metadata"
                      className="w-full max-h-72 object-contain"
                      playsInline
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  car.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  car.status === 'Coming Soon' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {car.status || 'Available'}
                </span>
                <span className="text-white/40 text-sm">{car.year}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{car.brand} {car.model}</h1>
              {car.trim && <p className="text-amber-400 text-lg font-medium">{car.trim}</p>}
            </div>

            <div className="text-4xl font-bold text-amber-400">{car.price ? `$${car.price.toLocaleString()}` : 'POA'}</div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(() => {
                const baseSpecs = [
                  { icon: <Calendar className="w-5 h-5" />, label: 'Year', value: car.year },
                  { icon: <Gauge className="w-5 h-5" />, label: 'Mileage', value: car.mileage ? `${car.mileage.toLocaleString()} mi` : 'N/A' },
                  { icon: <Fuel className="w-5 h-5" />, label: 'Fuel', value: car.fuelType || 'N/A' },
                  { icon: <Cog className="w-5 h-5" />, label: 'Transmission', value: car.transmission || 'N/A' },
                ];
                const extraSpecs = [
                  { icon: <Settings className="w-5 h-5" />, label: 'Engine', value: car.engineCapacity || 'N/A' },
                  // Separate exterior and interior colors
                  { icon: <Palette className="w-5 h-5" />, label: 'Exterior Color', value: car.exteriorColor || 'N/A' },
                  { icon: <Palette className="w-5 h-5" />, label: 'Interior Color', value: car.interiorColor || 'N/A' },
                  // Facebook URL
                  { icon: <Globe className="w-5 h-5" />, label: 'Facebook', value: car.facebookUrl || 'N/A' },
                  { icon: <User className="w-5 h-5" />, label: 'Brand', value: car.brand || 'N/A' },
                  { icon: <User className="w-5 h-5" />, label: 'Model', value: car.model || 'N/A' },
                  { icon: <Settings className="w-5 h-5" />, label: 'Trim', value: car.trim || 'N/A' },
                  { icon: <Settings className="w-5 h-5" />, label: 'Price', value: car.price ? `$${car.price.toLocaleString()}` : 'POA' },
                  { icon: <Settings className="w-5 h-5" />, label: 'Status', value: car.status || 'N/A' },
                  { icon: <ShieldCheck className="w-5 h-5" />, label: 'Condition', value: car.condition || 'N/A' },
                  { icon: <Settings className="w-5 h-5" />, label: 'Body Type', value: car.bodyType || 'N/A' },
                  { icon: <Settings className="w-5 h-5" />, label: 'Drivetrain', value: car.drivetrain || 'N/A' },
                  { icon: <Key className="w-5 h-5" />, label: 'Number of Owners', value: car.numberOfOwners || 'N/A' },
                  { icon: <Key className="w-5 h-5" />, label: 'Keys', value: car.keys || 'N/A' },
                  { icon: <Globe className="w-5 h-5" />, label: 'Regional Specs', value: car.regionalSpecs || 'N/A' },
                  { icon: <Sun className="w-5 h-5" />, label: 'Sunroof', value: car.sunroof || 'N/A' },
                  { icon: <Lightbulb className="w-5 h-5" />, label: 'Lighting', value: car.lighting || 'N/A' },
                  { icon: <Package className="w-5 h-5" />, label: 'Special Packages', value: car.specialPackages?.length ? car.specialPackages : [] },
                  { icon: <Cpu className="w-5 h-5" />, label: 'Tech Features', value: car.techFeatures?.length ? car.techFeatures : [] }
                ];
                const specs = showAllSpecs ? [...baseSpecs, ...extraSpecs] : baseSpecs;
                return specs.map((spec, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-amber-400 mb-1">
                      {spec.icon}
                      <span className="text-xs text-white/40 uppercase tracking-wider">{spec.label}</span>
                    </div>
                    {Array.isArray(spec.value) ? (
                      spec.value.length > 0 ? (
                        <ul className="list-disc list-inside text-white text-sm">
                          {spec.value.map((v, idx) => <li key={idx}>{v}</li>)}
                        </ul>
                      ) : (
                        <p className="text-white font-medium text-sm">N/A</p>
                      )
                    ) : (
                      <p className="text-white font-medium text-sm">{spec.value}</p>
                    )}
                  </div>
                ));
              })()}
            </div>
            <button
              onClick={() => setShowAllSpecs(!showAllSpecs)}
              className="mt-4 px-4 py-2 bg-amber-500 text-black font-semibold rounded hover:bg-amber-400 transition-colors"
            >
              {showAllSpecs ? 'Show Less Specs' : 'Show All Specs'}
            </button>

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
                href={`https://wa.me/${settings?.whatsappNumber?.replace(/\+/g, '') || '1234567890'}?text=I'm interested in the ${car.year} ${car.brand} ${car.model}`}
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
  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Get brand and model from URL params
  const urlBrand = searchParams.get('brand') || '';
  const urlModel = searchParams.get('model') || '';

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
    const matchesSearch = car.brand?.toLowerCase().includes(q) ||
                          car.model?.toLowerCase().includes(q) ||
                          String(car.year).includes(q);
    const matchesStatus = statusFilter === '' || car.status === statusFilter;
    const matchesBrand = brandFilter === '' || car.brand === brandFilter;
    const matchesUrlBrand = urlBrand === '' || car.brand === urlBrand;
    const matchesUrlModel = urlModel === '' || car.model === urlModel;
    return matchesSearch && matchesStatus && matchesBrand && matchesUrlBrand && matchesUrlModel;
  });

  // Latest arrivals (vehicles added within last 3 days)
  // If brand/model are selected, show only the latest arrival for that brand/model
  const latestArrivals = vehicles.filter((car: any) => {
    if (!car.createdAt) return false;
    const createdAt = new Date(car.createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const isRecent = createdAt >= threeDaysAgo && car.status === 'Available';
    const matchesUrlBrand = urlBrand === '' || car.brand === urlBrand;
    const matchesUrlModel = urlModel === '' || car.model === urlModel;
    return isRecent && matchesUrlBrand && matchesUrlModel;
  });

  // If brand/model are selected, show only the single latest arrival
  const filteredLatestArrivals = (urlBrand || urlModel) 
    ? [latestArrivals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]].filter(Boolean)
    : latestArrivals;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-wider mb-2 text-white">Virtual Showroom</h1>
          <div className="w-24 h-1 bg-gold"></div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex flex-col md:flex-none">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-dark-card border border-white/20 text-white px-6 py-3 hover:border-gold transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            {showFilter && (
              <div className="absolute mt-14 z-20 bg-dark-card border border-white/20 p-4 rounded-lg shadow-xl w-64">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Brand</label>
                    <select 
                      value={brandFilter} 
                      onChange={e => setBrandFilter(e.target.value)}
                      className="w-full bg-dark-bg border border-white/20 text-white rounded px-3 py-2 focus:outline-none focus:border-gold"
                    >
                      <option value="">All Brands</option>
                      {BRANDS.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Status</label>
                    <select 
                      value={statusFilter} 
                      onChange={e => setStatusFilter(e.target.value)}
                      className="w-full bg-dark-bg border border-white/20 text-white rounded px-3 py-2 focus:outline-none focus:border-gold"
                    >
                      <option value="">All Statuses</option>
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
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

      {/* Latest Arrivals Section */}
      {filteredLatestArrivals.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gold"></div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
              {urlBrand || urlModel ? 'Latest Arrival' : 'Latest Arrivals'}
            </h2>
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {urlBrand || urlModel ? `For ${urlBrand} ${urlModel}` : 'Added within last 3 days'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredLatestArrivals.map((car: any) => (
              <div key={car.id} className="group bg-dark-card border border-gold/30 overflow-hidden hover:border-gold transition-colors flex flex-col relative">
                <div className="absolute top-3 right-3 z-10 bg-gold text-black text-xs font-bold uppercase px-3 py-1 rounded-sm shadow-lg animate-pulse">
                  New
                </div>
                <div className="relative h-48 overflow-hidden">
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
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {car.brand} <span className="text-gray-400 font-normal">{car.model}</span>
                  </h3>
                  <div className="mt-auto flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-lg font-bold text-gold">{car.price ? `$${car.price.toLocaleString()}` : 'POA'}</span>
                    <button
                      onClick={() => router.push(`/inventory?id=${car.id}`)}
                      className="text-white uppercase tracking-wider text-xs font-bold hover:text-gold transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Vehicles Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 bg-white/30"></div>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">All Vehicles</h2>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 opacity-20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.64 5H8.4a2 2 0 0 0-1.9 1.3L5 10 3 8"/><path d="M1 11.5 3 10l-1.5-1.5"/><path d="m23 11.5-2-1.5 1.5-1.5"/><path d="M5.5 10h13l1.5 3.5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3.5L5.5 10z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No car found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your search filters or browse all vehicles</p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setBrandFilter('');
            }}
            className="bg-gold text-black font-semibold px-6 py-3 rounded hover:bg-gold-hover transition-colors"
          >
            Clear Filters
          </button>
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
                {car.status === 'Coming Soon' && (
                  <div className="absolute top-4 left-4 z-10 bg-purple-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-sm shadow-lg">Coming Soon</div>
                )}
                {car.status === 'Sold Out' && (
                  <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="border-2 border-red-500 text-red-500 font-bold uppercase tracking-widest px-6 py-2 rotate-[-15deg] text-xl">Sold Out</span>
                  </div>
                )}
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
