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
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

// Build a short "Area, City" label — prioritise sub-locality over city
function getShortName(r: NominatimResult): string {
  const a = r.address || {};
  const area = a.suburb || a.neighbourhood || a.quarter || a.city_district || '';
  const city = a.city || a.town || a.village || '';
  if (area && city) return `${area}, ${city}`;
  if (area) return area;
  if (city) {
    const state = a.state || '';
    return state ? `${city}, ${state}` : city;
  }
  // fallback: first two comma-parts of display_name
  const parts = r.display_name.split(',');
  return parts.slice(0, 2).join(',').trim();
}

export default function LocationAutocomplete({
  label,
  placeholder = 'Search area or locality...',
  value = '',
  icon,
  error,
  onChange,
  onSelect,
  className = '',
}: Props) {
  const [inputValue, setInputValue]     = useState(value);
  const [suggestions, setSuggestions]   = useState<NominatimResult[]>([]);
  const [loading, setLoading]           = useState(false);
  const [open, setOpen]                 = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync external value
  useEffect(() => {
    if (value !== inputValue) setInputValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (query: string) => {
    if (query.trim().length < 2) { setSuggestions([]); setOpen(false); return; }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '6',
        addressdetails: '1',
        countrycodes: 'in',
        'accept-language': 'en',
        featuretype: 'settlement',   // prefer settled areas over admin boundaries
      });

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          signal: abortRef.current.signal,
          headers: { 'User-Agent': 'RydoApp/1.0 (ride-sharing)' },
        }
      );
      if (!res.ok) throw new Error('Search failed');
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch (err: any) {
      if (err.name !== 'AbortError') { setSuggestions([]); setOpen(false); }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange?.(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (result: NominatimResult) => {
    const short = getShortName(result);
    setInputValue(short);
    setOpen(false);
    setSuggestions([]);
    onChange?.(short);
    onSelect?.({
      displayName: short,
      fullName: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    });
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setOpen(false);
    onChange?.('');
    onSelect?.({ displayName: '', fullName: '', lat: 0, lng: 0 });
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white/60 mb-1.5">{label}</label>
      )}

      <div className={`
        flex items-center gap-3 bg-white/5 border rounded-xl px-4 py-3
        transition-all duration-150
        ${error
          ? 'border-red-500/50'
          : 'border-white/10 focus-within:border-[#00C853] focus-within:ring-1 focus-within:ring-[#00C853]/30'}
      `}>
        <span className="text-white/30 shrink-0">
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin text-[#00C853]" />
            : (icon || <MapPin className="w-4 h-4" />)
          }
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30 min-w-0"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-white/20 hover:text-white/60 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
          {suggestions.map((r) => {
            const short = getShortName(r);
            const parts = r.display_name.split(',');
            // subtitle: next 2 parts after the short name
            const subtitle = parts.slice(1, 3).join(',').trim();
            return (
              <button
                key={r.place_id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/[0.04] last:border-0"
              >
                <MapPin className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{short}</p>
                  {subtitle && (
                    <p className="text-white/40 text-xs truncate mt-0.5">{subtitle}</p>
                  )}
                </div>
              </button>
            );
          })}
          <div className="px-4 py-2 border-t border-white/[0.04]">
            <p className="text-white/20 text-xs">© OpenStreetMap contributors</p>
          </div>
        </div>
      )}
    </div>
  );
}
