'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Zap, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0D1117] border-r border-cyan-500/10 z-30 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-cyan-500/10">
        <Link href="/admin" className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.8))' }} />
          <div>
            <p className="font-['Orbitron'] text-sm font-black text-white tracking-wider">GEARFORGE</p>
            <p className="font-['Share_Tech_Mono'] text-[#5A6478] text-[10px]">COMMAND CENTER</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                isActive
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                  : 'text-[#5A6478] hover:text-[#E8EAF0] hover:bg-white/5'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-cyan-400' : 'text-[#5A6478] group-hover:text-[#E8EAF0]')} />
              <span className="font-['Rajdhani'] font-semibold text-sm uppercase tracking-wider">{label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-cyan-500/10 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#5A6478] hover:text-[#E8EAF0] hover:bg-white/5 transition-all"
        >
          <Zap className="w-4 h-4" />
          <span className="font-['Rajdhani'] font-semibold text-sm uppercase tracking-wider">Store Front</span>
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#5A6478] hover:text-[#FF3E6C] hover:bg-[#FF3E6C]/5 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-['Rajdhani'] font-semibold text-sm uppercase tracking-wider">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
