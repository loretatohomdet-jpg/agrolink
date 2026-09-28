'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import { 
  Building, Plus, Search, Calendar, MapPin, Award, Star, Cpu, 
  ArrowRight, ShieldCheck, Loader2, Sparkles, AlertCircle, X, HelpCircle
} from 'lucide-react';

export default function BuyerDashboard() {
  const { t, language } = useTranslation();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [demands, setDemands] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Explain Modal State
  const [explainOpen, setExplainOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showTransparency, setShowTransparency] = useState(false);

  const fetchDashboardData = async (userId: string) => {
    try {
      // Fetch demands
      const demRes = await fetch('/api/demand');
      const demData = await demRes.json();
      const userDemands = demData.demands || [];
      setDemands(userDemands);

      // Fetch matches for the most recent demand if any exists
      if (userDemands.length > 0) {
        const recentDemandId = userDemands[0].id;
        const matchesRes = await fetch(`/api/demand/${recentDemandId}/matches`);
        const matchesData = await matchesRes.json();
        setMatches(matchesData.matches || []);
      }
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
        await fetchDashboardData(meData.user.id);
        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleOpenExplanation = async (match: any) => {
    setActiveMatch(match);
    setExplainOpen(true);
    setAiLoading(true);
    setAiExplanation('');
    setShowTransparency(false);

    try {
      // Query explain API
      const res = await fetch(`/api/matches/${match.id}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language })
      });
      const data = await res.json();
      if (res.ok) {
        setAiExplanation(data.explanation);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setAiExplanation(language === 'ha' 
        ? `Gaza samun bayani daga AI: ${err.message}` 
        : `Failed to load AI match explanation: ${err.message}`
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateInquiry = async (match: any) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: match.listing_id,
          demand_id: match.demand_id,
          product: match.category,
          quantity: match.available_quantity, // propose listing quantity
          unit: match.listing_unit,
          price_per_unit: match.price_per_unit,
          delivery_location: user.location ? `${user.location.address}, ${user.location.lga}` : 'Abuja Depot',
          expected_delivery_date: match.available_date,
          supplier_id: match.listing_id ? undefined : match.farmer_id // resolves supplier
        })
      });
      if (res.ok) {
        router.push('/transactions');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to start inquiry');
      }
    } catch (e) {
      console.error(e);
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Welcome */}
        <div className="bg-white border border-[#E2ECE3] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22392B]">
              {t('dashboard.welcome')}, {user.name}!
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2F6F1] text-[#4E6956] text-xs font-bold border border-[#E2ECE3]">
                <Building className="w-3.5 h-3.5" />
                {t('dashboard.buyerBadge')}
              </span>
              
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Buyer
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                  Verification Pending
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={() => router.push('/buyer/demand')}
            className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-sm px-5 py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t('dashboard.postDemand')}</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Demands List */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-lg font-extrabold text-[#22392B]">{t('nav.myRequests')} ({demands.length})</h2>
            
            {demands.length === 0 ? (
              <div className="border border-dashed border-[#E2ECE3] rounded-2xl p-8 text-center bg-white space-y-4 shadow-sm">
                <Building className="w-8 h-8 mx-auto text-[#181F1B]/30" />
                <h4 className="font-bold text-xs text-[#22392B]">No demands posted yet</h4>
                <p className="text-[10px] text-[#181F1B]/60 max-w-xs mx-auto">
                  Post agricultural demand requirements (tonnage, variety, locations) to match with verified suppliers.
                </p>
                <button
                  onClick={() => router.push('/buyer/demand')}
                  className="bg-[#F2F6F1] hover:bg-[#E2ECE3] border border-[#E2ECE3] text-[#22392B] font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  Create Demand Request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {demands.map((dem) => (
                  <div key={dem.id} className="bg-white border border-[#E2ECE3] rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-[#22392B]">{dem.product}</div>
                        <div className="text-[10px] text-[#181F1B]/50">{dem.quality_grade}</div>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {dem.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-[#F2F6F1] pt-2 text-[#181F1B]/80 font-mono">
                      <div>Qty: <span className="font-bold text-[#22392B]">{dem.quantity} {dem.unit}</span></div>
                      <div>Date: <span className="font-bold text-[#22392B]">{new Date(dem.required_date).toLocaleDateString()}</span></div>
                      <div className="col-span-2">Destination: <span className="font-bold text-[#22392B]">{dem.delivery_location_lga}, {dem.delivery_location_state}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Matched Suppliers */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-lg font-extrabold text-[#22392B]">
              {t('matching.title')} {demands.length > 0 && `for ${demands[0].product}`}
            </h2>

            {demands.length === 0 ? (
              <div className="bg-white border border-[#E2ECE3] rounded-2xl p-12 text-center text-[#181F1B]/60 shadow-sm text-xs">
                Post a demand request to view matched, ranked farmers in Plateau State.
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-white border border-[#E2ECE3] rounded-2xl p-12 text-center text-[#181F1B]/60 shadow-sm space-y-2">
                <AlertCircle className="w-8 h-8 text-[#D7A33D] mx-auto" />
                <h4 className="font-bold text-sm text-[#22392B]">No matches found yet</h4>
                <p className="text-xs text-[#181F1B]/60 max-w-xs mx-auto">
                  Try adjusting your demanded quantity or quality grade to expand matching parameters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                {matches.map((match) => (
                  <div key={match.id} className="bg-white border border-[#E2ECE3] rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    
                    {/* Header */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-sm text-[#22392B]">{match.farm_name}</h4>
                            <span className="inline-flex px-1.5 py-0.2 rounded bg-[#E2ECE3] text-[#4E6956] text-[8px] font-extrabold uppercase">
                              {t('matching.verified')}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#181F1B]/60">{match.farm_lga}, {match.farm_state}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-[#D7A33D]">{match.score}%</div>
                          <span className="text-[9px] uppercase font-bold text-[#181F1B]/40">Match Score</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#FAFAF7] p-2.5 rounded-lg border border-[#E2ECE3]">
                      <div>
                        <span className="text-[#181F1B]/50 block">Quantity Offered:</span>
                        <span className="font-bold">{match.available_quantity} {match.listing_unit}</span>
                      </div>
                      <div>
                        <span className="text-[#181F1B]/50 block">Offered Grade:</span>
                        <span className="font-bold">{match.listing_grade}</span>
                      </div>
                      <div>
                        <span className="text-[#181F1B]/50 block">Harvest Date:</span>
                        <span className="font-bold">{new Date(match.harvest_date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-[#181F1B]/50 block">Farmer Rating:</span>
                        <span className="font-bold flex items-center gap-0.5 text-[#D7A33D]">
                          <Star className="w-3 h-3 fill-[#D7A33D] text-[#D7A33D]" />
                          {Number(match.avg_rating).toFixed(1)} / 5
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#F2F6F1] flex gap-2 justify-end">
                      <button
                        onClick={() => handleOpenExplanation(match)}
                        className="bg-[#F2F6F1] hover:bg-[#E2ECE3] text-[#4E6956] font-bold text-[10px] px-3 py-2 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Explain Match</span>
                      </button>
                      <button
                        onClick={() => handleCreateInquiry(match)}
                        className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-[10px] px-3 py-2 rounded-lg transition-all"
                      >
                        Contact Supplier
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Explainable AI Modal / Drawer overlay */}
      {explainOpen && activeMatch && (
        <div className="fixed inset-0 z-50 bg-[#181F1B]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2ECE3] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-[#22392B] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#D7A33D]" />
                <span className="font-extrabold text-sm">{t('matching.whyThisMatch')}</span>
              </div>
              <button 
                onClick={() => setExplainOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Natural Language Explanation Box */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">AI Recommendation Explanation</div>
                <div className="border border-[#E2ECE3] rounded-xl p-4 bg-[#FAFAF7] text-sm text-[#181F1B] leading-relaxed relative">
                  {aiLoading ? (
                    <div className="flex items-center justify-center py-4 gap-2 text-xs font-semibold text-[#181F1B]/60 animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-[#4E6956]" />
                      <span>Generating explainable recommendations...</span>
                    </div>
                  ) : (
                    <p className="italic">"{aiExplanation}"</p>
                  )}
                </div>
              </div>

              {/* Matching Factor Breakdown toggle */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowTransparency(!showTransparency)}
                  className="text-xs font-bold text-[#4E6956] hover:underline flex items-center gap-1"
                >
                  {showTransparency ? 'Hide detailed mathematical calculation' : 'Show detailed mathematical calculation'}
                </button>

                {showTransparency && (
                  <div className="border border-[#E2ECE3] rounded-xl p-4 bg-[#FAFAF7] space-y-4 animate-fade-in font-mono text-[11px] text-[#181F1B]/80">
                    <div className="text-xs font-bold text-[#22392B] pb-1 border-b border-[#E2ECE3]">{t('matching.howCalculated')}</div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Quantity Score Fit (30%):</span>
                        <span className="font-bold">{activeMatch.quantity_score} &times; 0.30 = {Math.round(activeMatch.quantity_score * 0.3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quality Grade Fit (25%):</span>
                        <span className="font-bold">{activeMatch.quality_score} &times; 0.25 = {Math.round(activeMatch.quality_score * 0.25)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Harvest Window Timing (20%):</span>
                        <span className="font-bold">{activeMatch.timing_score} &times; 0.20 = {Math.round(activeMatch.timing_score * 0.2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logistics Location Fit (15%):</span>
                        <span className="font-bold">{activeMatch.location_score} &times; 0.15 = {Math.round(activeMatch.location_score * 0.15)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Supplier Reliability (10%):</span>
                        <span className="font-bold">{activeMatch.reliability_score} &times; 0.10 = {Math.round(activeMatch.reliability_score * 0.1)}</span>
                      </div>
                      
                      <div className="flex justify-between pt-2 border-t border-[#E2ECE3] font-bold text-sm text-[#22392B]">
                        <span>Final Score Match:</span>
                        <span className="text-[#D7A33D]">{activeMatch.score}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal footer CTAs */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setExplainOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#E2ECE3] text-xs font-bold hover:bg-[#FAFAF7]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setExplainOpen(false);
                    handleCreateInquiry(activeMatch);
                  }}
                  className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow"
                >
                  Contact Supplier
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
