import React from 'react'
import { clsx } from 'clsx'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'wine' | 'ivory' | 'outline' | 'subtle'
  size?: 'sm' | 'md'
}

export function Badge({
  className,
  variant = 'gold',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    gold: 'bg-gold/15 text-gold border border-gold/40',
    wine: 'bg-wine text-ivory border border-white/10',
    ivory: 'bg-ivory/10 text-ivory border border-white/20',
    outline: 'bg-transparent text-white/70 border border-white/15',
    subtle: 'bg-white/5 text-gold/80 border border-transparent',
  }

  const sizes = {
    sm: 'text-[9px] px-2.5 py-0.5 tracking-[0.2em]',
    md: 'text-[10px] px-3 py-1 tracking-[0.24em]',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center font-mono uppercase font-normal select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
