import { cn } from '@/lib/utils'

interface NeonBadgeProps {
  label: string
  color?: 'cyan' | 'pink' | 'yellow' | 'green' | 'red' | 'purple'
  className?: string
  pulse?: boolean
}

const colorMap = {
  cyan: 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30 shadow-[0_0_8px_rgba(0,245,255,0.3)]',
  pink: 'bg-[#FF3E6C]/15 text-[#FF3E6C] border-[#FF3E6C]/30 shadow-[0_0_8px_rgba(255,62,108,0.3)]',
  yellow: 'bg-[#FFD700]/15 text-[#FFD700] border-[#FFD700]/30 shadow-[0_0_8px_rgba(255,215,0,0.3)]',
  green: 'bg-green-400/15 text-green-400 border-green-400/30 shadow-[0_0_8px_rgba(74,222,128,0.3)]',
  red: 'bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.3)]',
  purple: 'bg-purple-400/15 text-purple-400 border-purple-400/30 shadow-[0_0_8px_rgba(192,132,252,0.3)]',
}

export default function NeonBadge({ label, color = 'cyan', className, pulse }: NeonBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded border',
        colorMap[color],
        pulse && 'animate-pulse',
        className
      )}
    >
      {label}
    </span>
  )
}
