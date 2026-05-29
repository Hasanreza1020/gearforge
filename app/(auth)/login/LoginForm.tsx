'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import GlowButton from '@/components/ui/GlowButton'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Welcome back, soldier!')
    router.push(redirect)
  }

  async function signInWithGoogle() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` },
    })
    if (error) {
      toast.error(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#0D1117] border border-cyan-500/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,245,255,0.05)]">
        <h1 className="font-['Orbitron'] text-2xl font-black text-[#E8EAF0] mb-1">SIGN IN</h1>
        <p className="text-[#5A6478] font-['Rajdhani'] text-sm mb-8">Access your GearForge account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="player@example.com"
              autoComplete="email"
              className="w-full bg-[#080B14] border border-white/10 rounded-lg px-4 py-3 text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 transition-colors font-['Rajdhani']"
            />
            {errors.email && <p className="text-[10px] text-[#FF3E6C] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full bg-[#080B14] border border-white/10 rounded-lg px-4 py-3 text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 transition-colors font-['Rajdhani']"
            />
            {errors.password && <p className="text-[10px] text-[#FF3E6C] mt-1">{errors.password.message}</p>}
          </div>

          <GlowButton type="submit" fullWidth size="lg" loading={loading}>
            Sign In
          </GlowButton>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[#5A6478] text-xs font-['Share_Tech_Mono']">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <GlowButton
          variant="ghost"
          fullWidth
          size="lg"
          onClick={signInWithGoogle}
          loading={googleLoading}
          className="border border-white/10 hover:border-white/20"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </GlowButton>

        <p className="text-center text-[#5A6478] font-['Rajdhani'] text-sm mt-6">
          New player?{' '}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
            Create Account →
          </Link>
        </p>
      </div>
    </div>
  )
}
