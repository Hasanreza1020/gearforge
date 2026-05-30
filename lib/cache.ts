import { unstable_cache } from 'next/cache'
import { createAnonClient } from './supabase/server'
import type { ProductFilters } from '@/types'

export const getCachedProducts = unstable_cache(
  async (filters: ProductFilters = {}) => {
    const supabase = createAnonClient()
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)

    if (filters.category) {
      query = query.eq('categories.slug', filters.category)
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters.min_price) query = query.gte('price', filters.min_price)
    if (filters.max_price) query = query.lte('price', filters.max_price)
    if (filters.in_stock) query = query.gt('stock_quantity', 0)
    if (filters.is_featured) query = query.eq('is_featured', true)

    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      price_asc: { column: 'price', ascending: true },
      price_desc: { column: 'price', ascending: false },
      newest: { column: 'created_at', ascending: false },
      rating: { column: 'average_rating', ascending: false },
      popular: { column: 'review_count', ascending: false },
    }
    const sortConfig = sortMap[filters.sort ?? 'newest'] ?? sortMap.newest
    query = query.order(sortConfig.column, { ascending: sortConfig.ascending })

    const page = filters.page ?? 1
    const limit = filters.limit ?? 24
    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query
    if (error) throw error
    return { data: data ?? [], count: count ?? 0 }
  },
  ['products-list'],
  { revalidate: 300, tags: ['products'] }
)

export const getCachedProduct = unstable_cache(
  async (slug: string) => {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    if (error) return null
    return data
  },
  ['product-detail'],
  { revalidate: 600, tags: ['products'] }
)

export const getCachedCategories = unstable_cache(
  async () => {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) throw error
    return data ?? []
  },
  ['categories'],
  { revalidate: 3600, tags: ['categories'] }
)

export const getCachedFeaturedProducts = unstable_cache(
  async () => {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8)
    if (error) throw error
    return data ?? []
  },
  ['featured-products'],
  { revalidate: 300, tags: ['products'] }
)

export const getCachedDeliveryOptions = unstable_cache(
  async () => {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('delivery_options')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    if (error) throw error
    return data ?? []
  },
  ['delivery-options'],
  { revalidate: 3600, tags: ['delivery-options'] }
)
