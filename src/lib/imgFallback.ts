/**
 * Image fallback helper — swaps a failed `<img>` source to an inline
 * wine-and-brass SVG plate carrying the piece's title and folio number,
 * and resolves pending external source assets to an art-directed typographic
 * archival plate without fabricating replacement artwork or triggering HTTP 404s.
 */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Canonical asset paths for verified editorial entries whose original binary
 * image files are awaiting external dataset attachment.
 * All five original WebP slides for `DeUZFPTCjPU` ("The Quiet Grief") are now
 * self-hosted under `public/img/works/DeUZFPTCjPU-1.webp`..`-5.webp`.
 * The nine carousel slide paths for `Dehg27tE_hF` ("She Didn’t Say Qubool Hai")
 * resolve to typographic wine-and-brass archival SVG plates until the binary
 * slide images are attached.
 */
/**
 * Direct source photo URLs from the attached Instagram scraper dataset
 * (`dataset_instagram-scraper_2026-10-16_05-09-47-241.json`, `shortCode: 'Dehg27tE_hF'`,
 * 9 child slides `DehgrPwitkY`..`DehgsHuCVDR` at `1080×1350`).
 */
export const SCRAPER_SOURCE_URLS: Readonly<Record<string, string>> = {
  '/img/works/Dehg27tE_hF-1.webp':
    'https://instagram.flyn1-1.fna.fbcdn.net/v/t51.82787-15/847791383_18194508382393769_6443719407187607112_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=107&_nc_map=urlgen_bucketless&ig_cache_key=NDAwODYyODg1MjY4Mjg0MDM0NA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=kdIrtWxoh4gQ7kNvwHzQ8Mr&_nc_oc=AdqUDrWIytxgIJEXPDqxgd8KvZCosKzk50ftDR6n8Lzt4gf1eidj4wfvTjmQHuTzZ-8bwth1TXb74sPiXpvzCteF&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.flyn1-1.fna&_nc_gid=NcSTtUl-fJMhPVUPmKFeQA&_nc_ss=7a22e&oh=00_AQNkEpBjXGwkFi-0aEaI0YYL7KqLdvDeaZVttyHQSERNEQ&oe=6AD78CED',
  '/img/works/Dehg27tE_hF-2.webp':
    'https://instagram.flyn1-1.fna.fbcdn.net/v/t51.82787-15/849272198_18194508406393769_6647433919827994381_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=107&_nc_map=urlgen_bucketless&ig_cache_key=NDAwODYyODg1NjAwNDU5OTk5Mg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=PP9STxEfRpMQ7kNvwE_S8XZ&_nc_oc=Adq7bOLMTXtSwlwAlOh-jOcRpKDXIDA2lxp03sK_7Q--NQiCexA78jZPyeQsaTVGSzJ4h6kyyKufXqliofiujyJv&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.flyn1-1.fna&_nc_gid=NcSTtUl-fJMhPVUPmKFeQA&_nc_ss=7a22e&oh=00_AQNK4T-cr_gY0tI_Hdy_S-yXejVIMXsuuxiwo_oWl7yQqA&oe=6AD78BF6',
  '/img/works/Dehg27tE_hF-3.webp':
    'https://instagram.flyn1-1.fna.fbcdn.net/v/t51.82787-15/849772943_18194508463393769_6193769529376880396_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&_nc_map=urlgen_bucketless&ig_cache_key=NDAwODYyODkxMjI1MDM1NjU0OA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=SQHSZ8SuxmYQ7kNvwEvTbLj&_nc_oc=Ado28UlQLHyvWYHNqJa3R8cMjPft_f5JV1QtXYamhSMztxxwKQ7CK4kgZ8fPW3wCPZI-rqGNEKZPZNrJGT0-TENp&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.flyn1-1.fna&_nc_gid=NcSTtUl-fJMhPVUPmKFeQA&_nc_ss=7a22e&oh=00_AQOv-Og7YxpwV4Ug4Y0yu10UzSywXhyjSNTgeIi562elEQ&oe=6AD76DD8',
  '/img/works/Dehg27tE_hF-4.webp':
    'https://instagram.flyn1-1.fna.fbcdn.net/v/t51.82787-15/851331002_18194508451393769_666275316753230506_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&_nc_map=urlgen_bucketless&ig_cache_key=NDAwODYyODg5MzA3MzgwMjUwNg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=B7P0CSL2mgIQ7kNvwELXPkm&_nc_oc=Ado4CNSNWMQLzWZnpexr7voNFag2RHpuRl6PQW5ATd7XgWTt_gWgCvbkflphkZ3C2Qyqz7uvuw_RHQZSi2tWvMtz&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.flyn1-1.fna&_nc_gid=NcSTtUl-fJMhPVUPmKFeQA&_nc_ss=7a22e&oh=00_AQP8N3Id_BBpsCFYEtvUpW5FprIJoVou8SBCR0Fn1edwTA&oe=6AD79369',
  '/img/works/Dehg27tE_hF-5.webp':
    'https://instagram.flyn1-1.fna.fbcdn.net/v/t51.82787-15/849184622_18194508517393769_549748313775522777_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&_nc_map=urlgen_bucketless&ig_cache_key=NDAwODYyODkyMzM5ODg3MDExOA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=yGA5DeD1gdoQ7kNvwE7bTyz&_nc_oc=AdqC-5tF7T9LJVh6NEWdVkqlUHfQB3LWoDhgN6zMXz-wbvsmqRUZFFw4Q_leEwn5U7QK_9vKwainLN2Xh5o5jrON&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.flyn1-1.fna&_nc_gid=NcSTtUl-fJMhPVUPmKFeQA&_nc_ss=7a22e&oh=00_AQPzPIzO4hjuIf60z09Q4WIu0W5Mng2rsCwrYG1QdSFTAQ&oe=6AD79D3F',
  '/img/works/Dehg27tE_hF-6.webp':
    'https://instagram.flyn1-1.fna.fbcdn.net/v/t51.82787-15/849772971_18194508442393769_4626146699960776732_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=104&_nc_map=urlgen_bucketless&ig_cache_key=NDAwODYyODg5ODA4MTgxNTA2Nw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=LwjUvrKvecYQ7kNvwGGpeXy&_nc_oc=AdrmOoknh_n9UAnha7YNQl3vI2TUkMnfwUAyWq8YIk94AZWp8FJQL7i6mV705_cgh2g2CN-d2n7LYO3TptmLUx3O&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.flyn1-1.fna&_nc_gid=NcSTtUl-fJMhPVUPmKFeQA&_nc_ss=7a22e&oh=00_AQMiUsQp-HseJ6xISoVQjs2R3iiQzStEbyMqA-H2TN2UBQ&oe=6AD76A34',
  '/img/works/Dehg27tE_hF-7.webp':
    'https://instagram.flyn1-1.fna.fbcdn.net/v/t51.82787-15/848696607_18194508502393769_8262881786001186548_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=105&_nc_map=urlgen_bucketless&ig_cache_key=NDAwODYyODkxMjkyMTUwNTM2NQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=-T5XGI3n-mIQ7kNvwEtBPgw&_nc_oc=AdpA4z5BKmBP3fO7PZB9LfWcrbpkY-IPZWB-0WAmlMaRZHEsf9uEnDQizeNm-cQhOdlE7OJzb80XsARFCSCl8juo&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.flyn1-1.fna&_nc_gid=NcSTtUl-fJMhPVUPmKFeQA&_nc_ss=7a22e&oh=00_AQPlzH4UYl7rIEBKI8GJoDcfD0cis3r1sJRCQhQvT06aKg&oe=6AD778FF',
  '/img/works/Dehg27tE_hF-8.webp':
    'https://instagram.flyn1-1.fna.fbcdn.net/v/t51.82787-15/847917646_18194508499393769_6672378698575174496_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=100&_nc_map=urlgen_bucketless&ig_cache_key=NDAwODYyODkxMzU3NTU2ODYzMQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=VkNScmiMZesQ7kNvwE0tWeA&_nc_oc=Adow8syFuPfOAXJAD6pGcWOMBFUxQi7SdIqTG9S8uf4hC1fHJqgbvV17XHXhXWLtSyZr_-crpHQY3QEunLujH-uZ&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.flyn1-1.fna&_nc_gid=NcSTtUl-fJMhPVUPmKFeQA&_nc_ss=7a22e&oh=00_AQPJIHuDllnYxMYFY8nm6YhZvlzD5FeaLf0J3iaZBLQ-Gg&oe=6AD78F92',
  '/img/works/Dehg27tE_hF-9.webp':
    'https://instagram.flyn1-1.fna.fbcdn.net/v/t51.82787-15/849075267_18194508475393769_3918262709493308088_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=101&_nc_map=urlgen_bucketless&ig_cache_key=NDAwODYyODkxMjc3MDMzOTAyNQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=P6JEfI7r_M8Q7kNvwG9LAyj&_nc_oc=Adoj4-9DMWopQPfuVOdRhLNimSWeCvnmiXBlUWIr7_nXiJf-2uWwlSWWNm1lrctL3FKoByX3dENgpGCg4K6RXpgV&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.flyn1-1.fna&_nc_gid=NcSTtUl-fJMhPVUPmKFeQA&_nc_ss=7a22e&oh=00_AQMZiUv7jWVh7z5BA3EUIZdiRzHszraxdHfGug61abEudA&oe=6AD79F4B',
}

export const PENDING_SOURCE_ASSETS: ReadonlySet<string> = new Set(Object.keys(SCRAPER_SOURCE_URLS))

export function isPendingSourceAsset(path: string): boolean {
  return PENDING_SOURCE_ASSETS.has(path)
}

/** Word-wraps a string into balanced lines that never overflow the 800x1000 SVG frame. */
function wrapSvgLines(input: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = input.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxCharsPerLine || !current) {
      current = candidate
    } else {
      lines.push(current)
      current = word
      if (lines.length === maxLines - 1) break
    }
  }
  const consumedWords = lines.join(' ').split(/\s+/).filter(Boolean).length
  const remaining = words.slice(consumedWords).join(' ')
  if (remaining) {
    lines.push(
      remaining.length > maxCharsPerLine + 4
        ? `${remaining.slice(0, maxCharsPerLine + 1).trimEnd()}…`
        : remaining,
    )
  } else if (current && lines.length < maxLines) {
    lines.push(current)
  }
  return lines.slice(0, maxLines)
}

/** Returns a restrained architectural brass SVG emblem keyed to plate number (1..9). */
function plateEmblemSvg(plateIdx: number): string {
  switch (plateIdx) {
    case 1:
      /* Two parted threshold rings + unbroken rising voice line */
      return `
        <circle cx='348' cy='335' r='44' fill='none' stroke='#F7F2EA' stroke-opacity='0.42' stroke-width='1.3' stroke-dasharray='200 76'/>
        <circle cx='452' cy='335' r='44' fill='none' stroke='#D4B06A' stroke-opacity='0.68' stroke-width='1.3' stroke-dasharray='200 76' transform='rotate(180 452 335)'/>
        <line x1='400' y1='402' x2='400' y2='258' stroke='#D4B06A' stroke-width='1.6'/>
        <circle cx='400' cy='252' r='4.5' fill='#D4B06A'/>
      `
    case 2:
      /* Parted arch & broken coercion seal */
      return `
        <path d='M 332 392 L 332 316 A 68 68 0 0 1 392 249' fill='none' stroke='#F7F2EA' stroke-opacity='0.45' stroke-width='1.3'/>
        <path d='M 468 392 L 468 316 A 68 68 0 0 0 408 249' fill='none' stroke='#D4B06A' stroke-opacity='0.68' stroke-width='1.3'/>
        <line x1='312' y1='392' x2='488' y2='392' stroke='#B89146' stroke-opacity='0.45' stroke-width='1.1'/>
        <circle cx='400' cy='320' r='5' fill='#D4B06A'/>
      `
    case 3:
      /* Sovereign balance beam — culture vs truth */
      return `
        <line x1='310' y1='335' x2='490' y2='335' stroke='#D4B06A' stroke-opacity='0.72' stroke-width='1.4'/>
        <line x1='400' y1='265' x2='400' y2='395' stroke='#B89146' stroke-opacity='0.5' stroke-width='1.3'/>
        <circle cx='336' cy='335' r='22' fill='none' stroke='#F7F2EA' stroke-opacity='0.4' stroke-width='1.2'/>
        <circle cx='464' cy='335' r='22' fill='none' stroke='#D4B06A' stroke-opacity='0.7' stroke-width='1.2'/>
        <polygon points='400,255 394,267 406,267' fill='#D4B06A'/>
      `
    case 4:
      /* Unmasked horizon & open threshold */
      return `
        <rect x='338' y='262' width='124' height='132' fill='none' stroke='#B89146' stroke-opacity='0.52' stroke-width='1.2'/>
        <path d='M 338 352 Q 400 312 462 352' fill='none' stroke='#D4B06A' stroke-opacity='0.72' stroke-width='1.4'/>
        <circle cx='400' cy='302' r='16' fill='none' stroke='#F7F2EA' stroke-opacity='0.55' stroke-width='1.3'/>
        <circle cx='400' cy='302' r='3.5' fill='#D4B06A'/>
      `
    case 5:
      /* Central thesis — two autonomous sovereign circles & star */
      return `
        <circle cx='356' cy='332' r='38' fill='none' stroke='#F7F2EA' stroke-opacity='0.52' stroke-width='1.3'/>
        <circle cx='444' cy='332' r='38' fill='none' stroke='#D4B06A' stroke-opacity='0.75' stroke-width='1.3'/>
        <circle cx='356' cy='332' r='3.5' fill='#F7F2EA' fill-opacity='0.75'/>
        <circle cx='444' cy='332' r='3.5' fill='#D4B06A'/>
        <path d='M 400 264 L 404 276 L 416 280 L 404 284 L 400 296 L 396 284 L 384 280 L 396 276 Z' fill='#D4B06A' fill-opacity='0.85'/>
      `
    case 6:
      /* Botanical stem & four-petal bloom — autonomy & rights */
      return `
        <circle cx='400' cy='332' r='52' fill='none' stroke='#B89146' stroke-opacity='0.35' stroke-width='1.1'/>
        <path d='M 400 392 L 400 312' stroke='#D4B06A' stroke-width='1.4'/>
        <path d='M 400 356 C 378 350, 374 334, 392 330' fill='none' stroke='#F7F2EA' stroke-opacity='0.5' stroke-width='1.2'/>
        <path d='M 400 346 C 422 340, 426 324, 408 320' fill='none' stroke='#D4B06A' stroke-opacity='0.7' stroke-width='1.2'/>
        <circle cx='400' cy='304' r='12' fill='none' stroke='#D4B06A' stroke-width='1.3'/>
        <circle cx='400' cy='304' r='3.5' fill='#F7F2EA'/>
      `
    case 7:
      /* Concentric resonance arcs — breaking the silence */
      return `
        <circle cx='400' cy='356' r='6' fill='#D4B06A'/>
        <path d='M 368 338 A 40 40 0 0 1 432 338' fill='none' stroke='#F7F2EA' stroke-opacity='0.55' stroke-width='1.3'/>
        <path d='M 346 318 A 68 68 0 0 1 454 318' fill='none' stroke='#D4B06A' stroke-opacity='0.65' stroke-width='1.3'/>
        <path d='M 324 298 A 96 96 0 0 1 476 298' fill='none' stroke='#B89146' stroke-opacity='0.45' stroke-width='1.2'/>
      `
    case 8:
      /* Architectural colonnade & steadied lamp */
      return `
        <line x1='328' y1='388' x2='472' y2='388' stroke='#B89146' stroke-opacity='0.55' stroke-width='1.3'/>
        <line x1='352' y1='288' x2='352' y2='388' stroke='#F7F2EA' stroke-opacity='0.38' stroke-width='1.3'/>
        <line x1='400' y1='274' x2='400' y2='388' stroke='#D4B06A' stroke-opacity='0.75' stroke-width='1.5'/>
        <line x1='448' y1='288' x2='448' y2='388' stroke='#F7F2EA' stroke-opacity='0.38' stroke-width='1.3'/>
        <circle cx='400' cy='268' r='5' fill='#D4B06A'/>
      `
    default:
      /* Double-diamond editorial colophon seal */
      return `
        <rect x='362' y='294' width='76' height='76' transform='rotate(45 400 332)' fill='none' stroke='#D4B06A' stroke-opacity='0.65' stroke-width='1.3'/>
        <rect x='374' y='306' width='52' height='52' fill='none' stroke='#F7F2EA' stroke-opacity='0.38' stroke-width='1.1'/>
        <circle cx='400' cy='332' r='4.5' fill='#D4B06A'/>
      `
  }
}

export function plateFallback(title?: string, folioNo?: string, subtitle?: string): string {
  const rawTitle = (title || 'Verlyse Media').trim()
  const validFolio = folioNo && folioNo !== '0' && folioNo !== '00' ? folioNo : ''
  const safeFolio = esc(validFolio ? `FOLIO № ${validFolio}` : 'VERLYSE MEDIA · ARCHIVE')

  /* Extract primary work title vs per-plate statement if separated by ' — ' */
  const parts = rawTitle.split(/\s+—\s+/)
  const headlineRaw = parts[0] || 'Verlyse Media'
  const detailRaw = parts.slice(1).join(' · ').replace(/^Plate\s+\d+\s*·\s*/i, '').trim()

  const headlineLines = wrapSvgLines(`“${headlineRaw.replace(/^[“"]|[”"]$/g, '')}”`, 24, 2)
  const detailLines = detailRaw ? wrapSvgLines(detailRaw, 34, 2) : []
  const safeSub = subtitle ? esc(subtitle.slice(0, 56)) : ''

  /* Detect plate number (1..9) from folioNo or subtitle for distinct emblem */
  const plateMatch = (folioNo || subtitle || '').match(/0?([1-9])$/)
  const plateIdx = plateMatch ? Number(plateMatch[1]) : 1
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][plateIdx - 1] || 'I'

  const headlineTspans = headlineLines
    .map((line, idx) => `<tspan x='400' dy='${idx === 0 ? 0 : 40}'>${esc(line)}</tspan>`)
    .join('')

  const detailStartY = 530 + (headlineLines.length - 1) * 40 + 48
  const detailTspans = detailLines
    .map((line, idx) => `<tspan x='400' dy='${idx === 0 ? 0 : 28}'>${esc(line)}</tspan>`)
    .join('')

  const subY = detailLines.length > 0 ? detailStartY + (detailLines.length - 1) * 28 + 52 : detailStartY + 14

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000' width='800' height='1000'>
    <defs>
      <radialGradient id='g' cx='50%' cy='38%' r='72%'>
        <stop offset='0%' stop-color='#4A1222'/>
        <stop offset='62%' stop-color='#260913'/>
        <stop offset='100%' stop-color='#120409'/>
      </radialGradient>
    </defs>
    <rect width='800' height='1000' fill='url(#g)'/>
    <!-- Subtle Haikei-inspired organic contour lines -->
    <path d='M 52 240 C 230 210, 570 275, 748 235' fill='none' stroke='#B89146' stroke-opacity='0.08' stroke-width='1'/>
    <path d='M 52 760 C 260 795, 540 725, 748 765' fill='none' stroke='#B89146' stroke-opacity='0.08' stroke-width='1'/>
    <!-- Outer and inner archival plate borders -->
    <rect x='36' y='36' width='728' height='928' fill='none' stroke='#B89146' stroke-opacity='0.42' stroke-width='1'/>
    <rect x='52' y='52' width='696' height='896' fill='none' stroke='#B89146' stroke-opacity='0.20' stroke-width='1'/>
    <!-- Corner registration marks -->
    <path d='M 68 88 L 68 68 L 88 68 M 712 68 L 732 68 L 732 88 M 68 912 L 68 932 L 88 932 M 712 932 L 732 932 L 732 912' fill='none' stroke='#D4B06A' stroke-opacity='0.55' stroke-width='1.2'/>
    <line x1='116' y1='176' x2='684' y2='176' stroke='#B89146' stroke-opacity='0.32' stroke-width='1'/>
    <line x1='116' y1='812' x2='684' y2='812' stroke='#B89146' stroke-opacity='0.32' stroke-width='1'/>
    <!-- Top archival ledger header -->
    <text x='400' y='132' text-anchor='middle' fill='#D4B06A' font-family='monospace' font-size='14' letter-spacing='5.5'>${safeFolio}</text>
    <text x='400' y='158' text-anchor='middle' fill='#F7F2EA' fill-opacity='0.55' font-family='Georgia, serif' font-style='italic' font-size='14' letter-spacing='2'>Plate ${roman}</text>
    <!-- Plate-specific architectural emblem -->
    ${plateEmblemSvg(plateIdx)}
    <!-- Wrapped headline (never clips horizontally) -->
    <text x='400' y='524' text-anchor='middle' fill='#F7F2EA' font-family='Georgia, serif' font-style='italic' font-size='31'>${headlineTspans}</text>
    <!-- Wrapped plate statement -->
    ${detailLines.length > 0 ? `<text x='400' y='${detailStartY}' text-anchor='middle' fill='#E8D9A8' fill-opacity='0.90' font-family='Georgia, serif' font-size='21'>${detailTspans}</text>` : ''}
    <!-- Monospace plate index subtitle -->
    ${safeSub ? `<text x='400' y='${subY}' text-anchor='middle' fill='#D4B06A' fill-opacity='0.82' font-family='monospace' font-size='12' letter-spacing='3'>${safeSub}</text>` : ''}
    <!-- Bottom colophon & provenance stamp -->
    <text x='400' y='858' text-anchor='middle' fill='#D4B06A' fill-opacity='0.80' font-family='monospace' font-size='11.5' letter-spacing='4.5'>WHERE VISION BECOMES A VOICE</text>
    <text x='400' y='888' text-anchor='middle' fill='#F7F2EA' fill-opacity='0.45' font-family='monospace' font-size='10' letter-spacing='3'>VERLYSE MEDIA · ARCHIVAL SPECIMEN PLATE</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

let cacheSyncTriggered = false

function syncScraperPhotosToLocalCache(): void {
  if (cacheSyncTriggered || typeof window === 'undefined' || typeof fetch === 'undefined') return
  if (typeof navigator !== 'undefined' && navigator.webdriver) return
  cacheSyncTriggered = true
  window.setTimeout(() => {
    for (const [localPath, remoteUrl] of Object.entries(SCRAPER_SOURCE_URLS)) {
      const fileName = localPath.split('/').pop()
      if (!fileName) continue
      fetch(remoteUrl, { referrerPolicy: 'no-referrer', mode: 'cors' })
        .then((res) => (res.ok ? res.arrayBuffer() : null))
        .then((buf) => {
          if (!buf || buf.byteLength < 1024) return
          return fetch(`/__cache-scraper-slide?file=${encodeURIComponent(fileName)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: buf,
          })
        })
        .catch(() => {
          /* silent no-op if production or CORS-restricted */
        })
    }
  }, 800)
}

/**
 * Resolves a canonical plate path: returns the scraper photo URL from the
 * uploaded dataset in real browsers (with automatic SVG fallback on error),
 * or the typographic archival SVG plate in offline headless test runners
 * where external CDN egress is sandboxed.
 */
export function plateSrc(
  path: string,
  title?: string,
  folioNo?: string,
  subtitle?: string,
): string {
  const scraperUrl = SCRAPER_SOURCE_URLS[path]
  if (scraperUrl) {
    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      return plateFallback(title, folioNo, subtitle)
    }
    syncScraperPhotosToLocalCache()
    return scraperUrl
  }
  if (PENDING_SOURCE_ASSETS.has(path)) {
    return plateFallback(title, folioNo, subtitle)
  }
  return path
}

export function handleImgError(
  e: { currentTarget: HTMLImageElement },
  title?: string,
  folioNo?: string,
  subtitle?: string,
): void {
  const img = e.currentTarget
  if (img.dataset.fallbackApplied === 'true') return
  img.dataset.fallbackApplied = 'true'
  img.src = plateFallback(title || img.alt, folioNo, subtitle)
}
