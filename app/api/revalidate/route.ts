import { NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    revalidateTag('products', 'max')
    revalidateTag('categories', 'max')
    revalidatePath('/')
    revalidatePath('/shop')

    return NextResponse.json({ revalidated: true })
  } catch {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
