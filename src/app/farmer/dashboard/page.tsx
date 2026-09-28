'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import { 
  Sprout, Award, Star, ListPlus, ArrowRight, ShieldCheck, CheckCircle2, 
  AlertCircle, MessageSquare, Bell, Sparkles, Loader2, Landmark
} from 'lucide-react';

export default function FarmerDashboard() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        // Fetch listings
        const produceRes = await fetch(`/api/produce?farmerId=${meData.user.id}`);
        const produceData = await produceRes.json();
        setListings(produceData.listings || []);

        // Mock notifications / Fetch user notifications
        setNotifications([
          { id: 1, title: 'Profile Under Review', content: 'Your farmer profile is currently being reviewed by an admin. You will be notified once verified.', type: 'verification' },
          { id: 2, title: 'Tips for success', content: 'Complete your farm details and add pictures of your farm to increase match scores by 15%.', type: 'info' }
        ]);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        router.push('/login');
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E6956]" />
      </div>
    );
  }

  // Calculate profile completion rate based on filled details
  const calculateCompletion = () => {
    let score = 40; // baseline for registering
    if (user.location?.community) score += 20;
    if (user.profile?.farm_size) score += 20;
    if (user.profile?.experience_years) score += 20;
    return score;
  };

  const completion = calculateCompletion();
  const verification = user.profile?.verification_status || 'pending';

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Welcome */}
        <div className="bg-white border border-[#E2ECE3] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22392B]">
              {t('dashboard.welcome')}, {user.name}!
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2F6F1] text-[#4E6956] text-xs font-bold border border-[#E2ECE3]">
                <Sprout className="w-3.5 h-3.5" />
                {t('dashboard.farmerBadge')}
              </span>
              
              {verification === 'verified' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Badge
                </span>
              )}
              {verification === 'pending' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Verification Pending
                </span>
              )}
              {verification === 'under_review' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Under Review
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={() => router.push('/farmer/produce')}
            className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-sm px-5 py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <ListPlus className="w-5 h-5" />
            <span>{t('dashboard.addProduce')}</span>
          </button>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Completion */}
          <div className="bg-white border border-[#E2ECE3] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
              {t('dashboard.profileCompletion')}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-[#22392B]">{completion}%</span>
              <span className="text-xs font-semibold text-[#4E6956] bg-[#F2F6F1] px-2.5 py-1 rounded-lg">
                Level {completion === 100 ? 'Complete' : 'Starter'}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[#FAFAF7] h-2 rounded-full overflow-hidden border border-[#E2ECE3]">
              <div 
                className="bg-[#4E6956] h-full transition-all duration-500" 
                style={{ width: `${completion}%` }}
              ></div>
            </div>
            {completion < 100 && (
              <p className="text-xs text-[#181F1B]/60">
                {t('dashboard.completeProfileTip')}
              </p>
            )}
          </div>

          {/* Verification Progress */}
          <div className="bg-white border border-[#E2ECE3] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
              {t('dashboard.verificationStatus')}
            </h3>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                verification === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {verification === 'verified' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-sm font-bold text-[#22392B] capitalize">{verification.replace('_', ' ')}</div>
                <div className="text-[10px] text-[#181F1B]/60 mt-0.5">
                  {verification === 'verified' ? 'Approved for direct matching' : 'Pending admin validation'}
                </div>
              </div>
            </div>
            {verification !== 'verified' && (
              <div className="p-2.5 rounded-lg bg-[#FAFAF7] border border-[#E2ECE3] text-[10px] text-[#181F1B]/60 italic">
                Note: Listings will become discoverable to buyers once an administrator verifies your farm profile.
              </div>
            )}
          </div>

          {/* Trust Score & Orders */}
          <div className="bg-white border border-[#E2ECE3] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
              Farm Reputation
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-extrabold text-[#22392B]">4.8 <span className="text-xs text-[#181F1B]/40 font-normal">/ 5</span></div>
                <div className="flex items-center gap-0.5 text-[#D7A33D] mt-1">
                  <Star className="w-3.5 h-3.5 fill-[#D7A33D]" />
                  <Star className="w-3.5 h-3.5 fill-[#D7A33D]" />
                  <Star className="w-3.5 h-3.5 fill-[#D7A33D]" />
                  <Star className="w-3.5 h-3.5 fill-[#D7A33D]" />
                  <Star className="w-3.5 h-3.5 fill-[#D7A33D] opacity-40" />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#22392B]">12 Orders</div>
                <div className="text-[10px] text-[#4E6956] font-bold bg-[#F2F6F1] px-2 py-0.5 rounded mt-1 inline-block">100% Fulfilled</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Listings */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#22392B]">
                {t('dashboard.activeListings')} ({listings.length})
              </h2>
              <button 
                onClick={() => router.push('/farmer/produce')}
                className="text-xs font-bold text-[#4E6956] hover:underline flex items-center gap-1"
              >
                <span>Manage Produce</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {listings.length === 0 ? (
              <div className="border border-dashed border-[#E2ECE3] rounded-2xl p-12 text-center bg-white space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#FAFAF7] flex items-center justify-center mx-auto text-[#181F1B]/40">
                  <Sprout className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#22392B]">No produce listed yet</h4>
                  <p className="text-xs text-[#181F1B]/60 max-w-xs mx-auto">
                    List your available harvests so off-takers can find and match with you.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/farmer/produce')}
                  className="bg-[#F2F6F1] hover:bg-[#E2ECE3] border border-[#E2ECE3] text-[#22392B] font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  Create First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((list) => (
                  <div key={list.id} className="bg-white border border-[#E2ECE3] rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-extrabold text-base text-[#22392B]">{list.category}</div>
                        <div className="text-xs text-[#181F1B]/60">{list.variety || 'Standard Variety'}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        list.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {list.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAFAF7] p-2.5 rounded-lg border border-[#E2ECE3]">
                      <div>
                        <span className="text-[#181F1B]/50 block">Quantity:</span>
                        <span className="font-bold text-[#22392B]">{list.quantity} {list.unit}</span>
                      </div>
                      <div>
                        <span className="text-[#181F1B]/50 block">Quality Grade:</span>
                        <span className="font-bold text-[#22392B]">{list.quality_grade}</span>
                      </div>
                      <div>
                        <span className="text-[#181F1B]/50 block">Price:</span>
                        <span className="font-bold text-[#22392B]">₦{Number(list.price_per_unit).toLocaleString()} / {list.unit}</span>
                      </div>
                      <div>
                        <span className="text-[#181F1B]/50 block">Harvest Date:</span>
                        <span className="font-bold text-[#22392B]">{new Date(list.harvest_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Notifications & Tips */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-lg font-extrabold text-[#22392B]">{t('nav.notifications')}</h2>
            
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="bg-white border border-[#E2ECE3] rounded-2xl p-4 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#FAFAF7] text-[#4E6956] border border-[#E2ECE3]">
                    {notif.type === 'verification' ? <Award className="w-4 h-4 text-[#D7A33D]" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold text-[#22392B]">{notif.title}</div>
                    <p className="text-[10px] text-[#181F1B]/70 leading-relaxed">{notif.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Support Box */}
            <div className="bg-[#22392B] text-white rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#4E6956] rounded-full blur-xl"></div>
              <Landmark className="w-7 h-7 text-[#D7A33D]" />
              <h4 className="font-bold text-sm text-[#D7A33D]">Need Financing or Assistance?</h4>
              <p className="text-[10px] text-white/70 leading-relaxed">
                AgroLink cooperates with agricultural extension officers in Plateau State to support local farmers. Get in touch for soil testing or micro-credit referrals.
              </p>
              <div className="text-[10px] font-bold text-white hover:underline cursor-pointer flex items-center gap-1 pt-1">
                <span>Contact Local Representative</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
