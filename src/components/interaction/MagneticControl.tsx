import { type ReactNode } from 'react'
import { clsx } from 'clsx'

/**
 * MagneticControl — declarative StringTune magnetic container.
 * Uses real `string="magnetic"` attributes for fine pointers.
 * Disabled on touch / coarse pointers and prefers-reduced-motion via CSS rules.
 */
export function MagneticControl({
  children,
  strength = 0.25,
  radius = 120,
  stringId,
  className = '',
}: {
  children: ReactNode
  strength?: number
  radius?: number
  stringId?: string
  className?: string
}) {
  return (
    <div
      string="magnetic"
      string-id={stringId}
      string-strength={strength}
      string-radius={radius}
      className={clsx('inline-block will-change-transform', className)}
    >
      {children}
    </div>
  )
}
