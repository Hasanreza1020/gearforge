'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import GlowButton from '@/components/ui/GlowButton'
import { toast } from 'sonner'

const schema = z.object({
  full_name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'At least 8 characters'),
  confirm: z.string(),
  terms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name } },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Account created! Welcome to GearForge. +100 XP!')
    router.push('/')
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#0D1117] border border-cyan-500/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,245,255,0.05)]">
        <h1 className="font-['Orbitron'] text-2xl font-black text-[#E8EAF0] mb-1">CREATE ACCOUNT</h1>
        <p className="text-[#5A6478] font-['Rajdhani'] text-sm mb-1">Join the GearForge squad</p>
        <p className="text-cyan-400 font-['Share_Tech_Mono'] text-xs mb-8">+100 XP on registration</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'full_name' as const, label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { name: 'email' as const, label: 'Email', type: 'email', placeholder: 'player@example.com' },
            { name: 'password' as const, label: 'Password', type: 'password', placeholder: '••••••••' },
            { name: 'confirm' as const, label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">{label}</label>
              <input
                {...register(name)}
                type={type}
                placeholder={placeholder}
                className="w-full bg-[#080B14] border border-white/10 rounded-lg px-4 py-3 text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 transition-colors font-['Rajdhani']"
              />
              {errors[name] && <p className="text-[10px] text-[#FF3E6C] mt-1">{(errors[name] as { message?: string })?.message}</p>}
            </div>
          ))}

          <div className="flex items-start gap-3">
            <input
              {...register('terms')}
              type="checkbox"
              id="terms"
              className="mt-1 w-4 h-4 border border-white/20 rounded bg-[#080B14] accent-cyan-400"
            />
            <label htmlFor="terms" className="text-[#5A6478] font-['Rajdhani'] text-sm cursor-pointer">
              I agree to the <span className="text-cyan-400">Terms of Service</span> and <span className="text-cyan-400">Privacy Policy</span>
            </label>
          </div>
          {errors.terms && <p className="text-[10px] text-[#FF3E6C]">{errors.terms.message}</p>}

          <GlowButton type="submit" fullWidth size="lg" loading={loading}>
            Create Account
          </GlowButton>
        </form>

        <p className="text-center text-[#5A6478] font-['Rajdhani'] text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
            Sign In →
          </Link>
        </p>
      </div>
    </div>
  )
}
