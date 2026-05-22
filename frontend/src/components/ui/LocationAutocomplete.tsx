'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

export interface LocationResult {
  displayName: string;   // area/sublocality shown in the field
  fullName: string;      // full address for reference
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

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  terms: { value: string; offset: number }[];
}

const GMAPS_KEY = 'AIzaSyCFoPTcIqM5HENk3gFJMX1o_sGXXc_9FX4';

// Build a short "area, city" label from prediction terms
// terms[0] = sublocality/area, terms[1] = city/district, terms[2] = state, terms[3] = country
function getAreaLabel(pred: PlacePrediction): string {
  const terms = pred.terms || [];
  if (terms.length >= 2) {
    // Show: "Banjara Hills, Hyderabad" or "Koramangala, Bengaluru"
    return `${terms[0].value}, ${terms[1].value}`;
  }
  return pred.structured_formatting?.main_text || pred.description;
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
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionToken = useRef<string>(Math.random().toString(36).slice(2));

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
    if (query.trim().length < 2) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      // Google Places Autocomplete — biased to India, prefer sublocalities & localities
      const params = new URLSearchParams({
        input: query,
        key: GMAPS_KEY,
        sessiontoken: sessionToken.current,
        components: 'country:in',
        language: 'en',
        types: 'geocode',        // sublocality, locality, route, etc
      });

      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
      );
      const data = await res.json();

      if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
        setPredictions(data.predictions || []);
        setOpen((data.predictions || []).length > 0);
      } else {
        console.error('Places API error:', data.status, data.error_message);
        setPredictions([]);
        setOpen(false);
      }
    } catch (err) {
      console.error('Autocomplete error:', err);
      setPredictions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange?.(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = async (pred: PlacePrediction) => {
    const areaLabel = getAreaLabel(pred);
    setInputValue(areaLabel);
    setOpen(false);
    setPredictions([]);
    onChange?.(areaLabel);

    // Fetch lat/lng via Place Details
    try {
      // Rotate session token after use (billing optimization)
      sessionToken.current = Math.random().toString(36).slice(2);

      const params = new URLSearchParams({
        place_id: pred.place_id,
        fields: 'geometry,formatted_address',
        key: GMAPS_KEY,
      });
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?${params}`
      );
      const data = await res.json();
      const loc = data.result?.geometry?.location;
      onSelect?.({
        displayName: areaLabel,
        fullName: data.result?.formatted_address || pred.description,
        lat: loc?.lat || 0,
        lng: loc?.lng || 0,
      });
    } catch {
      onSelect?.({
        displayName: areaLabel,
        fullName: pred.description,
        lat: 0,
        lng: 0,
      });
    }
  };

  const handleClear = () => {
    setInputValue('');
    setPredictions([]);
    setOpen(false);
    onChange?.('');
    onSelect?.({ displayName: '', fullName: '', lat: 0, lng: 0 });
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white/60 mb-1.5">
          {label}
        </label>
      )}

      <div className={`
        flex items-center gap-3
        bg-white/5 border rounded-xl px-4 py-3
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
          onFocus={() => predictions.length > 0 && setOpen(true)}
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

      {/* Dropdown */}
      {open && predictions.length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
          {predictions.map((pred) => {
            const main = pred.structured_formatting?.main_text || pred.terms?.[0]?.value || pred.description;
            const secondary = pred.structured_formatting?.secondary_text || pred.terms?.slice(1).map(t => t.value).join(', ') || '';
            return (
              <button
                key={pred.place_id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(pred); }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/[0.04] last:border-0"
              >
                <MapPin className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{main}</p>
                  {secondary && (
                    <p className="text-white/40 text-xs truncate mt-0.5">{secondary}</p>
                  )}
                </div>
              </button>
            );
          })}
          <div className="px-4 py-2 border-t border-white/[0.04] flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4"/>
            </svg>
            <p className="text-white/20 text-xs">Powered by Google</p>
          </div>
        </div>
      )}
    </div>
  );
}
