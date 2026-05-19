'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Shield, BarChart3, Users, Car, Calendar } from 'lucide-react';
import { adminApi } from '@/services/api';
import { Badge, Spinner } from '@/components/ui';
import { formatDate, formatPrice, bookingStatusConfig } from '@/utils';
import type { BookingStatus } from '@/types';

export default function AdminBookingsPage() {
  const [page, setPage]   = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', status, page],
    queryFn: () => adminApi.getBookings({ status: status || undefined, page, limit: 20 }).then(r => r.data),
  });

  const bookings = data?.data  || [];
  const total    = data?.total || 0;
  const pages    = data?.pages || 1;

  const STATUSES = ['', 'pending', 'accepted', 'rejected', 'cancelled', 'completed'];

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <aside className="fixed left-0 top-0 h-full w-56 bg-[#111111] border-r border-white/[0.06] flex flex-col py-6 px-3 z-40">
        <div className="flex items-center gap-2 px-3 mb-8">
          <div className="w-7 h-7 bg-[#00C853] rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-black" />
          </div>
          <span className="text-white font-bold text-sm">Rydo Admin</span>
        </div>
        <nav className="space-y-1">
          {[
            { href: '/admin',          icon: BarChart3, label: 'Dashboard' },
            { href: '/admin/users',    icon: Users,     label: 'Users' },
            { href: '/admin/rides',    icon: Car,       label: 'Rides' },
            { href: '/admin/bookings', icon: Calendar,  label: 'Bookings' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-white/40 text-sm mt-0.5">{total} total bookings</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                status === s ? 'bg-[#00C853] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Route', 'Passenger', 'Driver', 'Seats', 'Amount', 'Date', 'Status'].map(h => (
                    <th key={h} className="text-left py-4 px-4 text-xs font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="py-20 text-center"><Spinner className="mx-auto" /></td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center text-white/30 text-sm">No bookings found</td></tr>
                ) : bookings.map((b: any) => {
                  const cfg = bookingStatusConfig[b.status as BookingStatus];
                  return (
                    <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="text-white text-sm font-medium truncate max-w-[140px]">{b.ride?.pickupLocation} → {b.ride?.dropLocation}</p>
                      </td>
                      <td className="py-3.5 px-4 text-white/70 text-sm">{b.passenger?.name || '—'}</td>
                      <td className="py-3.5 px-4 text-white/50 text-sm">{b.ride?.rider?.name || '—'}</td>
                      <td className="py-3.5 px-4 text-white/50 text-sm">{b.seatsBooked}</td>
                      <td className="py-3.5 px-4 text-[#00C853] text-sm font-semibold">{formatPrice(b.totalAmount)}</td>
                      <td className="py-3.5 px-4 text-white/30 text-xs">{formatDate(b.createdAt)}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={
                          b.status === 'accepted'  ? 'green'  :
                          b.status === 'pending'   ? 'yellow' :
                          b.status === 'completed' ? 'blue'   : 'red'
                        }>
                          {cfg?.label || b.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t border-white/[0.04]">
              {Array.from({ length: pages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === i + 1 ? 'bg-[#00C853] text-black' : 'text-white/40 hover:bg-white/5'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
