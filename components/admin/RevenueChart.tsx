'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import type { RevenueDataPoint } from '@/types'

interface RevenueChartProps {
  data: RevenueDataPoint[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const formattedData = useMemo(
    () => data.map((d) => ({ ...d, date: format(new Date(d.date), 'MMM dd') })),
    [data]
  )

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#5A6478', fontSize: 10, fontFamily: 'Share Tech Mono' }}
          axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#5A6478', fontSize: 10, fontFamily: 'Share Tech Mono' }}
          axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            background: '#0D1117',
            border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: '8px',
            fontFamily: 'Share Tech Mono',
            color: '#E8EAF0',
            fontSize: 12,
          }}
          labelStyle={{ color: '#5A6478' }}
          formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Revenue']}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#00F5FF"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: '#00F5FF', stroke: '#080B14', strokeWidth: 2 }}
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,245,255,0.5))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
