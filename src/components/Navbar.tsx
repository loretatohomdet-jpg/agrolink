'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { Sprout, Languages, Bell, LogOut, Menu, X, User } from 'lucide-react';

interface NavbarProps {
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const { t, language, setLanguage } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/auth/me'); // Just to verify auth and read counts if needed
        // For simplicity in MVP, we can query active counts or mock it based on seed data
        setUnreadCount(2); // seeded notification count
      } catch (e) {}
    };
    fetchNotifications();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout failed');
    }
  };

  const getLinks = () => {
    if (user.role === 'farmer') {
      return [
        { href: '/farmer/dashboard', label: t('nav.dashboard') },
        { href: '/farmer/produce', label: t('nav.myProduce') },
        { href: '/transactions', label: t('nav.transactions') },
        { href: '/messages', label: t('nav.messages') },
      ];
    } else if (user.role === 'buyer') {
      return [
        { href: '/buyer/dashboard', label: t('nav.dashboard') },
        { href: '/buyer/suppliers', label: t('nav.findSuppliers') },
        { href: '/buyer/demand', label: t('nav.postDemand') },
        { href: '/transactions', label: t('nav.transactions') },
        { href: '/messages', label: t('nav.messages') },
      ];
    } else if (user.role === 'admin') {
      return [
        { href: '/admin/dashboard', label: t('nav.adminOverview') },
        { href: '/admin/verifications', label: t('nav.adminVerifications') },
        { href: '/transactions', label: t('nav.transactions') },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <nav className="border-b border-[#E2ECE3] bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-[#22392B]">
            <div className="w-9 h-9 rounded-lg bg-[#4E6956] flex items-center justify-center text-white">
              <Sprout className="w-5.5 h-5.5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">AgroLink</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  pathname === link.href 
                    ? 'text-[#4E6956]' 
                    : 'text-[#181F1B]/70 hover:text-[#4E6956]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Notifications */}
          <Link href="/transactions" className="relative p-2 text-[#181F1B]/60 hover:text-[#4E6956] transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#D7A33D] text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Language Switch */}
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ha' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2F6F1] hover:bg-[#E2ECE3] text-[#4E6956] text-xs font-bold transition-colors"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Hausa' : 'English'}</span>
          </button>

          {/* Profile Name */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAFAF7] border border-[#E2ECE3]">
            <User className="w-4 h-4 text-[#4E6956]" />
            <span className="text-xs font-bold text-[#22392B] max-w-[120px] truncate">{user.name}</span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#D7A33D]">{user.role}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-[#181F1B]/60 hover:text-red-600 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-3">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ha' : 'en')}
            className="p-2 text-[#4E6956]"
          >
            <Languages className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#181F1B]/60"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2ECE3] bg-white px-4 pt-2 pb-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2.5 px-3 rounded-lg text-sm font-semibold ${
                pathname === link.href 
                  ? 'bg-[#F2F6F1] text-[#4E6956]' 
                  : 'text-[#181F1B]/70 hover:bg-[#FAFAF7]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#F2F6F1] flex items-center justify-between px-3">
            <span className="text-xs font-bold text-[#181F1B]/70">{user.name} ({user.role})</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
