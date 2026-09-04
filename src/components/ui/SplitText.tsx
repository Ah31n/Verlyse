import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { useNearViewport } from '../../hooks/useNearViewport'

interface SplitTextProps {
  text: string
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  italicWord?: string
  delay?: number
}

/**
 * Masked word-by-word reveal — the signature headline entrance.
 * The `italicWord` fragment is rendered in gold italic serif.
 */
export default function SplitText({ text, as = 'h2', className = '', italicWord, delay = 0 }: SplitTextProps) {
  const ref = useRef<HTMLHeadingElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const near = useNearViewport(ref)
  const reduce = useReducedMotion()
  const Comp = motion[as] as typeof motion.h2
  const show = inView || near

  const words = text.split(' ')
  let consumed = 0
  const segments = words.map((word, i) => {
    const isItalic = italicWord ? text.slice(consumed, consumed + word.length) === italicWord && words[i] === italicWord : false
    consumed += word.length + 1
    return { word, isItalic, i }
  })

  return (
    <Comp ref={ref} className={`display ${className}`} aria-label={text}>
      {segments.map(({ word, isItalic, i }) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className={`inline-block ${isItalic ? 'italic text-gold font-normal' : ''}`}
            initial={reduce ? false : { y: '120%' }}
            animate={show ? { y: 0 } : undefined}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.05 }}
          >
            {word}
          </motion.span>
          {i < segments.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Comp>
  )
}
