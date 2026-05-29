import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateXPForOrder, calculateLevel } from '@/lib/utils'
import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 're_placeholder')
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature failed: ${err}` }, { status: 400 })
  }

  const supabase = await createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const { userId, deliveryOptionId, shippingAddress, couponCode, discountAmount, couponId } = session.metadata!
    const shippingAddr = JSON.parse(shippingAddress)
    const discount = parseFloat(discountAmount ?? '0')

    // Get delivery option
    const { data: deliveryOption } = await supabase
      .from('delivery_options')
      .select('*')
      .eq('id', deliveryOptionId)
      .single()

    // Calculate totals from Stripe session
    const subtotal = (session.amount_subtotal ?? 0) / 100
    const shippingCost = deliveryOption?.price ?? 0
    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100
    const total = (session.amount_total ?? 0) / 100

    // Generate order number
    const orderNumber = `GX-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999 + 1)).padStart(4, '0')}`

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        status: 'paid',
        subtotal,
        shipping_cost: shippingCost,
        tax,
        discount,
        total,
        shipping_address: shippingAddr,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        paid_at: new Date().toISOString(),
        metadata: { delivery_option: deliveryOption },
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order creation failed:', orderError)
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
    }

    // Get line items from Stripe to create order_items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 })

    const productMatches: { name: string; quantity: number; price: number }[] = []
    for (const item of lineItems.data) {
      if (item.description?.includes('Shipping') || item.description?.includes('shipping')) continue
      productMatches.push({
        name: item.description ?? '',
        quantity: item.quantity ?? 1,
        price: (item.amount_total ?? 0) / 100 / (item.quantity ?? 1),
      })
    }

    // Match with products in DB
    for (const match of productMatches) {
      const { data: product } = await supabase
        .from('products')
        .select('id, thumbnail, images, stock_quantity')
        .ilike('name', match.name)
        .single()

      if (product) {
        await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: product.id,
          product_name: match.name,
          product_image: product.thumbnail ?? product.images?.[0] ?? null,
          quantity: match.quantity,
          unit_price: match.price,
          total_price: match.price * match.quantity,
        })

        // Decrease stock
        await supabase
          .from('products')
          .update({ stock_quantity: Math.max(0, product.stock_quantity - match.quantity) })
          .eq('id', product.id)
      }
    }

    // Update profile XP and order counts
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('total_orders, total_spent, xp_points, achievements')
      .eq('id', userId)
      .single()

    if (currentProfile) {
      const newXp = (currentProfile.xp_points ?? 0) + calculateXPForOrder(total)
      const newLevel = calculateLevel(newXp)
      const totalOrders = (currentProfile.total_orders ?? 0) + 1
      const totalSpent = (currentProfile.total_spent ?? 0) + total

      // Check achievements
      const achievements = [...(currentProfile.achievements ?? [])]
      const hasFirstBlood = achievements.some((a: { id: string }) => a.id === 'first_blood')
      const hasHighRoller = achievements.some((a: { id: string }) => a.id === 'high_roller')
      const hasVeteran = achievements.some((a: { id: string }) => a.id === 'veteran')

      if (!hasFirstBlood && totalOrders === 1) {
        achievements.push({ id: 'first_blood', title: 'First Blood', description: 'Made your first purchase', icon: '🩸', unlocked_at: new Date().toISOString() })
      }
      if (!hasHighRoller && total >= 200) {
        achievements.push({ id: 'high_roller', title: 'High Roller', description: 'Placed an order over $200', icon: '💰', unlocked_at: new Date().toISOString() })
      }
      if (!hasVeteran && totalOrders >= 10) {
        achievements.push({ id: 'veteran', title: 'Veteran', description: 'Completed 10+ orders', icon: '⭐', unlocked_at: new Date().toISOString() })
      }

      await supabase.from('profiles').update({
        total_orders: totalOrders,
        total_spent: totalSpent,
        xp_points: newXp,
        level: newLevel,
        achievements,
      }).eq('id', userId)
    }

    // Increment coupon use
    if (couponId) {
      await supabase.rpc('increment_coupon_uses', { coupon_id: couponId })
    }

    // Send confirmation email
    try {
      const resend = getResend()
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'orders@gearforge.store',
        to: shippingAddr.email,
        subject: `Order Confirmed — ${orderNumber}`,
        html: `
          <div style="font-family: monospace; background: #080B14; color: #E8EAF0; padding: 32px; max-width: 600px;">
            <h1 style="color: #00F5FF; font-size: 24px;">⚡ GEARFORGE</h1>
            <h2 style="color: #E8EAF0;">Order Confirmed!</h2>
            <p>Order #<strong style="color: #00F5FF;">${orderNumber}</strong></p>
            <p>Total: <strong style="color: #00F5FF;">$${total.toFixed(2)}</strong></p>
            <p style="color: #5A6478;">Thank you for your order, ${shippingAddr.full_name}! We'll notify you when it ships.</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    await supabase
      .from('orders')
      .update({ status: 'payment_pending' })
      .eq('stripe_payment_intent_id', paymentIntent.id)
  }

  return NextResponse.json({ received: true })
}
