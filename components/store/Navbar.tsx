'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Search, Heart, User, Menu, X, Zap, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/shop', label: 'All' },
  { href: '/shop?category=consoles', label: 'Consoles' },
  { href: '/shop?category=controllers', label: 'Controllers' },
  { href: '/shop?category=retro-games', label: 'Retro' },
  { href: '/shop?category=headphones', label: 'Headphones' },
  { href: '/shop?category=cds', label: "CD's" },
  { href: '/shop?category=collectibles', label: 'Collectibles' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const itemCount = useCartStore((s) => s.getItemCount())
  const toggleCart = useCartStore((s) => s.toggleCart)
  const { isSearchOpen, toggleSearch, isMobileMenuOpen, openMobileMenu, closeMobileMenu } = useUIStore()
  const { user, profile, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-[#080B14]/98 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_20px_rgba(0,245,255,0.1)]'
            : 'bg-[#080B14]/95 backdrop-blur-md'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Zap
                className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.8))' }}
              />
              <div className="flex flex-col leading-none">
                <span
                  className="font-['Orbitron'] text-lg font-black text-white tracking-wider group-hover:text-cyan-400 transition-colors"
                  style={{ textShadow: '0 0 20px rgba(0,245,255,0.3)' }}
                >
                  THE PLAYERS
                </span>
                <span className="font-['Share_Tech_Mono'] text-[9px] text-cyan-400/70 tracking-widest">UAE</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "font-['Rajdhani'] font-semibold text-sm uppercase tracking-wider transition-colors duration-200",
                    pathname === link.href
                      ? 'text-cyan-400'
                      : 'text-[#5A6478] hover:text-[#E8EAF0]'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Icons — always visible */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={toggleSearch}
                className="p-2 text-[#5A6478] hover:text-cyan-400 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist — always visible; guests go to login */}
              <Link
                href={user ? '/account' : '/login'}
                className="p-2 text-[#5A6478] hover:text-[#FF3E6C] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart — always visible */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-[#5A6478] hover:text-cyan-400 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 text-[#080B14] text-[10px] font-black rounded-full flex items-center justify-center"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </button>

              {/* Profile — always visible */}
              {user ? (
                <div className="relative group">
                  <button
                    className="flex items-center gap-1.5 p-2 text-[#5A6478] hover:text-cyan-400 transition-colors"
                    aria-label="Account"
                  >
                    <User className="w-5 h-5" />
                    {profile?.level && (
                      <span className="hidden sm:block font-['Share_Tech_Mono'] text-[10px] text-[#FFD700]">
                        {profile.level}
                      </span>
                    )}
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#0D1117] border border-cyan-500/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2.5 border-b border-white/5">
                      <p className="text-xs font-['Rajdhani'] font-bold text-[#E8EAF0] truncate">{profile?.full_name ?? 'Player'}</p>
                      <p className="text-[10px] font-['Share_Tech_Mono'] text-[#5A6478] truncate">{profile?.email}</p>
                    </div>
                    <Link href="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#E8EAF0] hover:text-cyan-400 hover:bg-cyan-400/5 transition-colors">
                      <User className="w-4 h-4" /> My Account
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#E8EAF0] hover:text-cyan-400 hover:bg-cyan-400/5 transition-colors">
                      <ShoppingCart className="w-4 h-4" /> My Orders
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#FFD700] hover:bg-[#FFD700]/5 transition-colors">
                        ⚡ Admin Panel
                      </Link>
                    )}
                    <hr className="border-white/10 my-1" />
                    <button
                      onClick={signOut}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#FF3E6C] hover:bg-[#FF3E6C]/5 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-[#5A6478] hover:text-cyan-400 transition-colors"
                  aria-label="Login"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Hamburger — mobile only */}
              <button
                className="lg:hidden p-2 text-[#5A6478] hover:text-[#E8EAF0] transition-colors ml-1"
                onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="py-3 pb-4">
                  <input
                    autoFocus
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`
                      }
                    }}
                    placeholder="Search products..."
                    className="w-full bg-[#0D1117] border border-cyan-500/30 rounded-lg px-4 py-2.5 text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400 transition-colors font-['Rajdhani']"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden bg-[#0D1117] border-t border-cyan-500/10"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="block px-3 py-2.5 text-[#E8EAF0] hover:text-cyan-400 hover:bg-cyan-400/5 rounded-lg font-['Rajdhani'] font-semibold uppercase tracking-wider text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2.5 text-cyan-400 hover:bg-cyan-400/5 rounded-lg font-['Rajdhani'] font-semibold uppercase tracking-wider text-sm transition-colors"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
