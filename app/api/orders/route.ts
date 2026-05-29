import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

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
