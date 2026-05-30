import type { Metadata } from 'next'
import { Orbitron, Rajdhani, Share_Tech_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import CartDrawer from '@/components/store/CartDrawer'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-share-tech-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'The Players UAE — Gaming Store',
    template: '%s | The Players UAE',
  },
  description: 'UAE\'s ultimate gaming store. Consoles, controllers, retro games, CDs, headphones, collectibles and more. Cash on delivery across UAE.',
  keywords: ['gaming store UAE', 'buy consoles UAE', 'retro games UAE', 'gaming accessories Dubai', 'PlayStation UAE', 'Xbox UAE'],
  openGraph: {
    type: 'website',
    siteName: 'The Players UAE',
    title: 'The Players UAE — Gaming Store',
    description: 'UAE\'s ultimate gaming store. Cash on delivery.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable}`}>
      <body className="bg-[#080B14] text-[#E8EAF0] antialiased min-h-screen">
        {children}
        <CartDrawer />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0D1117',
              border: '1px solid rgba(0,245,255,0.2)',
              color: '#E8EAF0',
              fontFamily: 'var(--font-rajdhani)',
            },
          }}
        />
      </body>
    </html>
  )
}
