'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Heart, Minus, Plus, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import GlowButton from '@/components/ui/GlowButton'
import NeonBadge from '@/components/ui/NeonBadge'
import ParticleEffect from '@/components/ui/ParticleEffect'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(product.thumbnail ?? product.images[0] ?? '')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description')
  const [particle, setParticle] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addToCart } = useCart()

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price
  const discountPct = isOnSale
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0

  function handleAddToCart() {
    if (product.stock_quantity === 0) return
    addToCart(product, quantity)
    setParticle(true)
    setTimeout(() => setParticle(false), 700)
  }

  const allImages = [product.thumbnail, ...product.images].filter(Boolean) as string[]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Images */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0D1117] border border-cyan-500/10">
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">
              {product.category?.icon ?? '🎮'}
            </div>
          )}
          {isOnSale && (
            <div className="absolute top-4 left-4">
              <NeonBadge label={`-${discountPct}% OFF`} color="pink" />
            </div>
          )}
        </div>
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-cyan-400' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <Image src={img} alt={`View ${i + 1}`} width={64} height={64} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-6">
        {product.category && (
          <NeonBadge label={product.category.name} color="cyan" />
        )}

        <h1 className="font-['Orbitron'] text-2xl sm:text-3xl font-bold text-[#E8EAF0] leading-tight">
          {product.name}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-lg ${s <= Math.round(product.average_rating) ? 'text-[#FFD700]' : 'text-[#5A6478]'}`}>★</span>
            ))}
          </div>
          <span className="font-['Share_Tech_Mono'] text-[#E8EAF0]">{product.average_rating.toFixed(1)}</span>
          <span className="text-[#5A6478] text-sm">({product.review_count} reviews)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="font-['Share_Tech_Mono'] text-4xl font-bold text-cyan-400">
            {formatPrice(product.price)}
          </span>
          {isOnSale && (
            <span className="font-['Share_Tech_Mono'] text-xl text-[#5A6478] line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className={`flex items-center gap-2 text-sm font-['Rajdhani'] font-bold ${product.stock_quantity === 0 ? 'text-red-400' : product.stock_quantity < 5 ? 'text-yellow-400 animate-pulse' : 'text-green-400'}`}>
          <span className={`w-2 h-2 rounded-full ${product.stock_quantity === 0 ? 'bg-red-400' : product.stock_quantity < 5 ? 'bg-yellow-400' : 'bg-green-400'}`} />
          {product.stock_quantity === 0
            ? 'OUT OF STOCK'
            : product.stock_quantity < 5
            ? `⚠ ONLY ${product.stock_quantity} LEFT!`
            : `IN STOCK (${product.stock_quantity} units)`}
        </div>

        {/* SKU */}
        {product.sku && (
          <p className="font-['Share_Tech_Mono'] text-[#5A6478] text-xs">SKU: {product.sku}</p>
        )}

        {/* Quantity */}
        {product.stock_quantity > 0 && (
          <div className="flex items-center gap-4">
            <span className="font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider text-sm">Qty:</span>
            <div className="flex items-center border border-white/20 rounded">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-[#E8EAF0] hover:text-cyan-400 hover:bg-cyan-400/5 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-['Share_Tech_Mono'] text-[#E8EAF0]">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                className="w-10 h-10 flex items-center justify-center text-[#E8EAF0] hover:text-cyan-400 hover:bg-cyan-400/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <ParticleEffect trigger={particle} />
            <GlowButton
              fullWidth
              size="lg"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Loadout
            </GlowButton>
          </div>
          <button
            onClick={() => setIsWishlisted((v) => !v)}
            className={`p-3.5 border rounded-lg transition-all ${isWishlisted ? 'border-[#FF3E6C] text-[#FF3E6C] bg-[#FF3E6C]/10' : 'border-white/20 text-[#5A6478] hover:border-[#FF3E6C]/50 hover:text-[#FF3E6C]'}`}
            aria-label="Add to wishlist"
          >
            <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Shipping note */}
        <div className="flex items-center gap-2 bg-cyan-400/5 border border-cyan-400/10 rounded-lg p-3 text-sm">
          <Truck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="font-['Rajdhani'] text-[#5A6478]">Free shipping on orders over <span className="text-cyan-400 font-bold">$75</span></span>
        </div>

        {/* Tabs */}
        <div>
          <div className="flex border-b border-white/10">
            {(['description', 'specs', 'shipping'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider font-['Rajdhani'] transition-colors border-b-2 -mb-[2px] ${activeTab === tab ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-[#5A6478] hover:text-[#E8EAF0]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="py-4">
            {activeTab === 'description' && (
              <p className="text-[#5A6478] font-['Rajdhani'] leading-relaxed">
                {product.description ?? 'No description available.'}
              </p>
            )}
            {activeTab === 'specs' && (
              <div className="space-y-2">
                {product.sku && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-[#5A6478] font-['Rajdhani'] text-sm">SKU</span>
                    <span className="font-['Share_Tech_Mono'] text-[#E8EAF0] text-sm">{product.sku}</span>
                  </div>
                )}
                {product.weight_grams && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-[#5A6478] font-['Rajdhani'] text-sm">Weight</span>
                    <span className="font-['Share_Tech_Mono'] text-[#E8EAF0] text-sm">{product.weight_grams}g</span>
                  </div>
                )}
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {product.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[#5A6478] text-xs font-['Share_Tech_Mono']">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="space-y-3 text-sm font-['Rajdhani']">
                <div className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-lg">
                  <span className="text-lg">📦</span>
                  <div>
                    <p className="font-bold text-[#E8EAF0]">Standard (5-7 days)</p>
                    <p className="text-[#5A6478]">$5.99 · Free over $75</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-lg">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="font-bold text-[#E8EAF0]">Express (2-3 days)</p>
                    <p className="text-[#5A6478]">$14.99</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-lg">
                  <span className="text-lg">🚀</span>
                  <div>
                    <p className="font-bold text-[#E8EAF0]">Overnight</p>
                    <p className="text-[#5A6478]">$29.99</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
