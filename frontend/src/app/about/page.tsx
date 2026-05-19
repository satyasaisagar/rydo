import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Zap, Users, MapPin } from 'lucide-react';

export const metadata = { title: 'About — Rydo' };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-20">
            <p className="text-[#00C853] text-sm font-semibold uppercase tracking-wider mb-3">Our Story</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Making every commute<br />
              <span className="text-[#00C853]">smarter and greener.</span>
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
              Rydo was founded with a simple belief: millions of cars travel the same routes every day with empty seats.
              We connect drivers with passengers to make journeys affordable, social, and sustainable.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">
            {[
              { icon: Shield, title: 'Safety First',      desc: 'Every user is verified. Ratings and reviews build a trustworthy community where everyone feels safe.' },
              { icon: Users,  title: 'Community Driven',  desc: 'We\'re built on real connections between real people. Every ride is a chance to meet someone new.' },
              { icon: Zap,    title: 'Simple & Fast',      desc: 'Search, book, travel. Our platform is designed to get you on the road in minutes.' },
              { icon: MapPin, title: 'City Focused',       desc: 'Rydo is designed specifically for Indian cities and intercity routes — built for how we actually travel.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#111111] border border-white/[0.06] rounded-2xl p-7">
                <div className="w-11 h-11 bg-[#00C853]/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-[#00C853]" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-[#00C853]/10 to-transparent border border-[#00C853]/15 rounded-3xl p-10">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[['50K+', 'Happy Riders'], ['200K+', 'Rides Completed'], ['4.8★', 'Average Rating']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-[#00C853] font-bold text-3xl mb-1">{val}</p>
                  <p className="text-white/40 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
