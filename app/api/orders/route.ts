import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { items, shippingAddress, deliveryOptionId, subtotal, shippingCost, discount, tax, total, paymentMethod } = body

    // Generate order number
    const date = new Date()
    const orderNumber = `TP-${date.getFullYear().toString().slice(-2)}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*9999+1)).padStart(4,'0')}`

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: paymentMethod === 'cod' ? 'pending' : 'payment_pending',
        subtotal,
        shipping_cost: shippingCost,
        discount: discount ?? 0,
        tax: tax ?? 0,
        total,
        shipping_address: shippingAddress,
        metadata: { payment_method: paymentMethod ?? 'cod', delivery_option_id: deliveryOptionId },
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map((item: { product_id: string; product_name: string; product_image?: string; quantity: number; price: number }) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image ?? null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    // Decrement stock
    for (const item of items) {
      await supabase.rpc('decrement_stock', { product_id: item.product_id, qty: item.quantity }).maybeSingle()
    }

    // Update profile totals
    await supabase
      .from('profiles')
      .update({ total_orders: supabase.rpc('increment', { x: 1 }) as unknown as number })
      .eq('id', user.id)

    return NextResponse.json({ orderNumber, orderId: order.id }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create order'
    console.error('[orders POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    let query = supabase
      .from('orders')
      .select('*, order_items(*), user:profiles(email, full_name)')
      .order('created_at', { ascending: false })

    if (!isAdmin) query = query.eq('user_id', user.id)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
