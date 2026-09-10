/* ------------------------------------------------------------------ */
/* Typographic plate fallback — if a cover ever fails to resolve,     */
/* the reserved box never shows a broken-image icon: it becomes a     */
/* designed wine plate set in the house type (gold rule, folio №,      */
/* title, wordmark). Same dimensions as the missing image, so there    */
/* is zero layout shift. Decorative by construction — the surrounding */
/* link/card already carries the accessible name.                      */
/* ------------------------------------------------------------------ */

function wrapLines(text: string, max: number, maxLines: number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (next.length > max && line) {
      lines.push(line)
      line = w
      if (lines.length === maxLines - 1) break
    } else {
      line = next
    }
  }
  if (lines.length < maxLines && line) lines.push(line)
  if (lines.length === maxLines) {
    const used = lines.join(' ').split(' ').length
    const rest = words.slice(used).join(' ')
    if (rest) lines[maxLines - 1] = `${lines[maxLines - 1]}…`
  }
  return lines
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function plateFallback(label: string, folio = ''): string {
  const lines = wrapLines(label.replace(/^“|”$/g, ''), 26, 4)
  const startY = 500 - (lines.length - 1) * 44
  const tspans = lines
    .map((l, i) => `<text x='400' y='${startY + i * 76}' text-anchor='middle' font-family='Georgia, serif' font-style='italic' font-size='52' fill='#F8F6F2'>${esc(l)}</text>`)
    .join('')
  const folioLine = folio
    ? `<text x='400' y='300' text-anchor='middle' font-family='monospace' font-size='26' letter-spacing='8' fill='#D9B978'>№ ${folio}</text>`
    : ''
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000' viewBox='0 0 800 1000'>
<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#3B0D17'/><stop offset='1' stop-color='#1B0610'/></linearGradient></defs>
<rect width='800' height='1000' fill='url(#g)'/>
<rect x='40' y='40' width='720' height='920' fill='none' stroke='#B89146' stroke-width='2'/>
<rect x='56' y='56' width='688' height='888' fill='none' stroke='#B89146' stroke-opacity='0.35'/>
${folioLine}
<line x1='300' y1='360' x2='500' y2='360' stroke='#D9B978' stroke-width='2'/>
${tspans}
<text x='400' y='820' text-anchor='middle' font-family='monospace' font-size='24' letter-spacing='10' fill='#D9B978'>VERLYSE MEDIA</text>
<text x='400' y='860' text-anchor='middle' font-family='monospace' font-size='18' letter-spacing='6' fill='#F8F6F2' fill-opacity='0.55'>WHERE VISION BECOMES A VOICE</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** onError handler for <img>: swap once to the typographic plate. */
export function handleImgError(e: React.SyntheticEvent<HTMLImageElement>, label: string, folio = '') {
  const img = e.currentTarget
  if (img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.setAttribute('data-img-fallback', '1')
  img.src = plateFallback(label, folio)
}
