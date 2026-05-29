import { createClient } from '@/lib/supabase/server'
import OrdersTable from '@/components/admin/OrdersTable'
import type { Order } from '@/types'

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const limit = 25
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*, order_items(id), user:profiles(email, full_name)', { count: 'exact' })

  if (params.status) query = query.eq('status', params.status)
  if (params.search) {
    query = query.or(`order_number.ilike.%${params.search}%`)
  }

  query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1)
  const { data: orders, count } = await query

  const statuses = ['pending', 'payment_pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0]">ORDERS</h1>
        <p className="text-[#5A6478] font-['Share_Tech_Mono'] text-xs mt-1">{count ?? 0} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <a href="/admin/orders" className={`px-3 py-1.5 rounded text-xs font-['Rajdhani'] font-bold uppercase tracking-wider border transition-colors ${!params.status ? 'border-cyan-400 text-cyan-400' : 'border-white/10 text-[#5A6478] hover:border-white/20'}`}>
          All
        </a>
        {statuses.map((s) => (
          <a
            key={s}
            href={`?status=${s}`}
            className={`px-3 py-1.5 rounded text-xs font-['Rajdhani'] font-bold uppercase tracking-wider border transition-colors ${params.status === s ? 'border-cyan-400 text-cyan-400' : 'border-white/10 text-[#5A6478] hover:border-white/20'}`}
          >
            {s.replace('_', ' ')}
          </a>
        ))}
      </div>

      <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
        <OrdersTable orders={(orders as Order[]) ?? []} />
      </div>
    </div>
  )
}
