import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost' | 'seal' | 'paper' | 'outline' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  shimmer?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'md', isLoading = false, shimmer = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-sans font-semibold uppercase tracking-[0.24em] transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-wine-deep disabled:pointer-events-none disabled:opacity-40 overflow-hidden select-none active:translate-y-[1px]'

    const variants = {
      gold: 'bg-gold text-[#171212] border border-gold hover:text-ivory before:absolute before:inset-0 before:-z-10 before:origin-bottom before:bg-wine-deep before:scale-y-0 hover:before:scale-y-100 before:transition-transform before:duration-500',
      ghost: 'bg-transparent text-ivory border border-gold/60 hover:text-charcoal hover:border-gold before:absolute before:inset-0 before:-z-10 before:origin-bottom before:bg-gold before:scale-y-0 hover:before:scale-y-100 before:transition-transform before:duration-500',
      seal: 'bg-transparent text-wine border border-wine hover:text-[#F2EADA] before:absolute before:inset-0 before:-z-10 before:origin-bottom before:bg-wine-deep before:scale-y-0 hover:before:scale-y-100 before:transition-transform before:duration-500',
      paper: 'bg-paper text-wine-deep border border-wine/30 hover:bg-ivory hover:border-gold shadow-sm',
      outline: 'bg-transparent text-ivory/80 border border-white/20 hover:border-gold hover:text-gold',
      link: 'bg-transparent text-gold hover:text-ivory underline underline-offset-4 tracking-[0.18em] !p-0 !h-auto',
    }

    const sizes = {
      sm: 'text-[9px] px-5 py-2.5 tracking-[0.22em]',
      md: 'text-[11px] px-8 py-3.5 tracking-[0.24em]',
      lg: 'text-xs px-10 py-4.5 tracking-[0.26em]',
      icon: 'h-10 w-10 p-0',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {shimmer && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[brass-shimmer_1.5s_infinite]"
          />
        )}
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'
