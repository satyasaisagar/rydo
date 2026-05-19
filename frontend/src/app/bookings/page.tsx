'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BookOpen, Car } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Spinner, EmptyState, Button } from '@/components/ui';
import { BookingCard } from '@/components/bookings/BookingCard';
import { useMyBookings, useMyRides, useRideBookings, useUpdateBookingStatus } from '@/hooks';
import { useAuthStore } from '@/store/authStore';
import { getApiErrorMessage } from '@/utils';

type Tab = 'passenger' | 'rider';

export default function BookingsPage() {
  const [tab, setTab] = useState<Tab>('passenger');
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  const { data: myBookings, isLoading: loadingBookings } = useMyBookings();
  const { mutateAsync: updateStatus } = useUpdateBookingStatus();

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status });
      toast.success(status === 'accepted' ? 'Booking accepted!' : status === 'rejected' ? 'Booking declined.' : 'Booking cancelled.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white mb-6">My Trips</h1>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 mb-8 w-fit">
            {(['passenger', 'rider'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  tab === t
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}>
                {t === 'passenger' ? 'Booked Rides' : 'Ride Requests'}
              </button>
            ))}
          </div>

          {tab === 'passenger' && (
            <div>
              {loadingBookings ? (
                <div className="flex justify-center py-20"><Spinner /></div>
              ) : !myBookings?.length ? (
                <EmptyState
                  icon={<BookOpen className="w-14 h-14" />}
                  title="No bookings yet"
                  description="Find a ride and book your first seat."
                  action={<Link href="/rides/search"><Button>Find a Ride</Button></Link>}
                />
              ) : (
                <div className="space-y-4">
                  {myBookings.map((booking: any) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onUpdateStatus={handleUpdateStatus}
                      isRider={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'rider' && (
            <RiderBookingsTab onUpdateStatus={handleUpdateStatus} />
          )}
        </div>
      </div>
    </div>
  );
}

function RiderBookingsTab({ onUpdateStatus }: { onUpdateStatus: (id: string, status: string) => void }) {
  const { data: myRides, isLoading } = useMyRides();

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const activeRides = myRides?.filter((r: any) => r.status === 'scheduled') || [];

  if (!activeRides.length) {
    return (
      <EmptyState
        icon={<Car className="w-14 h-14" />}
        title="No active rides"
        description="Offer a ride to start receiving booking requests."
        action={<Link href="/rides/offer"><Button>Offer a Ride</Button></Link>}
      />
    );
  }

  return <div className="space-y-6">{activeRides.map((r: any) => <RideBookings key={r.id} rideId={r.id} ride={r} onUpdateStatus={onUpdateStatus} />)}</div>;
}

function RideBookings({ rideId, ride, onUpdateStatus }: any) {
  const { data: bookings, isLoading } = useRideBookings(rideId);
  if (isLoading || !bookings?.length) return null;

  return (
    <div>
      <p className="text-white/60 text-sm font-medium mb-3">
        {ride.pickupLocation} → {ride.dropLocation} · {ride.rideDate}
      </p>
      <div className="space-y-3">
        {bookings.map((b: any) => (
          <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateStatus} isRider />
        ))}
      </div>
    </div>
  );
}


