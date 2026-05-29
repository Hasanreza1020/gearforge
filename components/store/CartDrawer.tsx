'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Plus, Minus, Trash2, Tag, Zap } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import GlowButton from '@/components/ui/GlowButton'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer() {
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    getSubtotal, getShippingCost, getDiscount, getTax, getTotal,
    couponCode, setCoupon,
  } = useCartStore()

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const subtotal = getSubtotal()
  const freeShippingThreshold = 75
  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100)
  const amountToFree = Math.max(freeShippingThreshold - subtotal, 0)

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponInput)}`)
      const data = await res.json()
      if (data.error) {
        setCouponError(data.error)
        setCoupon(null, null)
      } else {
        setCoupon(couponInput, data.coupon)
      }
    } catch {
      setCouponError('Failed to validate coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0D1117] border-l border-cyan-500/20 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/10">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-cyan-400" />
                <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider">
                  LOADOUT ({items.length})
                </h2>
              </div>
              <button onClick={closeCart} className="p-1 text-[#5A6478] hover:text-[#E8EAF0] transition-colors" aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping progress */}
            {subtotal < freeShippingThreshold && subtotal > 0 && (
              <div className="px-6 py-3 bg-cyan-400/5 border-b border-cyan-500/10">
                <p className="text-xs text-[#5A6478] font-['Rajdhani'] mb-1.5">
                  Add <span className="text-cyan-400 font-bold">{formatPrice(amountToFree)}</span> more for FREE shipping
                </p>
                <div className="h-1 bg-[#080B14] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,245,255,0.5)]"
                  />
                </div>
              </div>
            )}

            {subtotal >= freeShippingThreshold && subtotal > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-2.5 bg-cyan-400/10 border-b border-cyan-500/20 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400 font-['Rajdhani'] tracking-wider uppercase">
                  Free Shipping Unlocked!
                </span>
              </motion.div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="text-6xl mb-4">🎮</span>
                  <p className="font-['Orbitron'] text-[#5A6478] text-xs tracking-widest">YOUR LOADOUT IS EMPTY</p>
                  <button onClick={closeCart} className="mt-4 text-cyan-400 text-sm font-['Rajdhani'] hover:underline">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product_id} className="flex gap-3 bg-[#080B14]/60 rounded-lg p-3 border border-white/5">
                    <div className="w-16 h-16 rounded overflow-hidden bg-[#080B14] flex-shrink-0">
                      {item.product_image ? (
                        <Image src={item.product_image} alt={item.product_name} width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">🎮</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-['Rajdhani'] font-bold text-[#E8EAF0] text-sm leading-tight truncate">{item.product_name}</p>
                      <p className="font-['Share_Tech_Mono'] text-cyan-400 text-sm mt-0.5">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center border border-white/20 rounded text-[#E8EAF0] hover:border-cyan-400/50 hover:text-cyan-400 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-['Share_Tech_Mono'] text-sm text-[#E8EAF0] w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock_quantity}
                          className="w-6 h-6 flex items-center justify-center border border-white/20 rounded text-[#E8EAF0] hover:border-cyan-400/50 hover:text-cyan-400 transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-['Share_Tech_Mono'] text-[#E8EAF0] text-sm">{formatPrice(item.price * item.quantity)}</p>
                      <button onClick={() => removeItem(item.product_id)} className="text-[#5A6478] hover:text-[#FF3E6C] transition-colors" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-4 border-t border-cyan-500/10 space-y-3">
                {/* Coupon */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5A6478]" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="COUPON CODE"
                      className="w-full pl-8 pr-3 py-2 bg-[#080B14] border border-white/10 rounded text-xs font-['Share_Tech_Mono'] text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 transition-colors"
                    />
                  </div>
                  <GlowButton size="sm" onClick={applyCoupon} loading={couponLoading} variant="ghost">
                    Apply
                  </GlowButton>
                </div>
                {couponError && <p className="text-[10px] text-[#FF3E6C] font-['Rajdhani']">{couponError}</p>}
                {couponCode && <p className="text-[10px] text-green-400 font-['Rajdhani']">✓ Coupon applied: {couponCode}</p>}

                {/* Totals */}
                <div className="space-y-1.5 text-xs font-['Share_Tech_Mono']">
                  <div className="flex justify-between text-[#5A6478]">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  {getDiscount() > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span><span>-{formatPrice(getDiscount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#5A6478]">
                    <span>Shipping</span>
                    <span>{getShippingCost() === 0 ? <span className="text-cyan-400">FREE</span> : formatPrice(getShippingCost())}</span>
                  </div>
                  <div className="flex justify-between text-[#5A6478]">
                    <span>Tax (8%)</span><span>{formatPrice(getTax())}</span>
                  </div>
                  <div className="flex justify-between text-[#E8EAF0] text-sm font-bold pt-2 border-t border-white/10">
                    <span>Total</span><span className="text-cyan-400">{formatPrice(getTotal())}</span>
                  </div>
                </div>

                <Link href="/checkout" onClick={closeCart}>
                  <GlowButton fullWidth size="lg" className="mt-2">
                    Proceed to Checkout →
                  </GlowButton>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
