import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface CountUpProps {
  value: number
  className?: string
  duration?: number
}

/** A quiet count-up — the ledger's numbers arrive like a tally being kept. */
export default function CountUp({ value, className = '', duration = 1.8 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) { setN(value); return }
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduce, value, duration])

  return (
    <span ref={ref} className={`tnum ${className}`}>
      {n.toLocaleString('en-US')}
    </span>
  )
}
