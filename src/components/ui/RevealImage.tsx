import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { useNearViewport } from '../../hooks/useNearViewport'

interface RevealImageProps {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  /** seconds the curtain takes; default 1.3 */
  duration?: number
  /** keep a slow ken burns settle after the reveal */
  settle?: boolean
}

/**
 * The editorial image reveal — the picture rises like a plate lifted
 * from the paper (clip-path curtain), while the image inside settles
 * from a gentle zoom. Calm, cinematic, and GPU-friendly.
 */
export default function RevealImage({ src, alt, className = '', imgClassName = '', duration = 1.3, settle = false }: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -6% 0px' })
  const near = useNearViewport(ref)
  const reduce = useReducedMotion()
  const show = inView || near

  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden ${className}`}
      initial={reduce ? false : { clipPath: 'inset(0% 0% 100% 0%)' }}
      animate={show ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
      transition={{ duration, ease: [0.65, 0.05, 0.36, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className={imgClassName}
        initial={reduce ? false : { scale: 1.18 }}
        animate={show ? { scale: settle ? 1.08 : 1 } : undefined}
        transition={{ duration: duration + 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  )
}
