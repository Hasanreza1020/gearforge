'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductFilters } from '@/types'

export function useProducts(initialFilters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)
  const [total, setTotal] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      let query = supabase
        .from('products')
        .select('*, category:categories(*)', { count: 'exact' })
        .eq('is_active', true)

      if (filters.search) query = query.ilike('name', `%${filters.search}%`)
      if (filters.in_stock) query = query.gt('stock_quantity', 0)
      if (filters.is_featured) query = query.eq('is_featured', true)
      if (filters.min_price) query = query.gte('price', filters.min_price)
      if (filters.max_price) query = query.lte('price', filters.max_price)

      const sortMap: Record<string, { column: string; ascending: boolean }> = {
        price_asc: { column: 'price', ascending: true },
        price_desc: { column: 'price', ascending: false },
        newest: { column: 'created_at', ascending: false },
        rating: { column: 'average_rating', ascending: false },
      }
      const sort = sortMap[filters.sort ?? 'newest'] ?? sortMap.newest
      query = query.order(sort.column, { ascending: sort.ascending })

      const page = filters.page ?? 1
      const limit = filters.limit ?? 24
      query = query.range((page - 1) * limit, page * limit - 1)

      const { data, count } = await query
      setProducts((data as Product[]) ?? [])
      setTotal(count ?? 0)
      setLoading(false)
    }

    fetchProducts()
  }, [filters, supabase])

  return { products, loading, total, filters, setFilters }
}
