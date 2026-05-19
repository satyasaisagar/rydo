'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Star, Wind, Music, PawPrint, Package, Shield, MessageCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button, Badge, Avatar, StarRating, Card, Spinner, Modal } from '@/components/ui';
import { useRide, useCreateBooking } from '@/hooks';
import { useAuthStore } from '@/store/authStore';
import { formatDate, formatPrice, getApiErrorMessage } from '@/utils';

export default function RideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: ride, isLoading } = useRide(id);
  const { mutateAsync: createBooking, isPending } = useCreateBooking();
  const [seats, setSeats] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBook = async () => {
    if (!user) { router.push('/auth/login'); return; }
    try {
      await createBooking({ rideId: id, seatsBooked: seats });
      toast.success('Booking request sent!');
      setShowBookingModal(false);
      router.push('/bookings');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white">Ride not found</p>
          <Link href="/rides/search" className="text-[#00C853] text-sm mt-2 block">← Back to search</Link>
        </div>
      </div>
    );
  }

  const isOwnRide = ride.riderId === user?.id;
  const preferences = [
    { show: ride.acAvailable,    icon: Wind,     label: 'AC Available' },
    { show: ride.musicAllowed,   icon: Music,    label: 'Music Allowed' },
    { show: ride.petsAllowed,    icon: PawPrint, label: 'Pets Welcome' },
    { show: ride.luggageAllowed, icon: Package,  label: 'Luggage OK' },
    { show: ride.womenOnly,      icon: Shield,   label: 'Women Only' },
  ].filter(p => p.show);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-20 pb-32">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/rides/search" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to search
          </Link>

          {/* Route card */}
          <Card className="p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2 pt-1">
                <div className="w-3 h-3 rounded-full bg-[#00C853]" />
                {ride.stops && ride.stops.length > 0
                  ? ride.stops.map((s, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-px h-8 bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-white/20" />
                      </div>
                    ))
                  : <div className="w-px h-12 bg-white/10" />
                }
                <div className="w-3 h-3 rounded-full border-2 border-white/30" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-bold text-lg">{ride.pickupLocation}</p>
                  <span className="text-white/50 text-sm">{ride.rideTime?.slice(0, 5)}</span>
                </div>
                {ride.stops?.map((stop, i) => (
                  <div key={i} className="flex items-center justify-between mt-4 mb-1">
                    <p className="text-white/60">{stop.stopName}</p>
                    {stop.arrivalTime && <span className="text-white/30 text-sm">{stop.arrivalTime}</span>}
                  </div>
                ))}
                <p className="text-white/60 mt-4">{ride.dropLocation}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-5 pt-5 border-t border-white/[0.06] text-sm text-white/50">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(ride.rideDate)}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{ride.availableSeats} seats left</span>
              {ride.distanceKm && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{ride.distanceKm} km</span>}
            </div>
          </Card>

          {/* Driver card */}
          <Card className="p-6 mb-4">
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Driver</h2>
            <div className="flex items-center gap-4">
              <Avatar name={ride.rider?.name || '?'} src={ride.rider?.profileImage} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold">{ride.rider?.name}</p>
                  {ride.rider?.isVerified && <Badge variant="green">Verified</Badge>}
                </div>
                <StarRating rating={ride.rider?.rating || 0} size="md" />
                {ride.rider?.bio && <p className="text-white/40 text-sm mt-2">{ride.rider.bio}</p>}
              </div>
              {!isOwnRide && (
                <Link href={`/chat/${ride.id}?receiverId=${ride.riderId}&receiverName=${encodeURIComponent(ride.rider?.name || '')}`}
                  className="flex items-center gap-1.5 text-sm text-[#00C853] hover:text-[#00A846] transition-colors">
                  <MessageCircle className="w-4 h-4" /> Chat
                </Link>
              )}
            </div>
            {ride.vehicle && (
              <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-3 text-sm text-white/50">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ride.vehicle.color }} />
                  {ride.vehicle.brand} {ride.vehicle.model} · {ride.vehicle.color}
                </span>
                <span className="text-white/20">·</span>
                <span>{ride.vehicle.registrationNumber}</span>
              </div>
            )}
          </Card>

          {/* Preferences */}
          {preferences.length > 0 && (
            <Card className="p-6 mb-4">
              <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Ride Preferences</h2>
              <div className="grid grid-cols-2 gap-3">
                {preferences.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-white/70">
                    <div className="w-8 h-8 rounded-xl bg-[#00C853]/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#00C853]" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Description */}
          {ride.description && (
            <Card className="p-6 mb-4">
              <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Notes from driver</h2>
              <p className="text-white/60 text-sm leading-relaxed">{ride.description}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      {!isOwnRide && ride.status === 'scheduled' && ride.availableSeats > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#111111]/95 backdrop-blur-xl border-t border-white/[0.06] p-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[#00C853] font-bold text-2xl">{formatPrice(ride.pricePerSeat)}</p>
              <p className="text-white/30 text-xs">per seat</p>
            </div>
            <Button onClick={() => user ? setShowBookingModal(true) : router.push('/auth/login')} size="lg" className="px-10">
              Book a Seat
            </Button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <Modal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} title="Confirm Booking">
        <div className="space-y-5">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white font-medium">{ride.pickupLocation} → {ride.dropLocation}</p>
            <p className="text-white/40 text-sm mt-1">{formatDate(ride.rideDate)} · {ride.rideTime?.slice(0, 5)}</p>
          </div>

          <div>
            <p className="text-sm text-white/60 mb-3">Number of seats</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setSeats(Math.max(1, seats - 1))}
                className="w-10 h-10 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all text-lg">
                −
              </button>
              <span className="text-white font-bold text-xl w-8 text-center">{seats}</span>
              <button onClick={() => setSeats(Math.min(ride.availableSeats, seats + 1))}
                className="w-10 h-10 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all text-lg">
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-white/[0.06]">
            <span className="text-white/60">Total</span>
            <span className="text-[#00C853] font-bold text-xl">{formatPrice(ride.pricePerSeat * seats)}</span>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowBookingModal(false)} className="flex-1">Cancel</Button>
            <Button loading={isPending} onClick={handleBook} className="flex-1">Request Booking</Button>
          </div>

          <p className="text-center text-xs text-white/25">Your booking is confirmed only after the driver accepts it.</p>
        </div>
      </Modal>
    </div>
  );
}
