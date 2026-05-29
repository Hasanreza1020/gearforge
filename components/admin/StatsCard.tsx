import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  color?: 'cyan' | 'pink' | 'gold' | 'green'
  prefix?: string
}

const colorMap = {
  cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  pink: 'text-[#FF3E6C] bg-[#FF3E6C]/10 border-[#FF3E6C]/20',
  gold: 'text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/20',
  green: 'text-green-400 bg-green-400/10 border-green-400/20',
}

export default function StatsCard({ title, value, change, icon: Icon, color = 'cyan', prefix }: StatsCardProps) {
  return (
    <div className="bg-[#0D1117] border border-white/5 rounded-xl p-5 hover:border-cyan-500/20 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-['Rajdhani'] font-bold text-[#5A6478] text-xs uppercase tracking-widest mb-1">{title}</p>
          <p className="font-['Share_Tech_Mono'] text-2xl font-bold text-[#E8EAF0]">
            {prefix && <span className="text-[#5A6478] text-lg">{prefix}</span>}
            {value}
          </p>
        </div>
        <div className={cn('p-2.5 rounded-lg border', colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs font-["Share_Tech_Mono"]', change >= 0 ? 'text-green-400' : 'text-[#FF3E6C]')}>
          <span>{change >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(change).toFixed(1)}% vs last period</span>
        </div>
      )}
    </div>
  )
}
