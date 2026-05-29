'use client'

import { useEffect } from 'react'
import GlowButton from '@/components/ui/GlowButton'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col items-center justify-center text-center px-4">
      <p className="font-['Share_Tech_Mono'] text-[#FF3E6C] text-xs tracking-[0.5em] uppercase mb-4">System Error</p>
      <h1 className="font-['Orbitron'] font-black text-6xl text-white mb-4" style={{ textShadow: '0 0 30px rgba(255,62,108,0.3)' }}>
        CRITICAL ERROR
      </h1>
      <p className="text-[#5A6478] font-['Rajdhani'] text-lg max-w-md mx-auto mb-8">
        A system failure has occurred. Our engineers are on it.
      </p>
      <div className="flex gap-4">
        <GlowButton onClick={reset}>Retry Mission</GlowButton>
        <a href="/"><GlowButton variant="secondary">Return to Base</GlowButton></a>
      </div>
    </div>
  )
}
