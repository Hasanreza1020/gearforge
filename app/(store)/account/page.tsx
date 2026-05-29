'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import LoadingScanner from '@/components/ui/LoadingScanner'
import { getLevelProgress } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'

const LEVEL_COLORS: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2',
  Elite: '#00F5FF',
}

export default function AccountPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/account')
  }, [loading, user, router])

  if (loading || !profile) return <LoadingScanner fullScreen message="LOADING PROFILE" />

  const progress = getLevelProgress(profile.xp_points ?? 0)
  const levelColor = LEVEL_COLORS[profile.level ?? 'Bronze'] ?? '#CD7F32'

  const achievementsMap: Record<string, { title: string; description: string; icon: string }> = {
    first_blood: { title: 'First Blood', description: 'Made your first purchase', icon: '🩸' },
    high_roller: { title: 'High Roller', description: 'Placed an order over $200', icon: '💰' },
    veteran: { title: 'Veteran', description: 'Completed 10+ orders', icon: '⭐' },
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0] mb-8">MY PROFILE</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6 text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold border-2"
              style={{ borderColor: levelColor, boxShadow: `0 0 20px ${levelColor}40` }}
            >
              {profile.full_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <h2 className="font-['Orbitron'] text-lg font-bold text-[#E8EAF0]">{profile.full_name ?? 'Player'}</h2>
            <p className="text-[#5A6478] font-['Rajdhani'] text-sm mb-3">{profile.email}</p>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold font-['Orbitron'] tracking-wider"
              style={{ color: levelColor, background: `${levelColor}20`, border: `1px solid ${levelColor}40` }}
            >
              {profile.level?.toUpperCase() ?? 'BRONZE'}
            </span>

            {/* XP Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] font-['Share_Tech_Mono'] text-[#5A6478] mb-1">
                <span>{(profile.xp_points ?? 0).toLocaleString()} XP</span>
                <span>{progress.next === progress.current ? 'MAX' : `${progress.next.toLocaleString()} XP`}</span>
              </div>
              <div className="h-2 bg-[#080B14] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress.progress}%`, background: `linear-gradient(90deg, ${levelColor}, ${levelColor}88)`, boxShadow: `0 0 8px ${levelColor}60` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 text-center">
              <div className="bg-[#080B14] rounded-lg p-3">
                <p className="font-['Share_Tech_Mono'] text-[#E8EAF0] text-lg font-bold">{profile.total_orders ?? 0}</p>
                <p className="text-[#5A6478] text-[10px] font-['Rajdhani'] uppercase tracking-wider">Orders</p>
              </div>
              <div className="bg-[#080B14] rounded-lg p-3">
                <p className="font-['Share_Tech_Mono'] text-cyan-400 text-lg font-bold">{formatPrice(profile.total_spent ?? 0)}</p>
                <p className="text-[#5A6478] text-[10px] font-['Rajdhani'] uppercase tracking-wider">Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements */}
          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
            <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-4">ACHIEVEMENTS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(achievementsMap).map(([id, ach]) => {
                const unlocked = profile.achievements?.some((a: { id: string }) => a.id === id)
                return (
                  <div
                    key={id}
                    className={`p-4 rounded-lg border text-center transition-all ${unlocked ? 'border-[#FFD700]/30 bg-[#FFD700]/5' : 'border-white/5 opacity-40 grayscale'}`}
                  >
                    <div className="text-3xl mb-2">{ach.icon}</div>
                    <p className="font-['Rajdhani'] font-bold text-[#E8EAF0] text-sm">{ach.title}</p>
                    <p className="text-[#5A6478] text-xs font-['Rajdhani'] mt-1">{ach.description}</p>
                    {!unlocked && <p className="text-[#5A6478] text-[10px] font-['Share_Tech_Mono'] mt-2">LOCKED</p>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
            <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-4">QUICK ACCESS</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/orders', icon: '📦', label: 'My Orders' },
                { href: '/shop', icon: '🛒', label: 'Shop Now' },
                { href: '/shop?is_featured=true', icon: '⭐', label: 'Featured' },
                { href: '#', icon: '❤️', label: 'Wishlist' },
              ].map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-3 p-3 bg-[#080B14] rounded-lg hover:bg-cyan-400/5 hover:border-cyan-400/20 border border-transparent transition-all"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="font-['Rajdhani'] font-semibold text-[#E8EAF0] text-sm">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
