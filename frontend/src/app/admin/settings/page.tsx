"use client";

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    whatsappNumber: '',
    instagramUrl: '',
    tiktokUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await fetchApi('/settings');
        if (data) {
          setForm({
            whatsappNumber: data.whatsappNumber || '',
            instagramUrl: data.instagramUrl || '',
            tiktokUrl: data.tiktokUrl || '',
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your showroom contact and social media links</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-8">
        {/* WhatsApp */}
        <div className="bg-dark-card border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">WhatsApp Contact</h2>
          <p className="text-gray-500 text-sm mb-5">This number will be used for the "Inquire via WhatsApp" button on vehicle pages.</p>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">WhatsApp Number</label>
            <input
              type="text"
              id="whatsapp"
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors"
              placeholder="+1234567890"
            />
            <p className="text-gray-600 text-xs mt-2">Include country code (e.g., +971 for UAE)</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-dark-card border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">Social Media</h2>
          <p className="text-gray-500 text-sm mb-5">Links shown in the footer and contact page.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Instagram URL</label>
              <input
                type="url"
                id="instagram"
                value={form.instagramUrl}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                placeholder="https://instagram.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">TikTok URL</label>
              <input
                type="url"
                id="tiktok"
                value={form.tiktokUrl}
                onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
                className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                placeholder="https://tiktok.com/@yourpage"
              />
            </div>
          </div>
        </div>

        {/* Feedback */}
        {success && (
          <div className="bg-green-900/30 border border-green-500/50 text-green-400 rounded-lg px-4 py-3 text-sm">
            ✓ Settings saved successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-gold text-black font-bold px-8 py-3 rounded-lg hover:bg-gold-hover transition-colors disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider"
        >
          {saving ? (
            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></span>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
