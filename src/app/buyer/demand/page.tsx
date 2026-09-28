'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import { Sprout, ArrowLeft, Loader2, Award, Calendar, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['Irish Potato', 'Tomato', 'Onion', 'Maize', 'Rice', 'Soybean', 'Pepper', 'Vegetables', 'Fruits', 'Other'];
const GRADES = ['Grade A', 'Grade B', 'Grade C'];
const LGAS = ['Jos South', 'Barkin Ladi', 'Riyom', 'Jos North', 'Bassa', 'Mangu', 'Bokkos', 'Abuja', 'Lagos', 'Kano', 'Ibadan', 'Port Harcourt'];

export default function BuyerDemandPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [product, setProduct] = useState(CATEGORIES[0]);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('tonnes');
  const [grade, setGrade] = useState(GRADES[0]);
  const [deliveryLga, setDeliveryLga] = useState(LGAS[0]);
  const [deliveryState, setDeliveryState] = useState('Plateau');
  const [requiredDate, setRequiredDate] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [requirements, setRequirements] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        if (meData.user.role !== 'buyer') {
          router.push('/login');
          return;
        }
        setUser(meData.user);
        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!quantity || !requiredDate) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    const payload = {
      product,
      quantity: Number(quantity),
      unit,
      quality_grade: grade,
      delivery_location_lga: deliveryLga,
      delivery_location_state: deliveryState,
      required_date: requiredDate,
      price_min: priceMin ? Number(priceMin) : undefined,
      price_max: priceMax ? Number(priceMax) : undefined,
      additional_requirements: requirements
    };

    try {
      const res = await fetch('/api/demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit demand request');
      }

      router.push('/buyer/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E6956]" />
      </div>
    );
  }

  const isVerified = user.profile?.verification_status === 'verified';

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center gap-2 border-b border-[#E2ECE3] pb-4">
          <button 
            onClick={() => router.push('/buyer/dashboard')}
            className="p-1 rounded-lg hover:bg-[#F2F6F1] text-[#181F1B]/60"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#22392B]">{t('nav.postDemand')}</h1>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        {/* Note on high value demands */}
        {!isVerified && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Important: Account Verification Required for High Volumes</span>
            </div>
            <p>
              Your buyer profile is currently pending verification. Unverified accounts cannot list high-value requests (requests larger than 20 tonnes). You can list lower quantities or contact admin to verify your CAC registration.
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-[#E2ECE3] rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Crop/Produce Required</label>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] bg-white text-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
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
                    placeholder="e.g. 50"
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
                    <option value="tonnes">Tonnes</option>
                    <option value="bags">Bags</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Quality Grade Required</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] bg-white text-sm"
                >
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Delivery Deadline</label>
                <input
                  type="date"
                  required
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Target Destination LGA</label>
                <select
                  value={deliveryLga}
                  onChange={(e) => setDeliveryLga(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] bg-white text-sm"
                >
                  {LGAS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Destination State</label>
                <input
                  type="text"
                  required
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  placeholder="Plateau"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Min Price Range Target (₦, Optional)</label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="e.g. 400000"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Max Price Range Target (₦, Optional)</label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">Additional Sourcing Specifications</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Mention packaging size requirements, moisture levels, transport access, cooperative expectations, or escrow terms..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] text-sm outline-none resize-none focus:ring-1 focus:ring-[#4E6956]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-sm shadow transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing matches...</span>
                </>
              ) : (
                <span>Post Sourcing Demand</span>
              )}
            </button>

          </form>
        </div>

      </main>
    </div>
  );
}
