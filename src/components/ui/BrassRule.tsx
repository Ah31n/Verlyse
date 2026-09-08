import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { animate, createDrawable, cubicBezier } from 'animejs'
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
 * ── WHY ANIME.JS RATHER THAN motion/react ────────────────────────────────
 * This is a path-length draw, not a layout or route transition. anime.js
 * ships `createDrawable`, which measures the geometry (`pathLength`) and
 * drives the dash pair as a single normalised `draw: "start end"` value, so
 * both directions of the rule and the lozenge share one timeline. Doing the
 * same with motion/react means measuring every path by hand, animating two
 * dash properties per element, and keeping them in sync — more code, and it
 * would put a second engine on an SVG surface for no benefit.
 *
 * ── ACCESSIBILITY / REDUCED MOTION ───────────────────────────────────────
 * Purely ornamental: `aria-hidden` and `pointer-events-none`, so it can never
 * receive focus or be announced. Under `prefers-reduced-motion` the rule
 * renders fully drawn and no timeline is created at all — the dash attributes
 * are never applied, so there is nothing to animate and nothing to clean up.
 *
 * ── CLEANUP ──────────────────────────────────────────────────────────────
 * The animation is paused on unmount, and the dash attributes are removed so
 * no inline style is left behind and no observer or timer outlives the mount.
 */

/* the same expo-out curve the publication already uses for entrances */
const EASE = cubicBezier(0.16, 1, 0.3, 1)

export default function BrassRule({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<SVGLineElement>(null)
  const rightRef = useRef<SVGLineElement>(null)
  const gemRef = useRef<SVGPathElement>(null)

  const reduce = useReducedMotion()
  const near = useNearViewport(wrapRef)

  /* holds the drawable proxies once collapsed, so the near-viewport effect can animate them */
  const drawables = useRef<{
    lines: ReturnType<typeof createDrawable>
    gem: ReturnType<typeof createDrawable>
  } | null>(null)

  /* 1 · collapse once on mount, so the rule is never briefly shown pre-drawn.
         Skipped entirely under reduced motion: no dash attributes are ever set,
         so the SVG simply renders complete. */
  useEffect(() => {
    if (reduce) return
    const lineEls = [leftRef.current, rightRef.current].filter(Boolean) as SVGGeometryElement[]
    const gemEl = gemRef.current
    if (!lineEls.length || !gemEl) return

    try {
      const lines = createDrawable(lineEls, 0, 0)
      const gem = createDrawable(gemEl, 0, 0)
      /* createDrawable only applies its initial collapsed state the first time
         it sees an element (it keys off `pathLength`). Under StrictMode the
         effect runs twice, so the second pass would leave the rule fully drawn
         and it would flash before redrawing. Force the collapsed state
         explicitly so the rule is never shown pre-drawn. */
      for (const d of [...lines, ...gem]) d.setAttribute('draw', '0 0')
      drawables.current = { lines, gem }
    } catch {
      /* if the drawable cannot be built, leave the rule fully drawn */
      drawables.current = null
    }

    return () => {
      /* restore plain geometry — no dash or pathLength state left behind, so a
         remount re-initialises cleanly */
      for (const el of [...lineEls, gemEl]) {
        el.removeAttribute('stroke-dasharray')
        el.removeAttribute('stroke-dashoffset')
        el.removeAttribute('pathLength')
      }
      drawables.current = null
    }
  }, [reduce])

  /* 2 · draw once, when the rule comes near the viewport */
  useEffect(() => {
    if (reduce || !near || !drawables.current) return
    const { lines, gem } = drawables.current

    const rules = animate(lines, {
      draw: '0 1',
      duration: 1500,
      ease: EASE,
    })

    const lozenge = animate(gem, {
      draw: '0 1',
      duration: 900,
      delay: 780,
      ease: EASE,
    })

    return () => {
      rules.pause()
      lozenge.pause()
    }
  }, [near, reduce])

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
        />
        {/* the brass lozenge that closes the rule */}
        <path
          ref={gemRef}
          d="M300 2 L308 10 L300 18 L292 10 Z"
          fill="none"
          stroke="#B89146"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}
