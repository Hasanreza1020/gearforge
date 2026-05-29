'use client'

import { useCartStore } from '@/store/cartStore'
import type { Product, DeliveryOption } from '@/types'

export function useCart() {
  const store = useCartStore()

  function addToCart(product: Product, quantity = 1) {
    store.addItem({
      id: crypto.randomUUID(),
      product_id: product.id,
      product_name: product.name,
      product_image: product.thumbnail ?? product.images[0] ?? null,
      slug: product.slug,
      price: product.price,
      quantity,
      stock_quantity: product.stock_quantity,
    })
    store.openCart()
  }

  function selectDelivery(option: DeliveryOption) {
    store.setDeliveryOption(option)
  }

  return {
    items: store.items,
    itemCount: store.getItemCount(),
    subtotal: store.getSubtotal(),
    shipping: store.getShippingCost(),
    discount: store.getDiscount(),
    tax: store.getTax(),
    total: store.getTotal(),
    deliveryOption: store.deliveryOption,
    coupon: store.coupon,
    isOpen: store.isOpen,
    addToCart,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    selectDelivery,
    setCoupon: store.setCoupon,
    openCart: store.openCart,
    closeCart: store.closeCart,
    toggleCart: store.toggleCart,
  }
}
