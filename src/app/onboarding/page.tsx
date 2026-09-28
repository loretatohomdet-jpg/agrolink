'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { Sprout, Building, ChevronRight, Languages, ArrowLeft, Check } from 'lucide-react';

export default function Onboarding() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF7]" />}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const { t, language, setLanguage } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'buyer' ? 'buyer' : 'farmer';
  const [role, setRole] = useState<'farmer' | 'buyer'>(initialRole);

  const handleContinue = () => {
    router.push(`/register?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#4E6956] flex items-center justify-center text-white mx-auto">
          <Sprout className="w-7 h-7" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#4E6956]">{t('onboarding.stepLabel')}</p>
        <h2 className="text-3xl font-extrabold text-[#22392B]">{t('onboarding.title')}</h2>
        <p className="text-sm text-[#181F1B]/70 max-w-sm mx-auto">
          {t('onboarding.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[#E2ECE3] shadow sm:rounded-2xl sm:px-10 space-y-6">
          
          {/* Language Selection */}
          <fieldset className="space-y-2">
            <legend className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
              {t('onboarding.selectLang')}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={language === 'en'}
                onClick={() => setLanguage('en')}
                className={`min-h-11 py-2 px-4 rounded-xl border font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E6956] motion-reduce:transition-none ${
                  language === 'en'
                    ? 'bg-[#F2F6F1] border-[#4E6956] text-[#22392B]'
                    : 'border-[#E2ECE3] text-[#181F1B] hover:bg-[#FAFAF7]'
                }`}
              >
                <Languages className="w-4 h-4" aria-hidden="true" />
                English
                {language === 'en' && <Check className="w-4 h-4" aria-hidden="true" />}
              </button>
              <button
                type="button"
                aria-pressed={language === 'ha'}
                onClick={() => setLanguage('ha')}
                className={`min-h-11 py-2 px-4 rounded-xl border font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E6956] motion-reduce:transition-none ${
                  language === 'ha'
                    ? 'bg-[#F2F6F1] border-[#4E6956] text-[#22392B]'
                    : 'border-[#E2ECE3] text-[#181F1B] hover:bg-[#FAFAF7]'
                }`}
              >
                <Languages className="w-4 h-4" aria-hidden="true" />
                Hausa
                {language === 'ha' && <Check className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </fieldset>

          {/* Role Selection */}
          <fieldset className="space-y-2">
            <legend className="block text-xs font-bold text-[#181F1B]/60 uppercase tracking-wider">
              {t('onboarding.selectRole')}
            </legend>
            <div className="space-y-3">
              {/* Farmer Option */}
              <button
                type="button"
                aria-pressed={role === 'farmer'}
                onClick={() => setRole('farmer')}
                className={`w-full min-h-24 p-4 rounded-xl border text-left flex items-center gap-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E6956] motion-reduce:transition-none ${
                  role === 'farmer'
                    ? 'bg-[#F2F6F1] border-[#4E6956] ring-1 ring-[#4E6956]'
                    : 'border-[#E2ECE3] hover:bg-[#FAFAF7]'
                }`}
              >
                <div className={`p-2.5 rounded-lg border ${role === 'farmer' ? 'bg-white border-[#4E6956] text-[#4E6956]' : 'bg-[#FAFAF7] border-[#E2ECE3] text-[#181F1B]/60'}`}>
                  <Sprout className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#22392B]">{t('dashboard.farmerBadge')}</div>
                  <div className="text-xs text-[#181F1B]/60 mt-1">{t('onboarding.farmerDesc')}</div>
                </div>
                {role === 'farmer' && <Check className="w-5 h-5 shrink-0 text-[#4E6956]" aria-hidden="true" />}
              </button>

              {/* Buyer Option */}
              <button
                type="button"
                aria-pressed={role === 'buyer'}
                onClick={() => setRole('buyer')}
                className={`w-full min-h-24 p-4 rounded-xl border text-left flex items-center gap-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E6956] motion-reduce:transition-none ${
                  role === 'buyer'
                    ? 'bg-[#F2F6F1] border-[#4E6956] ring-1 ring-[#4E6956]'
                    : 'border-[#E2ECE3] hover:bg-[#FAFAF7]'
                }`}
              >
                <div className={`p-2.5 rounded-lg border ${role === 'buyer' ? 'bg-white border-[#4E6956] text-[#4E6956]' : 'bg-[#FAFAF7] border-[#E2ECE3] text-[#181F1B]/60'}`}>
                  <Building className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#22392B]">{t('dashboard.buyerBadge')}</div>
                  <div className="text-xs text-[#181F1B]/60 mt-1">{t('onboarding.buyerDesc')}</div>
                </div>
                {role === 'buyer' && <Check className="w-5 h-5 shrink-0 text-[#4E6956]" aria-hidden="true" />}
              </button>
            </div>
          </fieldset>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full min-h-12 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4E6956] hover:bg-[#22392B] text-white font-bold text-sm shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4E6956] motion-reduce:transition-none"
          >
            <span>{t('onboarding.continue')}</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <Link href="/" className="mx-auto w-fit flex items-center gap-1.5 text-xs font-semibold text-[#4E6956] hover:text-[#22392B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E6956] rounded">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {t('onboarding.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
