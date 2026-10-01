import { clsx } from 'clsx'

/**
 * ArchivalSeal — an authentic generative brass/wax seal mark.
 */
export function ArchivalSeal({
  size = 72,
  className = '',
  monogram = 'VM',
  year = '2026',
}: {
  size?: number
  className?: string
  monogram?: string
  year?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={clsx('text-gold select-none', className)}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
      
      {/* Decorative star pips */}
      <circle cx="50" cy="14" r="1.5" fill="currentColor" />
      <circle cx="50" cy="86" r="1.5" fill="currentColor" />
      <circle cx="14" cy="50" r="1.5" fill="currentColor" />
      <circle cx="86" cy="50" r="1.5" fill="currentColor" />

      {/* Center typography */}
      <text
        x="50"
        y="48"
        textAnchor="middle"
        fontFamily="Cormorant Garamond, serif"
        fontSize="17"
        fontWeight="300"
        letterSpacing="2"
        fill="currentColor"
      >
        {monogram}
      </text>
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="7"
        letterSpacing="3"
        fill="currentColor"
        opacity="0.8"
      >
        {year}
      </text>
    </svg>
  )
}

/**
 * ChapterDivider — Haikei-inspired organic curved vector contour.
 */
export function ChapterDivider({
  className = '',
  flip = false,
}: {
  className?: string
  flip?: boolean
}) {
  return (
    <div className={clsx('w-full overflow-hidden leading-none select-none my-12 pointer-events-none', className)} aria-hidden="true">
      <svg
        viewBox="0 0 1200 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx('w-full h-12 md:h-16 text-[#B89146]/25', flip && 'rotate-180')}
        preserveAspectRatio="none"
      >
        <path
          d="M0 32C150 12 300 52 450 32C600 12 750 52 900 32C1050 12 1150 42 1200 32"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 38C180 18 360 48 540 38C720 28 900 48 1080 38C1140 34 1180 40 1200 38"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="4 6"
          vectorEffect="non-scaling-stroke"
          opacity="0.6"
        />
      </svg>
    </div>
  )
}

/**
 * InkWash — Generative subtle ink wash organic background texture.
 */
export function InkWash({
  className = '',
  intensity = 'subtle',
}: {
  className?: string
  intensity?: 'subtle' | 'medium' | 'deep'
}) {
  const opacities = {
    subtle: 'opacity-[0.06]',
    medium: 'opacity-[0.12]',
    deep: 'opacity-[0.18]',
  }

  return (
    <div
      aria-hidden="true"
      className={clsx(
        'pointer-events-none absolute inset-0 z-0 overflow-hidden mix-blend-soft-light select-none',
        opacities[intensity],
        className
      )}
    >
      <svg
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover"
      >
        <filter id="ink-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="60" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <path
          d="M200,300 Q300,100 500,200 T700,450 Q600,700 400,650 T150,500 Z"
          fill="#5C1224"
          filter="url(#ink-blur)"
        />
        <path
          d="M350,200 Q550,150 650,350 T500,600 Q300,650 200,500 T300,250 Z"
          fill="#B89146"
          filter="url(#ink-blur)"
          opacity="0.5"
        />
      </svg>
    </div>
  )
}

/**
 * TopographicContour — Generative topographic line contours for spatial backgrounds.
 */
export function TopographicContour({
  className = '',
}: {
  className?: string
}) {
  return (
    <div aria-hidden="true" className={clsx('pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07] select-none', className)}>
      <svg viewBox="0 0 1000 600" fill="none" className="w-full h-full text-gold" preserveAspectRatio="none">
        <path d="M0,100 C200,150 400,50 600,120 C800,190 900,80 1000,110" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M0,200 C250,230 450,160 650,220 C850,280 920,190 1000,210" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M0,300 C180,340 380,260 580,310 C780,360 880,280 1000,300" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M0,400 C220,430 420,370 620,410 C820,450 910,390 1000,410" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M0,500 C190,520 390,470 590,510 C790,550 890,490 1000,500" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

/**
 * BotanicalGeometry — Refined vector fleuron / botanical motif.
 */
export function BotanicalGeometry({
  className = '',
  size = 32,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={clsx('text-gold select-none', className)}
      aria-hidden="true"
    >
      <path
        d="M20 4 C20 14 10 20 4 20 C14 20 20 26 20 36 C20 26 26 20 36 20 C26 20 20 14 20 4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="20" cy="20" r="2.5" fill="currentColor" />
    </svg>
  )
}
