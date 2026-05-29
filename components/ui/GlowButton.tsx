'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    const base =
      'relative inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all duration-200 will-change-transform transform-gpu focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080B14] disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-[#080B14] focus:ring-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.5)]',
      secondary:
        'border border-[#FF3E6C] text-[#FF3E6C] hover:bg-[#FF3E6C] hover:text-white focus:ring-[#FF3E6C] shadow-[0_0_15px_rgba(255,62,108,0.2)] hover:shadow-[0_0_30px_rgba(255,62,108,0.5)]',
      danger:
        'bg-[#FF3E6C] text-white hover:bg-[#e0335d] focus:ring-[#FF3E6C] shadow-[0_0_15px_rgba(255,62,108,0.3)]',
      ghost:
        'text-[#5A6478] hover:text-[#E8EAF0] hover:bg-white/5 border border-transparent hover:border-white/10',
    }

    const sizes = {
      sm: 'px-4 py-1.5 text-xs rounded',
      md: 'px-6 py-2.5 text-sm rounded',
      lg: 'px-8 py-3.5 text-base rounded-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

GlowButton.displayName = 'GlowButton'
export default GlowButton
