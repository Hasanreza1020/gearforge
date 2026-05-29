import ProductCard from './ProductCard'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns]

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🎮</p>
        <p className="font-['Orbitron'] text-[#5A6478] text-sm tracking-widest">NO PRODUCTS FOUND</p>
      </div>
    )
  }

  return (
    <div className={`grid ${colClass} gap-4 md:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
