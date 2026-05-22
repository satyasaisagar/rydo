'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Car, Bell, LogOut, MapPin, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCityStore } from '@/store/cityStore';
import CityPicker from '@/components/ui/CityPicker';

export default function Navbar() {
  const [isOpen, setIsOpen]       = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const pathname  = usePathname();
  const { user, logout } = useAuthStore();
  const { selectedCity } = useCityStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/rides/search', label: 'Find Rides' },
    { href: '/rides/offer',  label: 'Offer Ride' },
    { href: '/about',        label: 'About' },
  ];

  return (
    <>
      {showPicker && <CityPicker forceOpen onClose={() => setShowPicker(false)} />}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0D0D0D]/95 backdrop-blur-xl border-b border-[#FF6D00]/10' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-[#FF6D00] to-[#FF9E40] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6D00]/25 group-hover:shadow-[#FF6D00]/40 transition-shadow">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
                rydo
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === href ? 'text-[#FF6D00]' : 'text-white/55 hover:text-white'
                  }`}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {/* City chip */}
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1.5 bg-[#FF6D00]/10 border border-[#FF6D00]/20 hover:border-[#FF6D00]/50 text-[#FF6D00] text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
              >
                <MapPin className="w-3 h-3" />
                {selectedCity || 'Select City'}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {user ? (
                <>
                  <Link href="/notifications"
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
                    <Bell className="w-4.5 h-4.5" />
                  </Link>
                  <Link href="/dashboard"
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6D00] to-[#FF9E40] flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-xs">{user.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className="hidden lg:block font-medium text-sm">{user.name?.split(' ')[0]}</span>
                  </Link>
                  <button onClick={logout}
                    className="text-white/30 hover:text-white/60 transition-colors p-1.5">
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login"
                    className="text-sm font-medium text-white/55 hover:text-white transition-colors px-4 py-2">
                    Log in
                  </Link>
                  <Link href="/auth/register"
                    className="text-sm font-semibold bg-gradient-to-r from-[#FF6D00] to-[#FF9E40] hover:from-[#E65100] hover:to-[#FF6D00] text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-[#FF6D00]/20">
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile btn */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setShowPicker(true)}
                className="flex items-center gap-1 bg-[#FF6D00]/10 border border-[#FF6D00]/20 text-[#FF6D00] text-xs font-semibold px-2.5 py-1.5 rounded-full">
                <MapPin className="w-3 h-3" />
                {selectedCity || 'City'}
              </button>
              <button className="text-white/60 hover:text-white p-1" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isOpen && (
            <div className="md:hidden absolute left-0 right-0 top-16 bg-[#161616] border-b border-[#FF6D00]/10 py-4 px-4 space-y-1">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    pathname === href ? 'text-[#FF6D00] bg-[#FF6D00]/10' : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}>
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
                {user ? (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-sm text-white/70 hover:text-white">Dashboard</Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-sm text-center text-white/70 border border-white/10 rounded-xl">Log in</Link>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-sm text-center font-semibold bg-gradient-to-r from-[#FF6D00] to-[#FF9E40] text-white rounded-xl">Sign up</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
