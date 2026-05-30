'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import GlowButton from '@/components/ui/GlowButton'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'
import type { Product, Category } from '@/types'

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  price: z.string(),
  compare_at_price: z.string().optional(),
  category_id: z.string().optional(),
  stock_quantity: z.string(),
  sku: z.string().optional(),
  tags: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  weight_grams: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ProductFormProps {
  product?: Product
}

export default function ProductForm({ product }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [thumbnail, setThumbnail] = useState<string>(product?.thumbnail ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      price: String(product?.price ?? ''),
      compare_at_price: product?.compare_at_price ? String(product.compare_at_price) : '',
      category_id: product?.category_id ?? '',
      stock_quantity: String(product?.stock_quantity ?? '0'),
      sku: product?.sku ?? '',
      tags: product?.tags?.join(', ') ?? '',
      is_featured: product?.is_featured ?? false,
      is_active: product?.is_active ?? true,
      weight_grams: product?.weight_grams ? String(product.weight_grams) : '',
    },
  })

  const name = watch('name')
  useEffect(() => {
    if (!product) setValue('slug', slugify(name))
  }, [name, product, setValue])

  useEffect(() => {
    supabase.from('categories').select('*').order('display_order').then(({ data }) => {
      if (data) setCategories(data as Category[])
    })
  }, [supabase])

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Upload failed')
        return
      }
      if (data.url) {
        setImages((prev) => [...prev, data.url])
        if (!thumbnail) setThumbnail(data.url)
        toast.success('Image uploaded')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    }
    finally { setUploading(false) }
  }

  async function onSubmit(data: FormData) {
    setSaving(true)
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
        stock_quantity: parseInt(data.stock_quantity),
        weight_grams: data.weight_grams ? parseInt(data.weight_grams) : null,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        images,
        thumbnail,
      }

      if (product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id)
        if (error) throw error
        toast.success('Product updated')
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        toast.success('Product created')
      }

      // Bust the frontend cache so new products/images appear immediately
      await fetch('/api/revalidate', { method: 'POST' })

      router.push('/admin/products')
      router.refresh()
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {/* Basic Info */}
      <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
        <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-4">PRODUCT INFO</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'name' as const, label: 'Product Name', span: true },
            { name: 'slug' as const, label: 'URL Slug', span: true },
            { name: 'price' as const, label: 'Price ($)' },
            { name: 'compare_at_price' as const, label: 'Compare At Price ($)' },
            { name: 'stock_quantity' as const, label: 'Stock Quantity' },
            { name: 'sku' as const, label: 'SKU' },
            { name: 'weight_grams' as const, label: 'Weight (grams)' },
            { name: 'tags' as const, label: 'Tags (comma separated)' },
          ].map(({ name, label, span }) => (
            <div key={name} className={span ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">{label}</label>
              <input
                {...register(name)}
                className="w-full bg-[#080B14] border border-white/10 rounded px-3 py-2.5 text-sm text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 transition-colors font-['Rajdhani']"
              />
              {errors[name] && <p className="text-[10px] text-[#FF3E6C] mt-1">{(errors[name] as { message?: string })?.message}</p>}
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full bg-[#080B14] border border-white/10 rounded px-3 py-2.5 text-sm text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 transition-colors font-['Rajdhani'] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-['Rajdhani'] font-bold text-[#5A6478] uppercase tracking-wider mb-1">Category</label>
            <select
              {...register('category_id')}
              className="w-full bg-[#080B14] border border-white/10 rounded px-3 py-2.5 text-sm text-[#E8EAF0] focus:outline-none focus:border-cyan-400/50 transition-colors font-['Rajdhani']"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('is_featured')} type="checkbox" className="accent-cyan-400 w-4 h-4" />
              <span className="text-[#E8EAF0] font-['Rajdhani'] text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('is_active')} type="checkbox" className="accent-cyan-400 w-4 h-4" />
              <span className="text-[#E8EAF0] font-['Rajdhani'] text-sm">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
        <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-4">PRODUCT IMAGES</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((img, i) => (
            <div key={i} className={`relative w-20 h-20 rounded overflow-hidden border-2 ${thumbnail === img ? 'border-cyan-400' : 'border-white/10'}`}>
              <Image src={img} alt={`Image ${i + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImages((prev) => prev.filter((_, j) => j !== i))
                  if (thumbnail === img) setThumbnail(images.find((x) => x !== img) ?? '')
                }}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#FF3E6C] rounded-full flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
              {thumbnail !== img && (
                <button
                  type="button"
                  onClick={() => setThumbnail(img)}
                  className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white text-center py-0.5 font-['Rajdhani']"
                >
                  Set thumb
                </button>
              )}
              {thumbnail === img && (
                <div className="absolute bottom-0 left-0 right-0 bg-cyan-400/80 text-[8px] text-[#080B14] text-center py-0.5 font-['Rajdhani'] font-bold">
                  THUMB
                </div>
              )}
            </div>
          ))}
          <label className="w-20 h-20 rounded border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400/50 transition-colors">
            <input type="file" accept="image/*" className="sr-only" onChange={uploadImage} disabled={uploading} />
            <Upload className="w-5 h-5 text-[#5A6478]" />
            <span className="text-[8px] text-[#5A6478] mt-1 font-['Rajdhani']">{uploading ? 'uploading...' : 'Upload'}</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <GlowButton type="submit" size="lg" loading={saving}>
          {product ? 'Update Product' : 'Create Product'}
        </GlowButton>
        <GlowButton type="button" variant="ghost" size="lg" onClick={() => router.back()}>
          Cancel
        </GlowButton>
      </div>
    </form>
  )
}
