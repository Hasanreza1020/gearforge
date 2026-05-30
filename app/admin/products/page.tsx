import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import GlowButton from '@/components/ui/GlowButton'
import DeleteProductButton from '@/components/admin/DeleteProductButton'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

interface PageProps {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const limit = 25
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, category:categories(name)', { count: 'exact' })

  if (params.search) query = query.ilike('name', `%${params.search}%`)

  query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1)
  const { data: products, count } = await query

  const totalPages = Math.ceil((count ?? 0) / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0]">PRODUCTS</h1>
          <p className="text-[#5A6478] font-['Share_Tech_Mono'] text-xs mt-1">{count ?? 0} total products</p>
        </div>
        <Link href="/admin/products/new">
          <GlowButton size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Product</GlowButton>
        </Link>
      </div>

      {/* Search */}
      <form className="flex gap-3">
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Search products..."
          className="flex-1 bg-[#0D1117] border border-white/10 rounded px-3 py-2 text-sm text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 transition-colors font-['Rajdhani']"
        />
        <GlowButton type="submit" size="sm" variant="ghost">Search</GlowButton>
      </form>

      {/* Table */}
      <div className="bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 font-['Orbitron'] text-[10px] text-[#5A6478] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(products as Product[])?.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded overflow-hidden bg-[#080B14]">
                      {product.thumbnail ? (
                        <Image src={product.thumbnail} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg opacity-30">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-['Rajdhani'] font-semibold text-[#E8EAF0] text-sm line-clamp-1">{product.name}</p>
                    <p className="font-['Share_Tech_Mono'] text-[#5A6478] text-[10px]">{product.sku ?? '—'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-['Rajdhani'] text-[#5A6478] text-xs">
                      {(product.category as { name?: string })?.name ?? '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-['Share_Tech_Mono'] text-cyan-400 text-xs">{formatPrice(product.price)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-['Share_Tech_Mono'] text-xs ${product.stock_quantity === 0 ? 'text-red-400' : product.stock_quantity < 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-['Rajdhani'] uppercase ${product.is_active ? 'text-green-400 bg-green-400/10' : 'text-[#5A6478] bg-white/5'}`}>
                      {product.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/products/${product.id}`}>
                        <button className="p-1.5 text-[#5A6478] hover:text-cyan-400 transition-colors" aria-label="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products?.length && (
            <div className="text-center py-12">
              <p className="font-['Orbitron'] text-[#5A6478] text-xs tracking-widest">NO PRODUCTS FOUND</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-['Share_Tech_Mono'] text-[#5A6478] text-xs">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`?${new URLSearchParams({ ...params, page: String(page - 1) })}`}>
                <GlowButton size="sm" variant="ghost">← Prev</GlowButton>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`?${new URLSearchParams({ ...params, page: String(page + 1) })}`}>
                <GlowButton size="sm" variant="ghost">Next →</GlowButton>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
