'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Filter, Star, Car, Music, PawPrint, Wind } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';
import { ridesApi } from '@/services/api';

function SearchContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    pickup: searchParams.get('pickup') || '',
    drop:   searchParams.get('drop')   || '',
    date:   searchParams.get('date')   || new Date().toISOString().split('T')[0],
    seats:  Number(searchParams.get('seats')) || 1,
    maxPrice:  '',
    womenOnly: false,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['rides-search', filters, page],
    queryFn: () => ridesApi.search({ ...filters, page, limit: 10 }).then(r => r.data),
    enabled: true,
  });

  const handleSearch = () => { setPage(1); refetch(); };

  const PreferenceIcon = ({ label, icon: Icon }: { label: string; icon: any }) => (
    <span className="inline-flex items-center gap-1 text-xs text-white/40 bg-white/5 rounded-full px-2.5 py-1">
      <Icon className="w-3 h-3" /> {label}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-20">
        {/* Search bar */}
        <div className="bg-[#111111] border-b border-white/[0.05] py-4 px-4 sticky top-16 z-40">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 items-end">
            {/* Pickup autocomplete */}
            <div className="flex-1">
              <LocationAutocomplete
                placeholder="From city or area"
                value={filters.pickup}
                onChange={(val) => setFilters(f => ({ ...f, pickup: val }))}
                onSelect={(r) => setFilters(f => ({ ...f, pickup: r.displayName }))}
              />
            </div>

            {/* Drop autocomplete */}
            <div className="flex-1">
              <LocationAutocomplete
                placeholder="To city or area"
                value={filters.drop}
                onChange={(val) => setFilters(f => ({ ...f, drop: val }))}
                onSelect={(r) => setFilters(f => ({ ...f, drop: r.displayName }))}
              />
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <Calendar className="w-4 h-4 text-white/30" />
              <input type="date" value={filters.date}
                onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
                className="bg-transparent text-white/70 text-sm outline-none" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 hover:bg-white/5 transition-all">
                <Filter className="w-4 h-4" /> Filters
              </button>
              <button onClick={handleSearch}
                className="bg-[#00C853] hover:bg-[#00A846] text-black font-semibold text-sm px-6 py-3 rounded-xl transition-colors">
                Search
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="max-w-5xl mx-auto mt-3 flex flex-wrap gap-3 pt-3 border-t border-white/[0.05]">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <span className="text-xs text-white/40">Max price ₹</span>
                <input type="number" value={filters.maxPrice}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                  placeholder="Any" className="bg-transparent text-white text-sm outline-none w-20" />
              </div>
              <button onClick={() => setFilters(f => ({ ...f, womenOnly: !f.womenOnly }))}
                className={`text-xs rounded-xl px-4 py-2 border transition-all ${filters.womenOnly ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' : 'border-white/10 text-white/40 hover:bg-white/5'}`}>
                Women only
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-white font-semibold text-xl mb-2">No rides found</h3>
              <p className="text-white/40 text-sm">Try different dates or locations</p>
              <Link href="/rides/offer"
                className="inline-flex items-center gap-2 mt-6 text-sm text-[#00C853] hover:text-[#00A846]">
                Be the first to offer this route →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-white/40 text-sm">{data?.total} rides found</p>
              {data?.data?.map((ride: any) => (
                <Link key={ride.id} href={`/rides/${ride.id}`}
                  className="block bg-[#111111] border border-white/[0.06] rounded-2xl p-6 hover:border-[#00C853]/25 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00C853]" />
                        <div className="w-px h-10 bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 mb-1">
                          <span className="text-white font-semibold">{ride.pickupLocation}</span>
                          <span className="text-white/30 text-sm">{ride.rideTime?.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-white/60">{ride.dropLocation}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          <div className="w-8 h-8 rounded-full bg-[#00C853]/20 flex items-center justify-center text-xs text-[#00C853] font-bold">
                            {ride.rider?.name?.[0]}
                          </div>
                          <div>
                            <span className="text-sm text-white font-medium">{ride.rider?.name}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-[#00C853] fill-current" />
                              <span className="text-xs text-white/40">{ride.rider?.rating || '—'}</span>
                            </div>
                          </div>
                          {ride.vehicle && (
                            <span className="flex items-center gap-1 text-xs text-white/30">
                              <Car className="w-3 h-3" /> {ride.vehicle.brand} {ride.vehicle.model}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {ride.acAvailable    && <PreferenceIcon label="AC" icon={Wind} />}
                          {ride.musicAllowed   && <PreferenceIcon label="Music" icon={Music} />}
                          {ride.petsAllowed    && <PreferenceIcon label="Pets OK" icon={PawPrint} />}
                          {ride.luggageAllowed && <PreferenceIcon label="Luggage" icon={Car} />}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[#00C853] font-bold text-2xl">₹{ride.pricePerSeat}</p>
                      <p className="text-white/30 text-xs mb-3">per seat</p>
                      <div className="flex items-center gap-1 justify-end text-xs text-white/40">
                        <Users className="w-3.5 h-3.5" />
                        <span>{ride.availableSeats} left</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {data?.pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  {Array.from({ length: data.pages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-[#00C853] text-black' : 'text-white/40 hover:bg-white/5'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
