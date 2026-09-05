import { useEffect, useRef, useMemo, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useReducedMotion } from 'framer-motion'
import { ARTICLES } from '../../data/content'
import { useWebGLSupport } from '../../lib/three/useWebGLSupport'
import { hash01 } from '../../lib/three/seed'
import { spatialIntensity, type SpatialState } from '../../lib/three/spatialState'

/**
 * THE SPATIAL ARCHIVE — the bounded spatial layer behind the homepage masthead.
 * A receding shelf of standing editorial PLATES, each now textured with a real
 * canonical Verlyse cover from the article registry (curated subset, deterministic
 * placement, lazy-loaded) plus a brass signal thread.
 *
 * NEW:
 *   - Planes use actual canonical covers (useLoader + TextureLoader, lazy) instead
 *     of solid-colour meshes, so this reads as fragments of the Verlyse archive.
 *   - `selectedId` pulls the chosen work toward focal depth / emphasis; neighbours recede.
 *   - The real spatial state machine (threshold/archive/selected/reading/desk/quiet)
 *     drives camera reframe + scene intensity. Never sourced from mousemove.
 *
 * Preserved lifecycle:
 *   - ONE shared Canvas; never a canvas per card.
 *   - Mounted only while near viewport + tab visible (bounded rAF, no offscreen work).
 *   - Deterministic (seeded by article id) — stable across mounts.
 *   - pointer-events none + aria-hidden; never intercepts reading/focus.
 *   - Removed under reduced-motion / no-WebGL (CSS gradients remain the fallback).
 */
const WINE_DEEP = '#3B0D17'
const GOLD = '#B89146'
const IVORY = '#F8F6F2'

/** Curated subset of canonical covers to texture a handful of planes (lazy, low cost). */
function coverUrlFor(index: number): string {
  const a = ARTICLES[index % ARTICLES.length]
  return a?.cover ?? '/img/poster-3-13-1.webp'
}

/** A standing plate textured with its canonical cover, with editorial depth falloff. */
function CoverPlane({ index, total, selected, intensity }: { index: number; total: number; selected: boolean; intensity: number }) {
  const url = coverUrlFor(index)
  const tex = useLoader(THREE.TextureLoader, url)
  useEffect(() => () => { tex.dispose() }, [tex])
  const id = ARTICLES[index % ARTICLES.length]?.id ?? `p${index}`
  const seed = hash01(id)
  const t = total > 1 ? index / (total - 1) : 0
  const baseRay = 7.2 + seed * 3.2
  const baseAngle = (t - 0.5) * Math.PI * 0.86
  if (tex) { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4 }
  // refinement when this plane is the selected work
  const focal = selected ? -2.4 : 0
  const ray = baseRay + focal
  const x = Math.sin(baseAngle) * ray
  const z = -6 - Math.cos(baseAngle) * (4.5 + seed * 3.5) + focal * 0.4
  const y = -0.6 + (seed - 0.5) * 0.9
  const w = selected ? 2.5 : 1.55 + seed * 0.45
  const h = selected ? 3.4 : 2.1 + ((index + 1) % 3) * 0.22
  const rotY = -baseAngle * 0.5 + (seed - 0.5) * 0.12
  // depth falloff: further planes are dimmer + thinner, selected reads brightest
  const distFade = Math.max(0.25, 1 - Math.max(0, (-z - 4) / 14))
  const opacity = (selected ? 0.96 : 0.4 * distFade) * intensity
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    map: tex, transparent: true, opacity, roughness: 0.78, metalness: 0.05,
    emissive: selected ? new THREE.Color(GOLD) : new THREE.Color('#000000'),
    emissiveIntensity: selected ? 0.12 : 0,
    side: THREE.DoubleSide,
  }), [tex, opacity, selected])
  useEffect(() => () => { mat.dispose() }, [mat])

  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      <mesh material={mat}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {/* faint rim edge — a thin brass rule, brightest on the selected work */}
      <mesh position={[0, 0, Math.max(0.002, 0.002 + (selected ? 0.01 : 0))]}>
        <planeGeometry args={[w * 0.96, 0.008]} />
        <meshBasicMaterial color={GOLD} transparent opacity={selected ? 0.9 : 0.45 * distFade} />
      </mesh>
    </group>
  )
}

/** One continuous brass wire — an editorial signal/annotation threading the archive. */
function SignalThread({ intensity }: { intensity: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2
      const r = 8.6
      pts.push(new THREE.Vector3(Math.cos(a) * r, (i / 72 - 0.5) * 3.2, Math.sin(a) * r * -1))
    }
    return pts
  }, [])
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[new Float32Array(points.flatMap((p) => p.toArray())), 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={GOLD} transparent opacity={0.42 * intensity} />
    </line>
  )
}

/** A smooth, art-directed camera — damped drift with a tiny rotational response. */
function Rig({ active, state, selectedId }: { active: boolean; state: SpatialState; selectedId: string | null }) {
  const { camera } = useThree()
  useFrame((root, delta) => {
    if (!active) return
    const t = root.clock.elapsedTime
    const hasFocus = state === 'selected' && selectedId
    const speed = Math.min(0.06, (delta || 0.016) * 2.2) // bounded damping, frame-rate independent
    const drift = state === 'threshold' ? 0.5 : state === 'archive' ? 0.28 : 0.1
    const depth = hasFocus ? -2.2 : 0
    // damped sway
    const targetX = Math.sin(t * 0.1) * drift
    const targetY = 0.2 + Math.cos(t * 0.085) * 0.15
    const targetZ = 13.5 + depth
    camera.position.x += (targetX - camera.position.x) * speed
    camera.position.y += (targetY - camera.position.y) * speed
    camera.position.z += (targetZ - camera.position.z) * speed
    // subtle rotational response — the camera leans toward the focused work
    const lean = hasFocus ? 0.06 : 0
    camera.lookAt(Math.sin(t * 0.05) * lean, 0.1, -4)
  })
  return null
}

function Scene({ active, state, selectedId }: { active: boolean; state: SpatialState; selectedId: string | null }) {
  const intensity = spatialIntensity(state)
  const light = Math.max(intensity, 0.28)
  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={[WINE_DEEP, 10, 26]} />
      {/* soft ambient wash */}
      <ambientLight intensity={0.3 * light} color={IVORY} />
      {/* key light — warm, from the upper right, editorial */}
      <directionalLight position={[5, 6, 7]} intensity={0.55 * light} color={IVORY} />
      {/* brass rim — a faint gold edge from behind the archive */}
      <pointLight position={[0, 1.5, 2]} intensity={0.6 * light} color={GOLD} distance={18} />
      {/* cool counter-fill to keep the wine field readable, never neon */}
      <hemisphereLight args={[IVORY, WINE_DEEP, 0.18 * light]} />
      {ARTICLES.map((a, i) => (
        <CoverPlane key={a.id} index={i} total={ARTICLES.length} selected={selectedId === a.id} intensity={intensity} />
      ))}
      <SignalThread intensity={intensity} />
      <Rig active={active} state={state} selectedId={selectedId} />
    </>
  )
}

export interface SpatialArchiveProps {
  /** the currently selected work id (drives focal emphasis), or null */
  selectedId?: string | null
  /** the spatial state machine value */
  state?: SpatialState
}

export default function SpatialArchive({ selectedId = null, state = 'threshold' }: SpatialArchiveProps) {
  const reduce = useReducedMotion()
  const { supported } = useWebGLSupport()
  const [mounted, setMounted] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)

  useEffect(() => setMounted(true), [])

  // Gate the scene to the hero region + visible tab.
  useEffect(() => {
    if (!mounted) return
    const el = wrap.current
    if (!el) return
    let done = false
    const check = () => {
      if (done) return
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight * 1.05 && r.bottom > -120) {
        done = true
        setActive(true)
      }
    }
    check()
    const t = setTimeout(check, 400)
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    const onVis = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [mounted])

  const show = mounted && supported && !reduce && tabVisible && state !== 'quiet'

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
      {show && active ? (
        <Canvas
          frameloop="always"
          dpr={[1, 1.5]}
          style={{ position: 'absolute', inset: 0 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          camera={{ position: [0, 0.2, 13.5], fov: 42, near: 0.1, far: 40 }}
        >
          <Suspense fallback={null}>
            <Scene active={active} state={state} selectedId={selectedId} />
          </Suspense>
        </Canvas>
      ) : null}
    </div>
  )
}
