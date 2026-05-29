import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" aria-hidden>
        <svg className="w-full h-full">
          <defs>
            <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00F5FF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.8))' }} />
            <span className="font-['Orbitron'] text-lg font-black text-white tracking-wider">GEARFORGE</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          {children}
        </main>
      </div>
    </div>
  )
}
