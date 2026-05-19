import Link from 'next/link';
import { Car, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-[#00C853] rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-black" />
              </div>
              <span className="text-white font-bold text-xl">rydo</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              India's smarter way to share rides. Save money, reduce congestion, connect people.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 border border-white/[0.08] rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { heading: 'Product', links: [['Find Rides', '/rides/search'], ['Offer Ride', '/rides/offer'], ['How it Works', '/#how'], ['Mobile App', '/app']] },
            { heading: 'Company',  links: [['About', '/about'], ['Careers', '/careers'], ['Blog', '/blog'], ['Press', '/press']] },
            { heading: 'Support',  links: [['Help Center', '/help'], ['Contact', '/contact'], ['Safety', '/safety'], ['FAQ', '/faq']] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-white text-sm font-semibold mb-4">{heading}</h4>
              <ul className="space-y-3">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-white/40 hover:text-white text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <p>© {new Date().getFullYear()} Rydo Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-white/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
