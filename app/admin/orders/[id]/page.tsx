'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDateTime, getStatusColor } from '@/lib/utils'
import GlowButton from '@/components/ui/GlowButton'
import LoadingScanner from '@/components/ui/LoadingScanner'
import { toast } from 'sonner'
import type { Order } from '@/types'

const STATUSES = ['pending', 'payment_pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export default function AdminOrderDetailPage() {
  const { id } = useParams() as { id: string }
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [tracking, setTracking] = useState('')
  const [carrier, setCarrier] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('orders').select('*, order_items(*), user:profiles(email, full_name)').eq('id', id).single()
      .then(({ data }) => {
        if (data) {
          setOrder(data as Order)
          setStatus(data.status)
          setTracking(data.tracking_number ?? '')
          setCarrier(data.carrier ?? '')
        }
        setLoading(false)
      })
  }, [id, supabase])

  async function saveChanges() {
    setSaving(true)
    const { error } = await supabase.from('orders').update({
      status,
      tracking_number: tracking || null,
      carrier: carrier || null,
    }).eq('id', id)
    if (error) toast.error('Failed to update order')
    else { toast.success('Order updated'); setOrder((prev) => prev ? { ...prev, status: status as Order['status'], tracking_number: tracking, carrier } : prev) }
    setSaving(false)
  }

  if (loading) return <LoadingScanner message="LOADING ORDER" />
  if (!order) return <p className="font-['Orbitron'] text-[#5A6478]">Order not found</p>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Orbitron'] text-xl font-bold text-[#E8EAF0]">{order.order_number}</h1>
          <p className="text-[#5A6478] font-['Share_Tech_Mono'] text-xs mt-1">{formatDateTime(order.created_at)}</p>
        </div>
        <span className={`px-3 py-1 rounded font-['Rajdhani'] font-bold uppercase text-sm ${getStatusColor(order.status)}`}>
          {order.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Items */}
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
          <h2 className="font-['Orbitron'] text-xs font-bold text-[#5A6478] tracking-widest mb-3">ITEMS</h2>
          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="font-['Rajdhani'] text-[#E8EAF0]">{item.product_name} ×{item.quantity}</span>
                <span className="font-['Share_Tech_Mono'] text-[#5A6478]">{formatPrice(item.total_price)}</span>
              </div>
            ))}
            <div className="border-t border-white/5 pt-3 space-y-1.5 text-xs font-['Share_Tech_Mono']">
              <div className="flex justify-between text-[#5A6478]"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-[#5A6478]"><span>Shipping</span><span>{formatPrice(order.shipping_cost)}</span></div>
              <div className="flex justify-between text-[#5A6478]"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between text-[#E8EAF0] text-sm font-bold pt-1 border-t border-white/5"><span>Total</span><span className="text-cyan-400">{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </div>

        {/* Customer & Address */}
        <div className="space-y-4">
          {/* Customer info — falls back to shipping address for guests */}
          <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
            <h2 className="font-['Orbitron'] text-xs font-bold text-[#5A6478] tracking-widest mb-3">CUSTOMER</h2>
            <p className="font-['Rajdhani'] font-bold text-[#E8EAF0] text-sm">
              {(order.user as { full_name?: string })?.full_name ?? order.shipping_address?.full_name ?? '—'}
            </p>
            <p className="text-[#5A6478] font-['Share_Tech_Mono'] text-xs mt-0.5">
              {(order.user as { email?: string })?.email ?? order.shipping_address?.email ?? '—'}
            </p>
            {order.shipping_address?.phone && (
              <p className="text-cyan-400 font-['Share_Tech_Mono'] text-xs mt-0.5">
                📞 {order.shipping_address.phone}
              </p>
            )}
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FFD700]/10 border border-[#FFD700]/20">
              <span className="text-[#FFD700] font-['Rajdhani'] font-bold text-xs uppercase tracking-wider">
                💵 {order.metadata?.payment_method === 'cod' ? 'Cash on Delivery' : order.metadata?.payment_method ?? 'COD'}
              </span>
            </div>
          </div>

          {/* UAE Shipping Address */}
          {order.shipping_address && (
            <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
              <h2 className="font-['Orbitron'] text-xs font-bold text-[#5A6478] tracking-widest mb-3">DELIVERY ADDRESS</h2>
              <div className="space-y-1 font-['Rajdhani'] text-sm">
                {order.shipping_address.building && (
                  <p className="text-[#E8EAF0]">{order.shipping_address.building}</p>
                )}
                {order.shipping_address.area && (
                  <p className="text-[#5A6478]">{order.shipping_address.area}</p>
                )}
                {order.shipping_address.street && (
                  <p className="text-[#5A6478]">{order.shipping_address.street}</p>
                )}
                {order.shipping_address.landmark && (
                  <p className="text-[#5A6478] italic text-xs">Near: {order.shipping_address.landmark}</p>
                )}
                <p className="text-[#E8EAF0] font-bold">
                  {order.shipping_address.emirate ?? order.shipping_address.city}
                  {order.shipping_address.country ? `, ${order.shipping_address.country}` : ''}
                </p>
                {/* Legacy address format fallback */}
                {!order.shipping_address.emirate && order.shipping_address.line1 && (
                  <p className="text-[#5A6478]">{order.shipping_address.line1}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Order */}
      <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
        <h2 className="font-['Orbitron'] text-xs font-bold text-[#5A6478] tracking-widest mb-4">UPDATE ORDER</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#080B14] border border-white/10 rounded px-3 py-2.5 text-sm text-[#E8EAF0] focus:outline-none focus:border-cyan-400/50 font-['Rajdhani']"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">Tracking Number</label>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="TRK123456789"
              className="w-full bg-[#080B14] border border-white/10 rounded px-3 py-2.5 text-sm text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 font-['Rajdhani']" />
          </div>
          <div>
            <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">Carrier</label>
            <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Aramex, Fetchr..."
              className="w-full bg-[#080B14] border border-white/10 rounded px-3 py-2.5 text-sm text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 font-['Rajdhani']" />
          </div>
        </div>
        <GlowButton onClick={saveChanges} loading={saving}>Save Changes</GlowButton>
      </div>
    </div>
  )
}
