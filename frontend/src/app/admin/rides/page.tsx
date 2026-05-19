'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Shield, BarChart3, Users, Car, Calendar, MapPin, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/services/api';
import { Badge, Spinner } from '@/components/ui';
import { formatDate, formatPrice } from '@/utils';

export default function AdminRidesPage() {
  const [page, setPage]       = useState(1);
  const [status, setStatus]   = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-rides', status, page],
    queryFn: () => adminApi.getRides({ status: status || undefined, page, limit: 20 }).then(r => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => adminApi.cancelRide(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-rides'] }); toast.success('Ride cancelled'); },
    onError: () => toast.error('Failed to cancel ride'),
  });

  const rides  = data?.data  || [];
  const total  = data?.total || 0;
  const pages  = data?.pages || 1;

  const STATUSES = ['', 'scheduled', 'active', 'completed', 'cancelled'];

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
          <h1 className="text-2xl font-bold text-white">Rides</h1>
          <p className="text-white/40 text-sm mt-0.5">{total} total rides</p>
        </div>

        {/* Status filter */}
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
                  {['Route', 'Rider', 'Date', 'Seats', 'Price', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-4 px-5 text-xs font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="py-20 text-center"><Spinner className="mx-auto" /></td></tr>
                ) : rides.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center text-white/30 text-sm">No rides found</td></tr>
                ) : rides.map((ride: any) => (
                  <tr key={ride.id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col items-center gap-0.5 mt-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                          <div className="w-px h-3 bg-white/10" />
                          <div className="w-1.5 h-1.5 rounded-full border border-white/30" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium truncate max-w-[160px]">{ride.pickupLocation}</p>
                          <p className="text-white/40 text-xs truncate max-w-[160px]">{ride.dropLocation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="text-white/70 text-sm">{ride.rider?.name || '—'}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="text-white/50 text-sm">{formatDate(ride.rideDate)}</p>
                      <p className="text-white/25 text-xs">{ride.rideTime?.slice(0,5)}</p>
                    </td>
                    <td className="py-3.5 px-5 text-white/50 text-sm">{ride.availableSeats}</td>
                    <td className="py-3.5 px-5 text-[#00C853] text-sm font-semibold">{formatPrice(ride.pricePerSeat)}</td>
                    <td className="py-3.5 px-5">
                      <Badge variant={
                        ride.status === 'scheduled' ? 'green' :
                        ride.status === 'active'    ? 'yellow' :
                        ride.status === 'completed' ? 'blue' : 'red'
                      }>
                        {ride.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5">
                      {(ride.status === 'scheduled' || ride.status === 'active') && (
                        <button onClick={() => cancelMutation.mutate(ride.id)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t border-white/[0.04]">
              {Array.from({ length: pages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    page === i + 1 ? 'bg-[#00C853] text-black' : 'text-white/40 hover:bg-white/5'
                  }`}>
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
