import React, { useRef, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { isTouchDevice, isReducedMotion } from '../motion/StringTuneAdapter'

export function SpotlightCard({
  children,
  className = '',
  theme = 'dark',
  borderHighlight = true,
  stringId,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  theme?: 'dark' | 'paper'
  borderHighlight?: boolean
  stringId?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isTouchDevice() || isReducedMotion()) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--spot-x', `${x}px`)
    cardRef.current.style.setProperty('--spot-y', `${y}px`)
    cardRef.current.style.setProperty('--spot-opacity', '1')
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.setProperty('--spot-opacity', '0')
  }

  return (
    <div
      ref={cardRef}
      string="spotlight"
      string-id={stringId}
      string-lerp="0.2"
      string-dist-max="320"
      string-deadzone="4"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        'group relative overflow-hidden transition-all duration-500',
        theme === 'dark' ? 'editorial-spotlight' : 'editorial-spotlight-paper',
        className
      )}
      {...props}
    >
      {borderHighlight && (
        <div
          className="pointer-events-none absolute inset-0 z-10 border border-gold/20 transition-colors duration-500 group-hover:border-gold/50"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  )
}
