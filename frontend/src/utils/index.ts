import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { BookingStatus } from '@/types';

// ─── Class Names ──────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date Helpers ─────────────────────────────────────────
export function formatDate(date: string | Date, fmt = 'dd MMM yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatTime(time: string) {
  if (!time) return '';
  return time.slice(0, 5); // HH:MM
}

export function formatRelative(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDateTime(date: string, time?: string) {
  const d = parseISO(date);
  const dateStr = format(d, 'EEE, dd MMM');
  return time ? `${dateStr} at ${formatTime(time)}` : dateStr;
}

// ─── Price Helpers ────────────────────────────────────────
export function formatPrice(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ─── Status Helpers ───────────────────────────────────────
export const bookingStatusConfig: Record<BookingStatus, { label: string; classes: string }> = {
  pending:   { label: 'Pending',   classes: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
  accepted:  { label: 'Confirmed', classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  rejected:  { label: 'Rejected',  classes: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  cancelled: { label: 'Cancelled', classes: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' },
  completed: { label: 'Completed', classes: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
};

export const rideStatusConfig = {
  scheduled: { label: 'Scheduled', classes: 'bg-emerald-500/10 text-emerald-400' },
  active:    { label: 'Active',    classes: 'bg-yellow-500/10 text-yellow-400' },
  completed: { label: 'Completed', classes: 'bg-blue-500/10 text-blue-400' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-500/10 text-red-400' },
};

// ─── String Helpers ───────────────────────────────────────
export function initials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function truncate(str: string, maxLen: number) {
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}

// ─── Error Helpers ────────────────────────────────────────
export function getApiErrorMessage(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}

// ─── Greeting ────────────────────────────────────────────
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Validation ───────────────────────────────────────────
export function isValidPhone(phone: string) {
  return /^[+]?[\d\s\-()]{10,15}$/.test(phone);
}
