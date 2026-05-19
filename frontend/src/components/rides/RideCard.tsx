import Link from 'next/link';
import { Star, Users, Wind, Music, PawPrint, Package, Car } from 'lucide-react';
import type { Ride } from '@/types';
import { Avatar, Badge } from '@/components/ui';
import { formatDateTime, formatPrice } from '@/utils';

interface RideCardProps {
  ride: Ride;
  compact?: boolean;
}

export function RideCard({ ride, compact }: RideCardProps) {
  const preferences = [
    ride.acAvailable    && { icon: Wind,     label: 'AC' },
    ride.musicAllowed   && { icon: Music,    label: 'Music' },
    ride.petsAllowed    && { icon: PawPrint, label: 'Pets' },
    ride.luggageAllowed && { icon: Package,  label: 'Luggage' },
  ].filter(Boolean) as { icon: any; label: string }[];

  return (
    <Link href={`/rides/${ride.id}`}
      className="block bg-[#111111] border border-white/[0.06] rounded-2xl p-5 hover:border-[#00C853]/25 transition-all group">
      <div className="flex items-start gap-4">
        {/* Route timeline */}
        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00C853]" />
          <div className="w-px h-10 bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full border-2 border-white/30" />
        </div>

        {/* Route info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-white font-semibold truncate">{ride.pickupLocation}</span>
            <span className="text-white/30 text-sm shrink-0">{ride.rideTime?.slice(0, 5)}</span>
          </div>
          <p className="text-white/50 text-sm truncate">{ride.dropLocation}</p>

          {!compact && (
            <>
              {/* Rider */}
              <div className="flex items-center gap-2.5 mt-4">
                <Avatar name={ride.rider?.name || '?'} src={ride.rider?.profileImage} size="sm" />
                <div>
                  <p className="text-sm text-white font-medium leading-none">{ride.rider?.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-[#00C853] fill-current" />
                    <span className="text-xs text-white/40">{ride.rider?.rating || '—'}</span>
                    {ride.rider?.isVerified && (
                      <Badge variant="green" className="text-[10px] py-0 px-1.5">Verified</Badge>
                    )}
                  </div>
                </div>
                {ride.vehicle && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-white/30">
                    <Car className="w-3 h-3" />
                    {ride.vehicle.brand} {ride.vehicle.model}
                  </span>
                )}
              </div>

              {/* Preferences */}
              {preferences.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {preferences.map(({ icon: Icon, label }) => (
                    <span key={label} className="inline-flex items-center gap-1 text-xs text-white/40 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
                      <Icon className="w-3 h-3" /> {label}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <p className="text-[#00C853] font-bold text-xl">{formatPrice(ride.pricePerSeat)}</p>
          <p className="text-white/30 text-xs mb-2">per seat</p>
          <div className="flex items-center gap-1 justify-end text-xs text-white/40">
            <Users className="w-3 h-3" />
            <span>{ride.availableSeats}</span>
          </div>
        </div>
      </div>

      {compact && (
        <p className="text-xs text-white/30 mt-3">
          {formatDateTime(ride.rideDate, ride.rideTime)}
        </p>
      )}
    </Link>
  );
}
