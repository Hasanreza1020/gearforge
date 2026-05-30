'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      toast.error('Failed to delete product')
      setDeleting(false)
      setConfirming(false)
      return
    }
    await fetch('/api/revalidate', { method: 'POST' })
    toast.success(`"${productName}" deleted`)
    router.refresh()
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-2 py-0.5 text-[10px] font-bold font-['Rajdhani'] uppercase bg-[#FF3E6C] text-white rounded hover:bg-[#FF3E6C]/80 transition-colors disabled:opacity-50"
        >
          {deleting ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-0.5 text-[10px] font-bold font-['Rajdhani'] uppercase border border-white/20 text-[#5A6478] rounded hover:border-white/40 transition-colors"
        >
          No
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 text-[#5A6478] hover:text-[#FF3E6C] transition-colors"
      aria-label="Delete product"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
