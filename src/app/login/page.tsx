'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { Sprout, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Successful login - redirect to appropriate dashboard
      const role = data.user.role;
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (role === 'farmer') {
        router.push('/farmer/dashboard');
      } else if (role === 'buyer') {
        router.push('/buyer/dashboard');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 text-[#22392B]">
          <div className="w-10 h-10 rounded-lg bg-[#4E6956] flex items-center justify-center text-white">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">AgroLink</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-[#22392B]">Sign in to your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[#E2ECE3] shadow sm:rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-sm shadow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#F2F6F1]">
            <p className="text-xs text-[#181F1B]/60">
              New to AgroLink?{' '}
              <Link href="/onboarding" className="font-bold text-[#4E6956] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
