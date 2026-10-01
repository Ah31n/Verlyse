import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { CURSOR_SIZE } from './physics'

export type CursorMode =
  | 'default'
  | 'link'
  | 'article'
  | 'image'
  | 'archive'
  | 'drag'
  | 'search'
  | 'room'
  | 'magnetic'

let setGlobalCursorMode: ((mode: CursorMode, label?: string) => void) | null = null

export function setCursor(mode: CursorMode, label = '') {
  if (setGlobalCursorMode) {
    setGlobalCursorMode(mode, label)
  }
}

export function resetCursor() {
  if (setGlobalCursorMode) {
    setGlobalCursorMode('default', '')
  }
}

/**
 * EditorialCursor — contextual publication cursor.
 * Changes shape and label based on interactive targets (READ, ENTER, VIEW, OPEN, DRAG).
 * Strictly unmounted on touch devices (pointer: coarse) and reduced motion.
 */
export function EditorialCursor() {
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState<CursorMode>('default')
  const [label, setLabel] = useState<string>('')
  const [visible, setVisible] = useState(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Calibrated spring physics for smooth following without lag
  const springX = useSpring(mouseX, { damping: 28, stiffness: 350 })
  const springY = useSpring(mouseY, { damping: 28, stiffness: 350 })

  useEffect(() => {
    // Check if device supports fine hover pointer
    const finePointer = window.matchMedia?.('(pointer: fine)')?.matches
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    if (!finePointer || reduceMotion) {
      setEnabled(false)
      return
    }

    setEnabled(true)
    setGlobalCursorMode = (m, l = '') => {
      setMode(m)
      setLabel(l)
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const onMouseLeave = () => {
      setVisible(false)
    }

    // Auto-detect cursor mode from data-cursor attributes on elements
    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-cursor]') as HTMLElement | null
      if (target) {
        const targetMode = (target.getAttribute('data-cursor') || 'link') as CursorMode
        const targetLabel = target.getAttribute('data-cursor-label') || ''
        setMode(targetMode)
        setLabel(targetLabel)
      } else {
        const isInteractive = (e.target as HTMLElement)?.closest('a, button, input, textarea, select, [role="button"]')
        if (isInteractive) {
          setMode('link')
          setLabel('')
        } else {
          setMode('default')
          setLabel('')
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseover', onMouseOver, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseover', onMouseOver)
      setGlobalCursorMode = null
    }
  }, [visible, mouseX, mouseY])

  if (!enabled || !visible) return null

  // Size and styling configurations per cursor mode
  const isLarge = mode === 'article' || mode === 'room' || mode === 'image' || mode === 'archive' || mode === 'drag' || Boolean(label)

  const defaultLabel = (() => {
    if (label) return label
    switch (mode) {
      case 'article': return 'READ'
      case 'room': return 'ENTER'
      case 'image': return 'VIEW'
      case 'archive': return 'OPEN'
      case 'drag': return 'DRAG'
      default: return ''
    }
  })()

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 select-none"
      style={{
        x: springX,
        y: springY,
      }}
    >
      <motion.div
        className="flex items-center justify-center rounded-full border border-gold transition-all duration-300"
        animate={{
          width: isLarge ? CURSOR_SIZE.badge : mode === 'link' ? CURSOR_SIZE.link : CURSOR_SIZE.default,
          height: isLarge ? CURSOR_SIZE.badge : mode === 'link' ? CURSOR_SIZE.link : CURSOR_SIZE.default,
          backgroundColor: isLarge
            ? 'rgba(42, 8, 17, 0.92)'
            : mode === 'link'
            ? 'rgba(184, 145, 70, 0.15)'
            : 'rgba(184, 145, 70, 0.9)',
          borderColor: isLarge ? 'rgba(184, 145, 70, 0.8)' : 'rgba(184, 145, 70, 0.5)',
          scale: mode === 'magnetic' ? 1.4 : 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {isLarge && (
          <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.22em] text-gold text-center px-1">
            {defaultLabel}
          </span>
        )}
      </motion.div>
    </motion.div>
  )
}
