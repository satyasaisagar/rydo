'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MessageCircle, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Spinner, EmptyState, Avatar, Card } from '@/components/ui';
import { bookingsApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/utils';

export default function ChatListPage() {
  const { user } = useAuthStore();
  const router   = useRouter();

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  // Get all accepted bookings — each has an associated chat
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['chat-list'],
    queryFn: () => bookingsApi.myBookings().then(r =>
      r.data.filter((b: any) => b.status === 'accepted')
    ),
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white mb-8">Messages</h1>

          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : !bookings?.length ? (
            <EmptyState
              icon={<MessageCircle className="w-14 h-14" />}
              title="No conversations yet"
              description="When your booking is accepted, you'll be able to chat with your driver or passengers here."
            />
          ) : (
            <div className="space-y-2">
              {bookings.map((booking: any) => {
                const ride         = booking.ride;
                const isPassenger  = booking.passengerId === user.id;
                const partner      = isPassenger ? ride?.rider : booking.passenger;
                const receiverId   = isPassenger ? ride?.riderId : booking.passengerId;

                return (
                  <Link
                    key={booking.id}
                    href={`/chat/${booking.rideId}?receiverId=${receiverId}&receiverName=${encodeURIComponent(partner?.name || 'Chat')}`}
                    className="flex items-center gap-4 p-4 bg-[#111111] border border-white/[0.06] rounded-2xl hover:border-[#00C853]/20 transition-all group"
                  >
                    <Avatar name={partner?.name || '?'} src={partner?.profileImage} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{partner?.name || '—'}</p>
                      <p className="text-white/40 text-xs mt-0.5 truncate">
                        {ride?.pickupLocation} → {ride?.dropLocation}
                      </p>
                      <p className="text-white/20 text-xs mt-0.5">{ride?.rideDate ? formatDate(ride.rideDate) : ''}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#00C853] transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
