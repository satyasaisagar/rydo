'use client';
// Lightweight client component that shows CityPicker on first visit globally
import CityPicker from './CityPicker';
import { useCityStore } from '@/store/cityStore';

export default function CityBootstrap() {
  const { selectedCity } = useCityStore();
  // CityPicker handles its own show/hide logic (shows when no city selected)
  return <CityPicker />;
}
