import { Suspense } from 'react'
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/admin/StatsCard'
import OrdersTable from '@/components/admin/OrdersTable'
import RevenueChartWrapper from '@/components/admin/RevenueChartWrapper'
import { formatPrice } from '@/lib/utils'
import type { Order } from '@/types'

async function getDashboardData() {
  const supabase = await createClient()
  const [ordersResult, productsResult, customersResult] = await Promise.all([
    supabase.from('orders').select('*, order_items(*), user:profiles(email, full_name)').order('created_at', { ascending: false }).limit(10),
    supabase.from('products').select('id, name, stock_quantity, is_active'),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
  ])

  const orders = ordersResult.data ?? []
  const products = productsResult.data ?? []
  const customerCount = customersResult.count ?? 0

  // Revenue last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('total, created_at')
    .eq('status', 'paid')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at')

  const totalRevenue = (recentOrders ?? []).reduce((s, o) => s + o.total, 0)
  const activeProducts = products.filter((p) => p.is_active).length
  const lowStockProducts = products.filter((p) => p.stock_quantity < 5 && p.is_active)

  // Build revenue chart data
  const revenueByDate: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    revenueByDate[d.toISOString().slice(0, 10)] = 0
  }
  for (const o of recentOrders ?? []) {
    const date = o.created_at.slice(0, 10)
    if (revenueByDate[date] !== undefined) revenueByDate[date] += o.total
  }
  const chartData = Object.entries(revenueByDate).map(([date, revenue]) => ({ date, revenue, orders: 0 }))

  return { orders, totalRevenue, activeProducts, customerCount, lowStockProducts, chartData }
}

export default async function AdminDashboard() {
  const { orders, totalRevenue, activeProducts, customerCount, lowStockProducts, chartData } = await getDashboardData()

  const stats = [
    { title: 'Total Revenue (30d)', value: formatPrice(totalRevenue), icon: DollarSign, color: 'cyan' as const },
    { title: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'pink' as const },
    { title: 'Active Products', value: activeProducts, icon: Package, color: 'gold' as const },
    { title: 'Customers', value: customerCount, icon: Users, color: 'green' as const },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0]">COMMAND CENTER</h1>
        <p className="text-[#5A6478] font-['Rajdhani'] text-sm mt-1">Mission overview and intel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
        <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider mb-6">REVENUE — LAST 30 DAYS</h2>
        <Suspense fallback={<div className="h-[280px] flex items-center justify-center text-[#5A6478] font-['Share_Tech_Mono'] text-xs">Loading chart...</div>}>
          <RevenueChartWrapper data={chartData} />
        </Suspense>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-[#0D1117] border border-[#FF3E6C]/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-[#FF3E6C]" />
            <h2 className="font-['Orbitron'] text-sm font-bold text-[#FF3E6C] tracking-wider">LOW STOCK ALERT</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="bg-[#FF3E6C]/5 border border-[#FF3E6C]/20 rounded-lg p-3 flex items-center justify-between">
                <span className="font-['Rajdhani'] font-semibold text-[#E8EAF0] text-sm truncate">{p.name}</span>
                <span className={`font-['Share_Tech_Mono'] text-xs font-bold ml-2 flex-shrink-0 ${p.stock_quantity === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {p.stock_quantity === 0 ? 'OUT' : `${p.stock_quantity} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-[#0D1117] border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Orbitron'] text-sm font-bold text-[#E8EAF0] tracking-wider">RECENT MISSIONS</h2>
          <a href="/admin/orders" className="text-cyan-400 text-xs font-['Rajdhani'] font-semibold hover:text-cyan-300">View All →</a>
        </div>
        <OrdersTable orders={orders as Order[]} />
      </div>
    </div>
  )
}
