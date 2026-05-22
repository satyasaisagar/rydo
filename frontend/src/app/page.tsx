'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Calendar, ArrowRight, Star, Shield, Zap,
  ChevronRight, Users, Car, Leaf, Clock, CheckCircle,
  Navigation, TrendingUp, Globe
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';
import CityPicker from '@/components/ui/CityPicker';
import { useCityStore } from '@/store/cityStore';

const POPULAR_ROUTES = [
  { from: 'Mumbai',    to: 'Pune',          price: 350, duration: '3h',   seats: 2 },
  { from: 'Delhi',     to: 'Agra',          price: 280, duration: '3.5h', seats: 3 },
  { from: 'Bangalore', to: 'Mysore',        price: 200, duration: '3h',   seats: 1 },
  { from: 'Chennai',   to: 'Pondicherry',   price: 180, duration: '2.5h', seats: 4 },
  { from: 'Hyderabad', to: 'Vijayawada',    price: 300, duration: '5h',   seats: 2 },
  { from: 'Kolkata',   to: 'Digha',         price: 250, duration: '3h',   seats: 3 },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Daily Commuter', rating: 5, city: 'Bangalore', text: 'Rydo changed how I travel. Safe, affordable, and I\'ve made great friends along the way!' },
  { name: 'Arjun Mehta',  role: 'Driver & Rider',  rating: 5, city: 'Delhi',     text: 'Love splitting fuel costs while meeting interesting people. The app is super easy to use.' },
  { name: 'Riya Patel',   role: 'Student',          rating: 5, city: 'Mumbai',   text: 'Perfect for weekend trips. Way cheaper than trains and more comfortable too.' },
];

const STATS = [['50K+', 'Happy Riders'], ['200K+', 'Rides Done'], ['₹2Cr+', 'Saved by Users'], ['4.8★', 'Avg Rating']];

export default function HomePage() {
  const router = useRouter();
  const { selectedCity } = useCityStore();
  const [outsideCity, setOutsideCity] = useState(false);
  const [search, setSearch] = useState({ from: '', to: '', date: '', seats: 1 });
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      pickup: search.from || ((!outsideCity && selectedCity) ? selectedCity : ''),
      drop: search.to,
      date: search.date,
      seats: String(search.seats),
    });
    router.push(`/rides/search?${params}`);
  };

  // City scope for location autocomplete
  const cityScope = (!outsideCity && selectedCity) ? selectedCity : undefined;

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0D' }}>
      {showCityPicker && <CityPicker forceOpen onClose={() => setShowCityPicker(false)} />}
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Abstract bg shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #FF6D00 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 -left-60 w-[500px] h-[500px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #FF9E40 0%, transparent 70%)' }} />
          {/* Diagonal grid overlay */}
          <div className="absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,109,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,109,0,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-semibold mb-7 uppercase tracking-wider"
                style={{ background: 'rgba(255,109,0,0.08)', borderColor: 'rgba(255,109,0,0.25)', color: '#FF6D00' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6D00] animate-pulse" />
                India's fastest-growing rideshare
              </div>

              <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.08] tracking-tight"
                style={{ fontFamily: 'Space Grotesk' }}>
                Ride together,{' '}
                <span className="relative inline-block">
                  <span style={{ color: '#FF6D00' }}>save more.</span>
                  <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none">
                    <path d="M0 5 Q50 1 100 4 Q150 7 200 3" stroke="#FF6D00" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-white/45 mb-10 leading-relaxed max-w-md">
                Share rides with verified travellers across India. Cut costs, reduce traffic, and turn every journey into a story.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mb-10">
                {STATS.map(([val, label]) => (
                  <div key={label}>
                    <div className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{val}</div>
                    <div className="text-xs text-white/35 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Shield, label: 'Verified Users' },
                  { icon: CheckCircle, label: 'Safe Rides' },
                  { icon: Leaf, label: 'Eco-Friendly' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-white/40 border border-white/[0.07] rounded-full px-3 py-1.5">
                    <Icon className="w-3 h-3" style={{ color: '#FF6D00' }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Search Card */}
            <div>
              <div className="rounded-3xl overflow-hidden"
                style={{ background: '#161616', border: '1px solid rgba(255,109,0,0.15)', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,109,0,0.05)' }}>
                {/* Card header */}
                <div className="px-6 pt-6 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Space Grotesk' }}>Find a ride</h2>
                      {mounted && selectedCity && (
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,109,0,0.8)' }}>
                          Showing rides in {selectedCity}
                        </p>
                      )}
                    </div>
                    {mounted && selectedCity && (
                      <button
                        onClick={() => setShowCityPicker(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                        style={{ background: 'rgba(255,109,0,0.1)', color: '#FF6D00', border: '1px solid rgba(255,109,0,0.2)' }}
                      >
                        <MapPin className="w-3 h-3" /> {selectedCity}
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSearch} className="p-5 space-y-3">
                  {/* Pickup */}
                  <div>
                    <label className="block text-xs text-white/35 uppercase tracking-wider mb-1.5 font-medium">From</label>
                    <LocationAutocomplete
                      placeholder={cityScope ? `Area in ${selectedCity}` : 'Pickup location'}
                      value={search.from}
                      cityScope={cityScope}
                      icon={<Navigation className="w-4 h-4" />}
                      onChange={val => setSearch({ ...search, from: val })}
                      onSelect={r => setSearch({ ...search, from: r.displayName })}
                    />
                  </div>

                  {/* Outside city toggle */}
                  {mounted && selectedCity && (
                    <label className="flex items-center gap-2.5 cursor-pointer py-1 px-1">
                      <div
                        onClick={() => setOutsideCity(!outsideCity)}
                        className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${outsideCity ? 'bg-[#FF6D00]' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${outsideCity ? 'left-4' : 'left-0.5'}`} />
                      </div>
                      <span className="text-xs text-white/45">
                        Going outside {selectedCity}?{' '}
                        <span className="text-white/60 font-medium">{outsideCity ? 'Yes — choose any destination' : 'Search city-wide'}</span>
                      </span>
                      <Globe className="w-3 h-3 text-white/25" />
                    </label>
                  )}

                  {/* Destination */}
                  <div>
                    <label className="block text-xs text-white/35 uppercase tracking-wider mb-1.5 font-medium">To</label>
                    <LocationAutocomplete
                      placeholder={outsideCity ? 'Any city or area in India' : (cityScope ? `Area in ${selectedCity}` : 'Drop location')}
                      value={search.to}
                      cityScope={outsideCity ? undefined : cityScope}
                      icon={<MapPin className="w-4 h-4" />}
                      onChange={val => setSearch({ ...search, to: val })}
                      onSelect={r => setSearch({ ...search, to: r.displayName })}
                    />
                  </div>

                  {/* Date + Seats row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/35 uppercase tracking-wider mb-1.5 font-medium">Date</label>
                      <div className="flex items-center gap-2 bg-[#1E1E1E] border border-white/[0.08] rounded-xl px-3 py-3 focus-within:border-[#FF6D00]/50 transition-colors">
                        <Calendar className="w-4 h-4 text-white/25 shrink-0" />
                        <input type="date" value={search.date}
                          onChange={e => setSearch({ ...search, date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="flex-1 bg-transparent text-white/70 text-sm outline-none min-w-0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-white/35 uppercase tracking-wider mb-1.5 font-medium">Seats</label>
                      <div className="flex items-center bg-[#1E1E1E] border border-white/[0.08] rounded-xl overflow-hidden">
                        <button type="button"
                          onClick={() => setSearch(s => ({ ...s, seats: Math.max(1, s.seats - 1) }))}
                          className="px-3 py-3 text-white/50 hover:text-white hover:bg-white/5 transition-all text-lg font-bold">−</button>
                        <div className="flex-1 text-center text-white font-bold text-sm">{search.seats}</div>
                        <button type="button"
                          onClick={() => setSearch(s => ({ ...s, seats: Math.min(8, s.seats + 1) }))}
                          className="px-3 py-3 text-white/50 hover:text-white hover:bg-white/5 transition-all text-lg font-bold">+</button>
                      </div>
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl text-white transition-all shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #FF6D00 0%, #FF9E40 100%)', boxShadow: '0 8px 24px rgba(255,109,0,0.35)' }}>
                    <span>Search Rides</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <Link href="/rides/offer"
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-xl transition-all"
                    style={{ color: '#FF6D00', background: 'rgba(255,109,0,0.08)', border: '1px solid rgba(255,109,0,0.15)' }}>
                    <Car className="w-4 h-4" /> Offer a Ride Instead
                  </Link>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: '#FF6D00' }}>Simple Process</span>
            <h2 className="text-3xl lg:text-4xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>How Rydo Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MapPin,   num: '01', title: 'Search your route', desc: 'Enter pickup and destination. We show available rides filtered to your city.' },
              { icon: Users,    num: '02', title: 'Book your seat',    desc: 'Pick a ride, check the driver profile, then request or instantly book.' },
              { icon: Zap,      num: '03', title: 'Travel & save',     desc: 'Meet your driver, enjoy a comfortable shared journey, save big on travel.' },
            ].map(({ icon: Icon, num, title, desc }) => (
              <div key={num} className="group relative rounded-2xl p-7 transition-all hover:-translate-y-1"
                style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,109,0,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}>
                {/* Step number watermark */}
                <div className="absolute top-5 right-6 text-6xl font-black select-none"
                  style={{ color: 'rgba(255,109,0,0.06)', fontFamily: 'Space Grotesk' }}>{num}</div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: 'linear-gradient(135deg, rgba(255,109,0,0.15), rgba(255,109,0,0.05))' }}>
                  <Icon className="w-5 h-5" style={{ color: '#FF6D00' }} />
                </div>
                <h3 className="text-white font-bold text-lg mb-3" style={{ fontFamily: 'Space Grotesk' }}>{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ───────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: '#FF6D00' }}>Trending</span>
              <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>Popular Routes</h2>
            </div>
            <Link href="/rides/search"
              className="flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ROUTES.map(route => (
              <Link key={`${route.from}-${route.to}`}
                href={`/rides/search?pickup=${route.from}&drop=${route.to}`}
                className="group rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,109,0,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-start gap-3">
                    {/* Route line */}
                    <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF6D00' }} />
                      <div className="w-0.5 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #FF6D00, rgba(255,255,255,0.1))' }} />
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-white/30" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{route.from}</p>
                      <div className="flex items-center gap-1 my-1">
                        <Clock className="w-3 h-3 text-white/25" />
                        <span className="text-white/30 text-xs">{route.duration}</span>
                      </div>
                      <p className="text-white/60 text-sm">{route.to}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black" style={{ color: '#FF6D00', fontFamily: 'Space Grotesk' }}>₹{route.price}</p>
                    <p className="text-white/30 text-xs">per seat</p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <Users className="w-3 h-3 text-white/25" />
                      <span className="text-white/30 text-xs">{route.seats} left</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-white/25">
                  <span>Multiple rides daily</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:text-[#FF6D00] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFER A RIDE CTA ─────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-10 lg:p-16 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(255,109,0,0.12) 0%, rgba(255,109,0,0.04) 50%, transparent 100%)', border: '1px solid rgba(255,109,0,0.18)' }}>
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #FF6D00, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
              style={{ background: 'radial-gradient(circle, #FF9E40, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

            <div className="relative">
              <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-semibold mb-5"
                style={{ background: 'rgba(255,109,0,0.1)', borderColor: 'rgba(255,109,0,0.25)', color: '#FF6D00' }}>
                <TrendingUp className="w-3 h-3" /> Earn while you travel
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>
                Going somewhere?<br />Bring others along.
              </h2>
              <p className="text-white/45 max-w-md mx-auto mb-8">
                Offer a ride, split your fuel costs, and make new connections. Takes less than 2 minutes to list.
              </p>
              <Link href="/rides/offer"
                className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-white transition-all shadow-xl"
                style={{ background: 'linear-gradient(135deg, #FF6D00, #FF9E40)', boxShadow: '0 12px 32px rgba(255,109,0,0.35)' }}>
                Offer a Ride <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: '#FF6D00' }}>Reviews</span>
            <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>What our riders say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-2xl p-7 flex flex-col gap-5"
                style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#FF6D00' }} />
                    ))}
                  </div>
                  <span className="text-xs text-white/25 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{t.city}
                  </span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #FF6D00, #FF9E40)' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-white/30 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ────────────────────────────────────── */}
      <section className="py-16 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield,       title: 'Verified Profiles',      desc: 'All users verified with phone and ID checks.' },
              { icon: Star,         title: 'Trusted Reviews',         desc: 'Real ratings from real passengers after every trip.' },
              { icon: CheckCircle,  title: 'Instant Confirmation',    desc: 'Book instantly or request — your choice.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255,109,0,0.1)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#FF6D00' }} />
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-white/35 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
