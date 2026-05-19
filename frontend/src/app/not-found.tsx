import Link from 'next/link';
import { Car } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#00C853]/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Car className="w-10 h-10 text-[#00C853]" />
        </div>
        <p className="text-[#00C853] font-mono text-sm mb-3 tracking-widest">404</p>
        <h1 className="text-3xl font-bold text-white mb-4">Page not found</h1>
        <p className="text-white/40 mb-10">
          Looks like this road doesn't exist. Let's get you back on track.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/"
            className="bg-[#00C853] hover:bg-[#00A846] text-black font-semibold px-6 py-3 rounded-xl transition-colors">
            Go Home
          </Link>
          <Link href="/rides/search"
            className="border border-white/10 text-white/70 hover:text-white px-6 py-3 rounded-xl transition-colors">
            Find a Ride
          </Link>
        </div>
      </div>
    </div>
  );
}
