'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import { 
  Sprout, Plus, Eye, Pause, Play, Trash2, Edit2, Loader2, ArrowLeft, CheckCircle2
} from 'lucide-react';

const CATEGORIES = ['Irish Potato', 'Tomato', 'Onion', 'Maize', 'Rice', 'Soybean', 'Pepper', 'Vegetables', 'Fruits', 'Other'];
const GRADES = ['Grade A', 'Grade B', 'Grade C'];
const UNITS = ['tonnes', 'bags', 'kg'];

export default function FarmerProducePage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState(UNITS[0]);
  const [price, setPrice] = useState('');
  const [grade, setGrade] = useState(GRADES[0]);
  const [harvestDate, setHarvestDate] = useState('');
  const [availableDate, setAvailableDate] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const fetchListings = async (userId: string) => {
    try {
      const res = await fetch(`/api/produce?farmerId=${userId}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);
        await fetchListings(meData.user.id);
        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!quantity || !price || !harvestDate || !availableDate) {
      setFormError('Please fill in all required fields');
      return;
    }

    const payload = {
      category,
      variety,
      quantity: Number(quantity),
      unit,
      price_per_unit: Number(price),
      price_type: 'negotiable',
      quality_grade: grade,
      harvest_date: harvestDate,
      available_date: availableDate,
      description
    };

    try {
      let res;
      if (editingId) {
        // Edit existing listing
        res = await fetch(`/api/produce/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new listing
        res = await fetch('/api/produce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save produce listing');
      }

      // Reset Form
      setFormOpen(false);
      setEditingId(null);
      setVariety('');
      setQuantity('');
      setPrice('');
      setHarvestDate('');
      setAvailableDate('');
      setDescription('');

      // Refresh listings
      await fetchListings(user.id);
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/produce/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        await fetchListings(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/produce/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchListings(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (list: any) => {
    setEditingId(list.id);
    setCategory(list.category);
    setVariety(list.variety || '');
    setQuantity(list.quantity.toString());
    setUnit(list.unit);
    setPrice(list.price_per_unit.toString());
    setGrade(list.quality_grade);
    
    // Format dates to YYYY-MM-DD
    const hd = new Date(list.harvest_date).toISOString().split('T')[0];
    const ad = new Date(list.available_date).toISOString().split('T')[0];
    setHarvestDate(hd);
    setAvailableDate(ad);
    
    setDescription(list.description || '');
    setFormOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E6956]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-[#E2ECE3] pb-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push('/farmer/dashboard')}
              className="p-1 rounded-lg hover:bg-[#F2F6F1] text-[#181F1B]/60"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#22392B]">My Produce Listings</h1>
          </div>
          
          {!formOpen && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormOpen(true);
              }}
              className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Produce</span>
            </button>
          )}
        </div>

        {formOpen && (
          <div className="bg-white border border-[#E2ECE3] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-[#F2F6F1] pb-2 flex justify-between items-center">
              <h3 className="font-bold text-sm text-[#22392B]">{editingId ? 'Edit Produce Listing' : 'List New Harvested Produce'}</h3>
              <button 
                onClick={() => setFormOpen(false)}
                className="text-xs text-[#181F1B]/60 hover:underline"
              >
                Cancel
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Crop Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] bg-white text-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Variety / Strain (Optional)</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Nicola, Russet, Roma"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] bg-white text-sm"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Price per Unit (₦ NGN)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 450000"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Quality Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] bg-white text-sm"
                >
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 col-span-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Available Date</label>
                  <input
                    type="date"
                    required
                    value={availableDate}
                    onChange={(e) => setAvailableDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe crop quality, certifications, cooperative associations, or bulk logistics preferences..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] text-sm outline-none resize-none focus:ring-1 focus:ring-[#4E6956]"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#E2ECE3] text-xs font-bold hover:bg-[#FAFAF7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow"
                >
                  {editingId ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="bg-white border border-[#E2ECE3] rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <Sprout className="w-10 h-10 mx-auto text-[#181F1B]/30" />
            <h3 className="font-bold text-sm text-[#22392B]">No produce listings registered</h3>
            <p className="text-xs text-[#181F1B]/60 max-w-sm mx-auto">
              Please use the "Add Produce" button above to register your harvested potatoes, onions, tomatoes or maize.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listings.map((list) => (
              <div 
                key={list.id} 
                className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                  list.is_active ? 'border-[#E2ECE3]' : 'border-[#E2ECE3] bg-gray-50/55 opacity-70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-base text-[#22392B]">{list.category}</h3>
                      <p className="text-xs text-[#181F1B]/60">{list.variety || 'Standard Variety'}</p>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      list.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {list.is_active ? 'Active Listing' : 'Paused Listing'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAFAF7] p-3 rounded-xl border border-[#E2ECE3]">
                    <div>
                      <span className="text-[#181F1B]/50 block">Available Quantity:</span>
                      <span className="font-bold text-[#22392B]">{list.quantity} {list.unit}</span>
                    </div>
                    <div>
                      <span className="text-[#181F1B]/50 block">Quality Grade:</span>
                      <span className="font-bold text-[#22392B]">{list.quality_grade}</span>
                    </div>
                    <div>
                      <span className="text-[#181F1B]/50 block">Expected Price:</span>
                      <span className="font-bold text-[#22392B]">₦{Number(list.price_per_unit).toLocaleString()} / {list.unit}</span>
                    </div>
                    <div>
                      <span className="text-[#181F1B]/50 block">Harvest Date:</span>
                      <span className="font-bold text-[#22392B]">{new Date(list.harvest_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {list.description && (
                    <p className="text-xs text-[#181F1B]/70 italic line-clamp-2">
                      "{list.description}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#F2F6F1] flex justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(list.id, list.is_active)}
                      className="p-2 rounded-lg border border-[#E2ECE3] hover:bg-[#FAFAF7] text-[#181F1B]/70"
                      title={list.is_active ? 'Pause Listing' : 'Activate Listing'}
                    >
                      {list.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEdit(list)}
                      className="p-2 rounded-lg border border-[#E2ECE3] hover:bg-[#FAFAF7] text-[#181F1B]/70"
                      title="Edit Listing"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(list.id)}
                    className="p-2 rounded-lg border border-[#E2ECE3] hover:bg-red-50 text-red-600"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
