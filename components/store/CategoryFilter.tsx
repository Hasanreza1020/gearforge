'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Link
        href="/shop"
        className={cn(
          'flex-shrink-0 px-4 py-1.5 rounded border text-xs font-bold uppercase tracking-widest font-[\'Rajdhani\'] transition-all',
          !currentCategory
            ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10 shadow-[0_0_10px_rgba(0,245,255,0.2)]'
            : 'border-white/10 text-[#5A6478] hover:border-cyan-400/30 hover:text-[#E8EAF0]'
        )}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/shop?category=${cat.slug}`}
          className={cn(
            'flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded border text-xs font-bold uppercase tracking-widest font-[\'Rajdhani\'] transition-all',
            currentCategory === cat.slug
              ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10 shadow-[0_0_10px_rgba(0,245,255,0.2)]'
              : 'border-white/10 text-[#5A6478] hover:border-cyan-400/30 hover:text-[#E8EAF0]'
          )}
        >
          <span>{cat.icon}</span>
          {cat.name}
        </Link>
      ))}
    </div>
  )
}
