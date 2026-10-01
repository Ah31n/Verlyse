import { type ReactNode } from 'react'
import { clsx } from 'clsx'
import { ArchivalSeal } from './GenerativeGraphics'

interface CorrespondenceSheetProps {
  title: string
  subtitle?: string
  folioRef?: string
  sealText?: string
  children: ReactNode
  className?: string
}

/**
 * CorrespondenceSheet — Stationery Paper Surface Primitive
 * Used on /submit and /contact for manuscript dispatch & editorial correspondence.
 */
export function CorrespondenceSheet({
  title,
  subtitle,
  folioRef,
  sealText = 'VERLYSE MEDIA · EDITORIAL DESK',
  children,
  className = '',
}: CorrespondenceSheetProps) {
  return (
    <div
      className={clsx(
        'relative mx-auto w-full max-w-3xl border border-gold/40 bg-[#FAF8F5] text-[#2A0F18] p-6 sm:p-10 md:p-14 shadow-[0_24px_60px_rgba(0,0,0,0.5)]',
        className
      )}
    >
      {/* Corner Registration Marks */}
      <span aria-hidden="true" className="absolute top-3 left-3 h-3 w-3 border-t border-l border-[#B89146]/70" />
      <span aria-hidden="true" className="absolute top-3 right-3 h-3 w-3 border-t border-r border-[#B89146]/70" />
      <span aria-hidden="true" className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[#B89146]/70" />
      <span aria-hidden="true" className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[#B89146]/70" />

      {/* Top Header Rail */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A0F18]/15 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <ArchivalSeal size={32} className="text-[#7C6338]" />
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.32em] text-[#7C6338]">
              {sealText}
            </p>
            {folioRef && (
              <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#2A0F18]/50">
                {folioRef}
              </p>
            )}
          </div>
        </div>

        <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-[#2A0F18]/50">
          STATIONERY № 01
        </span>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1E0B12] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 font-serif text-base italic text-[#2A0F18]/75 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Sheet Content / Form */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Footer colophon notation */}
      <div className="mt-12 flex items-center justify-between border-t border-[#2A0F18]/10 pt-4 font-mono text-[8px] uppercase tracking-[0.24em] text-[#2A0F18]/45">
        <span>Letters · Manuscripts · Colophon</span>
        <span>Archive Standard</span>
      </div>
    </div>
  )
}
