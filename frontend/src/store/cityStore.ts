import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CityState {
  selectedCity: string | null;
  setCity: (city: string) => void;
  clearCity: () => void;
}

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      selectedCity: null,
      setCity: (city) => set({ selectedCity: city }),
      clearCity: () => set({ selectedCity: null }),
    }),
    { name: 'rydo-city' }
  )
);
