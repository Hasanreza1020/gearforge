'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/store/cartStore'
import GlowButton from '@/components/ui/GlowButton'
import LoadingScanner from '@/components/ui/LoadingScanner'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const schema = z.object({
  full_name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  line1: z.string().min(3, 'Address required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().optional(),
  postal_code: z.string().min(3, 'Postal code required'),
  country: z.string().min(2, 'Country required'),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CheckoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, getSubtotal, getTax, getTotal, getDiscount, couponCode } = useCartStore()
  const [deliveryOptions, setDeliveryOptions] = useState<{ id: string; name: string; price: number; estimated_days_min: number; estimated_days_max: number }[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (searchParams.get('cancelled')) toast.error('Payment was cancelled')
  }, [searchParams])

  useEffect(() => {
    supabase.from('delivery_options').select('*').eq('is_active', true).order('display_order').then(({ data }) => {
      if (data) { setDeliveryOptions(data); setSelectedDelivery(data[0]?.id ?? '') }
    })
  }, [supabase])

  useEffect(() => {
    if (items.length === 0) router.push('/shop')
  }, [items, router])

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/checkout'); return }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingAddress: data, deliveryOptionId: selectedDelivery, userId: user.id, couponCode }),
      })
      const json = await res.json()
      if (json.error) { toast.error(json.error); return }
      if (json.sessionUrl) window.location.href = json.sessionUrl
    } catch { toast.error('Failed to create checkout session') }
    finally { setSubmitting(false) }
  }

  if (submitting) return <LoadingScanner fullScreen message="INITIALIZING PAYMENT" />

  const selectedOption = deliveryOptions.find((o) => o.id === selectedDelivery)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0] mb-8">CHECKOUT</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-6">
          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
            <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-4">SHIPPING ADDRESS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'full_name' as const, label: 'Full Name', placeholder: 'John Doe', span: true },
                { name: 'email' as const, label: 'Email', placeholder: 'john@example.com', span: true },
                { name: 'line1' as const, label: 'Address Line 1', placeholder: '123 Main St', span: true },
                { name: 'line2' as const, label: 'Address Line 2 (Optional)', placeholder: 'Apt 4', span: true },
                { name: 'city' as const, label: 'City', placeholder: 'New York' },
                { name: 'state' as const, label: 'State', placeholder: 'NY' },
                { name: 'postal_code' as const, label: 'Postal Code', placeholder: '10001' },
                { name: 'country' as const, label: 'Country', placeholder: 'US' },
                { name: 'phone' as const, label: 'Phone (Optional)', placeholder: '+1 555 0100' },
              ].map(({ name, label, placeholder, span }) => (
                <div key={name} className={span ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">{label}</label>
                  <input {...register(name)} placeholder={placeholder}
                    className="w-full bg-[#080B14] border border-white/10 rounded px-3 py-2.5 text-sm text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 transition-colors font-['Rajdhani']" />
                  {errors[name] && <p className="text-[10px] text-[#FF3E6C] mt-1">{errors[name]?.message}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
            <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-4">DELIVERY METHOD</h2>
            <div className="space-y-3">
              {deliveryOptions.map((option) => (
                <label key={option.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedDelivery === option.id ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/10 hover:border-white/20'}`}>
                  <input type="radio" name="delivery" value={option.id} checked={selectedDelivery === option.id} onChange={(e) => setSelectedDelivery(e.target.value)} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedDelivery === option.id ? 'border-cyan-400' : 'border-white/30'}`}>
                    {selectedDelivery === option.id && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-['Rajdhani'] font-bold text-[#E8EAF0] text-sm">{option.name}</p>
                    <p className="text-[#5A6478] text-xs font-['Rajdhani']">{option.estimated_days_min}-{option.estimated_days_max} business days</p>
                  </div>
                  <span className="font-['Share_Tech_Mono'] text-cyan-400 text-sm font-bold">
                    {option.price === 0 ? 'FREE' : formatPrice(option.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <GlowButton type="submit" fullWidth size="lg" loading={submitting}>Pay with Stripe →</GlowButton>
        </form>

        <div className="lg:col-span-2">
          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6 sticky top-20">
            <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-4">ORDER SUMMARY</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span className="font-['Rajdhani'] text-[#5A6478] truncate max-w-[60%]">{item.product_name} ×{item.quantity}</span>
                  <span className="font-['Share_Tech_Mono'] text-[#E8EAF0]">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-3 space-y-2 text-xs font-['Share_Tech_Mono']">
              <div className="flex justify-between text-[#5A6478]"><span>Subtotal</span><span>{formatPrice(getSubtotal())}</span></div>
              <div className="flex justify-between text-[#5A6478]">
                <span>Shipping</span>
                <span>{selectedOption?.price === 0 ? <span className="text-cyan-400">FREE</span> : formatPrice(selectedOption?.price ?? 0)}</span>
              </div>
              {getDiscount() > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{formatPrice(getDiscount())}</span></div>}
              <div className="flex justify-between text-[#5A6478]"><span>Tax</span><span>{formatPrice(getTax())}</span></div>
              <div className="flex justify-between text-[#E8EAF0] text-sm font-bold pt-2 border-t border-white/10">
                <span>Total</span><span className="text-cyan-400">{formatPrice(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
