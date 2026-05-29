import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import type { Product } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single()
  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0]">EDIT PRODUCT</h1>
        <p className="text-[#5A6478] font-['Rajdhani'] text-sm mt-1">Modify product data</p>
      </div>
      <ProductForm product={product as Product} />
    </div>
  )
}
