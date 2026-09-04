import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useReducedMotion } from 'framer-motion'
import { getEndingStatic } from '../../data/articleEndings'
import type { EndingSceneKind } from '../../data/articleEndings'
import type { Article } from '../../data/content'
import { useWebGLSupport } from '../../lib/three/useWebGLSupport'
import { seededFloats } from '../../lib/three/seed'

/**
 * STORY-ENDING 3D — a bounded, deterministic spatial atmosphere that sits
 * BEHIND the canonical `ArticleSignature` (which stays semantic HTML and always
 * renders on top). This layer is editorial atmosphere only.
 *
 * NEW: the article's `sceneKind` now genuinely selects a DIFFERENT low-frequency
 * geometry composition — not the same EmberField + GoldOrbit for every article.
 * Every scene is quiet, GPU-light, within the Verlyse palette, reduced-motion and
 * no-WebGL safe, and derives all placement from a seed of the article id (no
 * Math.random, so the same article is identical on every mount).
 *
 * Ending state machine: RESTING -> ENTERING -> ALIVE -> REDUCED -> FALLBACK.
 * - IntersectionObserver/geo gating activates only near the viewport; offscreen it
 *   simply does not render, so there is no offscreen rAF work.
 * - REDUCED: prefers-reduced-motion -> the scene is suppressed, signature stays.
 * - FALLBACK: no WebGL -> nothing renders, the semantic signature is the ending.
 */
type Phase = 'RESTING' | 'ENTERING' | 'ALIVE' | 'REDUCED' | 'FALLBACK'
type Palette = { primary: string; secondary?: string }

const GOLD = '#B89146'
const IVORY = '#F8F6F2'

/** Slow, bounded group motion; each scene supplies its own amplitude/axis. */
function SlowGroup({ children, dy = 0.05, ry = 0.02, duration = 1 }: { children: ReactNode; dy?: number; ry?: number; duration?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime / duration
    ref.current.position.y = Math.sin(t * Math.PI * 2) * dy
    ref.current.rotation.y = Math.sin(t * Math.PI * 2) * ry
  })
  return <group ref={ref}>{children}</group>
}

/** Deterministic scattered points from a seed key. */
function Points({ color, seed, count = 60, spread = [10, 4, 3], size = 0.045, opacity = 0.4 }: { color: string; seed: string; count?: number; spread?: [number, number, number]; size?: number; opacity?: number }) {
  const ref = useRef<THREE.Points>(null)
  const arr = useRef<Float32Array>()
  if (!arr.current) {
    const f = seededFloats(seed, count * 3)
    const out = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      out[i * 3] = (f[i * 3] - 0.5) * spread[0]
      out[i * 3 + 1] = (f[i * 3 + 1] - 0.5) * spread[1]
      out[i * 3 + 2] = (f[i * 3 + 2] - 0.5) * spread[2]
    }
    arr.current = out
  }
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.015
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[arr.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/* ---------- Distinct bounded scene compositions per sceneKind ---------- */

function SceneVoices({ p }: { p: Palette }) {
  // vertical ringing columns + a rising pulse — a raised voice made spatial
  return (
    <SlowGroup dy={0.06} ry={0}>
      {[-0.4, 0, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[0.05 - i * 0.01, 1.2 + i * 0.4, 0.05]} />
          <meshStandardMaterial color={i === 1 ? p.primary : GOLD} roughness={0.6} metalness={0.2} transparent opacity={0.5} />
        </mesh>
      ))}
    </SlowGroup>
  )
}

function SceneClock({ p }: { p: Palette }) {
  // a dial resting at 3:13 — hour at ~97°, minute at ~78°, only the ring breathes
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.03 })
  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[1.6, 0.012, 8, 96]} />
        <meshBasicMaterial color={p.primary} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.05]} rotation={[0, 0, (97 / 180) * Math.PI]}>
        <boxGeometry args={[0.03, 0.7, 0.03]} />
        <meshBasicMaterial color={IVORY} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.05]} rotation={[0, 0, (78 / 180) * Math.PI]}>
        <boxGeometry args={[0.02, 1.0, 0.02]} />
        <meshBasicMaterial color={IVORY} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

function SceneWaltz({ p }: { p: Palette }) {
  // two lights orbiting slowly — a quiet ballroom
  const a = useRef<THREE.Mesh>(null)
  const b = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.1
    if (a.current) a.current.position.set(Math.cos(t) * 1.6, Math.sin(t * 2) * 0.2, Math.sin(t) * 1.6)
    if (b.current) b.current.position.set(Math.cos(t + 1) * -1.6, Math.sin(t * 2 + 1) * -0.2, Math.sin(t + 1) * -1.6)
  })
  return (<><mesh ref={a}><sphereGeometry args={[0.05, 12, 12]} /><meshBasicMaterial color={p.primary} /></mesh><mesh ref={b}><sphereGeometry args={[0.05, 12, 12]} /><meshBasicMaterial color={GOLD} /></mesh></>)
}

function SceneCandle({ p }: { p: Palette }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.scale.y = 1 + Math.sin(clock.elapsedTime * 3) * 0.06 })
  return (
    <group>
      <mesh><cylinderGeometry args={[0.12, 0.14, 1.0, 12]} /><meshStandardMaterial color="#2E0913" roughness={0.9} /></mesh>
      <mesh ref={ref} position={[0, 0.66, 0]}><coneGeometry args={[0.11, 0.34, 12]} /><meshBasicMaterial color={p.primary} /></mesh>
      <pointLight position={[0, 0.9, 0]} intensity={0.5} color={p.primary} distance={6} />
    </group>
  )
}

function SceneLight({ p }: { p: Palette }) {
  return <SlowGroup dy={0.3} ry={0.04}><mesh><coneGeometry args={[0.4, 2.4, 24, 1, true]} /><meshBasicMaterial color={p.primary} transparent opacity={0.18} /></mesh></SlowGroup>
}

function ScenePainting({ p }: { p: Palette }) {
  return <SlowGroup dy={0.02} ry={0.01}><mesh><planeGeometry args={[2.2, 2.6]} /><meshStandardMaterial color={p.primary} roughness={0.85} /></mesh><mesh position={[0, 0, 0.02]}><planeGeometry args={[2.5, 2.9]} /><meshBasicMaterial color={GOLD} transparent opacity={0.2} /></mesh></SlowGroup>
}

function SceneBeads({ p }: { p: Palette }) {
  const beads = seededFloats(p.primary + 'beads', 18)
  return <SlowGroup dy={0.05} ry={0.03}>{beads.map((b, i) => (<mesh key={i} position={[Math.sin((i / 18) * Math.PI * 2) * 1.1, -Math.cos((i / 18) * Math.PI * 2) * 1.5 + 0.6, 0]}><sphereGeometry args={[0.05 + b * 0.02, 8, 8]} /><meshBasicMaterial color={i % 2 ? p.primary : GOLD} transparent opacity={0.7} /></mesh>))}</SlowGroup>
}

function ScenePage({ p }: { p: Palette }) {
  // a blank page with a faint gold spine rule
  return <SlowGroup dy={0.03} ry={0.01}><mesh rotation={[0.2, 0, 0]}><planeGeometry args={[1.6, 2.1]} /><meshStandardMaterial color={p.primary} roughness={0.9} transparent opacity={0.1} /></mesh><mesh position={[0, 0, 0.01]} rotation={[0.2, 0, 0]}><planeGeometry args={[0.006, 1.6]} /><meshBasicMaterial color={GOLD} transparent opacity={0.3} /></mesh></SlowGroup>
}

function SceneLetter({ p }: { p: Palette }) {
  return <SlowGroup dy={0.02} ry={0.02}><mesh rotation={[-0.15, 0, 0.12]}><planeGeometry args={[1.5, 1.0]} /><meshStandardMaterial color={p.primary} roughness={0.8} transparent opacity={0.35} /></mesh><mesh rotation={[0.15, 0, -0.12]} position={[0.1, 0, 0.05]}><planeGeometry args={[1.5, 1.0]} /><meshStandardMaterial color={p.primary} roughness={0.8} transparent opacity={0.3} /></mesh></SlowGroup>
}

function SceneCat({ p }: { p: Palette }) {
  // two paired lights that blink softly — a gaze in the dark
  const a = useRef<THREE.Mesh>(null)
  const b = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const blink = 0.6 + Math.max(0, Math.sin(clock.elapsedTime * 0.5)) * 0.4
    if (a.current) (a.current.material as THREE.MeshBasicMaterial).opacity = blink
    if (b.current) (b.current.material as THREE.MeshBasicMaterial).opacity = blink
  })
  return (<><mesh ref={a} position={[-0.5, 0.2, 0]}><sphereGeometry args={[0.06, 8, 8]} /><meshBasicMaterial color={p.primary} transparent opacity={0.6} /></mesh><mesh ref={b} position={[0.5, 0.2, 0]}><sphereGeometry args={[0.06, 8, 8]} /><meshBasicMaterial color={p.primary} transparent opacity={0.6} /></mesh></>)
}

function SceneFeather({ p }: { p: Palette }) {
  return <SlowGroup dy={0.5} ry={0.06} duration={2}><mesh rotation={[Math.PI / 2, 0, 0.3]}><torusGeometry args={[0.9, 0.01, 6, 60, Math.PI]} /><meshBasicMaterial color={p.primary} transparent opacity={0.5} /></mesh></SlowGroup>
}

function SceneHands({ p }: { p: Palette }) {
  const f = seededFloats(p.primary + 'hands', 20)
  return <SlowGroup dy={0.06}>{f.map((r, i) => (<mesh key={i} position={[Math.cos(r * Math.PI * 2) * 1.4, Math.sin(r * Math.PI * 2) * 1.4, 0]}><cylinderGeometry args={[0.02, 0.02, 0.5, 6]} /><meshBasicMaterial color={i % 2 ? p.primary : GOLD} transparent opacity={0.4} /></mesh>))}</SlowGroup>
}

function ScenePause({ p }: { p: Palette }) {
  // nearly still — a single held form with an imperceptible breath
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.2) * 0.008) })
  return <mesh ref={ref}><icosahedronGeometry args={[0.5, 0]} /><meshStandardMaterial color={p.primary} roughness={0.5} metalness={0.1} /></mesh>
}

function ScenePeople({ p }: { p: Palette }) {
  const f = seededFloats(p.primary + 'people', 14)
  return <SlowGroup dy={0.03}>{f.map((r, i) => (<mesh key={i} position={[(r - 0.5) * 3, -0.6, 0]}><coneGeometry args={[0.05, 0.4, 6]} /><meshBasicMaterial color={i % 2 ? p.primary : GOLD} transparent opacity={0.45} /></mesh>))}</SlowGroup>
}

function SceneWord({ p }: { p: Palette }) {
  // a column of small marks rising toward a point — a word reaching
  const f = seededFloats(p.primary + 'word', 12)
  return <SlowGroup dy={0.1}>{f.map((r, i) => (<mesh key={i} position={[0, -1.6 + i * 0.26, 0]}><boxGeometry args={[0.08 + r * 0.04, 0.08, 0.08]} /><meshBasicMaterial color={i % 2 ? p.primary : GOLD} transparent opacity={0.5} /></mesh>))}</SlowGroup>
}

function SceneSteps({ p }: { p: Palette }) {
  return <SlowGroup dy={0.02}>{[0, 1, 2].map((i) => (<mesh key={i} position={[0, -0.7 + i * 0.5, 0]}><boxGeometry args={[0.9 - i * 0.2, 0.06, 0.4]} /><meshBasicMaterial color={p.primary} transparent opacity={0.5 - i * 0.1} /></mesh>))}</SlowGroup>
}

function SceneCycle({ p }: { p: Palette }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.x = clock.elapsedTime * 0.04 })
  return <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.1, 0.02, 6, 80]} /><meshBasicMaterial color={p.primary} transparent opacity={0.5} /></mesh>
}

function ScenePrayer({ p }: { p: Palette }) {
  return (
    <SlowGroup dy={0.08} duration={1.4}>
      <mesh position={[0, 0.2, 0]}><coneGeometry args={[0.02, 2.2, 6]} /><meshBasicMaterial color={p.secondary ?? p.primary} transparent opacity={0.5} /></mesh>
      <Points color={p.secondary ?? p.primary} seed="prayer" count={40} spread={[1, 3, 1]} size={0.03} opacity={0.35} />
    </SlowGroup>
  )
}

function SceneUnspecified({ p }: { p: Palette }) {
  return <SlowGroup dy={0.02}><Points color={p.primary} seed="unspecified" /></SlowGroup>
}

const SCENES: Record<EndingSceneKind, (p: Palette) => ReactNode> = {
  voices: (p) => <SceneVoices p={p} />,
  clock: (p) => <SceneClock p={p} />,
  waltz: (p) => <SceneWaltz p={p} />,
  candle: (p) => <SceneCandle p={p} />,
  light: (p) => <SceneLight p={p} />,
  painting: (p) => <ScenePainting p={p} />,
  beads: (p) => <SceneBeads p={p} />,
  page: (p) => <ScenePage p={p} />,
  letter: (p) => <SceneLetter p={p} />,
  cat: (p) => <SceneCat p={p} />,
  feather: (p) => <SceneFeather p={p} />,
  hands: (p) => <SceneHands p={p} />,
  pause: (p) => <ScenePause p={p} />,
  people: (p) => <ScenePeople p={p} />,
  word: (p) => <SceneWord p={p} />,
  steps: (p) => <SceneSteps p={p} />,
  cycle: (p) => <SceneCycle p={p} />,
  prayer: (p) => <ScenePrayer p={p} />,
  unspecified: (p) => <SceneUnspecified p={p} />,
}

export default function StoryEnding3D({ article }: { article: Article }) {
  const reduce = useReducedMotion()
  const { supported } = useWebGLSupport()
  const wrap = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>(supported && !reduce ? 'RESTING' : reduce ? 'REDUCED' : 'FALLBACK')

  const ending = getEndingStatic(article)
  const palette: Palette = { primary: ending.palette.primary, secondary: ending.palette.secondary }
  const scene = SCENES[ending.sceneKind] ?? SCENES.unspecified

  // Activate on approach, then settle into ALIVE after ENTERING.
  useEffect(() => {
    if (!wrap.current) return
    let done = false
    const check = () => {
      if (done) return
      const r = wrap.current!.getBoundingClientRect()
      if (r.top < window.innerHeight * 1.1 && r.bottom > -60) {
        done = true
        setPhase((p) => (p === 'RESTING' ? 'ENTERING' : p))
      }
    }
    check()
    const t = setTimeout(check, 400)
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  useEffect(() => {
    if (phase === 'ENTERING') {
      const id = setTimeout(() => setPhase('ALIVE'), ending.motion.revealMs)
      return () => clearTimeout(id)
    }
  }, [phase, ending.motion.revealMs])

  const render =
    (phase === 'ALIVE' || phase === 'ENTERING') && !reduce && supported ? (
      <Canvas
        frameloop={phase === 'ALIVE' ? 'always' : 'demand'}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={[ending.palette.background, 5, 12]} />
        {/* quiet editorial lighting — a warm key, a faint brass rim, a soft ambient */}
        <ambientLight intensity={0.32} color={IVORY} />
        <pointLight position={[0, 1, 3]} intensity={0.6} color={ending.palette.primary} />
        <pointLight position={[1.5, 0.5, 1]} intensity={0.3} color={GOLD} distance={8} />
        <directionalLight position={[0.5, 2, 2]} intensity={0.25} color={IVORY} />
        {scene(palette)}
      </Canvas>
    ) : null

  return (
    <div
      ref={wrap}
      data-ending={ending.endingId}
      data-phase={phase}
      data-scene-kind={ending.sceneKind}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      {render}
    </div>
  )
}
