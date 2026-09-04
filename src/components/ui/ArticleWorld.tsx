import type { ReactNode } from 'react'

/**
 * THE WORLD — the atmospheric layer of each publication.
 * Every article lives in its own texture and light: fine laid paper for
 * poems, ruled letter-paper for letters, halftone newsprint for
 * dispatches, deep night light for horror, woven linen for warm stories,
 * a hushed gallery for artworks. Textures are drawn, never noisy — clean
 * print surfaces and light, with no grain anywhere in the interface.
 */

/* halftone — the newsprint and gallery dot screen, drawn, not filtered */
const HALFTONE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cdefs%3E%3Cpattern id='d' width='12' height='12' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='2' cy='2' r='1.4' fill='rgba(248,246,242,0.05)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23d)'/%3E%3C/svg%3E")`
/* linen — the woven weave of warm cloth */
const LINEN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M0 30h60M30 0v60' stroke='rgba(248,246,242,0.03)' stroke-width='1'/%3E%3C/svg%3E")`
/* laid paper — the fine horizontal ribs of good stationery */
const LAID = 'repeating-linear-gradient(to_bottom,transparent_0px,transparent_7px,rgba(248,246,242,0.022)_7px,rgba(248,246,242,0.022)_8px)'
/* ledger — the faint grid of a record sheet */
const LEDGER = 'repeating-linear-gradient(to_bottom,transparent_0px,transparent_44px,rgba(184,145,70,0.045)_44px,rgba(184,145,70,0.045)_45px),repeating-linear-gradient(to_right,transparent_0px,transparent_120px,rgba(184,145,70,0.025)_120px,rgba(184,145,70,0.025)_121px)'

export const WORLD_TEXTURE: Record<string, { layer: ReactNode; bodyClass: string }> = {
  paper: {
    layer: (
      <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: LAID }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(248,246,242,0.035),transparent_60%)]" />
      </>
    ),
    bodyClass: '',
  },
  letter: {
    layer: (
      <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_44px,rgba(184,145,70,0.05)_44px,rgba(184,145,70,0.05)_45px)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_0%,rgba(248,246,242,0.03),transparent_62%)]" />
      </>
    ),
    bodyClass: '',
  },
  newsprint: {
    layer: (
      <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: HALFTONE, backgroundSize: '120px 120px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgba(28,28,28,0.35),transparent_65%)]" />
      </>
    ),
    bodyClass: 'bg-[linear-gradient(180deg,rgba(28,28,28,0.45),transparent_35%)]',
  },
  night: {
    layer: (
      <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_35%,transparent_42%,rgba(6,1,4,0.6))]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_35%_at_50%_8%,rgba(248,246,242,0.028),transparent_70%)]" />
      </>
    ),
    bodyClass: 'bg-[#1F060E]',
  },
  linen: {
    layer: (
      <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: LINEN, backgroundSize: '60px 60px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_55%_at_50%_0%,rgba(184,145,70,0.08),transparent_60%)]" />
      </>
    ),
    bodyClass: '',
  },
  gallery: {
    layer: (
      <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: HALFTONE, backgroundSize: '120px 120px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_0%,rgba(184,145,70,0.06),transparent_65%)]" />
      </>
    ),
    bodyClass: '',
  },
  document: {
    layer: (
      <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: LEDGER }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(184,145,70,0.04)_49.9%,rgba(184,145,70,0.04)_50.1%,transparent_100%)]" />
      </>
    ),
    bodyClass: '',
  },
}

export function WorldTexture({ world }: { world?: string }) {
  const w = WORLD_TEXTURE[world ?? 'paper']
  return w ? <>{w.layer}</> : null
}

export function worldBodyClass(world?: string): string {
  return WORLD_TEXTURE[world ?? 'paper']?.bodyClass ?? ''
}
