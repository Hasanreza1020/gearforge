import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '24')
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const featured = searchParams.get('featured') === 'true'

  try {
    const supabase = await createServiceClient()
    let query = supabase
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('is_active', true)

    if (search) query = query.ilike('name', `%${search}%`)
    if (featured) query = query.eq('is_featured', true)
    if (category) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    const { data, count, error } = await query
    if (error) throw error

    const response = NextResponse.json({ data, count, page, limit })
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { data, error } = await supabase.from('products').insert(body).select().single()
    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
