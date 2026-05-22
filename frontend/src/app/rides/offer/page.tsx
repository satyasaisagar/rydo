'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Calendar, Clock, Users, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import { Button, Toggle, Input, Select, Card } from '@/components/ui';
import LocationAutocomplete, { type LocationResult } from '@/components/ui/LocationAutocomplete';
import { useCreateRide } from '@/hooks';
import { useVehicles } from '@/hooks';
import { getApiErrorMessage } from '@/utils';

const schema = z.object({
  pickupLocation: z.string().min(2, 'Enter pickup location'),
  pickupLat:      z.number(),
  pickupLng:      z.number(),
  dropLocation:   z.string().min(2, 'Enter drop location'),
  dropLat:        z.number(),
  dropLng:        z.number(),
  rideDate:       z.string().min(1, 'Select date'),
  rideTime:       z.string().min(1, 'Select time'),
  availableSeats: z.number().min(1).max(8),
  pricePerSeat:   z.number().min(0),
  vehicleId:      z.string().optional(),
  description:    z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const PREFERENCES = [
  { key: 'acAvailable',    label: 'AC Available',   desc: 'Air conditioning in the vehicle' },
  { key: 'musicAllowed',   label: 'Music OK',        desc: 'Music during the ride' },
  { key: 'petsAllowed',    label: 'Pets Welcome',    desc: 'Passengers can bring pets' },
  { key: 'smokingAllowed', label: 'Smoking OK',      desc: 'Smoking allowed in vehicle' },
  { key: 'womenOnly',      label: 'Women Only',      desc: 'Only accepting female passengers' },
  { key: 'luggageAllowed', label: 'Luggage OK',      desc: 'Extra luggage is fine' },
];

export default function OfferRidePage() {
  const router = useRouter();
  const { mutateAsync: createRide, isPending } = useCreateRide();
  const { data: vehicles } = useVehicles();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [stops, setStops] = useState<{ stopName: string; latitude: number; longitude: number }[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { availableSeats: 3, pricePerSeat: 200, pickupLat: 0, pickupLng: 0, dropLat: 0, dropLng: 0 },
  });

  const pickupValue = watch('pickupLocation') || '';
  const dropValue   = watch('dropLocation')   || '';

  const handlePickupSelect = (result: LocationResult) => {
    setValue('pickupLocation', result.displayName, { shouldValidate: true });
    setValue('pickupLat', result.lat);
    setValue('pickupLng', result.lng);
  };

  const handleDropSelect = (result: LocationResult) => {
    setValue('dropLocation', result.displayName, { shouldValidate: true });
    setValue('dropLat', result.lat);
    setValue('dropLng', result.lng);
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createRide({ ...data, ...prefs, stops });
      toast.success('Ride published! 🚗');
      router.push('/rides/my');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const addStop = () => setStops([...stops, { stopName: '', latitude: 0, longitude: 0 }]);
  const removeStop = (i: number) => setStops(stops.filter((_, idx) => idx !== i));
  const updateStop = (i: number, field: string, value: any) => {
    const updated = [...stops];
    updated[i] = { ...updated[i], [field]: value };
    setStops(updated);
  };

  const vehicleOptions = [
    { value: '', label: 'No vehicle selected' },
    ...(vehicles || []).map((v: any) => ({ value: v.id, label: `${v.brand} ${v.model} · ${v.color}` })),
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Offer a Ride</h1>
              <p className="text-white/40 text-sm mt-0.5">Share your journey and split the cost</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Route */}
            <Card className="p-6">
              <h2 className="text-white font-semibold mb-5">Route</h2>
              <div className="space-y-4">
                <LocationAutocomplete
                  label="Pickup Location"
                  placeholder="Search city or area..."
                  value={pickupValue}
                  icon={<MapPin className="w-4 h-4" />}
                  error={errors.pickupLocation?.message}
                  onChange={(val) => setValue('pickupLocation', val)}
                  onSelect={handlePickupSelect}
                />

                {/* Stops */}
                {stops.map((stop, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <LocationAutocomplete
                        placeholder={`Stop ${i + 1} (optional)`}
                        value={stop.stopName}
                        icon={<MapPin className="w-4 h-4" />}
                        onChange={(val) => updateStop(i, 'stopName', val)}
                        onSelect={(r) => {
                          updateStop(i, 'stopName', r.displayName);
                          updateStop(i, 'latitude', r.lat);
                          updateStop(i, 'longitude', r.lng);
                        }}
                      />
                    </div>
                    <button type="button" onClick={() => removeStop(i)}
                      className="text-white/30 hover:text-red-400 transition-colors mt-9 flex items-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addStop}
                  className="flex items-center gap-2 text-sm text-[#00C853] hover:text-[#00A846] transition-colors">
                  <Plus className="w-4 h-4" /> Add a stop
                </button>

                <LocationAutocomplete
                  label="Drop Location"
                  placeholder="Search city or area..."
                  value={dropValue}
                  icon={<MapPin className="w-4 h-4" />}
                  error={errors.dropLocation?.message}
                  onChange={(val) => setValue('dropLocation', val)}
                  onSelect={handleDropSelect}
                />
              </div>
            </Card>

            {/* Date & Time */}
            <Card className="p-6">
              <h2 className="text-white font-semibold mb-5">Date & Time</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  icon={<Calendar className="w-4 h-4" />}
                  error={errors.rideDate?.message}
                  min={new Date().toISOString().split('T')[0]}
                  {...register('rideDate')}
                />
                <Input
                  label="Departure Time"
                  type="time"
                  icon={<Clock className="w-4 h-4" />}
                  error={errors.rideTime?.message}
                  {...register('rideTime')}
                />
              </div>
            </Card>

            {/* Seats & Price */}
            <Card className="p-6">
              <h2 className="text-white font-semibold mb-5">Seats & Price</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">
                    Available Seats
                  </label>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setValue('availableSeats', Math.max(1, (watch('availableSeats') || 1) - 1))}
                      className="w-9 h-9 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-all flex items-center justify-center text-lg">
                      −
                    </button>
                    <span className="text-white font-bold text-xl w-6 text-center">{watch('availableSeats')}</span>
                    <button type="button"
                      onClick={() => setValue('availableSeats', Math.min(8, (watch('availableSeats') || 1) + 1))}
                      className="w-9 h-9 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-all flex items-center justify-center text-lg">
                      +
                    </button>
                  </div>
                  {errors.availableSeats && <p className="text-red-400 text-xs mt-1">{errors.availableSeats.message}</p>}
                </div>

                <Input
                  label="Price Per Seat (₹)"
                  type="number"
                  placeholder="200"
                  icon={<span className="text-white/30 text-sm font-medium">₹</span>}
                  error={errors.pricePerSeat?.message}
                  {...register('pricePerSeat', { valueAsNumber: true })}
                />
              </div>
            </Card>

            {/* Vehicle */}
            {vehicles && vehicles.length > 0 && (
              <Card className="p-6">
                <h2 className="text-white font-semibold mb-5">Vehicle</h2>
                <Select
                  label="Select your vehicle"
                  options={vehicleOptions}
                  {...register('vehicleId')}
                />
              </Card>
            )}

            {/* Preferences */}
            <Card className="p-6">
              <h2 className="text-white font-semibold mb-5">Ride Preferences</h2>
              <div className="space-y-4">
                {PREFERENCES.map(({ key, label, desc }) => (
                  <Toggle
                    key={key}
                    label={label}
                    description={desc}
                    checked={prefs[key] || false}
                    onChange={v => setPrefs(p => ({ ...p, [key]: v }))}
                  />
                ))}
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-white font-semibold mb-4">Additional Info</h2>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Description (optional)</label>
                <textarea
                  placeholder="Share anything relevant about the ride, meeting points, etc."
                  rows={3}
                  {...register('description')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853]/30 transition-all resize-none"
                />
              </div>
            </Card>

            {/* Price preview */}
            <Card className="p-5 bg-[#00C853]/5 border-[#00C853]/15">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Estimated earnings</p>
                  <p className="text-xs text-white/30 mt-0.5">with {watch('availableSeats')} passengers</p>
                </div>
                <p className="text-[#00C853] font-bold text-2xl">
                  ₹{((watch('pricePerSeat') || 0) * (watch('availableSeats') || 1)).toLocaleString()}
                </p>
              </div>
            </Card>

            <Button type="submit" size="lg" loading={isPending} className="w-full">
              Publish Ride
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
