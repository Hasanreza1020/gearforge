'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Eye, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import NeonBadge from '@/components/ui/NeonBadge'
import ParticleEffect from '@/components/ui/ParticleEffect'
import { useCart } from '@/hooks/useCart'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

const categoryColors: Record<string, 'cyan' | 'pink' | 'yellow' | 'green' | 'red' | 'purple'> = {
  'gaming-mice': 'cyan',
  keyboards: 'pink',
  headsets: 'purple',
  controllers: 'yellow',
  monitors: 'green',
  chairs: 'red',
  collectibles: 'yellow',
  'digital-games': 'cyan',
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [particle, setParticle] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addToCart } = useCart()
  const openCart = useCartStore((s) => s.openCart)

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price
  const discountPct = isOnSale
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0

  const categorySlug = product.category?.slug ?? ''
  const badgeColor = categoryColors[categorySlug] ?? 'cyan'

  const stockStatus =
    product.stock_quantity === 0
      ? { label: 'Out of Stock', color: 'text-red-400' }
      : product.stock_quantity < 5
      ? { label: `Only ${product.stock_quantity} left!`, color: 'text-yellow-400' }
      : { label: 'In Stock ✓', color: 'text-green-400' }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock_quantity === 0) return
    addToCart(product)
    openCart()
    setParticle(true)
    setTimeout(() => setParticle(false), 700)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative bg-[#0D1117]/80 backdrop-blur-sm border border-cyan-500/10 rounded-xl overflow-hidden hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(0,245,255,0.1)] transition-all duration-300 will-change-transform transform-gpu"
    >
      {/* Image */}
      <Link href={`/shop/${product.slug}`} className="block relative overflow-hidden aspect-square bg-[#080B14]">
        {product.thumbnail || product.images[0] ? (
          <Image
            src={product.thumbnail ?? product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110 will-change-transform"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-20">{product.category?.icon ?? '🎮'}</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <NeonBadge label={product.category?.name ?? 'Product'} color={badgeColor} />
        </div>

        {/* Sale / Hot badge */}
        {isOnSale && (
          <div className="absolute top-2 right-2">
            <NeonBadge label={`-${discountPct}%`} color="pink" pulse />
          </div>
        )}
        {product.is_featured && !isOnSale && (
          <div className="absolute top-2 right-2">
            <NeonBadge label="HOT" color="yellow" pulse />
          </div>
        )}

        {/* Quick view overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#080B14]/90 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Link
            href={`/shop/${product.slug}`}
            className="flex items-center justify-center gap-2 w-full py-1.5 text-xs font-bold uppercase tracking-wider text-[#E8EAF0] border border-white/20 rounded hover:border-cyan-400/50 hover:text-cyan-400 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </Link>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-['Rajdhani'] font-bold text-[#E8EAF0] text-sm leading-tight mb-1 group-hover:text-cyan-400 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`text-xs ${star <= Math.round(product.average_rating) ? 'text-[#FFD700]' : 'text-[#5A6478]'}`}>★</span>
          ))}
          <span className="text-[10px] text-[#5A6478] font-['Share_Tech_Mono'] ml-1">({product.review_count})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-['Share_Tech_Mono'] text-cyan-400 font-bold text-base">
            {formatPrice(product.price)}
          </span>
          {isOnSale && (
            <span className="font-['Share_Tech_Mono'] text-[#5A6478] text-xs line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>

        {/* Stock */}
        <p className={`font-['Rajdhani'] text-xs font-semibold mb-3 ${stockStatus.color} ${product.stock_quantity < 5 && product.stock_quantity > 0 ? 'animate-pulse' : ''}`}>
          {stockStatus.label}
        </p>

        {/* Add to cart */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ParticleEffect trigger={particle} />
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="relative w-full flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400 hover:text-[#080B14] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>
          <button
            onClick={() => setIsWishlisted((v) => !v)}
            className={`p-2 border rounded transition-colors ${isWishlisted ? 'border-[#FF3E6C]/50 text-[#FF3E6C]' : 'border-white/10 text-[#5A6478] hover:text-[#FF3E6C] hover:border-[#FF3E6C]/30'}`}
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
