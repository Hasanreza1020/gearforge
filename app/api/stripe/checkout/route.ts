import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import type { CartItem, ShippingAddress } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, shippingAddress, deliveryOptionId, userId, couponCode } = body as {
      items: CartItem[]
      shippingAddress: ShippingAddress
      deliveryOptionId: string
      userId: string
      couponCode?: string
    }

    if (!items?.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Validate products and stock
    const productIds = items.map((i) => i.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, is_active')
      .in('id', productIds)

    if (productsError || !products) {
      return NextResponse.json({ error: 'Failed to validate products' }, { status: 500 })
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id)
      if (!product || !product.is_active) {
        return NextResponse.json({ error: `Product "${item.product_name}" is no longer available` }, { status: 400 })
      }
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for "${item.product_name}"` }, { status: 400 })
      }
    }

    // Get delivery option
    const { data: deliveryOption } = await supabase
      .from('delivery_options')
      .select('*')
      .eq('id', deliveryOptionId)
      .single()

    // Validate coupon
    let discountAmount = 0
    let coupon = null
    if (couponCode) {
      const { data: couponData } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('is_active', true)
        .single()

      if (couponData) {
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
        if (subtotal >= couponData.min_order_amount) {
          coupon = couponData
          discountAmount = couponData.type === 'percentage'
            ? (subtotal * couponData.value) / 100
            : Math.min(couponData.value, subtotal)
        }
      }
    }

    // Build line items
    const lineItems: {
      price_data: { currency: string; product_data: { name: string; images?: string[] }; unit_amount: number }
      quantity: number
    }[] = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product_name,
          ...(item.product_image ? { images: [item.product_image] } : {}),
        },
        unit_amount: formatAmountForStripe(item.price),
      },
      quantity: item.quantity,
    }))

    // Add shipping as line item
    if (deliveryOption && deliveryOption.price > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `${deliveryOption.name} (${deliveryOption.estimated_days_min}-${deliveryOption.estimated_days_max} days)` },
          unit_amount: formatAmountForStripe(deliveryOption.price),
        },
        quantity: 1,
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?cancelled=true`,
      metadata: {
        userId,
        deliveryOptionId,
        shippingAddress: JSON.stringify(shippingAddress),
        couponCode: couponCode ?? '',
        discountAmount: String(discountAmount),
        couponId: coupon?.id ?? '',
      },
      customer_email: shippingAddress.email,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ sessionUrl: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
