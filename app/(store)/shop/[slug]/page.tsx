import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCachedProduct } from '@/lib/cache'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import ProductDetailClient from './ProductDetailClient'
import type { Review } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getCachedProduct(slug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description ?? `Buy ${product.name} at GearForge`,
    openGraph: {
      title: product.name,
      description: product.description ?? '',
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

async function ProductReviews({ productId }: { productId: string }) {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, user:profiles(full_name, avatar_url)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!reviews?.length) {
    return <p className="text-[#5A6478] font-['Rajdhani'] text-center py-8">No reviews yet. Be the first!</p>
  }

  return (
    <div className="space-y-4">
      {(reviews as (Review & { user: { full_name: string; avatar_url: string | null } })[]).map((review) => (
        <div key={review.id} className="bg-[#0D1117] border border-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                {review.user?.full_name?.[0] ?? '?'}
              </div>
              <span className="font-['Rajdhani'] font-semibold text-[#E8EAF0] text-sm">{review.user?.full_name ?? 'Anonymous'}</span>
              {review.is_verified_purchase && (
                <span className="text-[10px] text-green-400 font-['Share_Tech_Mono']">✓ Verified</span>
              )}
            </div>
            <span className="text-[#5A6478] font-['Share_Tech_Mono'] text-xs">{formatDate(review.created_at)}</span>
          </div>
          <div className="flex gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-sm ${s <= review.rating ? 'text-[#FFD700]' : 'text-[#5A6478]'}`}>★</span>
            ))}
          </div>
          {review.title && <p className="font-['Rajdhani'] font-bold text-[#E8EAF0] text-sm mb-1">{review.title}</p>}
          {review.body && <p className="text-[#5A6478] font-['Rajdhani'] text-sm">{review.body}</p>}
        </div>
      ))}
    </div>
  )
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getCachedProduct(slug)
  if (!product) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-['Share_Tech_Mono'] text-[#5A6478] mb-8">
        <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-cyan-400 transition-colors">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-cyan-400 transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[#E8EAF0]">{product.name}</span>
      </nav>

      <ProductDetailClient product={product as never} />

      {/* Reviews */}
      <div className="mt-16">
        <h2 className="font-['Orbitron'] text-lg font-bold text-[#E8EAF0] mb-6">
          PLAYER REVIEWS ({product.review_count})
        </h2>
        <div className="flex items-center gap-3 mb-8">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-2xl ${s <= Math.round(product.average_rating) ? 'text-[#FFD700]' : 'text-[#5A6478]'}`}>★</span>
            ))}
          </div>
          <span className="font-['Share_Tech_Mono'] text-[#E8EAF0] text-xl">{product.average_rating.toFixed(1)}</span>
          <span className="text-[#5A6478] font-['Rajdhani']">/ 5.0 · {product.review_count} reviews</span>
        </div>
        <Suspense fallback={<div className="text-[#5A6478] font-['Share_Tech_Mono'] text-xs">Loading reviews...</div>}>
          <ProductReviews productId={product.id} />
        </Suspense>
      </div>
    </div>
  )
}
