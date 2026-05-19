'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Shield, Search, CheckCircle, XCircle, UserCheck, BarChart3, Users, Car, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/services/api';
import { Badge, Avatar, Button, Input, Spinner } from '@/components/ui';
import { formatDate } from '@/utils';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => adminApi.getUsers({ search, page, limit: 20 }).then(r => r.data),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User suspended'); },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User activated'); },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => adminApi.verifyUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User verified'); },
  });

  const users = data?.data || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      {/* Sidebar */}
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

      {/* Main */}
      <main className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <p className="text-white/40 text-sm mt-0.5">{total} total users</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search by name or email..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['User', 'Status', 'Role', 'Rating', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left py-4 px-5 text-xs font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-20 text-center"><Spinner className="mx-auto" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="py-20 text-center text-white/30 text-sm">No users found</td></tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} src={u.profileImage} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-white text-sm font-medium">{u.name}</p>
                              {u.isVerified && <CheckCircle className="w-3.5 h-3.5 text-[#00C853] fill-current" />}
                            </div>
                            <p className="text-white/30 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant={u.status === 'active' ? 'green' : u.status === 'suspended' ? 'red' : 'yellow'}>
                          {u.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-sm text-white/50 capitalize">{u.role}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-sm text-white/50">{u.rating > 0 ? u.rating : '—'}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-xs text-white/30">{formatDate(u.createdAt)}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          {!u.isVerified && (
                            <button onClick={() => verifyMutation.mutate(u.id)}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" /> Verify
                            </button>
                          )}
                          {u.status === 'active' ? (
                            <button onClick={() => suspendMutation.mutate(u.id)}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors">
                              Suspend
                            </button>
                          ) : (
                            <button onClick={() => activateMutation.mutate(u.id)}
                              className="text-xs text-[#00C853] hover:text-[#00A846] transition-colors">
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
