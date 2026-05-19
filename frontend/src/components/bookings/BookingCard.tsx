import Link from 'next/link';
import { MapPin, Calendar, Clock, Users, ChevronRight } from 'lucide-react';
import type { Booking } from '@/types';
import { Badge } from '@/components/ui';
import { bookingStatusConfig, formatDate, formatPrice } from '@/utils';

interface BookingCardProps {
  booking: Booking;
  onUpdateStatus?: (id: string, status: string) => void;
  isRider?: boolean;
}

export function BookingCard({ booking, onUpdateStatus, isRider }: BookingCardProps) {
  const config = bookingStatusConfig[booking.status];

  return (
    <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
      {/* Route */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-2 h-2 rounded-full bg-[#00C853]" />
            <div className="w-px h-8 bg-white/10" />
            <div className="w-2 h-2 rounded-full border-2 border-white/30" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{booking.ride?.pickupLocation}</p>
            <p className="text-white/50 text-sm mt-2">{booking.ride?.dropLocation}</p>
          </div>
        </div>
        <Badge variant={
          booking.status === 'accepted'  ? 'green' :
          booking.status === 'pending'   ? 'yellow' :
          booking.status === 'completed' ? 'blue' : 'red'
        }>
          {config?.label}
        </Badge>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {booking.ride?.rideDate ? formatDate(booking.ride.rideDate) : '—'}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {booking.ride?.rideTime?.slice(0, 5) || '—'}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}
        </span>
        <span className="font-semibold text-[#00C853]">
          {formatPrice(booking.totalAmount)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.04]">
        <Link href={`/rides/${booking.rideId}`}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors">
          View ride <ChevronRight className="w-3 h-3" />
        </Link>

        {isRider && booking.status === 'pending' && onUpdateStatus && (
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => onUpdateStatus(booking.id, 'rejected')}
              className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all">
              Decline
            </button>
            <button onClick={() => onUpdateStatus(booking.id, 'accepted')}
              className="text-xs text-black bg-[#00C853] hover:bg-[#00A846] px-3 py-1.5 rounded-lg font-semibold transition-all">
              Accept
            </button>
          </div>
        )}

        {!isRider && booking.status === 'pending' && onUpdateStatus && (
          <button onClick={() => onUpdateStatus(booking.id, 'cancelled')}
            className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors">
            Cancel
          </button>
        )}

        {booking.status === 'accepted' && (
          <Link href={`/chat/${booking.rideId}?receiverId=${isRider ? booking.passengerId : booking.ride?.riderId}`}
            className="ml-auto text-xs text-[#00C853] hover:text-[#00A846] transition-colors">
            Message →
          </Link>
        )}
      </div>
    </div>
  );
}
