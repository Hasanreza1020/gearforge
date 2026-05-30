'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Coupon, DeliveryOption } from '@/types'

interface CartState {
  items: CartItem[]
  deliveryOptionId: string | null
  deliveryOption: DeliveryOption | null
  couponCode: string | null
  coupon: Coupon | null
  isOpen: boolean

  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setDeliveryOption: (option: DeliveryOption) => void
  setCoupon: (code: string | null, coupon: Coupon | null) => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  getSubtotal: () => number
  getShippingCost: () => number
  getDiscount: () => number
  getTax: () => number
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryOptionId: null,
      deliveryOption: null,
      couponCode: null,
      coupon: null,
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.product_id === item.product_id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock_quantity) }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.product_id !== productId) }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId
              ? { ...i, quantity: Math.min(quantity, i.stock_quantity) }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [], couponCode: null, coupon: null }),

      setDeliveryOption: (option) =>
        set({ deliveryOptionId: option.id, deliveryOption: option }),

      setCoupon: (code, coupon) => set({ couponCode: code, coupon }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getShippingCost: () => get().deliveryOption?.price ?? 0,

      getDiscount: () => {
        const { coupon } = get()
        const subtotal = get().getSubtotal()
        if (!coupon) return 0
        if (coupon.type === 'percentage') return (subtotal * coupon.value) / 100
        return Math.min(coupon.value, subtotal)
      },

      getTax: () => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscount()
        return Math.round((subtotal - discount) * 0.08 * 100) / 100
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const shipping = get().getShippingCost()
        const discount = get().getDiscount()
        const tax = get().getTax()
        return Math.round((subtotal + shipping - discount + tax) * 100) / 100
      },

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'theplayers-cart',
      partialize: (state) => ({
        items: state.items,
        deliveryOptionId: state.deliveryOptionId,
        deliveryOption: state.deliveryOption,
        couponCode: state.couponCode,
        coupon: state.coupon,
      }),
    }
  )
)
