'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Car, Bell, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#00C853] rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">rydo</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  pathname === href ? 'text-[#00C853]' : 'text-white/60 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
                  <Bell className="w-5 h-5" />
                </Link>
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#00C853]/20 flex items-center justify-center">
                    <span className="text-[#00C853] font-semibold text-xs">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="hidden lg:block">{user.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login"
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors px-4 py-2">
                  Log in
                </Link>
                <Link href="/auth/register"
                  className="text-sm font-semibold bg-[#00C853] hover:bg-[#00A846] text-black px-5 py-2 rounded-xl transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu btn */}
          <button
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 bg-[#111111] border-b border-white/[0.06] py-4 px-4 space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
              {user ? (
                <Link href="/dashboard" onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-sm text-white/70 hover:text-white transition-colors">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-sm text-center text-white/70 hover:text-white border border-white/10 rounded-xl">
                    Log in
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-sm text-center font-semibold bg-[#00C853] text-black rounded-xl">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
