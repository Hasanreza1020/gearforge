import { cn } from '@/lib/utils'

interface LoadingScannerProps {
  fullScreen?: boolean
  message?: string
  className?: string
}

export default function LoadingScanner({
  fullScreen = false,
  message = 'LOADING',
  className,
}: LoadingScannerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-[#080B14]',
        fullScreen ? 'fixed inset-0 z-50' : 'w-full py-20',
        className
      )}
    >
      <div className="relative w-48 h-1 bg-[#0D1117] rounded overflow-hidden mb-6">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-cyan-400 rounded animate-[scanner_1.5s_ease-in-out_infinite] shadow-[0_0_12px_rgba(0,245,255,0.8)]" />
      </div>
      <p className="font-['Orbitron'] text-cyan-400 text-sm tracking-[0.3em] animate-pulse">
        {message}
        <span className="inline-block ml-1 animate-[blink_1s_step-end_infinite]">...</span>
      </p>
    </div>
  )
}
