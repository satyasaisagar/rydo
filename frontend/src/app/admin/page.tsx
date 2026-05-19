'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Car, Calendar, TrendingUp, Shield, BarChart3, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (user.role !== 'admin') router.push('/dashboard');
  }, [user, router]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard().then(r => r.data),
  });

  const { data: usersData }    = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.getUsers({ limit: 5 }).then(r => r.data) });
  const { data: ridesData }    = useQuery({ queryKey: ['admin-rides'], queryFn: () => adminApi.getRides({ limit: 5 }).then(r => r.data) });

  if (!user || user.role !== 'admin') return null;

  const statCards = [
    { label: 'Total Users',     value: stats?.totalUsers,     icon: Users,       color: 'text-blue-400',   bg: 'bg-blue-400/10' },
    { label: 'Total Rides',     value: stats?.totalRides,     icon: Car,         color: 'text-[#00C853]',  bg: 'bg-[#00C853]/10' },
    { label: 'Total Bookings',  value: stats?.totalBookings,  icon: Calendar,    color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Revenue',         value: `₹${(stats?.revenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Admin Sidebar Nav */}
      <div className="flex">
        <aside className="fixed left-0 top-0 h-full w-60 bg-[#111111] border-r border-white/[0.06] z-40 flex flex-col py-6 px-4">
          <div className="flex items-center gap-2.5 px-2 mb-10">
            <div className="w-8 h-8 bg-[#00C853] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Rydo Admin</p>
              <p className="text-white/30 text-xs">CRM Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { href: '/admin',          label: 'Dashboard',  icon: BarChart3 },
              { href: '/admin/users',    label: 'Users',      icon: Users },
              { href: '/admin/rides',    label: 'Rides',      icon: Car },
              { href: '/admin/bookings', label: 'Bookings',   icon: Calendar },
              { href: '/admin/reports',  label: 'Reports',    icon: AlertCircle },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <Link href="/dashboard" className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 px-3 py-2 transition-colors">
              ← Back to app
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-60 flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Platform overview and analytics</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-white mb-1">{isLoading ? '—' : value}</p>
                <p className="text-sm text-white/40">{label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily rides chart */}
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-6">Daily Rides (7 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.dailyRides || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en', { weekday: 'short' })} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} />
                  <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#00C853" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Key metrics */}
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-6">Key Metrics</h3>
              <div className="space-y-4">
                {[
                  { label: 'Ride completion rate', value: stats?.completionRate || '—', icon: CheckCircle, color: 'text-[#00C853]' },
                  { label: 'Active rides now',      value: stats?.activeRides || 0,     icon: Car,         color: 'text-yellow-400' },
                  { label: 'Completed rides',       value: stats?.completedRides || 0,  icon: CheckCircle, color: 'text-blue-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm text-white/60">{label}</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent users table */}
          <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">Recent Users</h3>
              <Link href="/admin/users" className="text-xs text-[#00C853] hover:text-[#00A846]">View all →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/30 text-xs">
                    <th className="text-left pb-3 font-medium">Name</th>
                    <th className="text-left pb-3 font-medium">Email</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Rating</th>
                    <th className="text-left pb-3 font-medium">Joined</th>
                    <th className="text-left pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData?.data?.map((u: any) => (
                    <tr key={u.id} className="border-t border-white/[0.04]">
                      <td className="py-3 text-white font-medium">{u.name}</td>
                      <td className="py-3 text-white/50">{u.email}</td>
                      <td className="py-3">
                        <span className={`rydo-badge text-xs ${
                          u.status === 'active' ? 'bg-[#00C853]/10 text-[#00C853]' :
                          u.status === 'suspended' ? 'bg-red-500/10 text-red-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>{u.status}</span>
                      </td>
                      <td className="py-3 text-white/60">{u.rating || '—'}</td>
                      <td className="py-3 text-white/30 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {u.status === 'active' ? (
                            <button className="text-xs text-red-400 hover:text-red-300">Suspend</button>
                          ) : (
                            <button className="text-xs text-[#00C853] hover:text-[#00A846]">Activate</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
