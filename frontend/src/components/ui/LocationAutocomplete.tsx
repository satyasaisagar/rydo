'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

export interface LocationResult {
  displayName: string;
  fullName: string;
  lat: number;
  lng: number;
}

interface Props {
  label?: string;
  placeholder?: string;
  value?: string;
  icon?: React.ReactNode;
  error?: string;
  cityScope?: string;        // restrict results to this city
  onChange?: (value: string) => void;
  onSelect?: (result: LocationResult) => void;
  className?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    suburb?: string; neighbourhood?: string; quarter?: string;
    city_district?: string; city?: string; town?: string;
    village?: string; state?: string;
  };
}

function getShortName(r: NominatimResult): string {
  const a = r.address || {};
  const area = a.suburb || a.neighbourhood || a.quarter || a.city_district || '';
  const city = a.city || a.town || a.village || '';
  if (area && city) return `${area}, ${city}`;
  if (area) return area;
  if (city) return city;
  return r.display_name.split(',').slice(0, 2).join(',').trim();
}

export default function LocationAutocomplete({
  label, placeholder = 'Search area...', value = '',
  icon, error, cityScope, onChange, onSelect, className = '',
}: Props) {
  const [inputValue, setInputValue]   = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading]         = useState(false);
  const [open, setOpen]               = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { if (value !== inputValue) setInputValue(value); }, [value]); // eslint-disable-line

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const search = useCallback(async (query: string) => {
    if (query.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      // If city scoped, add city to query for more relevant results
      const q = cityScope ? `${query}, ${cityScope}, India` : `${query}, India`;
      const params = new URLSearchParams({
        q, format: 'json', limit: '6', addressdetails: '1',
        countrycodes: 'in', 'accept-language': 'en',
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        signal: abortRef.current.signal,
        headers: { 'User-Agent': 'RydoApp/1.0' },
      });
      if (!res.ok) throw new Error('Search failed');
      const data: NominatimResult[] = await res.json();
      // Filter to city scope if provided
      const filtered = cityScope
        ? data.filter(r => r.display_name.toLowerCase().includes(cityScope.toLowerCase()))
        : data;
      setSuggestions(filtered.length ? filtered : data.slice(0, 4));
      setOpen(true);
    } catch (e: any) {
      if (e.name !== 'AbortError') { setSuggestions([]); setOpen(false); }
    } finally { setLoading(false); }
  }, [cityScope]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val); onChange?.(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (r: NominatimResult) => {
    const short = getShortName(r);
    setInputValue(short); setOpen(false); setSuggestions([]);
    onChange?.(short);
    onSelect?.({ displayName: short, fullName: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
  };

  const handleClear = () => {
    setInputValue(''); setSuggestions([]); setOpen(false);
    onChange?.(''); onSelect?.({ displayName: '', fullName: '', lat: 0, lng: 0 });
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">{label}</label>}
      <div className={`flex items-center gap-3 bg-[#1E1E1E] border rounded-xl px-4 py-3 transition-all ${
        error ? 'border-red-500/50' : 'border-white/[0.08] focus-within:border-[#FF6D00]/60 focus-within:ring-1 focus-within:ring-[#FF6D00]/20'
      }`}>
        <span className="text-white/25 shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#FF6D00]" /> : (icon || <MapPin className="w-4 h-4" />)}
        </span>
        <input
          type="text" value={inputValue} onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder} autoComplete="off" spellCheck={false}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/25 min-w-0"
        />
        {inputValue && (
          <button type="button" onClick={handleClear} className="text-white/20 hover:text-white/50 transition-colors shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 w-full bg-[#1A1A1A] border border-[#FF6D00]/15 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          {suggestions.map(r => {
            const short = getShortName(r);
            const sub = r.display_name.split(',').slice(1, 3).join(',').trim();
            return (
              <button key={r.place_id} type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(r); }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#FF6D00]/10 transition-colors text-left border-b border-white/[0.04] last:border-0">
                <MapPin className="w-4 h-4 text-[#FF6D00] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{short}</p>
                  {sub && <p className="text-white/35 text-xs truncate mt-0.5">{sub}</p>}
                </div>
              </button>
            );
          })}
          <div className="px-4 py-1.5 border-t border-white/[0.04]">
            <p className="text-white/15 text-xs">© OpenStreetMap</p>
          </div>
        </div>
      )}
    </div>
  );
}
