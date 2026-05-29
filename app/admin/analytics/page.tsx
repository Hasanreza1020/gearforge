import { createClient } from '@/lib/supabase/server'
import RevenueChartWrapper from '@/components/admin/RevenueChartWrapper'
import type { RevenueDataPoint } from '@/types'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('total, created_at')
    .eq('status', 'paid')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at')

  const revenueByDate: Record<string, { revenue: number; orders: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    revenueByDate[d.toISOString().slice(0, 10)] = { revenue: 0, orders: 0 }
  }
  for (const o of recentOrders ?? []) {
    const date = o.created_at.slice(0, 10)
    if (revenueByDate[date]) {
      revenueByDate[date].revenue += o.total
      revenueByDate[date].orders += 1
    }
  }
  const chartData: RevenueDataPoint[] = Object.entries(revenueByDate).map(([date, v]) => ({ date, ...v }))
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = chartData.reduce((s, d) => s + d.orders, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0]">ANALYTICS</h1>
        <p className="text-[#5A6478] font-['Rajdhani'] text-sm mt-1">Intelligence report — last 30 days</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
          <p className="text-[#5A6478] font-['Rajdhani'] text-xs uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="font-['Share_Tech_Mono'] text-2xl text-cyan-400 font-bold">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5">
          <p className="text-[#5A6478] font-['Rajdhani'] text-xs uppercase tracking-widest mb-1">Total Orders</p>
          <p className="font-['Share_Tech_Mono'] text-2xl text-[#FF3E6C] font-bold">{totalOrders}</p>
        </div>
      </div>

      <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
        <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-6">REVENUE CHART</h2>
        <RevenueChartWrapper data={chartData} />
      </div>
    </div>
  )
}
