import { Suspense } from 'react'
import Link from 'next/link'
import HeroSection from '@/components/store/HeroSection'
import ProductGrid from '@/components/store/ProductGrid'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import GlowButton from '@/components/ui/GlowButton'
import LoadingScanner from '@/components/ui/LoadingScanner'
import { getCachedFeaturedProducts, getCachedCategories } from '@/lib/cache'
import { createAnonClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = createAnonClient()
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // 1267 gamers on May 30 2026, +5 every day
  const BASE_DATE = new Date('2026-05-30').getTime()
  const daysSince = Math.max(0, Math.floor((Date.now() - BASE_DATE) / 86400000))
  const gamerCount = 1267 + daysSince * 5

  return { productCount: count ?? 0, gamerCount }
}

export default async function HomePage() {
  const [featuredProducts, categories, { productCount, gamerCount }] = await Promise.all([
    getCachedFeaturedProducts(),
    getCachedCategories(),
    getStats(),
  ])

  return (
    <>
      <HeroSection />

      {/* Stats Bar */}
      <section className="border-y border-cyan-500/10 bg-[#0D1117]/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
            <div>
              <AnimatedCounter
                value={productCount}
                suffix="+"
                className="text-2xl sm:text-3xl text-cyan-400 font-bold block"
              />
              <p className="text-[#5A6478] text-xs uppercase tracking-wider mt-1 font-semibold">Products In Stock</p>
            </div>
            <div>
              <AnimatedCounter
                value={gamerCount}
                className="text-2xl sm:text-3xl text-cyan-400 font-bold block"
              />
              <p className="text-[#5A6478] text-xs uppercase tracking-wider mt-1 font-semibold">Satisfied Gamers</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <AnimatedCounter
                value={24}
                suffix="/7"
                className="text-2xl sm:text-3xl text-cyan-400 font-bold block"
              />
              <p className="text-[#5A6478] text-xs uppercase tracking-wider mt-1 font-semibold">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-['Orbitron'] text-xl font-bold text-[#E8EAF0]">SHOP BY CATEGORY</h2>
          <Link href="/shop" className="text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group bg-[#0D1117]/80 border border-cyan-500/10 rounded-xl p-4 text-center hover:border-cyan-400/40 hover:bg-cyan-400/5 hover:shadow-[0_0_20px_rgba(0,245,255,0.1)] transition-all duration-300"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 block">{cat.icon}</div>
              <p className="font-['Rajdhani'] font-bold text-[#5A6478] group-hover:text-[#E8EAF0] text-xs uppercase tracking-wider transition-colors">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-['Orbitron'] text-xl font-bold text-[#E8EAF0]">
              FEATURED PICKS<span className="inline-block w-0.5 h-5 bg-cyan-400 ml-1 animate-[blink_1s_step-end_infinite] align-middle" />
            </h2>
            <p className="text-[#5A6478] font-['Rajdhani'] text-sm mt-1">Handpicked for UAE gamers</p>
          </div>
          <Link href="/shop">
            <GlowButton size="sm" variant="ghost">View All</GlowButton>
          </Link>
        </div>
        <Suspense fallback={<LoadingScanner message="LOADING PICKS" />}>
          <ProductGrid products={featuredProducts as never} columns={4} />
        </Suspense>
      </section>

      {/* Why Choose Us */}
      <section className="border-y border-cyan-500/10 bg-[#0D1117]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-['Orbitron'] text-xl font-bold text-center text-[#E8EAF0] mb-10">
            WHY THE PLAYERS?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Fast UAE Delivery', desc: 'Aramex & Fetchr delivery across all 7 Emirates' },
              { icon: '💵', title: 'Cash on Delivery', desc: 'Pay when your order arrives — no card needed' },
              { icon: '✓', title: 'Authentic Products', desc: 'Official manufacturer partnerships, 100% genuine' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#0D1117] border border-white/5 rounded-xl p-6 hover:border-cyan-500/20 transition-colors">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-['Rajdhani'] font-bold text-[#E8EAF0] mb-1">{title}</h3>
                <p className="text-[#5A6478] font-['Rajdhani'] text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0] mb-3">JOIN THE SQUAD</h2>
        <p className="text-[#5A6478] font-['Rajdhani'] mb-8">Get exclusive deals, new releases, and gaming intel across UAE.</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 bg-[#0D1117] border border-cyan-500/20 rounded px-4 py-3 text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400 font-['Share_Tech_Mono'] text-sm transition-colors"
          />
          <GlowButton>Subscribe</GlowButton>
        </div>
      </section>
    </>
  )
}
