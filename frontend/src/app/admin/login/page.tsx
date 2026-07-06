"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@cardealer.com');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-widest text-white">
            Naccash<span className="text-red-500">Motors</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-wider">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-dark-card border border-white/10 rounded-xl p-8 shadow-2xl shadow-black/50">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to manage your showroom</p>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors placeholder-gray-600"
                placeholder="admin@cardealer.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors placeholder-gray-600"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-hover text-black font-bold uppercase tracking-wider py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-600 text-xs mb-3">
              Demo Credentials
            </p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-gold hover:text-white text-xs uppercase tracking-wider transition-colors"
            >
              Use Demo Account →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
