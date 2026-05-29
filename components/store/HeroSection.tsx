'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import GlowButton from '@/components/ui/GlowButton'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080B14]">
      {/* Animated grid background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00F5FF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-cyan-500/5 via-transparent to-transparent" />
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none scanlines opacity-[0.03]" />
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-400 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Pre-headline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-['Share_Tech_Mono'] text-cyan-400 text-xs tracking-[0.5em] uppercase mb-6"
          >
            ⚡ ELITE GAMING GEAR STORE
          </motion.p>

          {/* Main headline */}
          <h1
            className="font-['Orbitron'] font-black text-5xl sm:text-7xl lg:text-8xl text-white mb-4 leading-none"
            style={{ textShadow: '0 0 40px rgba(0,245,255,0.3), 0 0 80px rgba(0,245,255,0.1)' }}
          >
            GEAR UP.
          </h1>
          <h1
            className="font-['Orbitron'] font-black text-5xl sm:text-7xl lg:text-8xl mb-8 leading-none"
            style={{
              background: 'linear-gradient(135deg, #00F5FF, #FF3E6C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
            }}
          >
            LEVEL UP.
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-['Rajdhani'] text-[#5A6478] text-lg sm:text-xl max-w-2xl mx-auto mb-10"
          >
            Premium gaming peripherals, gear, and collectibles for elite players.
            Dominate every match with pro-grade equipment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/shop">
              <GlowButton size="lg" variant="primary">
                Shop Now →
              </GlowButton>
            </Link>
            <Link href="/shop?is_featured=true">
              <GlowButton size="lg" variant="secondary">
                View Deals
              </GlowButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { value: '10,000+', label: 'Products' },
            { value: '50,000+', label: 'Gamers' },
            { value: '99.9%', label: 'Uptime' },
            { value: '24/7', label: 'Support' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-[#0D1117]/60 backdrop-blur border border-cyan-500/10 rounded-lg p-4">
              <p className="font-['Share_Tech_Mono'] text-cyan-400 text-xl font-bold">{value}</p>
              <p className="font-['Rajdhani'] text-[#5A6478] text-xs uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080B14] to-transparent pointer-events-none" />
    </section>
  )
}
