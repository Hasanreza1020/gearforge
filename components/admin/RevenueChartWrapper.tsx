'use client'

import dynamic from 'next/dynamic'
import type { RevenueDataPoint } from '@/types'

const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false })

export default function RevenueChartWrapper({ data }: { data: RevenueDataPoint[] }) {
  return <RevenueChart data={data} />
}
