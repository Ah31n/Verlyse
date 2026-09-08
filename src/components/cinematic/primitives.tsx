import type { ReactNode } from 'react'
import gsap from 'gsap'
import { useCinematic } from './useCinematic'

/**
 * The cinematic primitives — Higgsfield-style camera moves built on GSAP
 * ScrollTrigger, scrubbed to the visitor's own scroll position.
 *
 * Nothing here pins, traps or hijacks the scrollbar: every tween is `scrub`,
 * so the page moves when the visitor moves and stops when they stop. The drama
 * is in the camera, not in taking control away.
 *
 * OWNERSHIP RULE, ENFORCED STRUCTURALLY
 * ------------------------------------
 * Every primitive renders two nested elements:
 *
 *   outer  — carries `className`, so the page's layout and positioning stay in
 *            the page's hands. GSAP never writes to it.
 *   inner  — created here, animated here, and the ONLY element GSAP touches.
 *
 * Children therefore sit *inside* the animated element and are never targeted
 * by GSAP. That is what keeps `motion/react` in sole possession of the
 * `motion.section` reveals and anime.js in sole possession of the BrassRule
 * stroke: no property on any element is written by two engines.
 */

interface WrapProps {
  children: ReactNode
  className?: string
}

/** Returns the inner animation target, or null if the tree is not as expected. */
function target(root: HTMLElement): HTMLElement | null {
  return (root.firstElementChild as HTMLElement | null) ?? null
}

/**
 * CRASH ZOOM — the signature dolly-through. The subject scales toward the
 * camera and dissolves as the visitor scrolls past, as though the lens kept
 * travelling after the subject was gone.
 */
export function CrashZoom({
  children,
  className = '',
  scaleFrom = 1,
  scaleTo = 2.2,
  fadeTo = 0,
  start = 'top top',
  end = '+=75%',
}: WrapProps & {
  scaleFrom?: number
  scaleTo?: number
  fadeTo?: number
  start?: string
  end?: string
}) {
  const scope = useCinematic((root) => {
    const el = target(root)
    if (!el) return
    gsap.fromTo(
      el,
      { scale: scaleFrom, opacity: 1, transformOrigin: '50% 50%', willChange: 'transform, opacity' },
      {
        scale: scaleTo,
        opacity: fadeTo,
        ease: 'none',
        scrollTrigger: { trigger: root, start, end, scrub: 0.6 },
      },
    )
  })
  return (
    <div ref={scope} className={className}>
      <div>{children}</div>
    </div>
  )
}

/**
 * DEPTH STAGE — a lens tilting down through a stack of paper. The outer
 * element holds the perspective; the inner one rotates on the X axis only, so
 * the move reads as depth without ever widening the layout.
 */
export function DepthStage({
  children,
  className = '',
  tiltFrom = 10,
  tiltTo = 0,
  perspective = 1400,
  start = 'top 88%',
  end = 'top 18%',
}: WrapProps & {
  tiltFrom?: number
  tiltTo?: number
  perspective?: number
  start?: string
  end?: string
}) {
  const scope = useCinematic((root) => {
    const el = target(root)
    if (!el) return
    gsap.fromTo(
      el,
      { rotateX: tiltFrom, transformOrigin: '50% 0%', willChange: 'transform' },
      {
        rotateX: tiltTo,
        ease: 'none',
        scrollTrigger: { trigger: root, start, end, scrub: 0.7 },
      },
    )
  })
  return (
    <div ref={scope} className={className} style={{ perspective }}>
      <div>{children}</div>
    </div>
  )
}

/**
 * DEPTH LAYER — parallax separation. Wrapping each sheet in a layer travelling
 * at its own rate is what makes the stack read as physical sheets at different
 * distances rather than one flat column.
 */
export function DepthLayer({
  children,
  className = '',
  distance = 44,
  start = 'top bottom',
  end = 'bottom top',
}: WrapProps & { distance?: number; start?: string; end?: string }) {
  const scope = useCinematic((root) => {
    const el = target(root)
    if (!el) return
    gsap.fromTo(
      el,
      { y: distance, willChange: 'transform' },
      {
        y: -distance,
        ease: 'none',
        scrollTrigger: { trigger: root, start, end, scrub: 0.8 },
      },
    )
  })
  return (
    <div ref={scope} className={className}>
      <div>{children}</div>
    </div>
  )
}

/**
 * ORBITAL DRIFT — a slow yaw across the whole stack, the move that sells the
 * sense of a camera circling the subject. Kept to a few degrees: enough to read
 * as an orbit, small enough not to threaten the layout bounds.
 */
export function OrbitalDrift({
  children,
  className = '',
  yawFrom = -2.6,
  yawTo = 2.6,
  start = 'top bottom',
  end = 'bottom top',
}: WrapProps & { yawFrom?: number; yawTo?: number; start?: string; end?: string }) {
  const scope = useCinematic((root) => {
    const el = target(root)
    if (!el) return
    gsap.fromTo(
      el,
      { rotateY: yawFrom, transformOrigin: '50% 50%', willChange: 'transform' },
      {
        rotateY: yawTo,
        ease: 'none',
        scrollTrigger: { trigger: root, start, end, scrub: 0.9 },
      },
    )
  })
  return (
    <div ref={scope} className={className}>
      <div>{children}</div>
    </div>
  )
}

/**
 * PUSH IN — the closing beat. The subject settles toward the lens as it
 * arrives, so the sequence ends rather than merely stopping.
 */
export function PushIn({
  children,
  className = '',
  scaleFrom = 0.93,
  start = 'top 85%',
  end = 'top 35%',
}: WrapProps & { scaleFrom?: number; start?: string; end?: string }) {
  const scope = useCinematic((root) => {
    const el = target(root)
    if (!el) return
    gsap.fromTo(
      el,
      { scale: scaleFrom, opacity: 0.35, transformOrigin: '50% 100%', willChange: 'transform, opacity' },
      {
        scale: 1,
        opacity: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: root, start, end, scrub: 0.6 },
      },
    )
  })
  return (
    <div ref={scope} className={className}>
      <div>{children}</div>
    </div>
  )
}

/**
 * MAGNETIC — the GSAP-homepage micro-interaction. The child is drawn a few
 * percent toward the cursor while the pointer is over the wrapper, and springs
 * home when it leaves. Hover-only: it never runs on touch, never affects layout,
 * and under reduced motion no listeners are attached at all.
 */
export function Magnetic({
  children,
  className = '',
  strength = 0.3,
}: WrapProps & { strength?: number }) {
  const scope = useCinematic((root) => {
    const el = target(root)
    if (!el) return
    // Hover-only micro-interaction: on touch there is no cursor to follow, and
    // emulated post-tap mousemove would leave the CTA stuck off-centre.
    if (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
    const move = (e: MouseEvent) => {
      const r = root.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => { xTo(0); yTo(0) }
    root.addEventListener('mousemove', move)
    root.addEventListener('mouseleave', leave)
    return () => {
      root.removeEventListener('mousemove', move)
      root.removeEventListener('mouseleave', leave)
    }
  })
  return (
    <span ref={scope} className={`inline-block ${className}`}>
      <span className="inline-block will-change-transform">{children}</span>
    </span>
  )
}

/**
 * LINE-MASK REVEAL — kinetic type. The text is split into words; each word sits
 * in an overflow-hidden mask and its inner span rises into place, staggered,
 * when the heading enters the viewport. This is the "built by GSAP" headline
 * entrance. The words carry the real text, so it degrades to a plain heading and
 * remains readable; under reduced motion the masks are never applied.
 */
export function LineMaskReveal({
  text,
  className = '',
  stagger = 0.045,
}: { text: string; className?: string; stagger?: number }) {
  const words = text.split(' ')
  const scope = useCinematic((root) => {
    const inner = root.querySelectorAll<HTMLElement>('[data-mask-word]')
    gsap.fromTo(
      inner,
      { yPercent: 115 },
      {
        yPercent: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger,
        scrollTrigger: { trigger: root, start: 'top 88%' },
      },
    )
  })
  return (
    <span ref={scope} className={`inline-block ${className}`}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="false" className="inline-block overflow-hidden align-bottom">
          <span data-mask-word className="inline-block will-change-transform">
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </span>
  )
}

/**
 * MASK REVEAL — a single line-mask over arbitrary content (headings with
 * accents, etc.). The whole line rises into place from behind an overflow
 * mask as it enters the viewport. Unlike the per-word variant it accepts any
 * children, so the gold `<em>` accents survive. Content degrades to a plain
 * block under reduced motion.
 */
export function MaskReveal({
  children,
  className = '',
  delay = 0,
}: WrapProps & { delay?: number }) {
  const scope = useCinematic((root) => {
    const el = target(root)
    if (!el) return
    gsap.fromTo(
      el,
      { yPercent: 112 },
      {
        yPercent: 0,
        duration: 1.05,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 88%' },
      },
    )
  })
  return (
    <span ref={scope} className={`block overflow-hidden ${className}`}>
      <span className="block will-change-transform">{children}</span>
    </span>
  )
}

/**
 * TILT3D — the immersive, cursor-reactive 3D of the GSAP / Mistral homepages.
 * The wrapped plate lives on a preserve-3d plane under a 900px perspective and
 * rotates toward the pointer (rotateX/rotateY via quickTo springs), settling
 * flat when the pointer leaves. Pure CSS-3D transforms — no WebGL required, so
 * it survives WebGL-off. Hover/pointer only; under reduced motion no listeners
 * are attached and the plate rests flat. It writes rotation solely on the
 * wrapper it creates, never on a motion.* child.
 */
export function Tilt3D({
  children,
  className = '',
  max = 6,
}: WrapProps & { max?: number }) {
  const scope = useCinematic((root) => {
    const el = target(root)
    if (!el) return
    // Touch devices have no hover, so they get a scroll-scrubbed 3D tilt (the
    // plate rocks gently as it crosses the viewport — still user-controlled,
    // never hijacked). Small screens get a gentler amplitude.
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    const amp = max * (window.innerWidth < 768 ? 0.6 : 1)
    if (coarse) {
      gsap.fromTo(
        el,
        { rotationX: amp * 1.4 },
        {
          rotationX: -amp * 1.4,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
      return
    }
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3.out' })
    const move = (e: MouseEvent) => {
      const r = root.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry(px * amp * 2)
      rx(-py * amp * 2)
    }
    const leave = () => { rx(0); ry(0) }
    root.addEventListener('mousemove', move)
    root.addEventListener('mouseleave', leave)
    return () => {
      root.removeEventListener('mousemove', move)
      root.removeEventListener('mouseleave', leave)
    }
  })
  return (
    <div ref={scope} className={className} style={{ perspective: '900px' }}>
      <div className="h-full w-full will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  )
}

/**
 * RISE3D — a 3D tilt-up entrance. The block starts rotated back in space
 * (rotationX) below its resting place and rises to flat as it enters the
 * viewport, as if the section tilts up out of the page. Ends at identity so it
 * leaves no persistent transform (and no overflow). Scrub-free: the visitor
 * keeps full scroll control. Reduced motion: never runs, content rests visible.
 */
export function Rise3D({
  children,
  className = '',
  delay = 0,
}: WrapProps & { delay?: number }) {
  const scope = useCinematic((root) => {
    const el = target(root)
    if (!el) return
    const rise = window.innerWidth < 768 ? 36 : 70
    gsap.fromTo(
      el,
      { rotationX: 16, y: rise, autoAlpha: 0, transformOrigin: '50% 0%' },
      {
        rotationX: 0,
        y: 0,
        autoAlpha: 1,
        duration: 1.05,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 86%' },
      },
    )
  })
  return (
    <div ref={scope} className={className} style={{ perspective: '900px' }}>
      <div className="will-change-transform">{children}</div>
    </div>
  )
}

/**
 * SLATE — the director's slate. Higgsfield surfaces its camera-move vocabulary
 * in the UI; this captions a scene with the move being performed, like a shot
 * slate (CAM — CRASH ZOOM · 35MM). Purely presentational and aria-hidden; it
 * carries the "directed" reading without adding motion of its own.
 */
export function Slate({
  move,
  lens = '35MM',
  className = '',
}: { move: string; lens?: string; className?: string }) {
  return (
    <p aria-hidden="true" className={`flex items-center justify-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.3em] text-gold/70 ${className}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold/80" />
      <span>cam — {move}</span>
      <span className="text-gold/40">·</span>
      <span>{lens}</span>
    </p>
  )
}

/**
 * DOLLY IN — the canonical Higgsfield move missing from the vocabulary: the
 * camera pushes toward the subject (scale .94 -> 1 with a slight rise) as it
 * enters the viewport. Ends at identity; reduced motion never runs it.
 */
export function DollyIn({
  children,
  className = '',
}: WrapProps) {
  const scope = useCinematic((root) => {
    const el = target(root)
    if (!el) return
    gsap.fromTo(
      el,
      { scale: 0.94, y: 26, autoAlpha: 0 },
      {
        scale: 1,
        y: 0,
        autoAlpha: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 86%' },
      },
    )
  })
  return (
    <div ref={scope} className={className}>
      <div className="will-change-transform">{children}</div>
    </div>
  )
}
