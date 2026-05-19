'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, MapPin, Calendar, Users, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button, Badge, Card, EmptyState, Spinner } from '@/components/ui';
import { useMyRides, useCancelRide } from '@/hooks';
import { useAuthStore } from '@/store/authStore';
import { rideStatusConfig, formatDate, formatPrice, getApiErrorMessage } from '@/utils';

export default function MyRidesPage() {
  const { user } = useAuthStore();
  const router   = useRouter();

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  const { data: rides, isLoading } = useMyRides();
  const { mutateAsync: cancelRide } = useCancelRide();

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this ride? All pending bookings will be declined.')) return;
    try {
      await cancelRide(id);
      toast.success('Ride cancelled.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto py-8">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">My Rides</h1>
              <p className="text-white/40 text-sm mt-0.5">Rides you're offering</p>
            </div>
            <Link href="/rides/offer">
              <Button icon={<Plus className="w-4 h-4" />}>Offer Ride</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : !rides?.length ? (
            <EmptyState
              icon={<MapPin className="w-14 h-14" />}
              title="No rides yet"
              description="Offer your first ride and start earning while you travel."
              action={<Link href="/rides/offer"><Button icon={<Plus className="w-4 h-4" />}>Offer a Ride</Button></Link>}
            />
          ) : (
            <div className="space-y-4">
              {rides.map((ride: any) => {
                const cfg = rideStatusConfig[ride.status as keyof typeof rideStatusConfig];
                return (
                  <Card key={ride.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      {/* Route */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                          <div className="w-2 h-2 rounded-full bg-[#00C853]" />
                          <div className="w-px h-8 bg-white/10" />
                          <div className="w-2 h-2 rounded-full border-2 border-white/30" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{ride.pickupLocation}</p>
                          <p className="text-white/50 text-sm mt-2 truncate">{ride.dropLocation}</p>
                        </div>
                      </div>

                      {/* Status + price */}
                      <div className="text-right shrink-0">
                        <Badge variant={ride.status === 'scheduled' ? 'green' : ride.status === 'completed' ? 'blue' : ride.status === 'active' ? 'yellow' : 'red'}>
                          {cfg?.label}
                        </Badge>
                        <p className="text-[#00C853] font-bold text-lg mt-1">{formatPrice(ride.pricePerSeat)}</p>
                        <p className="text-white/30 text-xs">per seat</p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 mb-4">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(ride.rideDate)}</span>
                      <span className="text-white/20">·</span>
                      <span>{ride.rideTime?.slice(0, 5)}</span>
                      <span className="text-white/20">·</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{ride.availableSeats} seats left</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                      <Link href={`/rides/${ride.id}/manage`}
                        className="flex items-center gap-1 text-sm text-[#00C853] hover:text-[#00A846] transition-colors">
                        Manage <ChevronRight className="w-4 h-4" />
                      </Link>
                      <Link href={`/rides/${ride.id}`}
                        className="text-sm text-white/40 hover:text-white transition-colors">
                        View listing
                      </Link>
                      {ride.status === 'scheduled' && (
                        <button onClick={() => handleCancel(ride.id)}
                          className="ml-auto text-sm text-red-400 hover:text-red-300 transition-colors">
                          Cancel ride
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
