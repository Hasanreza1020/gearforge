import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Profile } from '@/types'

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const limit = 25
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('role', 'customer')

  if (params.search) {
    query = query.or(`email.ilike.%${params.search}%,full_name.ilike.%${params.search}%`)
  }

  query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1)
  const { data: customers, count } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0]">CUSTOMERS</h1>
        <p className="text-[#5A6478] font-['Share_Tech_Mono'] text-xs mt-1">{count ?? 0} registered players</p>
      </div>

      <form className="flex gap-3">
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Search by name or email..."
          className="flex-1 bg-[#0D1117] border border-white/10 rounded px-3 py-2 text-sm text-[#E8EAF0] placeholder:text-[#5A6478] focus:outline-none focus:border-cyan-400/50 font-['Rajdhani']"
        />
        <button type="submit" className="px-4 py-2 border border-white/10 rounded text-xs font-['Rajdhani'] font-bold uppercase text-[#5A6478] hover:text-[#E8EAF0] hover:border-white/20 transition-colors">Search</button>
      </form>

      <div className="bg-[#0D1117] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Player', 'Email', 'Level', 'Orders', 'Spent', 'Joined'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 font-['Orbitron'] text-[10px] text-[#5A6478] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(customers as Profile[])?.map((customer) => (
                <tr key={customer.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cyan-400/20 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">
                        {customer.full_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="font-['Rajdhani'] font-semibold text-[#E8EAF0] text-sm">{customer.full_name ?? 'Anonymous'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-['Share_Tech_Mono'] text-[#5A6478] text-xs">{customer.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-['Rajdhani'] text-[#FFD700] text-xs font-bold">{customer.level ?? 'Bronze'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-['Share_Tech_Mono'] text-[#E8EAF0] text-xs">{customer.total_orders ?? 0}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-['Share_Tech_Mono'] text-cyan-400 text-xs">{formatPrice(customer.total_spent ?? 0)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-['Share_Tech_Mono'] text-[#5A6478] text-xs">{formatDate(customer.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!customers?.length && (
            <div className="text-center py-12">
              <p className="font-['Orbitron'] text-[#5A6478] text-xs tracking-widest">NO CUSTOMERS FOUND</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
