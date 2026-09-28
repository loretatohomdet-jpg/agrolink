'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { Sprout, Loader2, ArrowLeft } from 'lucide-react';

const LGAS = ['Jos South', 'Barkin Ladi', 'Riyom', 'Jos North', 'Bassa', 'Mangu', 'Bokkos'];
const BUSINESS_TYPES = [
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'processor', label: 'Processor' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'food_company', label: 'Food Company' },
  { value: 'institution', label: 'Institution' },
  { value: 'exporter', label: 'Exporter' },
  { value: 'other', label: 'Other' }
];

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF7]" />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') || 'farmer') as 'farmer' | 'buyer';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Farmer Specific State
  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [cooperativeName, setCooperativeName] = useState('');
  
  // Buyer Specific State
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('wholesaler');
  const [businessReg, setBusinessReg] = useState('');
  const [website, setWebsite] = useState('');
  
  // Shared Location State
  const [address, setAddress] = useState('');
  const [lga, setLga] = useState(LGAS[0]);
  const [community, setCommunity] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload: Record<string, any> = {
      email,
      password,
      name,
      phone,
      role,
      preferred_language: language,
      address,
      lga,
      community
    };

    if (role === 'farmer') {
      payload.farm_name = farmName;
      payload.farm_size = farmSize ? Number(farmSize) : undefined;
      payload.experience_years = experienceYears ? Number(experienceYears) : undefined;
      payload.cooperative_name = cooperativeName;
    } else {
      payload.company_name = companyName;
      payload.business_type = businessType;
      payload.business_registration_number = businessReg;
      payload.website = website;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Route to appropriate dashboard
      if (role === 'farmer') {
        router.push('/farmer/dashboard');
      } else {
        router.push('/buyer/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-4">
        <div className="flex justify-between items-center px-4 max-w-md mx-auto sm:px-0">
          <Link href="/onboarding" className="flex items-center gap-1 text-xs font-bold text-[#4E6956] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-[#22392B]">
            <Sprout className="w-5 h-5 text-[#4E6956]" />
            <span className="font-extrabold text-lg tracking-tight">AgroLink</span>
          </Link>
          <div className="w-8"></div>
        </div>
        <h2 className="text-3xl font-extrabold text-[#22392B]">
          Register as a {role === 'farmer' ? 'Farmer / Supplier' : 'Buyer / Off-taker'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 border border-[#E2ECE3] shadow sm:rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <div className="border-b border-[#F2F6F1] pb-2">
                <h3 className="text-sm font-bold text-[#22392B]">1. Account Credentials</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Musa Ibrahim"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08031234567"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="musa.farms@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Role Details */}
            {role === 'farmer' ? (
              <div className="space-y-4">
                <div className="border-b border-[#F2F6F1] pb-2">
                  <h3 className="text-sm font-bold text-[#22392B]">2. Farm Details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="farmName" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                      Farm Name
                    </label>
                    <input
                      id="farmName"
                      type="text"
                      required
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="Musa Farms Ltd"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="farmSize" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                      Farm Size (Hectares)
                    </label>
                    <input
                      id="farmSize"
                      type="number"
                      step="any"
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      placeholder="e.g. 5.5"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="exp" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                      Farming Experience (Years)
                    </label>
                    <input
                      id="exp"
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="coop" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                      Cooperative Name (Optional)
                    </label>
                    <input
                      id="coop"
                      type="text"
                      value={cooperativeName}
                      onChange={(e) => setCooperativeName(e.target.value)}
                      placeholder="Plateau Farmers Cooperative Alliance"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-[#F2F6F1] pb-2">
                  <h3 className="text-sm font-bold text-[#22392B]">2. Business Details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="companyName" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Okafor Food Processing Ltd"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="businessType" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                      Business Type
                    </label>
                    <select
                      id="businessType"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all bg-white"
                    >
                      {BUSINESS_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="regNum" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                      RC Registration Number (CAC)
                    </label>
                    <input
                      id="regNum"
                      type="text"
                      value={businessReg}
                      onChange={(e) => setBusinessReg(e.target.value)}
                      placeholder="e.g. RC1234567"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="website" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                      Website URL (Optional)
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Physical Location */}
            <div className="space-y-4">
              <div className="border-b border-[#F2F6F1] pb-2">
                <h3 className="text-sm font-bold text-[#22392B]">3. Physical Location (Plateau State)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="lga" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                    LGA (Local Government Area)
                  </label>
                  <select
                    id="lga"
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all bg-white"
                  >
                    {LGAS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="community" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                    Community / Village
                  </label>
                  <input
                    id="community"
                    type="text"
                    required
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    placeholder="e.g. Vwang, Ropp, Daffo"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="address" className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
                    Detailed Physical Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Behind LGA Secretariat, Main Road"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE3] focus:border-[#4E6956] focus:ring-1 focus:ring-[#4E6956] outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-sm shadow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#F2F6F1]">
            <p className="text-xs text-[#181F1B]/60">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#4E6956] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
