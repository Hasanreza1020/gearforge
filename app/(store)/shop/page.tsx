import { Suspense } from 'react'
import type { Metadata } from 'next'
import ProductGrid from '@/components/store/ProductGrid'
import CategoryFilter from '@/components/store/CategoryFilter'
import LoadingScanner from '@/components/ui/LoadingScanner'
import { getCachedCategories } from '@/lib/cache'
import { createClient } from '@/lib/supabase/server'
import type { Product, ProductFilters } from '@/types'

export const metadata: Metadata = {
  title: 'Shop All Gaming Gear',
  description: 'Browse our full collection of premium gaming peripherals, accessories, and collectibles.',
}

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

async function ProductResults({ filters }: { filters: ProductFilters }) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('is_active', true)

  if (filters.search) query = query.ilike('name', `%${filters.search}%`)
  if (filters.is_featured) query = query.eq('is_featured', true)
  if (filters.in_stock) query = query.gt('stock_quantity', 0)
  if (filters.min_price) query = query.gte('price', filters.min_price)
  if (filters.max_price) query = query.lte('price', filters.max_price)

  if (filters.category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', filters.category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    price_asc: { column: 'price', ascending: true },
    price_desc: { column: 'price', ascending: false },
    newest: { column: 'created_at', ascending: false },
    rating: { column: 'average_rating', ascending: false },
  }
  const sort = sortMap[filters.sort ?? 'newest'] ?? sortMap.newest
  query = query.order(sort.column, { ascending: sort.ascending })

  const page = filters.page ?? 1
  const limit = 24
  query = query.range((page - 1) * limit, page * limit - 1)

  const { data, count } = await query

  return (
    <div>
      <p className="text-[#5A6478] font-['Share_Tech_Mono'] text-xs mb-6">
        {count ?? 0} PRODUCTS FOUND
      </p>
      <ProductGrid products={(data as Product[]) ?? []} columns={4} />
    </div>
  )
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const categories = await getCachedCategories()

  const filters: ProductFilters = {
    category: params.category,
    search: params.search,
    is_featured: params.is_featured === 'true',
    in_stock: params.in_stock === 'true',
    sort: (params.sort as ProductFilters['sort']) ?? 'newest',
    page: params.page ? parseInt(params.page) : 1,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0] mb-2">
          {filters.category
            ? categories.find((c) => c.slug === filters.category)?.name ?? 'Products'
            : filters.search
            ? `Search: "${filters.search}"`
            : 'ALL GEAR'}
        </h1>
        <p className="text-[#5A6478] font-['Rajdhani']">
          Premium gaming gear for elite players
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <CategoryFilter categories={categories} />
        </Suspense>
      </div>

      {/* Sort controls */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs font-['Share_Tech_Mono'] text-[#5A6478]">
          {filters.search && (
            <span className="px-2 py-1 bg-cyan-400/10 border border-cyan-400/30 rounded text-cyan-400">
              Search: {filters.search}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[#5A6478] text-xs font-['Rajdhani'] font-semibold uppercase tracking-wider">Sort:</label>
          <a href={`?${new URLSearchParams({ ...params, sort: 'newest' })}`}
            className={`text-xs font-['Rajdhani'] font-semibold uppercase transition-colors ${filters.sort === 'newest' || !filters.sort ? 'text-cyan-400' : 'text-[#5A6478] hover:text-[#E8EAF0]'}`}>
            Newest
          </a>
          <a href={`?${new URLSearchParams({ ...params, sort: 'price_asc' })}`}
            className={`text-xs font-['Rajdhani'] font-semibold uppercase transition-colors ${filters.sort === 'price_asc' ? 'text-cyan-400' : 'text-[#5A6478] hover:text-[#E8EAF0]'}`}>
            Price ↑
          </a>
          <a href={`?${new URLSearchParams({ ...params, sort: 'price_desc' })}`}
            className={`text-xs font-['Rajdhani'] font-semibold uppercase transition-colors ${filters.sort === 'price_desc' ? 'text-cyan-400' : 'text-[#5A6478] hover:text-[#E8EAF0]'}`}>
            Price ↓
          </a>
          <a href={`?${new URLSearchParams({ ...params, sort: 'rating' })}`}
            className={`text-xs font-['Rajdhani'] font-semibold uppercase transition-colors ${filters.sort === 'rating' ? 'text-cyan-400' : 'text-[#5A6478] hover:text-[#E8EAF0]'}`}>
            Rating
          </a>
        </div>
      </div>

      {/* Products */}
      <Suspense fallback={<LoadingScanner message="LOADING GEAR" />}>
        <ProductResults filters={filters} />
      </Suspense>
    </div>
  )
}
