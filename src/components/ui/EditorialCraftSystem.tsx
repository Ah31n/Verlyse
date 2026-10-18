import { useMemo, type ReactNode } from 'react'

/* ============================================================================
 * 1. BOTANICAL ARTWORK PRIMITIVES (PURE VECTOR SVG, ZERO <CANVAS>)
 *    5 Flower Architectures · 3 Veined Leaf Species · Tapered Spiral Tendrils
 *    · Swelling Calyx Buds · Specular Berry Clusters
 * ========================================================================== */
export type BotanicalFlowerSpecies =
  | 'peony'       // Layered double-ring goblet petals + golden stamen crown
  | 'wildflower'  // Alternating slender notched petals + dual-ring center
  | 'bellflower'  // Nodding campanula corolla + protruding stamens + basal sepals
  | 'starflower'  // Elongated pointed clematis/jasmine petals + diamond center
  | 'camellia'    // Broad overlapping rounded petals + clustered anthers

export type BotanicalLeafSpecies = 'willow' | 'ivy' | 'rose-leaf'

/** Tapered curling spiral tendril returned as a closed filled outline path. */
function buildTendrilPath(
  startX: number,
  startY: number,
  headingRad: number,
  curlDir: 1 | -1,
  length: number,
  baseWidth: number
): string {
  const steps = 18
  const totalTurn = Math.PI * 1.65
  const pts: Array<{ x: number; y: number }> = [{ x: startX, y: startY }]
  let h = headingRad
  let px = startX
  let py = startY

  for (let k = 1; k <= steps; k++) {
    const t = k / steps
    h += (curlDir * totalTurn * (0.32 + 1.65 * t)) / steps
    const step = (length / steps) * (1.12 - 0.68 * t)
    px += Math.cos(h) * step
    py += Math.sin(h) * step
    pts.push({ x: px, y: py })
  }

  const left: string[] = []
  const right: string[] = []
  for (let k = 0; k < pts.length; k++) {
    const a = pts[Math.max(0, k - 1)]
    const b = pts[Math.min(pts.length - 1, k + 1)]
    const ang = Math.atan2(b.y - a.y, b.x - a.x)
    const w = (baseWidth * (1 - (k / steps) * 0.86)) / 2
    const lx = (pts[k].x + Math.cos(ang - Math.PI / 2) * w).toFixed(1)
    const ly = (pts[k].y + Math.sin(ang - Math.PI / 2) * w).toFixed(1)
    const rx = (pts[k].x + Math.cos(ang + Math.PI / 2) * w).toFixed(1)
    const ry = (pts[k].y + Math.sin(ang + Math.PI / 2) * w).toFixed(1)
    left.push(`${lx},${ly}`)
    right.unshift(`${rx},${ry}`)
  }

  return `M ${left.join(' L ')} L ${right.join(' L ')} Z`
}

/** Veined botanical leaf (Willow, Ivy, or Teardrop Rose-Leaf). */
export function BotanicalLeaf({
  x,
  y,
  rotation,
  scale = 0.42,
  species = 'rose-leaf',
  fillColor = '#8A6B32',
  veinColor = '#E6C77F',
  opacity = 0.9,
}: {
  x: number
  y: number
  rotation: number
  scale?: number
  species?: BotanicalLeafSpecies
  fillColor?: string
  veinColor?: string
  opacity?: number
}) {
  let leafPath = ''
  let veinPath = ''

  if (species === 'willow') {
    leafPath = 'M 0,0 C 15,-10 35,-5 45,0 C 35,5 15,10 0,0 Z'
    veinPath = 'M 0,0 Q 20,-2 40,0'
  } else if (species === 'ivy') {
    leafPath = 'M 0,0 C 15,-20 35,-15 40,0 C 35,15 15,20 0,0 Z'
    veinPath = 'M 0,0 Q 20,0 35,0 M 14,0 Q 24,-7 29,-9 M 14,0 Q 24,7 29,9'
  } else {
    leafPath = 'M 0,0 C 10,-15 25,-12 35,0 C 20,12 10,8 0,0 Z'
    veinPath = 'M 0,0 Q 15,-2 30,0 M 11,-1 Q 18,-6 23,-6'
  }

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`} opacity={opacity}>
      <path d={leafPath} fill={fillColor} stroke={veinColor} strokeWidth="1.1" strokeOpacity="0.65" />
      <path d={veinPath} fill="none" stroke={veinColor} strokeWidth="0.95" opacity="0.6" strokeLinecap="round" />
    </g>
  )
}

/** Nascent swelling calyx bud. */
export function BotanicalBud({
  x,
  y,
  rotation,
  scale = 0.75,
  stemColor = '#D9B978',
  petalColor = '#9E243C',
  accentColor = '#E6C77F',
}: {
  x: number
  y: number
  rotation: number
  scale?: number
  stemColor?: string
  petalColor?: string
  accentColor?: string
}) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
      <path d="M 0,0 C -5,-5 -6,-12 0,-15 C 6,-12 5,-5 0,0 Z" fill={stemColor} opacity="0.85" />
      <path
        d="M 0,-2 C -3.4,-6.5 -4.4,-11 0,-13.5 C 4.4,-11 3.4,-6.5 0,-2 Z"
        fill={petalColor}
        stroke={accentColor}
        strokeWidth="0.65"
      />
    </g>
  )
}

/** Clustered wild berries with branchlet stems and specular highlights. */
export function BotanicalBerry({
  x,
  y,
  rotation,
  scale = 0.72,
  stemColor = '#D9B978',
  berryColor = '#9E243C',
  highlightColor = '#F4DF9E',
}: {
  x: number
  y: number
  rotation: number
  scale?: number
  stemColor?: string
  berryColor?: string
  highlightColor?: string
}) {
  const r = 3.4
  const offsets = [
    { x: 0, y: -r * 2.35, r },
    { x: -r * 1.45, y: -r * 1.25, r: r * 0.88 },
    { x: r * 1.45, y: -r * 1.25, r: r * 0.88 },
  ]
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
      {offsets.map((pt, i) => (
        <path
          key={`bs-${i}`}
          d={`M 0,0 Q ${pt.x * 0.4},${pt.y * 0.5} ${pt.x},${pt.y}`}
          fill="none"
          stroke={stemColor}
          strokeWidth="0.95"
          strokeLinecap="round"
        />
      ))}
      {offsets.map((pt, i) => (
        <g key={`bb-${i}`} transform={`translate(${pt.x}, ${pt.y})`}>
          <circle cx="0" cy="0" r={pt.r} fill={berryColor} stroke={stemColor} strokeWidth="0.55" />
          <circle cx={-pt.r * 0.3} cy={-pt.r * 0.3} r={pt.r * 0.28} fill={highlightColor} opacity="0.9" />
        </g>
      ))}
    </g>
  )
}

/** Multi-architecture procedural botanical flower head. */
export function BotanicalFlower({
  x,
  y,
  rotation = 0,
  scale = 0.36,
  species = 'peony',
  petalPrimary = '#9E243C',
  petalSecondary = '#E6C77F',
  centerColor = '#F4DF9E',
  sepalColor = '#8A6B32',
}: {
  x: number
  y: number
  rotation?: number
  scale?: number
  species?: BotanicalFlowerSpecies
  petalPrimary?: string
  petalSecondary?: string
  centerColor?: string
  sepalColor?: string
}) {
  const renderPetals = () => {
    if (species === 'peony') {
      const petals = 6
      const step = 360 / petals
      return (
        <g>
          {Array.from({ length: petals }).map((_, i) => (
            <path
              key={`out-${i}`}
              d="M 0,0 C -18,-20 -22,-35 0,-40 C 22,-35 18,-20 0,0 Z"
              fill={petalPrimary}
              stroke={petalSecondary}
              strokeWidth="1.2"
              opacity="0.88"
              transform={`rotate(${i * step})`}
            />
          ))}
          {Array.from({ length: petals }).map((_, i) => (
            <path
              key={`in-${i}`}
              d="M 0,0 C -10,-12 -12,-22 0,-26 C 12,-22 10,-12 0,0 Z"
              fill={petalSecondary}
              stroke={centerColor}
              strokeWidth="0.9"
              opacity="0.92"
              transform={`rotate(${i * step + step / 2})`}
            />
          ))}
          <circle cx="0" cy="0" r="6.5" fill={petalPrimary} stroke={centerColor} strokeWidth="1" />
          <circle cx="0" cy="0" r="3.2" fill={centerColor} />
        </g>
      )
    }

    if (species === 'wildflower') {
      const wildPetals = 10
      const step = 360 / wildPetals
      return (
        <g>
          {Array.from({ length: wildPetals }).map((_, i) => {
            const len = i % 2 === 0 ? -36 : -28
            return (
              <path
                key={i}
                d={`M 0,0 C -4.5,-10 -6.5,${len} 0,${len - 2.5} C 6.5,${len} 4.5,-10 0,0 Z`}
                fill={i % 2 === 0 ? petalPrimary : petalSecondary}
                stroke={centerColor}
                strokeWidth="0.7"
                transform={`rotate(${i * step})`}
              />
            )
          })}
          <circle cx="0" cy="0" r="6.8" fill={centerColor} />
          <circle cx="0" cy="0" r="3.4" fill={petalPrimary} opacity="0.75" />
        </g>
      )
    }

    if (species === 'bellflower') {
      return (
        <g>
          <path
            d="M 0,5 C 20,-10 25,-25 15,-40 C 5,-35 -5,-35 -15,-40 C -25,-25 -20,-10 0,5 Z"
            fill={petalPrimary}
            stroke={petalSecondary}
            strokeWidth="1.2"
          />
          <path
            d="M -2,0 L -4.5,-45 M 2,0 L 4.5,-42"
            stroke={centerColor}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="-4.5" cy="-45" r="2.5" fill={centerColor} />
          <circle cx="4.5" cy="-42" r="2.5" fill={centerColor} />
          <path
            d="M 0,5 C -8,8 -12,2 -12,2 C -5,2 -2,8 0,5 C 2,8 5,2 12,2 C 12,2 8,8 0,5 Z"
            fill={sepalColor}
            stroke={petalSecondary}
            strokeWidth="0.8"
          />
        </g>
      )
    }

    if (species === 'starflower') {
      const petals = 6
      const step = 360 / petals
      return (
        <g>
          {Array.from({ length: petals }).map((_, i) => (
            <path
              key={i}
              d="M 0,0 Q -8.5,-16 0,-36 Q 8.5,-16 0,0 Z"
              fill={i % 2 === 0 ? petalPrimary : petalSecondary}
              stroke={centerColor}
              strokeWidth="0.85"
              transform={`rotate(${i * step})`}
            />
          ))}
          <rect
            x="-4.5"
            y="-4.5"
            width="9"
            height="9"
            fill={centerColor}
            transform="rotate(45)"
          />
        </g>
      )
    }

    // Default: 'camellia' — rounded curved petals
    const petals = 7
    const step = 360 / petals
    return (
      <g>
        {Array.from({ length: petals }).map((_, i) => (
          <path
            key={i}
            d="M 0,0 C -12,-15 -18,-30 0,-33 C 18,-30 12,-15 0,0 Z"
            fill={petalPrimary}
            stroke={petalSecondary}
            strokeWidth="1.05"
            transform={`rotate(${i * step})`}
          />
        ))}
        <circle cx="0" cy="0" r="5.5" fill={centerColor} />
        <circle cx="0" cy="0" r="2.4" fill={petalPrimary} />
      </g>
    )
  }

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
      {renderPetals()}
    </g>
  )
}

/* ============================================================================
 * 3. FLORAL WORD (<FloralWord>)
 *    Dual-Layer Depth Sandwiching around semantic display typography:
 *    - Plane 1 (back): Sinuous main vine, curling spiral lead-in tendril,
 *      veined rose/willow/ivy leaves, and calyx bud behind the letterforms.
 *    - Plane 2 (mid): Semantic readable text.
 *    - Plane 3 (front): Intertwining front twig, berry cluster, and multi-petal
 *      botanical bloom weaving in front of the letterform terminal.
 * ========================================================================== */
export type FloralVariant =
  | 'rose'
  | 'laurel'
  | 'iris'
  | 'lotus'
  | 'marigold'
  | 'camellia'
  | 'astrolabe-bloom'
  | 'magnolia'
  | 'wax-rose'

const VARIANT_TO_SPECIES: Record<
  FloralVariant,
  { flower: BotanicalFlowerSpecies; leaf: BotanicalLeafSpecies; petalsPrimary: string; petalsSecondary: string }
> = {
  rose: { flower: 'peony', leaf: 'rose-leaf', petalsPrimary: '#9E243C', petalsSecondary: '#E6C77F' },
  laurel: { flower: 'starflower', leaf: 'willow', petalsPrimary: '#B89146', petalsSecondary: '#9E243C' },
  iris: { flower: 'bellflower', leaf: 'ivy', petalsPrimary: '#8C2036', petalsSecondary: '#E6C77F' },
  lotus: { flower: 'peony', leaf: 'willow', petalsPrimary: '#A42843', petalsSecondary: '#F0D493' },
  marigold: { flower: 'wildflower', leaf: 'rose-leaf', petalsPrimary: '#C49A4B', petalsSecondary: '#9E243C' },
  camellia: { flower: 'camellia', leaf: 'ivy', petalsPrimary: '#9E243C', petalsSecondary: '#F3E6D0' },
  'astrolabe-bloom': { flower: 'starflower', leaf: 'willow', petalsPrimary: '#8C2036', petalsSecondary: '#E6C77F' },
  magnolia: { flower: 'camellia', leaf: 'rose-leaf', petalsPrimary: '#B89146', petalsSecondary: '#F8F6F2' },
  'wax-rose': { flower: 'peony', leaf: 'ivy', petalsPrimary: '#8C2036', petalsSecondary: '#D9B978' },
}

interface FloralWordProps {
  children: ReactNode
  variant?: FloralVariant
  tone?: 'dark' | 'light'
  className?: string
}

export function FloralWord({
  children,
  variant = 'rose',
  tone = 'dark',
  className = 'italic text-gold',
}: FloralWordProps) {
  const spec = VARIANT_TO_SPECIES[variant] ?? VARIANT_TO_SPECIES.rose
  const stemColor = tone === 'dark' ? '#D9B978' : '#7A1C2E'
  const leafColor = tone === 'dark' ? '#7D5F2B' : '#8A6B32'
  const centerColor = tone === 'dark' ? '#F6E3AA' : '#F8F6F2'

  const leadTendril = useMemo(() => buildTendrilPath(34, 72, Math.PI * 1.12, 1, 22, 2.0), [])
  const tipTendril = useMemo(() => buildTendrilPath(54, 42, -Math.PI * 0.22, -1, 22, 1.9), [])

  return (
    <span
      data-craft-floral-word={variant}
      className="group/floral relative inline-block pr-[0.28em]"
    >
      {/* Plane 1A (Under letterforms — baseline bough): Subtle double-strand vine cradling the baseline */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 240 24"
        preserveAspectRatio="none"
        fill="none"
        className="pointer-events-none absolute -bottom-[0.12em] left-0 right-[0.18em] z-0 h-[0.32em] w-full overflow-visible"
      >
        <path
          d="M 4 14 C 62 21, 134 7, 236 14"
          stroke={stemColor}
          strokeWidth="1.35"
          strokeLinecap="round"
          opacity="0.62"
        />
        <path
          d="M 18 17 C 84 9, 158 20, 228 11"
          stroke={stemColor}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.38"
        />
      </svg>

      {/* Plane 1B (Under letterforms — fixed-aspect left lead-in & lower-right foliage): Never distorts on wide phrases */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 100 100"
        fill="none"
        className="pointer-events-none absolute -bottom-[0.18em] -left-[0.32em] z-0 h-[1.05em] w-[1.05em] overflow-visible"
      >
        <path d={leadTendril} fill={stemColor} opacity="0.58" />
        <BotanicalLeaf
          x={42}
          y={76}
          rotation={-24}
          scale={0.38}
          species={spec.leaf}
          fillColor={leafColor}
          veinColor={stemColor}
          opacity={0.82}
        />
        <BotanicalBud
          x={26}
          y={70}
          rotation={-38}
          scale={0.68}
          stemColor={stemColor}
          petalColor={spec.petalsPrimary}
          accentColor={spec.petalsSecondary}
        />
      </svg>

      {/* Plane 2 (Middle): Semantic readable typography — 100% unobstructed x-height */}
      <em className={`relative z-[1] ${className}`}>{children}</em>

      {/* Plane 3 (Right terminal shoulder — fixed 1:1 aspect ratio so flowers never stretch or drift into word centers) */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 100 100"
        fill="none"
        className="pointer-events-none absolute -right-[0.34em] -top-[0.14em] z-0 h-[1.12em] w-[1.12em] overflow-visible"
      >
        {/* Rising terminal stem curving outside the final glyph */}
        <path
          d="M 28 86 C 46 76, 56 56, 62 34"
          stroke={stemColor}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.82"
        />
        <path d={tipTendril} fill={stemColor} opacity="0.68" />

        {/* Supporting veined leaf & berry cluster on the outer stem */}
        <BotanicalLeaf
          x={44}
          y={66}
          rotation={26}
          scale={0.38}
          species={spec.leaf}
          fillColor={leafColor}
          veinColor={stemColor}
          opacity={0.88}
        />
        <BotanicalBerry
          x={50}
          y={52}
          rotation={34}
          scale={0.6}
          stemColor={stemColor}
          berryColor={spec.petalsPrimary}
          highlightColor={centerColor}
        />

        {/* Hero multi-layered botanical bloom crowning the upper-right shoulder */}
        <g
          className="origin-[64px_30px] motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover/floral:rotate-12"
        >
          <BotanicalFlower
            x={64}
            y={30}
            rotation={16}
            scale={0.32}
            species={spec.flower}
            petalPrimary={spec.petalsPrimary}
            petalSecondary={spec.petalsSecondary}
            centerColor={centerColor}
            sepalColor={leafColor}
          />
        </g>
      </svg>
    </span>
  )
}

/* ============================================================================
 * 4. LAYERED ORGANIC CONTOUR PLANE (<HaikeiContourPlane>)
 * ========================================================================== */
export function HaikeiContourPlane({
  tone = 'dark',
  seed = 1,
  className = '',
}: {
  tone?: 'dark' | 'light'
  seed?: number
  className?: string
}) {
  const fillPrimary = tone === 'dark' ? 'rgba(92,18,36,0.28)' : 'rgba(184,145,70,0.09)'
  const strokePrimary = tone === 'dark' ? 'rgba(217,185,120,0.22)' : 'rgba(122,28,46,0.16)'
  const strokeSecondary = tone === 'dark' ? 'rgba(217,185,120,0.12)' : 'rgba(184,145,70,0.18)'

  const yShift = (seed % 4) * 28

  return (
    <svg
      data-craft-haikei={seed}
      aria-hidden="true"
      viewBox="0 0 1440 560"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <path
        d={`M0,${340 - yShift} C280,${270 + yShift} 540,${420 - yShift} 840,${330 + yShift} C1100,${260 - yShift} 1280,${310 + yShift} 1440,${280 - yShift} L1440,560 L0,560 Z`}
        fill={fillPrimary}
      />
      <path
        d={`M0,${410 - yShift} C320,${350 + yShift} 620,${460 - yShift} 940,${385 + yShift} C1180,${330 - yShift} 1330,${365 + yShift} 1440,${340 - yShift}`}
        fill="none"
        stroke={strokePrimary}
        strokeWidth="1"
      />
      <path
        d={`M0,${150 + yShift} C310,${105 - yShift} 640,${215 + yShift} 980,${145 - yShift} C1200,${100 + yShift} 1340,${135 - yShift} 1440,${110 + yShift}`}
        fill="none"
        stroke={strokeSecondary}
        strokeWidth="0.75"
      />
    </svg>
  )
}

/* ============================================================================
 * 6. FIXED BACK-COVER BOTANICAL WORDMARK SPECIMEN (<VerlyseBackCoverSpecimen>)
 *    Static, non-editable, brand-owned back-cover wordmark plate for Footer.tsx.
 *    Uses Verlyse tokens (oxblood #17070C, ivory #F8F6F2, antique brass #D9B978,
 *    crimson rose #9E243C) and keeps all decorative SVG layers aria-hidden and
 *    non-interactive, with 100% unobstructed Cormorant Garamond letterforms.
 * ========================================================================== */
const BACK_COVER_PALETTE = {
  bg: '#17070C',
  fg: '#F8F6F2',
  accent: '#E6C77F',
  petalPrimary: '#9E243C',
  petalSecondary: '#E6C77F',
  flowerCenter: '#F4DF9E',
  stem: '#D9B978',
  leaf: '#8A6B32',
} as const

export function VerlyseBackCoverSpecimen() {
  const leadTendril = useMemo(() => buildTendrilPath(34, 72, Math.PI * 1.12, 1, 22, 2.0), [])
  const trailTendril = useMemo(() => buildTendrilPath(54, 42, -Math.PI * 0.22, -1, 22, 1.9), [])

  return (
    <div
      data-footer-specimen="verlyse"
      aria-hidden="true"
      className="pointer-events-none relative select-none overflow-hidden border border-[#D9B978]/25 bg-[#17070C] px-5 py-8 sm:px-10 sm:py-11"
    >
      {/* Corner brass registration marks */}
      <span aria-hidden="true" className="pointer-events-none absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-[#D9B978]/45" />
      <span aria-hidden="true" className="pointer-events-none absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-[#D9B978]/45" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 left-2.5 h-3 w-3 border-b border-l border-[#D9B978]/45" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 right-2.5 h-3 w-3 border-b border-r border-[#D9B978]/45" />

      <HaikeiContourPlane tone="dark" seed={1} className="opacity-30" />

      {/* Inner plate frame & botanical corner sprigs */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-2.5 border border-[#D9B978]/15" />
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 120 120"
        fill="none"
        className="pointer-events-none absolute left-3 top-3 h-12 w-12 opacity-55 sm:h-14 sm:w-14"
      >
        <path d="M 6 64 C 6 24, 24 6, 64 6" stroke={BACK_COVER_PALETTE.stem} strokeWidth="1.2" strokeLinecap="round" />
        <BotanicalLeaf x={22} y={22} rotation={45} scale={0.42} species="rose-leaf" fillColor={BACK_COVER_PALETTE.leaf} veinColor={BACK_COVER_PALETTE.stem} />
        <BotanicalFlower x={16} y={16} rotation={15} scale={0.28} species="starflower" petalPrimary={BACK_COVER_PALETTE.petalPrimary} petalSecondary={BACK_COVER_PALETTE.petalSecondary} centerColor={BACK_COVER_PALETTE.flowerCenter} sepalColor={BACK_COVER_PALETTE.leaf} />
      </svg>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 120 120"
        fill="none"
        className="pointer-events-none absolute bottom-3 right-3 h-12 w-12 rotate-180 opacity-55 sm:h-14 sm:w-14"
      >
        <path d="M 6 64 C 6 24, 24 6, 64 6" stroke={BACK_COVER_PALETTE.stem} strokeWidth="1.2" strokeLinecap="round" />
        <BotanicalLeaf x={22} y={22} rotation={45} scale={0.42} species="willow" fillColor={BACK_COVER_PALETTE.leaf} veinColor={BACK_COVER_PALETTE.stem} />
        <BotanicalFlower x={16} y={16} rotation={-15} scale={0.28} species="camellia" petalPrimary={BACK_COVER_PALETTE.petalPrimary} petalSecondary={BACK_COVER_PALETTE.petalSecondary} centerColor={BACK_COVER_PALETTE.flowerCenter} sepalColor={BACK_COVER_PALETTE.leaf} />
      </svg>

      {/* Fixed Verlyse back-cover wordmark — native Cormorant Garamond kerning with outer-terminal botanical framing */}
      <div className="relative z-[1] flex items-center justify-center py-2 text-center">
        <span className="relative inline-block px-[0.48em] pb-[0.2em] font-serif text-[clamp(3.2rem,10vw,6.4rem)] font-light italic leading-[1.02] tracking-[-0.02em] text-[#F8F6F2]">
          {/* Below-descender brass rule clear of all letterforms and the 'y' descender */}
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 320 28"
            fill="none"
            className="pointer-events-none absolute -bottom-[0.12em] left-[6%] right-[6%] z-0 h-[0.28em] w-[88%] overflow-visible"
          >
            <path
              d="M 8 18 C 92 25, 228 11, 312 18"
              stroke={BACK_COVER_PALETTE.stem}
              strokeWidth="1.35"
              strokeLinecap="round"
              opacity="0.65"
            />
            <path
              d="M 28 21 C 112 13, 208 24, 292 15"
              stroke={BACK_COVER_PALETTE.stem}
              strokeWidth="0.85"
              strokeLinecap="round"
              opacity="0.38"
            />
          </svg>

          {/* Outer-left botanical lead-in sprig (outside the opening 'V') */}
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 100 100"
            fill="none"
            className="pointer-events-none absolute -bottom-[0.06em] -left-[0.24em] z-0 h-[0.95em] w-[0.95em] overflow-visible"
          >
            <path d={leadTendril} fill={BACK_COVER_PALETTE.stem} opacity="0.62" />
            <BotanicalLeaf
              x={40}
              y={74}
              rotation={-26}
              scale={0.38}
              species="rose-leaf"
              fillColor={BACK_COVER_PALETTE.leaf}
              veinColor={BACK_COVER_PALETTE.stem}
              opacity={0.85}
            />
            <BotanicalBud
              x={24}
              y={66}
              rotation={-38}
              scale={0.68}
              stemColor={BACK_COVER_PALETTE.stem}
              petalColor={BACK_COVER_PALETTE.petalPrimary}
              accentColor={BACK_COVER_PALETTE.accent}
            />
          </svg>

          {/* Unobstructed brand wordmark */}
          <span className="relative z-[1]">Verlyse</span>

          {/* Outer-right terminal stem, leaf, berry & Tudor-rose bloom (outside the closing 'e') */}
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 100 100"
            fill="none"
            className="pointer-events-none absolute -right-[0.28em] -top-[0.1em] z-0 h-[1.05em] w-[1.05em] overflow-visible"
          >
            <path
              d="M 38 80 C 50 70, 58 52, 64 32"
              stroke={BACK_COVER_PALETTE.stem}
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.82"
            />
            <path d={trailTendril} fill={BACK_COVER_PALETTE.stem} opacity="0.68" />
            <BotanicalLeaf
              x={50}
              y={64}
              rotation={26}
              scale={0.38}
              species="willow"
              fillColor={BACK_COVER_PALETTE.leaf}
              veinColor={BACK_COVER_PALETTE.stem}
              opacity={0.88}
            />
            <BotanicalBerry
              x={54}
              y={50}
              rotation={34}
              scale={0.58}
              stemColor={BACK_COVER_PALETTE.stem}
              berryColor={BACK_COVER_PALETTE.petalPrimary}
              highlightColor={BACK_COVER_PALETTE.flowerCenter}
            />
            <BotanicalFlower
              x={64}
              y={28}
              rotation={16}
              scale={0.32}
              species="peony"
              petalPrimary={BACK_COVER_PALETTE.petalPrimary}
              petalSecondary={BACK_COVER_PALETTE.petalSecondary}
              centerColor={BACK_COVER_PALETTE.flowerCenter}
              sepalColor={BACK_COVER_PALETTE.leaf}
            />
          </svg>
        </span>
      </div>
    </div>
  )
}
