'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Users, ArrowRight, Star, Shield, Zap, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const POPULAR_ROUTES = [
  { from: 'Mumbai', to: 'Pune', price: 350, duration: '3h' },
  { from: 'Delhi', to: 'Agra', price: 280, duration: '3.5h' },
  { from: 'Bangalore', to: 'Mysore', price: 200, duration: '3h' },
  { from: 'Chennai', to: 'Pondicherry', price: 180, duration: '2.5h' },
  { from: 'Hyderabad', to: 'Vijayawada', price: 300, duration: '5h' },
  { from: 'Kolkata', to: 'Digha', price: 250, duration: '3h' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Regular Commuter', rating: 5, text: 'Rydo has completely changed how I travel. Safe, affordable, and I\'ve made great friends along the way!' },
  { name: 'Arjun Mehta', role: 'Rider Since 2024', rating: 5, text: 'As a driver, I love splitting fuel costs while meeting interesting people. The app is super easy to use.' },
  { name: 'Riya Patel', role: 'Student', rating: 5, text: 'Perfect for weekend trips. Way cheaper than trains and more comfortable too. Highly recommend!' },
];

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState({ from: '', to: '', date: '', seats: 1 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      pickup: search.from,
      drop: search.to,
      date: search.date,
      seats: String(search.seats),
    });
    router.push(`/rides/search?${params}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00C853]/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#00C853]/10 border border-[#00C853]/20 rounded-full px-4 py-1.5 text-sm text-[#00C853] font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
            India's fastest-growing ride-share platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Travel smarter,{' '}
            <span className="text-[#00C853]">together.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            Share rides with trusted travellers. Cut costs, reduce traffic, and make every journey an experience.
          </p>

          {/* Search Card */}
          <form onSubmit={handleSearch}
            className="bg-[#111111] border border-white/[0.07] rounded-2xl p-2 max-w-4xl mx-auto shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3.5">
                <MapPin className="w-4 h-4 text-[#00C853] shrink-0" />
                <input
                  type="text"
                  placeholder="From city"
                  value={search.from}
                  onChange={e => setSearch({ ...search, from: e.target.value })}
                  className="bg-transparent text-white placeholder-white/30 text-sm outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3.5">
                <MapPin className="w-4 h-4 text-white/30 shrink-0" />
                <input
                  type="text"
                  placeholder="To city"
                  value={search.to}
                  onChange={e => setSearch({ ...search, to: e.target.value })}
                  className="bg-transparent text-white placeholder-white/30 text-sm outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3.5">
                <Calendar className="w-4 h-4 text-white/30 shrink-0" />
                <input
                  type="date"
                  value={search.date}
                  onChange={e => setSearch({ ...search, date: e.target.value })}
                  className="bg-transparent text-white/60 text-sm outline-none w-full"
                />
              </div>

              <button type="submit"
                className="flex items-center justify-center gap-2 bg-[#00C853] hover:bg-[#00A846] text-black font-semibold rounded-xl px-6 py-3.5 transition-colors duration-150">
                Search Rides
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-white/40">
            {[['50K+', 'Happy Riders'], ['200K+', 'Rides Completed'], ['4.8★', 'Average Rating']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-white font-bold text-lg">{val}</div>
                <div>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#00C853] text-sm font-semibold mb-2 uppercase tracking-wider">Popular</p>
              <h2 className="text-3xl font-bold text-white">Trending Routes</h2>
            </div>
            <Link href="/rides/search" className="text-sm text-white/40 hover:text-white flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ROUTES.map((route) => (
              <Link
                key={`${route.from}-${route.to}`}
                href={`/rides/search?pickup=${route.from}&drop=${route.to}`}
                className="group bg-[#111111] border border-white/[0.06] rounded-2xl p-5 hover:border-[#00C853]/30 hover:bg-[#111]/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#00C853]" />
                      <div className="w-px h-6 bg-white/10" />
                      <div className="w-2 h-2 rounded-full bg-white/30" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{route.from}</p>
                      <p className="text-white/40 text-xs mt-1">{route.duration}</p>
                      <p className="text-white/60 text-sm mt-0.5">{route.to}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00C853] font-bold text-lg">₹{route.price}</p>
                    <p className="text-white/30 text-xs">per seat</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-white/30">
                  <span>Multiple rides daily</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:text-[#00C853] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#00C853] text-sm font-semibold mb-2 uppercase tracking-wider">Simple</p>
            <h2 className="text-3xl font-bold text-white">How Rydo Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, step: '01', title: 'Search your route', desc: 'Enter your pickup, destination, and travel date. We\'ll show you available rides.' },
              { icon: Users, step: '02', title: 'Book a seat', desc: 'Choose your ride, check the driver profile and reviews, then request a booking.' },
              { icon: Zap, step: '03', title: 'Travel & save', desc: 'Get confirmed, meet your driver, and enjoy a shared, affordable journey.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative group">
                <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-8 h-full hover:border-[#00C853]/20 transition-colors">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-[#00C853]/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#00C853]" />
                    </div>
                    <span className="text-5xl font-bold text-white/[0.04]">{step}</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-3">{title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: Offer a ride */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#00C853]/10 via-[#00C853]/5 to-transparent border border-[#00C853]/20 rounded-3xl p-10 lg:p-16 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Going somewhere? Bring others along.
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mb-8">
              Offer a ride, split your fuel costs, and make new connections. It takes less than 2 minutes to list your ride.
            </p>
            <Link href="/rides/offer"
              className="inline-flex items-center gap-2 bg-[#00C853] hover:bg-[#00A846] text-black font-semibold px-8 py-4 rounded-xl transition-colors">
              Offer a Ride <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#00C853] text-sm font-semibold mb-2 uppercase tracking-wider">Reviews</p>
            <h2 className="text-3xl font-bold text-white">What our riders say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[#111111] border border-white/[0.06] rounded-2xl p-7">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#00C853] fill-current" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#00C853]/20 flex items-center justify-center text-[#00C853] font-bold text-sm">
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

      {/* Trust badges */}
      <section className="py-16 px-4 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, title: 'Verified Profiles', desc: 'All users are verified with phone and ID checks.' },
              { icon: Star,   title: 'Trusted Reviews', desc: 'Real ratings from real passengers after every trip.' },
              { icon: Zap,    title: 'Instant Confirmation', desc: 'Book instantly or request — your choice.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#00C853]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#00C853]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/40 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
