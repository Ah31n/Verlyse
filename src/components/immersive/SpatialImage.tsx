import { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react'
import { useImmersiveOrStatic } from './ImmersiveShell'

/**
 * SPATIAL IMAGE — a cover that sits in space rather than flat on the page.
 *
 * The pointer gives it a few degrees of tilt and a whisper of parallax, so a
 * folio cover reads as a physical object you are looking slightly across. On
 * touch there is no hover, so the tilt is simply absent and the cover sits
 * square — the interaction degrades instead of trapping itself behind a pointer.
 *
 * ACCESSIBILITY IS NOT OPTIONAL HERE. `alt` is a required prop, the image is a
 * real `<img>` in the DOM (never painted into a canvas), and the tilt is a
 * transform on a wrapper, so the accessible name and the reading order are
 * untouched. `pointer-events` stay on the image so it remains selectable and
 * focusable exactly as before.
 *
 * Under reduced motion the pointer handlers are never attached and the springs
 * are not created, so the cover renders perfectly square.
 */
export type SpatialImageProps = {
  src: string
  /** required: there is no such thing as a decorative-only cover here */
  alt: string
  /** maximum tilt in degrees; kept small on purpose */
  maxTilt?: number
  /** parallax travel of the image inside its frame, in px */
  parallax?: number
  /** brass hairline frame */
  frame?: boolean
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  width?: number
  height?: number
}

export default function SpatialImage({
  src,
  alt,
  maxTilt = 5,
  parallax = 10,
  frame = true,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  width,
  height,
}: SpatialImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shell = useImmersiveOrStatic()
  const reduce = shell.reduce

  /* pointer position normalised to -1..1 across the frame */
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 140, damping: 22, restDelta: 0.001 })
  const sy = useSpring(py, { stiffness: 140, damping: 22, restDelta: 0.001 })

  const rotateY = useTransform(sx, [-1, 1], [-maxTilt, maxTilt])
  const rotateX = useTransform(sy, [-1, 1], [maxTilt, -maxTilt])
  const ix = useTransform(sx, [-1, 1], [-parallax, parallax])
  const iy = useTransform(sy, [-1, 1], [-parallax, parallax])

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce) return
    /* coarse pointers have no hover to track; leave the cover square */
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) return
    px.set(((e.clientX - r.left) / r.width) * 2 - 1)
    py.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }

  function onLeave() {
    px.set(0)
    py.set(0)
  }

  return (
    <div ref={ref} className={className} style={{ perspective: 900 }}>
      <motion.div
        onPointerMove={reduce ? undefined : onMove}
        onPointerLeave={reduce ? undefined : onLeave}
        style={{
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
          transformStyle: 'preserve-3d',
          border: frame ? '1px solid rgba(184,145,70,0.35)' : undefined,
          background: '#F8F6F2',
        }}
        className="relative overflow-hidden"
      >
        <motion.img
          src={src}
          alt={alt}
          loading={loading}
          width={width}
          height={height}
          decoding="async"
          className={`block h-full w-full object-cover ${imgClassName}`}
          style={{ x: reduce ? 0 : ix, y: reduce ? 0 : iy }}
        />
      </motion.div>
    </div>
  )
}
