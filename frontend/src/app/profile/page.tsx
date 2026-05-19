'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Camera, Car, Plus, LogOut, Shield, Star, Edit2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import { Button, Avatar, Badge, StarRating, Card, Input, Select, Skeleton } from '@/components/ui';
import { useProfile, useUpdateProfile, useVehicles, useUserRatings } from '@/hooks';
import { useAuthStore } from '@/store/authStore';
import { formatDate, getApiErrorMessage } from '@/utils';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  const { data: profile, isLoading }      = useProfile();
  const { data: vehicles }                = useVehicles();
  const { data: ratingsData }             = useUserRatings(user?.id || '');
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    values: {
      name:  profile?.name || '',
      bio:   profile?.bio  || '',
      gender: profile?.gender || '',
    },
  });

  const onSave = async (data: any) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto py-8">

          {/* Profile header */}
          <Card className="p-6 mb-5">
            {isLoading ? (
              <div className="flex items-center gap-5">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-5">
                <div className="relative">
                  <Avatar name={profile?.name || ''} src={profile?.profileImage} size="xl" />
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#00C853] rounded-full flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5 text-black" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-white">{profile?.name}</h1>
                    {profile?.isVerified && (
                      <CheckCircle className="w-5 h-5 text-[#00C853] fill-current" />
                    )}
                  </div>
                  <p className="text-white/40 text-sm mb-2">{profile?.email}</p>
                  <StarRating rating={profile?.rating || 0} size="md" />
                  {profile?.bio && <p className="text-white/50 text-sm mt-2 leading-relaxed">{profile.bio}</p>}
                </div>

                <button onClick={() => setEditing(!editing)}
                  className="text-white/30 hover:text-white transition-colors flex-shrink-0">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Edit form */}
            {editing && (
              <form onSubmit={handleSubmit(onSave)} className="mt-6 pt-6 border-t border-white/[0.06] space-y-4">
                <Input label="Full name" {...register('name', { required: true })} />
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Bio</label>
                  <textarea rows={2} {...register('bio')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853]/30 transition-all resize-none" />
                </div>
                <Select label="Gender" {...register('gender')}
                  options={[{ value: '', label: 'Prefer not to say' }, { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" loading={isPending} className="flex-1">Save</Button>
                </div>
              </form>
            )}
          </Card>

          {/* Vehicles */}
          <Card className="p-6 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">My Vehicles</h2>
              <button className="flex items-center gap-1.5 text-sm text-[#00C853] hover:text-[#00A846] transition-colors">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {!vehicles?.length ? (
              <p className="text-white/30 text-sm">No vehicles added yet.</p>
            ) : (
              <div className="space-y-3">
                {vehicles.map((v: any) => (
                  <div key={v.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                      <Car className="w-4 h-4 text-white/40" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{v.brand} {v.model}</p>
                      <p className="text-white/30 text-xs">{v.color} · {v.registrationNumber}</p>
                    </div>
                    <span className="text-xs text-white/30">{v.seatCapacity} seats</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent reviews */}
          <Card className="p-6 mb-5">
            <h2 className="text-white font-semibold mb-4">
              Reviews <span className="text-white/30 font-normal text-sm ml-1">({ratingsData?.total || 0})</span>
            </h2>
            {!ratingsData?.data?.length ? (
              <p className="text-white/30 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {ratingsData.data.slice(0, 5).map((r: any) => (
                  <div key={r.id} className="border-b border-white/[0.04] pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={r.reviewer?.name || '?'} size="sm" />
                        <span className="text-white text-sm font-medium">{r.reviewer?.name}</span>
                      </div>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    {r.review && <p className="text-white/50 text-sm leading-relaxed">{r.review}</p>}
                    <p className="text-white/20 text-xs mt-1">{formatDate(r.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Danger zone */}
          <Card className="p-6">
            <h2 className="text-white font-semibold mb-4">Account</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
                <Shield className="w-4 h-4" /> Privacy & Security
              </button>
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="w-full flex items-center gap-3 py-2.5 text-sm text-red-400 hover:text-red-300 transition-colors">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
