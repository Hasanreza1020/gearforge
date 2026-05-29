import Link from 'next/link'
import { Zap, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#080B14] border-t border-cyan-500/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.8))' }} />
              <span className="font-['Orbitron'] text-lg font-black text-white tracking-wider">GEARFORGE</span>
            </Link>
            <p className="text-[#5A6478] font-['Rajdhani'] text-sm leading-relaxed max-w-xs">
              The ultimate destination for elite gaming gear. Level up your setup with premium peripherals, accessories, and collectibles.
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { label: 'GitHub', href: '#' },
                { label: 'Twitter', href: '#' },
                { label: 'Discord', href: '#' },
              ].map(({ href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="px-3 py-1.5 border border-white/10 rounded text-[#5A6478] hover:text-cyan-400 hover:border-cyan-400/30 transition-colors text-xs font-['Rajdhani'] font-semibold">
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-['Orbitron'] text-xs font-bold text-[#E8EAF0] uppercase tracking-widest mb-4">Shop</h4>
            <ul className="space-y-2">
              {[
                { href: '/shop', label: 'All Products' },
                { href: '/shop?category=gaming-mice', label: 'Gaming Mice' },
                { href: '/shop?category=keyboards', label: 'Keyboards' },
                { href: '/shop?category=headsets', label: 'Headsets' },
                { href: '/shop?is_featured=true', label: 'Featured' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[#5A6478] hover:text-cyan-400 font-['Rajdhani'] text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-['Orbitron'] text-xs font-bold text-[#E8EAF0] uppercase tracking-widest mb-4">Support</h4>
            <ul className="space-y-2">
              {[
                { href: '/orders', label: 'Track Order' },
                { href: '/account', label: 'My Account' },
                { href: '#', label: 'Shipping Info' },
                { href: '#', label: 'Returns' },
                { href: '#', label: 'Contact Us' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-[#5A6478] hover:text-cyan-400 font-['Rajdhani'] text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#5A6478] font-['Share_Tech_Mono'] text-xs">
            © {new Date().getFullYear()} GEARFORGE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-['Share_Tech_Mono'] text-xs text-[#5A6478]">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
