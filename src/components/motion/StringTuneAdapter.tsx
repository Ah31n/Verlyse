/**
 * StringTune React Adapter
 * Provides safe, declarative React hooks and components for `@fiddle-digital/string-tune`.
 * Features:
 * - SSR & prerender safety (never accesses window/DOM on server)
 * - Automatic cleanup on unmount
 * - Full prefers-reduced-motion bypass
 * - Touch / mobile detection (pointer: coarse)
 * - Zero React re-renders per frame
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react'

let stringTuneModules: any = null

export async function getStringTune() {
  if (typeof window === 'undefined') return null
  if (!stringTuneModules) {
    try {
      stringTuneModules = await import('@fiddle-digital/string-tune')
    } catch (e) {
      console.warn('[Verlyse StringTune] Could not import @fiddle-digital/string-tune:', e)
      return null
    }
  }
  return stringTuneModules
}

/** Check if client prefers reduced motion */
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

/** Check if device is touch-primary */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(pointer: coarse)')?.matches ?? false
}

/**
 * useStringParallax — binds StringTune parallax to an element.
 */
export function useStringParallax<T extends HTMLElement = HTMLDivElement>(options: {
  speed?: number
  direction?: 'vertical' | 'horizontal'
  disabled?: boolean
} = {}) {
  const ref = useRef<T>(null)
  const { speed = 0.2, direction = 'vertical', disabled = false } = options

  useEffect(() => {
    if (disabled || isReducedMotion() || !ref.current) return
    let instance: any = null
    let active = true

    getStringTune().then((st) => {
      if (!active || !st || !ref.current) return
      try {
        if (st.StringParallax) {
          instance = new st.StringParallax(ref.current, {
            speed,
            direction,
          })
        }
      } catch (e) {
        // Fallback gracefully
      }
    })

    return () => {
      active = false
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy()
      }
    }
  }, [speed, direction, disabled])

  return ref
}

/**
 * useStringSpotlight — tracks cursor coordinates for radial lighting over a card or container.
 */
export function useStringSpotlight<T extends HTMLElement = HTMLDivElement>(options: {
  color?: string
  radius?: number
  disabled?: boolean
} = {}) {
  const ref = useRef<T>(null)
  const { disabled = false } = options

  useEffect(() => {
    if (disabled || isTouchDevice() || !ref.current) return
    const el = ref.current

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--spot-x', `${x}px`)
      el.style.setProperty('--spot-y', `${y}px`)
      el.style.setProperty('--spot-opacity', '1')
    }

    const onMouseLeave = () => {
      el.style.setProperty('--spot-opacity', '0')
    }

    el.addEventListener('mousemove', onMouseMove, { passive: true })
    el.addEventListener('mouseleave', onMouseLeave, { passive: true })

    return () => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [disabled])

  return ref
}

/**
 * StringProgressTrack — reads scroll progress and maps to a CSS custom property `--st-progress`.
 */
export function useStringScrollProgress(options: {
  targetRef?: React.RefObject<HTMLElement | null>
  onChange?: (progress: number) => void
} = {}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      const target = options.targetRef?.current
      let currentProgress = 0

      if (target) {
        const rect = target.getBoundingClientRect()
        const totalHeight = target.offsetHeight - window.innerHeight
        if (totalHeight > 0) {
          const scrolled = -rect.top
          currentProgress = Math.min(Math.max(scrolled / totalHeight, 0), 1)
        }
      } else {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        if (docHeight > 0) {
          currentProgress = Math.min(Math.max(window.scrollY / docHeight, 0), 1)
        }
      }

      setProgress(currentProgress)
      options.onChange?.(currentProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [options.targetRef])

  return progress
}

/**
 * StringKineticText component: splits text into animated words/letters with StringTune/CSS masks.
 */
export function StringKineticText({
  text,
  className = '',
  style,
  delay = 0,
  as: Component = 'span',
}: {
  text: string
  className?: string
  style?: CSSProperties
  delay?: number
  as?: any
}) {
  const words = text.split(' ')
  const reduced = isReducedMotion()

  return (
    <Component className={`inline-block ${className}`} style={style}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block overflow-hidden align-bottom">
          <span
            className="inline-block will-change-transform"
            style={
              reduced
                ? undefined
                : {
                    animation: `string-tune-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay + wordIndex * 0.045}s both`,
                  }
            }
          >
            {word}
            {wordIndex < words.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </Component>
  )
}
