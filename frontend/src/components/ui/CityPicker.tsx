'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Navigation } from 'lucide-react';
import { useCityStore } from '@/store/cityStore';

const INDIAN_CITIES = [
  'Agra','Ahmedabad','Aizawl','Ajmer','Akola','Aligarh','Allahabad',
  'Amravati','Amritsar','Anand','Asansol','Aurangabad','Bangalore',
  'Bareilly','Belgaum','Bhavnagar','Bhilai','Bhopal','Bhubaneswar',
  'Bikaner','Chandigarh','Chennai','Coimbatore','Cuttack','Dehradun',
  'Delhi','Dhanbad','Durgapur','Erode','Faridabad','Ghaziabad',
  'Gorakhpur','Guntur','Gurgaon','Guwahati','Gwalior','Hubli',
  'Hyderabad','Imphal','Indore','Itanagar','Jabalpur','Jaipur',
  'Jalandhar','Jammu','Jamshedpur','Jodhpur','Kanpur','Kakinada',
  'Kochi','Kohima','Kolhapur','Kolkata','Kota','Kozhikode',
  'Lucknow','Ludhiana','Madurai','Mangalore','Meerut','Mumbai',
  'Mysore','Nagpur','Nashik','Navi Mumbai','Noida','Panaji',
  'Patna','Pondicherry','Pune','Raipur','Rajkot','Ranchi',
  'Salem','Shillong','Shimla','Siliguri','Srinagar','Surat',
  'Thane','Tiruchirappalli','Tirupati','Thiruvananthapuram','Udaipur',
  'Varanasi','Vijayawada','Visakhapatnam','Warangal',
].sort();

interface Props {
  onClose?: () => void;
  forceOpen?: boolean;
}

export default function CityPicker({ onClose, forceOpen = false }: Props) {
  const { selectedCity, setCity } = useCityStore();
  const [query, setQuery] = useState('');
  const [show, setShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Show on first visit (no city saved) or when forced
    if (forceOpen || !selectedCity) setShow(true);
  }, [forceOpen, selectedCity]);

  useEffect(() => {
    if (show) setTimeout(() => inputRef.current?.focus(), 100);
  }, [show]);

  const filtered = query.trim()
    ? INDIAN_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : INDIAN_CITIES;

  const handleSelect = (city: string) => {
    setCity(city);
    setShow(false);
    onClose?.();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => selectedCity && setShow(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#161616] border border-[#FF6D00]/20 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-8 pb-6 text-center border-b border-white/[0.06]">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF6D00] to-[#FF9E40] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#FF6D00]/25">
            <Navigation className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Choose your city
          </h2>
          <p className="text-white/40 text-sm">
            We'll show rides and areas within your city first
          </p>
          {selectedCity && (
            <button
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/30 hover:text-white rounded-full hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 bg-[#1E1E1E] border border-white/[0.08] rounded-xl px-4 py-3 focus-within:border-[#FF6D00]/50 transition-colors">
            <Search className="w-4 h-4 text-white/30 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* City list */}
        <div className="overflow-y-auto max-h-72 px-4 pb-4 grid grid-cols-2 gap-2 content-start">
          {filtered.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-white/30 text-sm">No city found</div>
          ) : (
            filtered.map(city => (
              <button
                key={city}
                onClick={() => handleSelect(city)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${
                  selectedCity === city
                    ? 'bg-[#FF6D00] text-white shadow-lg shadow-[#FF6D00]/20'
                    : 'bg-[#1E1E1E] text-white/70 hover:bg-[#FF6D00]/10 hover:text-white border border-white/[0.04] hover:border-[#FF6D00]/20'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {city}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
