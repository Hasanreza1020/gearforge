'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils'
import LoadingScanner from '@/components/ui/LoadingScanner'
import { toast } from 'sonner'
import type { Order } from '@/types'

const STATUS_STEPS = ['paid', 'processing', 'shipped', 'delivered']

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('success')) toast.success('🎉 Order placed! Check your email for confirmation.')
  }, [searchParams])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/orders'); return }

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setOrders((data as Order[]) ?? [])
      setLoading(false)
    }
    load()
  }, [router, supabase])

  if (loading) return <LoadingScanner message="LOADING MISSIONS" />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0] mb-2">MY MISSIONS</h1>
      <p className="text-[#5A6478] font-['Rajdhani'] mb-8">Your order history and mission status</p>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-[#5A6478] mx-auto mb-4" />
          <p className="font-['Orbitron'] text-[#5A6478] text-sm tracking-widest mb-4">NO MISSIONS YET</p>
          <a href="/shop" className="text-cyan-400 font-['Rajdhani'] font-semibold hover:underline">Start Shopping →</a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden hover:border-cyan-500/20 transition-colors">
              <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="w-full flex items-center gap-4 p-5 text-left">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[#5A6478] font-['Share_Tech_Mono'] text-[10px] uppercase mb-0.5">Order</p>
                    <p className="font-['Share_Tech_Mono'] text-cyan-400 text-sm">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-[#5A6478] font-['Share_Tech_Mono'] text-[10px] uppercase mb-0.5">Date</p>
                    <p className="font-['Rajdhani'] text-[#E8EAF0] text-sm">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-[#5A6478] font-['Share_Tech_Mono'] text-[10px] uppercase mb-0.5">Total</p>
                    <p className="font-['Share_Tech_Mono'] text-[#E8EAF0] text-sm">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-[#5A6478] font-['Share_Tech_Mono'] text-[10px] uppercase mb-0.5">Status</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-['Rajdhani'] uppercase ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#5A6478] flex-shrink-0 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
              </button>

              {STATUS_STEPS.includes(order.status) && (
                <div className="px-5 pb-3">
                  <div className="flex items-center gap-0">
                    {STATUS_STEPS.map((step, i) => {
                      const idx = STATUS_STEPS.indexOf(order.status)
                      const isDone = i <= idx
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${isDone ? 'border-cyan-400 bg-cyan-400' : 'border-white/20'}`} />
                          {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < idx ? 'bg-cyan-400' : 'bg-white/10'}`} />}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    {STATUS_STEPS.map((step) => (
                      <span key={step} className="text-[9px] font-['Share_Tech_Mono'] text-[#5A6478] uppercase">{step}</span>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {expandedId === order.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5">
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="font-['Orbitron'] text-xs text-[#5A6478] tracking-widest mb-3">ITEMS</h3>
                        <div className="space-y-2">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="font-['Rajdhani'] text-[#E8EAF0]">{item.product_name} ×{item.quantity}</span>
                              <span className="font-['Share_Tech_Mono'] text-[#5A6478]">{formatPrice(item.total_price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {order.shipping_address && (
                        <div>
                          <h3 className="font-['Orbitron'] text-xs text-[#5A6478] tracking-widest mb-2">DELIVERY ADDRESS</h3>
                          <p className="font-['Rajdhani'] text-[#E8EAF0] text-sm">{order.shipping_address.full_name}</p>
                          <p className="font-['Rajdhani'] text-[#5A6478] text-sm">{order.shipping_address.line1}, {order.shipping_address.city}</p>
                        </div>
                      )}
                      {order.tracking_number && (
                        <div>
                          <h3 className="font-['Orbitron'] text-xs text-[#5A6478] tracking-widest mb-2">TRACKING</h3>
                          <p className="font-['Share_Tech_Mono'] text-cyan-400 text-sm">{order.tracking_number}</p>
                          {order.carrier && <p className="font-['Rajdhani'] text-[#5A6478] text-sm">{order.carrier}</p>}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
