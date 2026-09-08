import type { ReactNode } from 'react'

/**
 * AUTHOR FRAME — the editorial frame that carries every creator photograph.
 *
 * A real printed photograph placed into the layout: a white matte border,
 * a fine inner rule, a soft shadow, and a subtle rotation like a print
 * tucked into a scrapbook. The photograph is NEVER a cut-out — it is the
 * complete original rectangular photo, preserved as-is.
 *
 * Variants:
 *  - 'polaroid'  — the classic instant-print: white border all around
 *  - 'matte'     — a museum print: thin matte + gold hairline + caption
 */
export function AuthorFrame({
  children,
  variant = 'matte',
  rotate = 0,
  caption,
  className = '',
}: {
  children: ReactNode
  variant?: 'polaroid' | 'matte'
  rotate?: number
  caption?: string
  className?: string
}) {
  if (variant === 'polaroid') {
    return (
      <figure className={`inline-block bg-[#F2EADA] p-3 pb-8 shadow-[0_18px_40px_rgba(0,0,0,0.45)] ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
        <div className="overflow-hidden bg-white">{children}</div>
        {caption && (
          <figcaption className="mt-3 text-center font-serif text-sm font-light italic text-[#5C1224]/70">
            {caption}
          </figcaption>
        )}
      </figure>
    )
  }
  return (
    <figure className={`inline-block border border-gold/30 bg-[#17060B] p-2 shadow-[0_18px_44px_rgba(0,0,0,0.5)] ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
      {/* the matte — the photograph sits inside a thin white mat */}
      <div className="border border-white/15 bg-[#F8F6F2] p-2">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-3 px-1 text-center font-mono text-[9px] uppercase tracking-[0.30em] text-gold/80">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

/** The canonical creator photograph — one asset, reused everywhere. */
export function AuthorPhoto({
  src,
  alt = '',
  className = '',
}: {
  src: string
  alt?: string
  className?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`block object-contain ${className}`}
    />
  )
}
