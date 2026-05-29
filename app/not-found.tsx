import Link from 'next/link'
import GlowButton from '@/components/ui/GlowButton'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col items-center justify-center text-center px-4">
      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" aria-hidden>
        <svg className="w-full h-full">
          <defs>
            <pattern id="404-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00F5FF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#404-grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <p className="font-['Share_Tech_Mono'] text-cyan-400 text-xs tracking-[0.5em] uppercase mb-4">Error 404</p>
        <h1
          className="font-['Orbitron'] font-black text-8xl sm:text-[10rem] text-white mb-2"
          style={{ textShadow: '0 0 40px rgba(0,245,255,0.2)' }}
        >
          404
        </h1>
        <h2 className="font-['Orbitron'] text-2xl font-bold text-[#FF3E6C] mb-4">PLAYER NOT FOUND</h2>
        <p className="text-[#5A6478] font-['Rajdhani'] text-lg max-w-md mx-auto mb-8">
          The page you're looking for has been eliminated from the game. Respawn at home base.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <GlowButton size="lg">← Return to Base</GlowButton>
          </Link>
          <Link href="/shop">
            <GlowButton size="lg" variant="secondary">Browse Shop</GlowButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
