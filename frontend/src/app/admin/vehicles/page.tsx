"use client";

import { useEffect, useRef, useState } from 'react';
import { Pencil, Trash2, Plus, X, Save, CarFront, Camera, Image, Video, Film } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import app from '@/lib/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const firebaseStorage = getStorage(app);
import {
  BRANDS, getModels, getYears,
  FUEL_TYPES, DRIVETRAINS, TRANSMISSIONS, ENGINE_CAPACITIES,
  EXTERIOR_COLORS, INTERIOR_COLORS, BODY_TYPES,
  OWNER_OPTIONS, KEY_OPTIONS, REGIONAL_SPECS,
  SUNROOF_OPTIONS, LIGHTING_OPTIONS, TECH_FEATURES, getSpecialPackages,
} from '@/lib/car-data';

const STATUSES = ['Available', 'Reserved', 'Sold Out', 'Hidden', 'Coming Soon'];
const CONDITIONS = ['New', 'Like New', 'Certified Pre-Owned', 'Used', 'Needs Repair'];

const emptyForm = {
  // Basic
  vin: '', brand: '', model: '', trim: '', year: '', price: '', status: 'Available', condition: 'Used',
  mileage: '', description: '', image: '',
  images: [] as string[],
  videos: [] as string[],
  // Engine
  transmission: '', fuelType: '', engineCapacity: '', drivetrain: '',
  // Aesthetics
  exteriorColor: '', interiorColor: '', bodyType: '',
  // Ownership
  numberOfOwners: '', keys: '', regionalSpecs: '',
  // Premium
  sunroof: '', lighting: '',
  specialPackages: [] as string[],
  techFeatures: [] as string[],
  // Financials (Internal)
  purchaseCost: '', shippingCost: '', customsCost: '', maintenanceCost: '', otherCosts: '', soldPrice: '',
};

type FormState = typeof emptyForm;

// Reusable select component
function Select({ label, id, value, onChange, options, placeholder = 'Select...', disabled = false, required = false }: {
  label: string; id: string; value: string;
  onChange: (v: string) => void; options: string[];
  placeholder?: string; disabled?: boolean; required?: boolean;
}) {
  const allOptions = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <select
        id={id} value={value} disabled={disabled} required={required}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold transition-colors disabled:opacity-40 appearance-none"
      >
        <option value="">{placeholder}</option>
        {allOptions.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// Section wrapper
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <div className="bg-white/5 px-5 py-3 border-b border-white/10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gold">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

// Multi-checkbox selector
function CheckboxGroup({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    const current = selected || [];
    onChange(current.includes(opt) ? current.filter(s => s !== opt) : [...current, opt]);
  };
  return (
    <div className="sm:col-span-2">
      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-3">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggle(opt); }}>
            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selected?.includes(opt) ? 'bg-gold border-gold' : 'border-white/30 group-hover:border-gold/60'}`}>
              {selected?.includes(opt) && <span className="text-black text-xs font-bold">✓</span>}
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [decodingVin, setDecodingVin] = useState(false);
  const [nhtsaTrims, setNhtsaTrims] = useState<string[]>([]);
  const [loadingTrims, setLoadingTrims] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FormState) => (value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const models = form.brand ? getModels(form.brand) : [];
  const years = form.brand ? getYears(form.brand).map(String) : Array.from({ length: 2026 - 1990 + 1 }, (_, i) => String(2026 - i));
  const packages = form.brand ? getSpecialPackages(form.brand) : [];

  async function loadVehicles() {
    try {
      const data = await fetchApi('/inventory/admin');
      setVehicles(data);
      
      // Auto-edit if query param is present
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const editId = params.get('edit');
        if (editId) {
          const vehicle = data.find((v: any) => v.id === Number(editId));
          if (vehicle) {
            setForm({
              ...emptyForm,
              ...vehicle,
              year: String(vehicle.year),
              price: vehicle.price ? String(vehicle.price) : '',
              mileage: vehicle.mileage ? String(vehicle.mileage) : '',
              images: vehicle.images || [],
              videos: vehicle.videos || [],
              specialPackages: vehicle.specialPackages || [],
              techFeatures: vehicle.techFeatures || [],
              purchaseCost: vehicle.purchaseCost ? String(vehicle.purchaseCost) : '',
              shippingCost: vehicle.shippingCost ? String(vehicle.shippingCost) : '',
              customsCost: vehicle.customsCost ? String(vehicle.customsCost) : '',
              maintenanceCost: vehicle.maintenanceCost ? String(vehicle.maintenanceCost) : '',
              otherCosts: vehicle.otherCosts ? String(vehicle.otherCosts) : '',
              soldPrice: vehicle.soldPrice ? String(vehicle.soldPrice) : '',
            });
            setEditingId(vehicle.id);
            setShowForm(true);
            
            // Clean up URL without refreshing the page
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadVehicles(); }, []);

  useEffect(() => {
    async function loadTrims() {
      if (!form.brand || !form.year) { setNhtsaTrims([]); return; }
      setLoadingTrims(true);
      try {
        const data = await fetchApi(`/nhtsa/models/${encodeURIComponent(form.brand)}/${form.year}`);
        if (data && data.Results) {
          const uniqueTrims = Array.from(new Set(data.Results.map((r: any) => r.Model_Name as string))).sort() as string[];
          setNhtsaTrims(uniqueTrims);
        }
      } catch (err) {
        console.error('Failed to load trims from NHTSA:', err);
      } finally {
        setLoadingTrims(false);
      }
    }
    loadTrims();
  }, [form.brand, form.year]);

  const handleVinDecode = async () => {
    if (!form.vin || form.vin.length < 11) return alert('Please enter a valid VIN (at least 11 characters)');
    setDecodingVin(true);
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${form.vin}?format=json`);
      const data = await res.json();
      if (data && data.Results) {
        const getVal = (variable: string) => {
          const item = data.Results.find((r: any) => r.Variable === variable && r.Value && r.Value !== 'Not Applicable');
          return item ? item.Value : null;
        };
        const errorCode = getVal('Error Code');
        const errorText = getVal('Error Text');
        if (errorCode && errorCode !== '0') {
          alert(`NHTSA Registry Warning: ${errorText || 'This VIN contains errors or is not fully registered in the US database.'} Only partial information could be retrieved.`);
        }
        const make = getVal('Make');
        const model = getVal('Model');
        const year = getVal('Model Year');
        const trim = getVal('Trim');
        const displacement = getVal('Displacement (L)');
        const drive = getVal('Drive Type');
        const fuel = getVal('Fuel Type - Primary');
        const body = getVal('Body Class');
        const trans = getVal('Transmission Style');
        const updates: any = {};
        if (make) {
          const matchedBrand = BRANDS.find(b => b.toUpperCase() === make.toUpperCase());
          updates.brand = matchedBrand || make;
        }
        if (model) updates.model = model;
        if (year) updates.year = year;
        if (trim) updates.trim = trim;
        if (displacement) {
          const matchedCap = ENGINE_CAPACITIES.find(c => c.startsWith(parseFloat(displacement).toFixed(1)));
          updates.engineCapacity = matchedCap || `${parseFloat(displacement).toFixed(1)}L`;
        }
        if (fuel) {
          if (fuel.includes('Gasoline')) updates.fuelType = 'Gasoline (Benzine)';
          else if (fuel.includes('Diesel')) updates.fuelType = 'Diesel';
          else if (fuel.includes('Electric')) updates.fuelType = 'Electric (EV)';
        }
        if (drive) {
          if (drive.includes('AWD') || drive.includes('All-Wheel')) updates.drivetrain = 'All-Wheel Drive (AWD)';
          else if (drive.includes('RWD') || drive.includes('Rear')) updates.drivetrain = 'Rear-Wheel Drive (RWD)';
          else if (drive.includes('FWD') || drive.includes('Front')) updates.drivetrain = 'Front-Wheel Drive (FWD)';
          else if (drive.includes('4x4')) updates.drivetrain = '4x4 / 4WD';
        }
        if (body) {
          if (body.includes('Sedan')) updates.bodyType = 'Sedan';
          else if (body.includes('Coupe')) updates.bodyType = 'Coupe';
          else if (body.includes('Utility') || body.includes('SUV')) updates.bodyType = 'SUV';
          else if (body.includes('Convertible')) updates.bodyType = 'Convertible / Cabriolet';
          else if (body.includes('Hatchback')) updates.bodyType = 'Hatchback';
          else if (body.includes('Wagon')) updates.bodyType = 'Wagon';
        }
        if (trans) {
          if (trans.includes('Automatic')) updates.transmission = 'Automatic';
          else if (trans.includes('Manual')) updates.transmission = 'Manual';
          else if (trans.includes('Continuously Variable') || trans.includes('CVT')) updates.transmission = 'CVT';
          else if (trans.includes('Dual Clutch') || trans.includes('DCT')) updates.transmission = 'Dual-Clutch (DCT)';
          else updates.transmission = trans;
        }
        setForm(prev => ({ ...prev, ...updates }));
      }
    } catch (err) {
      console.error('VIN Decode Failed', err);
      alert('Failed to fetch data for this VIN.');
    } finally {
      setDecodingVin(false);
    }
  };

  // Upload multiple files directly to Firebase Storage with progress tracking
  const handleMediaFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setMediaUploading(true);

    const fileArray = Array.from(files);
    const total = fileArray.length;
    let completed = 0;
    const newImages: string[] = [];
    const newVideos: string[] = [];

    const formatTime = (secs: number) => {
      if (!isFinite(secs) || secs < 0) return 'calculating...';
      if (secs < 60) return `${Math.ceil(secs)}s`;
      const m = Math.floor(secs / 60);
      const s = Math.ceil(secs % 60);
      return `${m}m ${s}s`;
    };

    setUploadProgress(`Preparing ${total} file(s)...`);

    await Promise.all(fileArray.map((file) => new Promise<void>((resolve, reject) => {
      const isVideo = file.type.startsWith('video/');
      const folder = isVideo ? 'vehicles/videos' : 'vehicles/images';
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.name}`;
      const storageRef = ref(firebaseStorage, `${folder}/${uniqueName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      const startTime = Date.now();

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = snapshot.bytesTransferred / elapsed;
          const remaining = (snapshot.totalBytes - snapshot.bytesTransferred) / speed;
          setUploadProgress(
            total === 1
              ? `Uploading... ${percent}% (${formatTime(remaining)} left)`
              : `Uploading file ${completed + 1}/${total} — ${percent}% (${formatTime(remaining)} left)`
          );
        },
        (error) => {
          console.error('Firebase upload error:', error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          if (isVideo) newVideos.push(downloadUrl);
          else newImages.push(downloadUrl);
          completed++;
          setUploadProgress(`✓ ${completed}/${total} uploaded`);
          resolve();
        }
      );
    }))).catch((err) => {
      setMediaUploading(false);
      setUploadProgress('');
      alert(`Upload failed: ${err.message || String(err)}`);
      return;
    });

    setForm(prev => {
      const updatedImages = [...prev.images, ...newImages];
      const updatedVideos = [...prev.videos, ...newVideos];
      return {
        ...prev,
        image: prev.image || updatedImages[0] || '',
        images: updatedImages,
        videos: updatedVideos,
      };
    });
    setMediaUploading(false);
    setUploadProgress(`✓ ${total} file(s) uploaded successfully`);
    setTimeout(() => setUploadProgress(''), 3000);
  };

  const removeImage = (idx: number) => {
    setForm(prev => {
      const updated = prev.images.filter((_, i) => i !== idx);
      // If removed image was the cover, update cover
      const removedUrl = prev.images[idx];
      return {
        ...prev,
        images: updated,
        image: prev.image === removedUrl ? (updated[0] || '') : prev.image,
      };
    });
  };

  const removeVideo = (idx: number) => {
    setForm(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== idx) }));
  };

  const setCoverImage = (url: string) => {
    setForm(prev => ({ ...prev, image: url }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (v: any) => {
    setEditingId(v.id);
    setForm({
      vin: v.vin || '', brand: v.brand || '', model: v.model || '', trim: v.trim || '', year: String(v.year || ''),
      price: v.price || '', status: v.status || 'Available', condition: v.condition || 'Used',
      mileage: v.mileage || '', description: v.description || '', image: v.image || '',
      images: v.images ? JSON.parse(v.images) : [],
      videos: v.videos ? JSON.parse(v.videos) : [],
      transmission: v.transmission || '', fuelType: v.fuelType || '',
      engineCapacity: v.engineCapacity || '', drivetrain: v.drivetrain || '',
      exteriorColor: v.exteriorColor || '', interiorColor: v.interiorColor || '',
      bodyType: v.bodyType || '', numberOfOwners: v.numberOfOwners || '',
      keys: v.keys || '', regionalSpecs: v.regionalSpecs || '',
      sunroof: v.sunroof || '', lighting: v.lighting || '',
      specialPackages: v.specialPackages ? JSON.parse(v.specialPackages) : [],
      techFeatures: v.techFeatures ? JSON.parse(v.techFeatures) : [],
      purchaseCost: v.purchaseCost || '', shippingCost: v.shippingCost || '',
      customsCost: v.customsCost || '', maintenanceCost: v.maintenanceCost || '',
      otherCosts: v.otherCosts || '', soldPrice: v.soldPrice || '',
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        ...form,
        specialPackages: JSON.stringify(form.specialPackages),
        techFeatures: JSON.stringify(form.techFeatures),
        images: JSON.stringify(form.images),
        videos: JSON.stringify(form.videos),
      };
      if (editingId !== null) {
        await fetchApi(`/inventory/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchApi('/inventory', { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowForm(false);
      await loadVehicles();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save vehicle.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this vehicle permanently?')) return;
    setDeleting(id);
    try {
      await fetchApi(`/inventory/${id}`, { method: 'DELETE' });
      await loadVehicles();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicles</h1>
          <p className="text-gray-500 mt-1">Manage your showroom inventory</p>
        </div>
        <button onClick={openAddForm}
          className="bg-gold text-black font-bold px-5 py-2.5 rounded-lg hover:bg-gold-hover transition-colors flex items-center gap-2 uppercase tracking-wider text-sm">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Vehicle Table */}
      <div className="bg-dark-card border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center">
            <CarFront className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No vehicles yet.</p>
            <button onClick={openAddForm} className="text-gold hover:text-white transition-colors">Add your first vehicle →</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['Vehicle', 'Year', 'Price', 'Fuel', 'Status', ''].map(h => (
                  <th key={h} className={`text-left text-xs uppercase tracking-wider text-gray-500 px-5 py-4 ${h === 'Year' || h === 'Fuel' ? 'hidden lg:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vehicles.map(v => (
                <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {v.image ? (
                        <img src={v.image} alt="" className="w-12 h-10 rounded-md object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-10 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                          <CarFront className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-sm">{v.brand}</p>
                        <p className="text-gray-500 text-xs">{v.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-sm hidden lg:table-cell">{v.year}</td>
                  <td className="px-5 py-3 text-white font-semibold text-sm">{v.price ? `$${Number(v.price).toLocaleString()}` : 'POA'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden lg:table-cell">{v.fuelType || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                      v.status === 'Available' ? 'bg-green-900/50 text-green-400' :
                      v.status === 'Reserved' ? 'bg-yellow-900/50 text-yellow-400' :
                      v.status === 'Sold Out' ? 'bg-red-900/50 text-red-400' :
                      v.status === 'Coming Soon' ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-800 text-gray-400'
                    }`}>{v.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditForm(v)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-gold hover:text-black text-gray-400 flex items-center justify-center transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(v.id)} disabled={deleting === v.id}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500 text-gray-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50">
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

      {/* ======== FORM MODAL ======== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/15 rounded-2xl w-full max-w-3xl shadow-2xl my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 sticky top-0 bg-[#111] rounded-t-2xl z-10">
              <div>
                <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                <p className="text-gray-500 text-sm mt-0.5">Fill in all available details for best results</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-12">

            {(() => {
              const isComingSoon = form.status === 'Coming Soon';
              const req = !isComingSoon;

              return (
                <>
            {/* 🔥 VIN DECODER SECTION */}
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-6">
              <h3 className="text-gold font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <CarFront className="w-5 h-5" /> Auto-Fill Specs via VIN
              </h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={form.vin}
                  onChange={e => set('vin')(e.target.value.toUpperCase())}
                  placeholder="Enter 17-digit Vehicle Identification Number (VIN)"
                  className="flex-1 bg-black/50 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-gold uppercase tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={handleVinDecode}
                  disabled={decodingVin}
                  className="bg-gold text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {decodingVin ? 'Decoding...' : 'Decode & Fill'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Entering a VIN will automatically fetch the exact Brand, Model, Year, Engine, Drivetrain, and Body Type from the NHTSA registry.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {formError && (
                <div className="md:col-span-2 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 text-sm">{formError}</div>
              )}

              {/* ─── BASIC INFO ─── */}
              <Section title="Basic Information">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Brand *</label>
                  <select required id="brand" value={form.brand}
                    onChange={e => setForm(prev => ({ ...prev, brand: e.target.value, model: '', year: '', transmission: '' }))}
                    className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold transition-colors">
                    <option value="">Select brand...</option>
                    {(form.brand && !BRANDS.includes(form.brand) ? [form.brand, ...BRANDS] : BRANDS).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Model *</label>
                  <select required id="model" value={form.model}
                    disabled={!form.brand}
                    onChange={e => setForm(prev => ({ ...prev, model: e.target.value, year: '' }))}
                    className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold transition-colors disabled:opacity-40">
                    <option value="">{form.brand ? 'Select model...' : 'Select brand first'}</option>
                    {(form.model && !models.includes(form.model) ? [form.model, ...models] : models).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                    Trim / Exact Model {loadingTrims && <span className="text-gold lowercase ml-2 animate-pulse">loading...</span>}
                  </label>
                  <input type="text" id="trim" value={form.trim} onChange={e => set('trim')(e.target.value)}
                    list="trim-options"
                    className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold"
                    placeholder="e.g. 530i, M Sport..." />
                  <datalist id="trim-options">
                    {nhtsaTrims.map(t => <option key={t} value={t} />)}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">Select from dropdown or type custom trim</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Year *</label>
                  <select required id="year" value={form.year}
                    disabled={!form.model}
                    onChange={e => set('year')(e.target.value)}
                    className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold transition-colors disabled:opacity-40">
                    <option value="">{form.model ? 'Select year...' : 'Select model first'}</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                    Price (USD) {req && <span className="text-gold">*</span>}
                  </label>
                  <input type="number" min="0" id="price" value={form.price} required={req} onChange={e => set('price')(e.target.value)}
                    className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold"
                    placeholder="e.g. 215000" />
                </div>
                <Select label="Status" id="status" value={form.status} onChange={set('status')} options={STATUSES} required={true} />
                <Select label="Condition" id="condition" value={form.condition} onChange={set('condition')} options={CONDITIONS} required={true} />
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                    Mileage (km) {req && <span className="text-gold">*</span>}
                  </label>
                  <input type="number" min="0" id="mileage" value={form.mileage} required={req} onChange={e => set('mileage')(e.target.value)}
                    className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold"
                    placeholder="e.g. 12000" />
                </div>
                <Select label="Body Type" id="bodyType" value={form.bodyType} onChange={set('bodyType')} options={BODY_TYPES} />
              </Section>

              {/* ─── MEDIA GALLERY ─── */}
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-white/5 px-5 py-3 border-b border-white/10">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gold">
                    Photos & Videos {req && <span>*</span>}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Upload multiple photos and videos. Click an image to set it as cover.</p>
                </div>
                <div className="p-5 space-y-5">

                  {/* Upload area */}
                  <div
                    className="border-2 border-dashed border-white/20 hover:border-gold/50 rounded-xl p-6 text-center transition-colors cursor-pointer group"
                    onClick={() => mediaInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); }}
                    onDrop={e => { e.preventDefault(); handleMediaFiles(e.dataTransfer.files); }}
                  >
                    <input
                      ref={mediaInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={e => { handleMediaFiles(e.target.files); e.target.value = ''; }}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={e => { handleMediaFiles(e.target.files); e.target.value = ''; }}
                    />
                    {mediaUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
                        <p className="text-gold text-sm">{uploadProgress}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-3 text-gray-500 group-hover:text-gold transition-colors">
                          <Image className="w-7 h-7" />
                          <Film className="w-7 h-7" />
                        </div>
                        <p className="text-sm text-gray-400 group-hover:text-white transition-colors">
                          <span className="text-gold font-semibold">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-xs text-gray-600">Images (JPG, PNG, WEBP) & Videos (MP4, MOV, MKV) — up to 200MB per file</p>
                        {uploadProgress && <p className="text-green-400 text-xs font-semibold mt-1">{uploadProgress}</p>}
                      </div>
                    )}
                  </div>

                  {/* Camera button for mobile */}
                  <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={mediaUploading}
                    className="w-full flex items-center justify-center gap-2 border border-white/20 hover:border-gold text-gray-400 hover:text-white rounded-lg py-2.5 transition-colors text-sm">
                    <Camera className="w-4 h-4" /> Take Photo with Camera
                  </button>

                  {/* Images preview grid */}
                  {form.images.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                        <Image className="w-3 h-3" /> Photos ({form.images.length}) — click to set cover
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {form.images.map((url, idx) => (
                          <div key={idx} className="relative group/img aspect-video rounded-lg overflow-hidden bg-black/30">
                            <img
                              src={url}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => setCoverImage(url)}
                            />
                            {form.image === url && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gold text-black text-[10px] font-bold text-center py-0.5">COVER</div>
                            )}
                            <button type="button" onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos preview */}
                  {form.videos.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                        <Video className="w-3 h-3" /> Videos ({form.videos.length})
                      </p>
                      <div className="space-y-2">
                        {form.videos.map((url, idx) => (
                          <div key={idx} className="relative group/vid rounded-lg overflow-hidden bg-black/30 border border-white/10">
                            <video src={url} controls className="w-full max-h-40 object-contain" />
                            <button type="button" onClick={() => removeVideo(idx)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cover image URL fallback */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Or paste cover image URL</label>
                    <input type="url" id="imageUrl"
                      value={form.image.startsWith('http') && !form.image.startsWith('http://localhost') ? form.image : ''}
                      required={req && !form.image && form.images.length === 0}
                      onChange={e => set('image')(e.target.value)}
                      className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold"
                      placeholder="https://..." />
                  </div>
                </div>
              </div>

              {/* ─── ENGINE & PERFORMANCE ─── */}
              <Section title="Engine & Performance">
                <Select label="Transmission" id="transmission" value={form.transmission} onChange={set('transmission')} options={TRANSMISSIONS} required={req} />
                <Select label="Fuel Type" id="fuelType" value={form.fuelType} onChange={set('fuelType')} options={FUEL_TYPES} required={req} />
                <Select label="Engine Capacity" id="engineCapacity" value={form.engineCapacity} onChange={set('engineCapacity')} options={ENGINE_CAPACITIES} />
                <Select label="Drivetrain" id="drivetrain" value={form.drivetrain} onChange={set('drivetrain')} options={DRIVETRAINS} />
              </Section>

              {/* ─── AESTHETICS ─── */}
              <Section title="Aesthetics & Styling">
                <Select label="Exterior Color" id="exteriorColor" value={form.exteriorColor} onChange={set('exteriorColor')} options={EXTERIOR_COLORS} required={req} />
                <Select label="Interior Color & Material" id="interiorColor" value={form.interiorColor} onChange={set('interiorColor')} options={INTERIOR_COLORS} />
              </Section>

              {/* ─── OWNERSHIP ─── */}
              <Section title="Ownership & Legal Status">
                <Select label="Number of Owners" id="numberOfOwners" value={form.numberOfOwners} onChange={set('numberOfOwners')} options={OWNER_OPTIONS} />
                <Select label="Keys" id="keys" value={form.keys} onChange={set('keys')} options={KEY_OPTIONS} />
                <Select label="Regional Specs (Origin)" id="regionalSpecs" value={form.regionalSpecs} onChange={set('regionalSpecs')} options={REGIONAL_SPECS} />
              </Section>

              {/* ─── PREMIUM FEATURES ─── */}
              <Section title="Premium Features & Packages">
                <Select label="Sunroof / Roof" id="sunroof" value={form.sunroof} onChange={set('sunroof')} options={SUNROOF_OPTIONS} />
                <Select label="Lighting" id="lighting" value={form.lighting} onChange={set('lighting')} options={LIGHTING_OPTIONS} />
                {packages.length > 0 && (
                  <CheckboxGroup label="Special Packages" options={packages}
                    selected={form.specialPackages} onChange={set('specialPackages')} />
                )}
                <CheckboxGroup label="Tech Features" options={TECH_FEATURES}
                  selected={form.techFeatures} onChange={set('techFeatures')} />
              </Section>

              {/* ─── DESCRIPTION ─── */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Description</label>
                <textarea id="description" value={form.description} onChange={e => set('description')(e.target.value)} rows={4}
                  className="w-full bg-dark-bg border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-gold resize-none"
                  placeholder="Describe the vehicle, notable features, history, condition..." />
              </div>

              {/* ─── INTERNAL FINANCIALS ─── */}
              <div className="md:col-span-2 border border-red-500/30 rounded-xl overflow-hidden mt-8">
                <div className="bg-red-500/10 px-5 py-3 border-b border-red-500/30">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-red-500">Internal Accounting & Financials (Private)</h3>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Purchase Cost ($)</label>
                    <input type="number" value={form.purchaseCost || ''} onChange={e => set('purchaseCost')(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Shipping Cost ($)</label>
                    <input type="number" value={form.shippingCost || ''} onChange={e => set('shippingCost')(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Customs & Taxes ($)</label>
                    <input type="number" value={form.customsCost || ''} onChange={e => set('customsCost')(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Maintenance / Prep ($)</label>
                    <input type="number" value={form.maintenanceCost || ''} onChange={e => set('maintenanceCost')(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Other Costs ($)</label>
                    <input type="number" value={form.otherCosts || ''} onChange={e => set('otherCosts')(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" />
                  </div>
                  {form.status === 'Sold Out' && (
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gold mb-2">Final Sale Price ($)</label>
                      <input type="number" value={form.soldPrice || ''} onChange={e => set('soldPrice')(e.target.value)}
                        className="w-full bg-black/50 border border-gold text-white rounded-lg px-4 py-3 focus:outline-none focus:border-gold" />
                    </div>
                  )}
                  <div className="md:col-span-3 mt-4 bg-black/40 p-4 rounded-lg border border-white/5 flex flex-wrap gap-6 justify-between items-center">
                    {(() => {
                      const totalCost = (Number(form.purchaseCost) || 0) + (Number(form.shippingCost) || 0) + (Number(form.customsCost) || 0) + (Number(form.maintenanceCost) || 0) + (Number(form.otherCosts) || 0);
                      const askingPrice = Number(form.price) || 0;
                      const isSold = form.status === 'Sold Out';
                      const revenue = isSold ? (Number(form.soldPrice) || 0) : askingPrice;
                      const profit = revenue - totalCost;
                      const margin = totalCost > 0 ? (profit / totalCost) * 100 : 0;
                      return (
                        <>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Cost</p>
                            <p className="text-xl font-mono text-white">${totalCost.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{isSold ? 'Final Revenue' : 'Asking Price'}</p>
                            <p className="text-xl font-mono text-white">${revenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{isSold ? 'Actual Profit' : 'Expected Profit'}</p>
                            <p className={`text-xl font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                              {profit >= 0 ? '+' : '-'}${Math.abs(profit).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Margin</p>
                            <p className={`text-xl font-mono ${margin >= 0 ? 'text-green-400' : 'text-red-500'}`}>{margin.toFixed(1)}%</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── ACTIONS ─── */}
            <div className="flex gap-3 pt-2 sticky bottom-0 bg-[#111] pb-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-white/20 text-gray-400 hover:text-white hover:border-white/40 py-3 rounded-lg transition-colors font-medium">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-gold text-black font-bold py-3 rounded-lg hover:bg-gold-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving
                  ? <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></span>
                  : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Vehicle'}
              </button>
            </div>
                </>
              );
            })()}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
