import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { useNearViewport } from '../../hooks/useNearViewport'

/**
 * THE BRASS RULE — an ornamental section rule that draws itself.
 *
 * A single hairline grows outward from the centre in both directions and a
 * small brass lozenge closes the composition at the end. Nothing else moves.
 *
 * ── ENGINE OWNERSHIP ─────────────────────────────────────────────────────
 * Anime.js is the ONLY animation engine that touches this element, and the
 * ONLY properties it writes are `stroke-dasharray` and `stroke-dashoffset`
 * (via animejs/svg `createDrawable`). `motion/react` owns the surrounding
 * section's opacity and transform; React Three Fiber owns 3D. No engine
 * shares a transform, camera or state property with this component.
 *
 * ── LAZY LOADING ─────────────────────────────────────────────────────────
 * `animejs` is dynamically imported ONLY when `!reduce && near` is true, so
 * the `anime-*.js` chunk is never requested on initial Home route load (while
 * the rule is offscreen) and is never requested at all under
 * `prefers-reduced-motion: reduce`.
 */

export default function BrassRule({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<SVGLineElement>(null)
  const rightRef = useRef<SVGLineElement>(null)
  const gemRef = useRef<SVGPathElement>(null)

  const reduce = useReducedMotion() === true
  const near = useNearViewport(wrapRef)

  useEffect(() => {
    if (reduce || !near) return undefined
    const lineEls = [leftRef.current, rightRef.current].filter(Boolean) as SVGGeometryElement[]
    const gemEl = gemRef.current
    if (!lineEls.length || !gemEl) return undefined

    let cancelled = false
    let pauseRules: (() => void) | null = null
    let pauseLozenge: (() => void) | null = null

    void import('animejs')
      .then(({ animate, createDrawable, cubicBezier }) => {
        if (cancelled) return
        const ease = cubicBezier(0.16, 1, 0.3, 1)
        const lines = createDrawable(lineEls, 0, 0)
        const gem = createDrawable(gemEl, 0, 0)
        for (const d of [...lines, ...gem]) d.setAttribute('draw', '0 0')

        const rulesAnim = animate(lines, {
          draw: '0 1',
          duration: 1500,
          ease,
        })
        const lozengeAnim = animate(gem, {
          draw: '0 1',
          duration: 900,
          delay: 780,
          ease,
        })
        pauseRules = () => rulesAnim.pause()
        pauseLozenge = () => lozengeAnim.pause()
      })
      .catch(() => {
        /* If the optional chunk fails to load, reveal the static rule cleanly. */
        if (cancelled) return
        for (const el of [...lineEls, gemEl]) {
          el.removeAttribute('stroke-dasharray')
          el.removeAttribute('stroke-dashoffset')
          el.removeAttribute('pathLength')
        }
      })

    return () => {
      cancelled = true
      pauseRules?.()
      pauseLozenge?.()
      for (const el of [...lineEls, gemEl]) {
        el.removeAttribute('stroke-dasharray')
        el.removeAttribute('stroke-dashoffset')
        el.removeAttribute('pathLength')
      }
    }
  }, [near, reduce])

  const initialDash = reduce ? undefined : 1

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      <svg
        viewBox="0 0 600 20"
        preserveAspectRatio="xMidYMid meet"
        className="h-5 w-full overflow-visible"
        focusable="false"
      >
        {/* drawn right-to-left so it grows toward the centre */}
        <line
          ref={leftRef}
          x1="10"
          y1="10"
          x2="272"
          y2="10"
          stroke="#B89146"
          strokeOpacity="0.55"
          strokeWidth="1"
          pathLength={initialDash}
          strokeDasharray={initialDash}
          strokeDashoffset={initialDash}
        />
        <line
          ref={rightRef}
          x1="590"
          y1="10"
          x2="328"
          y2="10"
          stroke="#B89146"
          strokeOpacity="0.55"
          strokeWidth="1"
          pathLength={initialDash}
          strokeDasharray={initialDash}
          strokeDashoffset={initialDash}
        />
        {/* the brass lozenge that closes the rule */}
        <path
          ref={gemRef}
          d="M300 2 L308 10 L300 18 L292 10 Z"
          fill="none"
          stroke="#B89146"
          strokeWidth="1"
          pathLength={initialDash}
          strokeDasharray={initialDash}
          strokeDashoffset={initialDash}
        />
      </svg>
    </div>
  )
}
