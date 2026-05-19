import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  ridesApi, bookingsApi, usersApi,
  chatApi, notificationsApi, ratingsApi,
} from '@/services/api';
import type { SearchRideParams } from '@/types';

// ─── Auth ─────────────────────────────────────────────────
export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

// ─── Rides ────────────────────────────────────────────────
export function useRideSearch(params: SearchRideParams) {
  return useQuery({
    queryKey: ['rides', 'search', params],
    queryFn: () => ridesApi.search(params).then((r) => r.data),
    enabled: !!(params.pickup || params.drop || params.date),
    staleTime: 30_000,
  });
}

export function useRide(id: string) {
  return useQuery({
    queryKey: ['rides', id],
    queryFn: () => ridesApi.getOne(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useMyRides() {
  return useQuery({
    queryKey: ['rides', 'mine'],
    queryFn: () => ridesApi.myRides().then((r) => r.data),
  });
}

export function useCreateRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => ridesApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rides', 'mine'] }),
  });
}

export function useCancelRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ridesApi.cancel(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rides', 'mine'] });
    },
  });
}

// ─── Bookings ─────────────────────────────────────────────
export function useMyBookings() {
  return useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: () => bookingsApi.myBookings().then((r) => r.data),
  });
}

export function useRideBookings(rideId: string) {
  return useQuery({
    queryKey: ['bookings', 'ride', rideId],
    queryFn: () => bookingsApi.rideBookings(rideId).then((r) => r.data),
    enabled: !!rideId,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { rideId: string; seatsBooked: number }) =>
      bookingsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      bookingsApi.updateStatus(id, { status, reason }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['rides'] });
    },
  });
}

// ─── Profile ──────────────────────────────────────────────
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.profile().then((r) => r.data),
  });
}

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => usersApi.publicProfile(userId).then((r) => r.data),
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => usersApi.updateProfile(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => usersApi.getVehicles().then((r) => r.data),
  });
}

// ─── Chat ─────────────────────────────────────────────────
export function useChatMessages(rideId: string, page = 1) {
  return useQuery({
    queryKey: ['chat', rideId, page],
    queryFn: () => chatApi.getMessages(rideId, page).then((r) => r.data),
    enabled: !!rideId,
    refetchInterval: false,
  });
}

// ─── Notifications ────────────────────────────────────────
export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.getAll(page).then((r) => r.data),
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ─── Ratings ──────────────────────────────────────────────
export function useUserRatings(userId: string) {
  return useQuery({
    queryKey: ['ratings', userId],
    queryFn: () => ratingsApi.getUserRatings(userId).then((r) => r.data),
    enabled: !!userId,
  });
}

export function useCreateRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => ratingsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ratings'] }),
  });
}
