/**
 * Image fallback helper — swaps a failed `<img>` source to an inline
 * wine-and-brass SVG plate carrying the piece's title and folio number,
 * and resolves pending external source assets to the same archival plate
 * without fabricating replacement artwork or triggering HTTP 404s.
 */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Canonical asset paths for verified editorial entries whose original binary
 * image files are awaiting external dataset attachment.
 * All five original WebP slides for `DeUZFPTCjPU` ("The Quiet Grief") are now
 * self-hosted under `public/img/works/DeUZFPTCjPU-1.webp`..`-5.webp`.
 */
export const PENDING_SOURCE_ASSETS: ReadonlySet<string> = new Set([])

export function isPendingSourceAsset(path: string): boolean {
  return PENDING_SOURCE_ASSETS.has(path)
}

export function plateFallback(title?: string, folioNo?: string, subtitle?: string): string {
  const safeTitle = esc((title || 'Verlyse Media').slice(0, 64))
  const validFolio = folioNo && folioNo !== '0' && folioNo !== '00' ? folioNo : ''
  const safeFolio = esc(validFolio ? `FOLIO № ${validFolio}` : 'VERLYSE MEDIA · ARCHIVE')
  const safeSub = subtitle ? esc(subtitle.slice(0, 64)) : ''
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000' width='800' height='1000'>
    <defs>
      <radialGradient id='g' cx='50%' cy='42%' r='70%'>
        <stop offset='0%' stop-color='#471323'/>
        <stop offset='65%' stop-color='#260913'/>
        <stop offset='100%' stop-color='#120409'/>
      </radialGradient>
    </defs>
    <rect width='800' height='1000' fill='url(#g)'/>
    <rect x='36' y='36' width='728' height='928' fill='none' stroke='#B89146' stroke-opacity='0.38' stroke-width='1'/>
    <rect x='52' y='52' width='696' height='896' fill='none' stroke='#B89146' stroke-opacity='0.18' stroke-width='1'/>
    <line x1='120' y1='180' x2='680' y2='180' stroke='#B89146' stroke-opacity='0.35' stroke-width='1'/>
    <line x1='120' y1='820' x2='680' y2='820' stroke='#B89146' stroke-opacity='0.35' stroke-width='1'/>
    <text x='400' y='148' text-anchor='middle' fill='#D4B06A' font-family='monospace' font-size='15' letter-spacing='6'>${safeFolio}</text>
    <circle cx='400' cy='430' r='54' fill='none' stroke='#B89146' stroke-opacity='0.45' stroke-width='1.2'/>
    <circle cx='400' cy='430' r='4' fill='#D4B06A'/>
    <text x='400' y='560' text-anchor='middle' fill='#F7F2EA' font-family='Georgia, serif' font-style='italic' font-size='27'>${safeTitle}</text>
    ${safeSub ? `<text x='400' y='612' text-anchor='middle' fill='#D4B06A' fill-opacity='0.82' font-family='monospace' font-size='13' letter-spacing='3'>${safeSub}</text>` : ''}
    <text x='400' y='866' text-anchor='middle' fill='#B89146' fill-opacity='0.75' font-family='monospace' font-size='12' letter-spacing='5'>WHERE VISION BECOMES A VOICE</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/**
 * Resolves a canonical plate path: returns the path itself when the binary
 * is present in the build, or the typographic wine-and-brass archival SVG
 * plate when the path is registered in `PENDING_SOURCE_ASSETS`.
 */
export function plateSrc(
  path: string,
  title?: string,
  folioNo?: string,
  subtitle?: string,
): string {
  if (PENDING_SOURCE_ASSETS.has(path)) {
    return plateFallback(title, folioNo, subtitle)
  }
  return path
}

export function handleImgError(
  e: { currentTarget: HTMLImageElement },
  title?: string,
  folioNo?: string,
): void {
  const img = e.currentTarget
  if (img.dataset.fallbackApplied === 'true') return
  img.dataset.fallbackApplied = 'true'
  img.src = plateFallback(title || img.alt, folioNo)
}
