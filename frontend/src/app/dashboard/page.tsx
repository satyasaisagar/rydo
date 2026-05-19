'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Car, MapPin, Calendar, Bell, MessageCircle, Star, Plus, ChevronRight, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import { bookingsApi, ridesApi, notificationsApi } from '@/services/api';

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-500/10 text-yellow-400',
  accepted:  'bg-[#00C853]/10 text-[#00C853]',
  rejected:  'bg-red-500/10 text-red-400',
  cancelled: 'bg-red-500/10 text-red-400',
  completed: 'bg-blue-500/10 text-blue-400',
  scheduled: 'bg-[#00C853]/10 text-[#00C853]',
  active:    'bg-yellow-500/10 text-yellow-400',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  const { data: bookingsData }      = useQuery({ queryKey: ['my-bookings'], queryFn: () => bookingsApi.myBookings().then(r => r.data) });
  const { data: ridesData }         = useQuery({ queryKey: ['my-rides'], queryFn: () => ridesApi.myRides().then(r => r.data) });
  const { data: notificationsData } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsApi.getAll().then(r => r.data) });

  const recentBookings = bookingsData?.slice(0, 3) || [];
  const recentRides    = ridesData?.slice(0, 3) || [];
  const unreadNotifs   = notificationsData?.data?.filter((n: any) => !n.isRead).length || 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-10 pt-6">
            <div>
              <p className="text-white/40 text-sm mb-1">Good {getGreeting()},</p>
              <h1 className="text-3xl font-bold text-white">{user.name?.split(' ')[0]} 👋</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/notifications" className="relative w-10 h-10 flex items-center justify-center bg-white/5 border border-white/[0.06] rounded-xl text-white/60 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00C853] text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Plus,        label: 'Offer Ride',    href: '/rides/offer',   color: 'bg-[#00C853] text-black' },
              { icon: MapPin,      label: 'Find Ride',     href: '/rides/search',  color: 'bg-white/5 text-white border border-white/10' },
              { icon: MessageCircle, label: 'Messages',    href: '/chat',          color: 'bg-white/5 text-white border border-white/10' },
              { icon: Star,        label: 'My Reviews',    href: '/profile/reviews', color: 'bg-white/5 text-white border border-white/10' },
            ].map(({ icon: Icon, label, href, color }) => (
              <Link key={href} href={href}
                className={`flex flex-col items-center gap-2 rounded-2xl p-5 text-sm font-semibold transition-all hover:scale-[1.02] ${color}`}>
                <Icon className="w-6 h-6" />
                {label}
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Bookings */}
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold">My Bookings</h2>
                <Link href="/bookings" className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-sm">
                  No bookings yet. <Link href="/rides/search" className="text-[#00C853]">Find a ride →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium">
                          {booking.ride?.pickupLocation} → {booking.ride?.dropLocation}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-white/30">
                          <Clock className="w-3 h-3" />
                          <span>{booking.ride?.rideDate}</span>
                        </div>
                      </div>
                      <span className={`rydo-badge text-xs ${statusColors[booking.status] || 'bg-white/5 text-white/40'}`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Rides */}
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold">Rides I'm Offering</h2>
                <Link href="/rides/my" className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {recentRides.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-sm">
                  Not offering any rides. <Link href="/rides/offer" className="text-[#00C853]">Offer one →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRides.map((ride: any) => (
                    <Link key={ride.id} href={`/rides/${ride.id}/manage`}
                      className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 hover:opacity-80 transition-opacity">
                      <div>
                        <p className="text-white text-sm font-medium">
                          {ride.pickupLocation} → {ride.dropLocation}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-white/30">
                          <Calendar className="w-3 h-3" />
                          <span>{ride.rideDate} · {ride.rideTime?.slice(0, 5)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`rydo-badge text-xs ${statusColors[ride.status] || 'bg-white/5 text-white/40'}`}>
                          {ride.status}
                        </span>
                        <p className="text-[#00C853] text-xs font-semibold mt-1">₹{ride.pricePerSeat}/seat</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
