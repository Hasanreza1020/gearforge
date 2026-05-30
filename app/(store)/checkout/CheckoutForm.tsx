'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/store/cartStore'
import GlowButton from '@/components/ui/GlowButton'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Package, MapPin, Phone, Truck } from 'lucide-react'

const UAE_EMIRATES = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman',
  'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain',
]

const schema = z.object({
  full_name:  z.string().min(2, 'Full name required'),
  phone:      z.string().min(9, 'Valid UAE phone required'),
  email:      z.string().email('Valid email required'),
  emirate:    z.string().min(1, 'Emirate required'),
  area:       z.string().min(2, 'Area/District required'),
  building:   z.string().min(1, 'Building / Villa required'),
  street:     z.string().optional(),
  landmark:   z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CheckoutForm() {
  const router = useRouter()
  const { items, getSubtotal, getTotal, getDiscount, clearCart } = useCartStore()
  const [deliveryOptions, setDeliveryOptions] = useState<{
    id: string; name: string; price: number
    estimated_days_min: number; estimated_days_max: number; description: string
  }[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: { emirate: 'Dubai' },
  })

  useEffect(() => {
    supabase.from('delivery_options').select('*').eq('is_active', true).order('display_order').then(({ data }) => {
      if (data) { setDeliveryOptions(data); setSelectedDelivery(data[0]?.id ?? '') }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (items.length === 0) router.push('/shop')
  }, [items, router])

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    try {
      // Guest checkout supported — user_id is null if not logged in
      const { data: { user } } = await supabase.auth.getUser()

      const selectedOption = deliveryOptions.find((o) => o.id === selectedDelivery)
      const shippingCost = selectedOption?.price ?? 15
      const subtotal = getSubtotal()
      const discount = getDiscount()
      const total = subtotal + shippingCost - discount

      const shippingAddress = {
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        emirate: data.emirate,
        area: data.area,
        building: data.building,
        street: data.street ?? '',
        landmark: data.landmark ?? '',
        country: 'AE',
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id ?? null,
          items,
          shippingAddress,
          deliveryOptionId: selectedDelivery,
          subtotal,
          shippingCost,
          discount,
          tax: 0,
          total,
          paymentMethod: 'cod',
        }),
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error ?? 'Failed to place order')
        return
      }

      clearCart()
      toast.success('Order placed! We\'ll call to confirm.')
      router.push(`/orders?success=true&order=${json.orderNumber}`)
    } catch {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedOption = deliveryOptions.find((o) => o.id === selectedDelivery)
  const shippingCost = selectedOption?.price ?? 0
  const subtotal = getSubtotal()
  const discount = getDiscount()
  const total = subtotal + shippingCost - discount

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0] mb-2">CHECKOUT</h1>
      <p className="text-[#5A6478] font-['Rajdhani'] mb-8 flex items-center gap-2">
        <Package className="w-4 h-4 text-cyan-400" />
        Cash on Delivery — Pay when your order arrives
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-6">

          {/* Contact */}
          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
            <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400" /> CONTACT INFO
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'full_name' as const, label: 'Full Name', placeholder: 'Ahmed Al Mansouri', span: true },
                { name: 'phone' as const,     label: 'Phone Number (Required)', placeholder: '+971 50 123 4567', span: false },
                { name: 'email' as const,     label: 'Email', placeholder: 'ahmed@example.com', span: false },
              ].map(({ name, label, placeholder, span }) => (
                <div key={name} className={span ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">{label}</label>
                  <input
                    {...register(name)}
                    placeholder={placeholder}
                    className="w-full bg-[#080B14] border border-white/10 rounded px-3 py-2.5 text-sm text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 transition-colors font-['Rajdhani']"
                  />
                  {errors[name] && <p className="text-[10px] text-[#FF3E6C] mt-1">{errors[name]?.message}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
            <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> DELIVERY ADDRESS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Emirate dropdown */}
              <div>
                <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">Emirate</label>
                <select
                  {...register('emirate')}
                  className="w-full bg-[#080B14] border border-white/10 rounded px-3 py-2.5 text-sm text-[#E8EAF0] focus:outline-none focus:border-cyan-400/50 transition-colors font-['Rajdhani']"
                >
                  {UAE_EMIRATES.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                {errors.emirate && <p className="text-[10px] text-[#FF3E6C] mt-1">{errors.emirate.message}</p>}
              </div>

              {[
                { name: 'area' as const,     label: 'Area / District', placeholder: 'e.g. Jumeirah, Al Nahda' },
                { name: 'building' as const, label: 'Building / Villa No.', placeholder: 'e.g. Tower 3 or Villa 14' },
                { name: 'street' as const,   label: 'Street (Optional)', placeholder: 'e.g. Sheikh Zayed Road' },
                { name: 'landmark' as const, label: 'Landmark (Optional)', placeholder: 'e.g. Near Mall of Emirates' },
              ].map(({ name, label, placeholder }) => (
                <div key={name} className={name === 'area' ? '' : 'sm:col-span-1'}>
                  <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">{label}</label>
                  <input
                    {...register(name)}
                    placeholder={placeholder}
                    className="w-full bg-[#080B14] border border-white/10 rounded px-3 py-2.5 text-sm text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 transition-colors font-['Rajdhani']"
                  />
                  {errors[name] && <p className="text-[10px] text-[#FF3E6C] mt-1">{errors[name]?.message}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Method */}
          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
            <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" /> DELIVERY METHOD
            </h2>
            <div className="space-y-3">
              {deliveryOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDelivery === option.id ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input type="radio" name="delivery" value={option.id} checked={selectedDelivery === option.id} onChange={(e) => setSelectedDelivery(e.target.value)} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedDelivery === option.id ? 'border-cyan-400' : 'border-white/30'}`}>
                    {selectedDelivery === option.id && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-['Rajdhani'] font-bold text-[#E8EAF0] text-sm">{option.name}</p>
                    <p className="text-[#5A6478] text-xs font-['Rajdhani']">{option.description}</p>
                  </div>
                  <span className="font-['Share_Tech_Mono'] text-cyan-400 text-sm font-bold whitespace-nowrap">
                    {formatPrice(option.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* COD notice */}
          <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl">💵</span>
            <div>
              <p className="font-['Rajdhani'] font-bold text-[#FFD700] text-sm">Cash on Delivery</p>
              <p className="font-['Rajdhani'] text-[#5A6478] text-xs mt-0.5">
                Have the exact amount ready when our delivery partner arrives. We&apos;ll call you to confirm before dispatching.
              </p>
            </div>
          </div>

          <GlowButton type="submit" fullWidth size="lg" loading={submitting}>
            Place COD Order →
          </GlowButton>
        </form>

        {/* Order Summary */}
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
              <div className="flex justify-between text-[#5A6478]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-[#5A6478]"><span>Delivery</span><span>{formatPrice(shippingCost)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-[#E8EAF0] text-sm font-bold pt-2 border-t border-white/10">
                <span>Total (COD)</span><span className="text-cyan-400">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
