'use client'

import Link from 'next/link'
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils'
import type { Order } from '@/types'

interface OrdersTableProps {
  orders: Order[]
  compact?: boolean
}

export default function OrdersTable({ orders, compact = false }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Action'].map((h) => (
              <th key={h} className="text-left py-3 px-3 font-['Orbitron'] text-[10px] text-[#5A6478] uppercase tracking-widest whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
              <td className="py-3 px-3">
                <span className="font-['Share_Tech_Mono'] text-cyan-400 text-xs">{order.order_number}</span>
              </td>
              <td className="py-3 px-3">
                <span className="font-['Rajdhani'] text-[#E8EAF0] text-sm">
                  {(order.user as { email?: string; full_name?: string })?.full_name ?? (order.user as { email?: string })?.email ?? '—'}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className="font-['Share_Tech_Mono'] text-[#5A6478] text-xs">{order.order_items?.length ?? 0}</span>
              </td>
              <td className="py-3 px-3">
                <span className="font-['Share_Tech_Mono'] text-[#E8EAF0] text-xs">{formatPrice(order.total)}</span>
              </td>
              <td className="py-3 px-3">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-['Rajdhani'] uppercase ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className="font-['Share_Tech_Mono'] text-[#5A6478] text-xs">{formatDate(order.created_at)}</span>
              </td>
              <td className="py-3 px-3">
                <Link href={`/admin/orders/${order.id}`} className="text-cyan-400 hover:text-cyan-300 text-xs font-['Rajdhani'] font-semibold transition-colors">
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="font-['Orbitron'] text-[#5A6478] text-xs tracking-widest">NO ORDERS FOUND</p>
        </div>
      )}
    </div>
  )
}
