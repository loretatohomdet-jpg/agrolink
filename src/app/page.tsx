'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { 
  Sprout, ArrowRight, ShieldCheck, Cpu, Star, Languages, ChevronRight, 
  MapPin, Calendar, Award, Scale, HelpCircle, Phone, Mail, Building
} from 'lucide-react';

export default function LandingPage() {
  const { t, language, setLanguage } = useTranslation();
  const [demoStep, setDemoStep] = useState(0); // 0: Idle/Initial, 1: Matching, 2: Match Found, 3: Explanation Expanded
  const [selectedMatch, setSelectedMatch] = useState<'musa' | 'plateau' | 'green'>('musa');

  // Realistic matching demo values
  const demoMatches = {
    musa: {
      name: 'Musa Farms',
      lga: 'Jos South',
      qty: 48,
      grade: 'Grade A',
      score: 94,
      rating: 4.8,
      breakdown: { qty: 95, qual: 100, time: 96, loc: 90, rel: 94 },
      explainEn: 'Recommended because this supplier matches your required Grade A quality, can supply 48 of your requested 50 tonnes, has an aligned harvest window, and has a strong 4.8-star fulfillment record.',
      explainHa: 'An ba da shawarar Musa Farms saboda sun cika ingancin Grade A da kuke nema, za su iya samar da tan 48 daga cikin tan 50 da kuke buƙata, ranar girbinsu ya dace, kuma suna da kyakkyawan tarihin kima na tauraro 4.8.'
    },
    plateau: {
      name: 'Plateau Agro Collective',
      lga: 'Barkin Ladi',
      qty: 55,
      grade: 'Grade B',
      score: 89,
      rating: 4.9,
      breakdown: { qty: 100, qual: 70, time: 98, loc: 85, rel: 96 },
      explainEn: 'Recommended because they can supply your full volume requirement and have an excellent fulfillment rating. However, their produce is Grade B, slightly lower than your requested Grade A.',
      explainHa: 'An ba da shawarar Plateau Agro saboda suna da cikakken yawan tan 55 da kuke nema da kyakkyawan tarihi, sai dai ingancin amfanin gonarsu Grade B ne, ƙasa da Grade A da kuke buƙata.'
    },
    green: {
      name: 'Green Valley Farms',
      lga: 'Bokkos',
      qty: 50,
      grade: 'Grade A',
      score: 83,
      rating: 3.8,
      breakdown: { qty: 100, qual: 100, time: 92, loc: 60, rel: 70 },
      explainEn: 'Matches your volume and grade specifications perfectly. However, they are located further away in Bokkos (higher logistics complexity) and have a lower reliability score of 3.8 stars.',
      explainHa: 'Sun cika yawa da ingancin da kuke buƙata daidai. Sai dai suna da nisa sosai a Bokkos (wahalar sufuri) kuma amincinsu ya fi ƙasa da tauraro 3.8.'
    }
  };

  const handleRunDemo = () => {
    setDemoStep(1);
    setTimeout(() => {
      setDemoStep(2);
    }, 1500);
  };

  const currentMatch = demoMatches[selectedMatch];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-[#E2ECE3] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#4E6956] flex items-center justify-center text-white">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#22392B]">AgroLink</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-medium text-[#181F1B]">
            <a href="#problem" className="hover:text-[#4E6956] transition-colors">Problem</a>
            <a href="#how-it-works" className="hover:text-[#4E6956] transition-colors">How It Works</a>
            <a href="#interactive-match" className="hover:text-[#4E6956] transition-colors">AI Matching</a>
            <a href="#logistics" className="hover:text-[#4E6956] transition-colors">Logistics</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ha' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2F6F1] hover:bg-[#E2ECE3] text-[#4E6956] text-sm font-semibold transition-colors"
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'en' ? 'Hausa' : 'English'}</span>
            </button>

            <Link href="/login" className="text-sm font-bold text-[#4E6956] hover:text-[#22392B] px-3 py-2">
              Log In
            </Link>
            <Link 
              href="/onboarding" 
              className="bg-[#4E6956] hover:bg-[#22392B] text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
            >
              {t('landing.getStarted')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-[#FAFAF7] pt-16 pb-20 border-b border-[#E2ECE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E2ECE3] text-[#4E6956] text-xs font-bold uppercase tracking-wider">
                Now Live in Plateau State
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#22392B] leading-tight">
                {t('landing.title')}
              </h1>
              <p className="text-lg text-[#181F1B]/80 max-w-xl">
                {t('landing.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link 
                  href="/onboarding?role=buyer" 
                  className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-center px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('landing.findSuppliersBtn')}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/onboarding?role=farmer" 
                  className="bg-white border border-[#E2ECE3] hover:bg-[#F2F6F1] text-[#22392B] font-bold text-center px-6 py-3.5 rounded-xl shadow-sm transition-all"
                >
                  {t('landing.listProduceBtn')}
                </Link>
              </div>
            </div>

            {/* Hero Right: Static Diagram Visual */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md bg-white border border-[#E2ECE3] rounded-2xl p-6 shadow-xl space-y-6">
                <div className="text-xs font-bold text-[#4E6956] uppercase tracking-wider flex items-center justify-between border-b border-[#F2F6F1] pb-3">
                  <span>AgroLink Architecture</span>
                  <span className="text-[#D7A33D]">Nigeria Focus</span>
                </div>
                <div className="flex flex-col gap-4 relative">
                  <div className="flex items-center gap-3 bg-[#F2F6F1] p-3 rounded-lg border border-[#E2ECE3]">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#E2ECE3]">
                      <Building className="w-4 h-4 text-[#4E6956]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#181F1B]">Commercial Off-taker</div>
                      <div className="text-[10px] text-[#181F1B]/60">Posts Demand Specifications</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center my-0.5">
                    <div className="h-4 border-l border-dashed border-[#4E6956]"></div>
                  </div>

                  <div className="flex items-center gap-3 bg-[#22392B] text-white p-3.5 rounded-lg shadow">
                    <div className="w-8 h-8 rounded-full bg-[#4E6956] flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-[#D7A33D]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#D7A33D]">AgroLink Matching Engine</div>
                      <div className="text-[10px] text-white/70">Deterministic scoring + Explainable AI</div>
                    </div>
                  </div>

                  <div className="flex justify-center my-0.5">
                    <div className="h-4 border-l border-dashed border-[#4E6956]"></div>
                  </div>

                  <div className="flex items-center gap-3 bg-[#F2F6F1] p-3 rounded-lg border border-[#E2ECE3]">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#E2ECE3]">
                      <Sprout className="w-4 h-4 text-[#4E6956]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#181F1B]">Verified Farmers / Co-ops</div>
                      <div className="text-[10px] text-[#181F1B]/60">Jos South, Bokkos, Mangu, etc.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Workflow/Principle Section */}
      <section id="how-it-works" className="py-20 bg-white border-b border-[#E2ECE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-[#22392B]">{t('landing.howItWorks')}</h2>
            <p className="text-[#181F1B]/70">{t('landing.howItWorksSub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FAFAF7] border border-[#E2ECE3] p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F2F6F1] border border-[#E2ECE3] flex items-center justify-center text-[#4E6956]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#22392B]">1. Verified Suppliers</h3>
              <p className="text-sm text-[#181F1B]/70">
                Farmers in Plateau State submit details of their farms and crops. Admins review and issue verification badges to guarantee authenticity.
              </p>
            </div>

            <div className="bg-[#FAFAF7] border border-[#E2ECE3] p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F2F6F1] border border-[#E2ECE3] flex items-center justify-center text-[#4E6956]">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#22392B]">2. AI-Assisted Sourcing</h3>
              <p className="text-sm text-[#181F1B]/70">
                Post crop demand. The engine checks quantity, quality grade, locations, and schedules, explaining matches transparently to buyers.
              </p>
            </div>

            <div className="bg-[#FAFAF7] border border-[#E2ECE3] p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F2F6F1] border border-[#E2ECE3] flex items-center justify-center text-[#4E6956]">
                <Star className="w-6 h-6 text-[#D7A33D]" />
              </div>
              <h3 className="text-lg font-bold text-[#22392B]">3. Safe Reputation Loop</h3>
              <p className="text-sm text-[#181F1B]/70">
                Transacting parties evaluate fulfillment, payment speed, and communications, improving future match scoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Product Visual - Interactive Match Engine Demo */}
      <section id="interactive-match" className="py-20 bg-[#FAFAF7] border-b border-[#E2ECE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Context */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D7A33D] uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Experience the Core Differentiator</span>
              </div>
              <h2 className="text-3xl font-extrabold text-[#22392B] leading-tight">
                {t('landing.explainableAi')}
              </h2>
              <p className="text-[#181F1B]/80 text-sm">
                AgroLink calculates a matching score using multi-factor parameters (Quantity, Quality, Timing, Location, Reliability) and explains the result. Play with the interactive demo to see it in action.
              </p>
              
              <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E2ECE3] text-xs">
                <div className="font-bold text-[#22392B] pb-2 border-b border-[#F2F6F1]">Demo Sourcing Demand Request:</div>
                <div className="flex justify-between">
                  <span className="text-[#181F1B]/60">Product Category:</span>
                  <span className="font-bold">Irish Potato</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#181F1B]/60">Required Quantity:</span>
                  <span className="font-bold">50 Tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#181F1B]/60">Required Quality:</span>
                  <span className="font-bold">Grade A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#181F1B]/60">Required Destination:</span>
                  <span className="font-bold">Abuja (FCT)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#181F1B]/60">Expected Date:</span>
                  <span className="font-bold">15 September 2026</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Sourcing Simulator */}
            <div className="lg:col-span-7 bg-white border border-[#E2ECE3] rounded-2xl shadow-xl overflow-hidden min-h-[480px] flex flex-col">
              
              {/* Simulator Header */}
              <div className="bg-[#22392B] text-white p-4 flex items-center justify-between">
                <span className="font-bold text-sm tracking-wide">AgroLink Matching Engine Simulator</span>
                <span className="px-2 py-0.5 rounded bg-[#4E6956] text-[10px] text-[#D7A33D] font-mono">STATUS: {demoStep === 0 ? 'READY' : demoStep === 1 ? 'MATCHING...' : 'COMPLETED'}</span>
              </div>

              {/* Simulator Content */}
              <div className="p-6 flex-1 flex flex-col justify-center">
                {demoStep === 0 && (
                  <div className="text-center space-y-6 py-8">
                    <div className="w-16 h-16 rounded-full bg-[#F2F6F1] flex items-center justify-center mx-auto text-[#4E6956]">
                      <Sprout className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-[#22392B]">Ready to search the verified supplier database?</h4>
                      <p className="text-xs text-[#181F1B]/60 max-w-sm mx-auto">
                        Click below to run the deterministic match engine for 50 tonnes of Grade A Irish potatoes to Abuja.
                      </p>
                    </div>
                    <button 
                      onClick={handleRunDemo}
                      className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold px-6 py-3 rounded-lg shadow transition-all"
                    >
                      Run Matching Engine
                    </button>
                  </div>
                )}

                {demoStep === 1 && (
                  <div className="text-center space-y-4 py-8">
                    <div className="animate-spin w-10 h-10 border-4 border-[#4E6956] border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-xs text-[#181F1B]/60 font-semibold uppercase tracking-wider animate-pulse">
                      Analyzing supplier capacities, logistics paths, harvest dates, and ratings...
                    </p>
                  </div>
                )}

                {demoStep >= 2 && (
                  <div className="space-y-6">
                    {/* Ranked Results Selector */}
                    <div>
                      <div className="text-xs font-bold text-[#181F1B]/60 uppercase mb-2">Ranked Matches</div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(demoMatches).map(([key, match]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedMatch(key as any);
                              setDemoStep(2); // collapse explanation on supplier switch
                            }}
                            className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
                              selectedMatch === key 
                                ? 'bg-[#F2F6F1] border-[#4E6956] ring-1 ring-[#4E6956]' 
                                : 'border-[#E2ECE3] hover:bg-[#FAFAF7]'
                            }`}
                          >
                            <div className="text-xs font-bold truncate text-[#22392B]">{match.name}</div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-[#181F1B]/60">{match.lga}</span>
                              <span className="text-xs font-bold text-[#D7A33D]">{match.score}%</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Match Details Card */}
                    <div className="border border-[#E2ECE3] rounded-xl p-4 bg-[#FAFAF7] space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-base text-[#22392B]">{currentMatch.name}</h4>
                            <span className="inline-flex px-1.5 py-0.5 rounded bg-[#E2ECE3] text-[#4E6956] text-[10px] font-bold">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-[#181F1B]/60 mt-1">{currentMatch.lga}, Plateau State</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-[#D7A33D]">{currentMatch.score}% Match</div>
                          <div className="flex items-center gap-1 text-xs text-[#181F1B]/60 mt-0.5 justify-end">
                            <Star className="w-3.5 h-3.5 fill-[#D7A33D] text-[#D7A33D]" />
                            <span>{currentMatch.rating} / 5</span>
                          </div>
                        </div>
                      </div>

                      {/* Detail Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-2 rounded border border-[#E2ECE3]">
                          <span className="text-[#181F1B]/50 block">Quantity:</span>
                          <span className="font-bold">{currentMatch.qty} tonnes</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-[#E2ECE3]">
                          <span className="text-[#181F1B]/50 block">Quality Grade:</span>
                          <span className="font-bold">{currentMatch.grade}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-[#E2ECE3]">
                          <span className="text-[#181F1B]/50 block">Harvest Date:</span>
                          <span className="font-bold">Sep 10, 2026</span>
                        </div>
                      </div>

                      {/* AI Explain Trigger */}
                      <div className="pt-2 border-t border-[#E2ECE3] flex gap-2">
                        {demoStep === 2 ? (
                          <button
                            onClick={() => setDemoStep(3)}
                            className="bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <Cpu className="w-4 h-4" />
                            <span>{t('matching.viewExplanation')}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setDemoStep(2)}
                            className="bg-white hover:bg-[#F2F6F1] border border-[#E2ECE3] text-[#22392B] font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                          >
                            Hide Explanation
                          </button>
                        )}
                        <Link 
                          href="/login"
                          className="bg-white hover:bg-[#F2F6F1] border border-[#E2ECE3] text-[#22392B] font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors"
                        >
                          Contact Supplier
                        </Link>
                      </div>
                    </div>

                    {/* AI Explanation Modal/Drawer Overlay (Inside Card) */}
                    {demoStep === 3 && (
                      <div className="border border-[#D7A33D]/30 bg-[#FAFAF7] rounded-xl p-4 space-y-4 animate-fade-in ring-1 ring-[#D7A33D]/20">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#D7A33D]">
                          <Cpu className="w-4 h-4" />
                          <span>{t('matching.whyThisMatch')} ({language === 'ha' ? 'Harshen Hausa' : 'English'})</span>
                        </div>
                        <p className="text-xs italic text-[#181F1B] leading-relaxed bg-white p-3 rounded-lg border border-[#E2ECE3]">
                          "{language === 'ha' ? currentMatch.explainHa : currentMatch.explainEn}"
                        </p>

                        {/* Transparency breakdown */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-[#181F1B]/60 uppercase tracking-wider">
                            {t('matching.howCalculated')}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#181F1B]/80">
                            <div className="bg-white px-2 py-1 rounded border border-[#E2ECE3] flex justify-between">
                              <span>Quantity Fit (30%):</span>
                              <span className="font-bold text-[#4E6956]">{currentMatch.breakdown.qty}%</span>
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-[#E2ECE3] flex justify-between">
                              <span>Quality Fit (25%):</span>
                              <span className="font-bold text-[#4E6956]">{currentMatch.breakdown.qual}%</span>
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-[#E2ECE3] flex justify-between">
                              <span>Timing Fit (20%):</span>
                              <span className="font-bold text-[#4E6956]">{currentMatch.breakdown.time}%</span>
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-[#E2ECE3] flex justify-between">
                              <span>Logistics (15%):</span>
                              <span className="font-bold text-[#4E6956]">{currentMatch.breakdown.loc}%</span>
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-[#E2ECE3] flex justify-between col-span-2">
                              <span>Reliability History (10%):</span>
                              <span className="font-bold text-[#4E6956]">{currentMatch.breakdown.rel}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Logistics Coming Soon Section */}
      <section id="logistics" className="py-20 bg-white border-b border-[#E2ECE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex px-3 py-1 rounded-md bg-[#D7A33D]/10 text-[#D7A33D] text-xs font-bold uppercase tracking-wider">
                Coming Soon
              </span>
              <h2 className="text-3xl font-extrabold text-[#22392B]">{t('landing.logistics')}</h2>
              <p className="text-[#181F1B]/70 text-sm leading-relaxed">
                {t('landing.logisticsSub')} AgroLink is building a dedicated logistics service layer to coordinate third-party truck fleets, drivers, and delivery tracking.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-[#181F1B]/80">
                <div className="flex items-center gap-2 bg-[#FAFAF7] p-3 rounded-lg border border-[#E2ECE3]">
                  <MapPin className="w-4 h-4 text-[#4E6956]" />
                  <span>Route Optimization</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FAFAF7] p-3 rounded-lg border border-[#E2ECE3]">
                  <Scale className="w-4 h-4 text-[#4E6956]" />
                  <span>Load Aggregation</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FAFAF7] p-3 rounded-lg border border-[#E2ECE3]">
                  <Calendar className="w-4 h-4 text-[#4E6956]" />
                  <span>Delivery Tracking</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FAFAF7] p-3 rounded-lg border border-[#E2ECE3]">
                  <Award className="w-4 h-4 text-[#4E6956]" />
                  <span>Partner Coordination</span>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-6 bg-[#F2F6F1] border border-[#E2ECE3] rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#E2ECE3] rounded-full filter blur-xl opacity-50"></div>
              <h4 className="font-extrabold text-lg text-[#22392B] mb-2">Our Logistics Vision</h4>
              <p className="text-xs text-[#181F1B]/70 leading-relaxed mb-4">
                We believe that matching supply to demand is only half the battle. To build a truly integrated agricultural network in Nigeria and West Africa, coordinating physical transit is essential. Our logistics framework is prepared for:
              </p>
              <ul className="space-y-2 text-xs font-semibold text-[#22392B]">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-[#D7A33D]" />
                  <span>Escrow-linked transport fee payouts</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-[#D7A33D]" />
                  <span>Direct coordinates routing for rural farm locations</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-[#D7A33D]" />
                  <span>Automated truck size recommendations based on crop tonnage</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#22392B] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-white/10 pb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Sprout className="w-6 h-6 text-[#D7A33D]" />
                <span className="font-extrabold text-xl tracking-tight">AgroLink</span>
              </div>
              <p className="text-xs text-white/60">
                Connecting B2B agricultural supply to real commercial demand in Nigeria.
              </p>
            </div>
            
            <div>
              <h5 className="font-bold text-xs uppercase text-[#D7A33D] tracking-wider mb-3">Plateau State LGAs</h5>
              <ul className="text-xs space-y-1.5 text-white/70">
                <li>Jos South / Jos North</li>
                <li>Bokkos / Mangu</li>
                <li>Riyom / Bassa</li>
                <li>Barkin Ladi</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-xs uppercase text-[#D7A33D] tracking-wider mb-3">Product</h5>
              <ul className="text-xs space-y-1.5 text-white/70">
                <li><Link href="/onboarding" className="hover:text-white">Register</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                <li><a href="#interactive-match" className="hover:text-white">AI Simulator</a></li>
              </ul>
            </div>

            <div className="space-y-3 text-xs text-white/70">
              <h5 className="font-bold uppercase text-[#D7A33D] tracking-wider">Contact</h5>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#D7A33D]" />
                <span>+234 803 123 4567</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D7A33D]" />
                <span>info@linkagro.com</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-white/40">
            <span>&copy; {new Date().getFullYear()} AgroLink. All rights reserved.</span>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
