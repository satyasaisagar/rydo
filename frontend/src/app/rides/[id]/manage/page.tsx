'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, MapPin, Clock, Calendar, XCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button, Badge, Avatar, Card, Spinner, EmptyState } from '@/components/ui';
import { useRide, useRideBookings, useUpdateBookingStatus, useCancelRide } from '@/hooks';
import { useAuthStore } from '@/store/authStore';
import { formatDate, formatPrice, getApiErrorMessage, rideStatusConfig } from '@/utils';

export default function ManageRidePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { user } = useAuthStore();

  const { data: ride,     isLoading: rideLoading }     = useRide(id);
  const { data: bookings, isLoading: bookingsLoading }  = useRideBookings(id);
  const { mutateAsync: updateStatus }   = useUpdateBookingStatus();
  const { mutateAsync: cancelRide, isPending: cancelling } = useCancelRide();

  const handleStatus = async (bookingId: string, status: string) => {
    try {
      await updateStatus({ id: bookingId, status });
      toast.success(status === 'accepted' ? '✅ Booking accepted!' : '❌ Booking declined');
    } catch (err) { toast.error(getApiErrorMessage(err)); }
  };

  const handleCancelRide = async () => {
    if (!confirm('Cancel this ride? All passengers will be notified.')) return;
    try {
      await cancelRide(id);
      toast.success('Ride cancelled');
      router.push('/dashboard');
    } catch (err) { toast.error(getApiErrorMessage(err)); }
  };

  if (rideLoading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!ride || ride.riderId !== user?.id) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <p className="text-white mb-4">Ride not found or unauthorized</p>
        <Link href="/dashboard"><Button variant="secondary">Go to dashboard</Button></Link>
      </div>
    </div>
  );

  const statusCfg  = rideStatusConfig[ride.status as keyof typeof rideStatusConfig];
  const pending    = bookings?.filter((b: any) => b.status === 'pending')   || [];
  const accepted   = bookings?.filter((b: any) => b.status === 'accepted')  || [];
  const totalEarnings = accepted.reduce((sum: number, b: any) => sum + b.totalAmount, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto py-8">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">
                {ride.pickupLocation} → {ride.dropLocation}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant={ride.status === 'scheduled' ? 'green' : ride.status === 'completed' ? 'blue' : 'red'}>
                  {statusCfg?.label}
                </Badge>
                <span className="text-white/30 text-sm">
                  {formatDate(ride.rideDate)} · {ride.rideTime?.slice(0, 5)}
                </span>
              </div>
            </div>
            {ride.status === 'scheduled' && (
              <Button variant="danger" size="sm" loading={cancelling} onClick={handleCancelRide}>
                <XCircle className="w-4 h-4" /> Cancel
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Available Seats', value: ride.availableSeats },
              { label: 'Confirmed',       value: accepted.length },
              { label: 'Earnings',        value: formatPrice(totalEarnings) },
            ].map(({ label, value }) => (
              <Card key={label} className="p-4 text-center">
                <p className="text-white font-bold text-xl">{value}</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </Card>
            ))}
          </div>

          {/* Pending Requests */}
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Pending Requests ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((booking: any) => (
                  <Card key={booking.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar name={booking.passenger?.name || '?'} src={booking.passenger?.profileImage} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{booking.passenger?.name}</p>
                        <p className="text-white/40 text-sm">{booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''} · {formatPrice(booking.totalAmount)}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`text-xs ${i < Math.round(booking.passenger?.rating || 0) ? 'text-[#00C853]' : 'text-white/10'}`}>★</span>
                          ))}
                          <span className="text-white/30 text-xs ml-0.5">{booking.passenger?.rating || '—'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => handleStatus(booking.id, 'accepted')}>Accept</Button>
                        <Button size="sm" variant="danger" onClick={() => handleStatus(booking.id, 'rejected')}>Decline</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Passengers */}
          <div>
            <h2 className="text-white font-semibold mb-3">
              Confirmed Passengers ({accepted.length})
            </h2>
            {accepted.length === 0 ? (
              <EmptyState
                icon={<Users className="w-10 h-10" />}
                title="No confirmed passengers yet"
                description="Booking requests will appear above when passengers search for this route."
              />
            ) : (
              <div className="space-y-3">
                {accepted.map((booking: any) => (
                  <Card key={booking.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar name={booking.passenger?.name || '?'} src={booking.passenger?.profileImage} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{booking.passenger?.name}</p>
                        <p className="text-white/40 text-sm">
                          {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''} · {formatPrice(booking.totalAmount)}
                        </p>
                      </div>
                      <Link
                        href={`/chat/${ride.id}?receiverId=${booking.passengerId}&receiverName=${encodeURIComponent(booking.passenger?.name || '')}`}
                        className="text-sm text-[#00C853] hover:text-[#00A846] transition-colors">
                        Message →
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
