"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CarFront, TrendingUp, Star, Eye, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/admin/login');
      return;
    }

    async function loadData() {
      try {
        const data = await fetchApi('/inventory/admin');
        setVehicles(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load vehicles:', err);
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          localStorage.removeItem('token');
          router.push('/admin/login');
        } else {
          setError(err.message || 'Failed to load vehicles');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this vehicle permanently?')) return;
    setDeleting(id);
    try {
      await fetchApi(`/inventory/${id}`, { method: 'DELETE' });
      const data = await fetchApi('/inventory/admin');
      setVehicles(data);
    } catch (err: any) {
      console.error('Failed to delete vehicle:', err);
      alert('Failed to delete vehicle. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const available = vehicles.filter(v => v.status === 'Available').length;
  const reserved = vehicles.filter(v => v.status === 'Reserved').length;
  const sold = vehicles.filter(v => v.status === 'Sold Out').length;
  const totalValue = vehicles.filter(v => v.price).reduce((sum, v) => sum + v.price, 0);

  const stats = [
    { label: 'Total Vehicles', value: vehicles.length, icon: CarFront, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Available', value: available, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Reserved', value: reserved, icon: Star, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Sold Out', value: sold, icon: Eye, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your showroom performance</p>
        </div>
        <Link
          href="/admin/vehicles"
          className="bg-gold text-black font-bold px-5 py-2.5 rounded-lg hover:bg-gold-hover transition-colors flex items-center gap-2 uppercase tracking-wider text-sm"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </Link>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-dark-card border border-white/10 rounded-xl p-6 animate-pulse">
              <div className="h-10 w-10 bg-white/10 rounded-full mb-4"></div>
              <div className="h-8 w-12 bg-white/10 rounded mb-2"></div>
              <div className="h-4 w-24 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-dark-card border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Total Portfolio Value */}
      {!loading && totalValue > 0 && (
        <div className="bg-gradient-to-r from-gold/20 to-transparent border border-gold/30 rounded-xl p-6 mb-10">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Portfolio Value</p>
          <p className="text-4xl font-bold text-white">${totalValue.toLocaleString()}</p>
        </div>
      )}

      {/* Recent Vehicles */}
      <div className="bg-dark-card border border-white/10 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Recent Vehicles</h2>
          <Link href="/admin/vehicles" className="text-gold text-sm hover:text-white transition-colors flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center">
            <CarFront className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No vehicles yet.</p>
            <Link href="/admin/vehicles" className="text-gold hover:text-white transition-colors mt-2 inline-block">
              Add your first vehicle →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs uppercase tracking-wider text-gray-500 px-6 py-3">Vehicle</th>
                <th className="text-left text-xs uppercase tracking-wider text-gray-500 px-6 py-3 hidden md:table-cell">Year</th>
                <th className="text-left text-xs uppercase tracking-wider text-gray-500 px-6 py-3">Price</th>
                <th className="text-left text-xs uppercase tracking-wider text-gray-500 px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vehicles.slice(0, 5).map((v) => (
                <tr key={v.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {v.image && (
                        <img src={v.image} alt="" className="w-10 h-10 rounded-md object-cover" />
                      )}
                      <div>
                        <p className="text-white font-medium">{v.brand}</p>
                        <p className="text-gray-500 text-sm">{v.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden md:table-cell">{v.year}</td>
                  <td className="px-6 py-4 text-white font-semibold">
                    {v.price ? `$${v.price.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      v.status === 'Available' ? 'bg-green-900/50 text-green-400' :
                      v.status === 'Reserved' ? 'bg-yellow-900/50 text-yellow-400' :
                      v.status === 'Sold Out' ? 'bg-red-900/50 text-red-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/vehicles`} 
                        className="text-gold hover:text-white transition-colors text-sm"
                        title="View All Vehicles"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(v.id)}
                        disabled={deleting === v.id}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500 text-gray-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === v.id
                          ? <span className="animate-spin rounded-full h-3 w-3 border-t-2 border-white"></span>
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
