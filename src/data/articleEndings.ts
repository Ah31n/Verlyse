import { ARTICLES, type Article } from './content'

/**
 * ARTICLE ENDING REGISTRY — the spatial counterpart of the canonical
 * `ArticleSignature` scenes. This drives the bounded three.js atmosphere that
 * sits BEHIND the semantic signature (which is always preserved as HTML/DOM).
 *
 * It must never invent a signature: the `signatureAsset` and `reducedMotionLabel`
 * are taken from the already-verified `ArticleSignature`/`ArticleClosing`
 * registry. `SOURCE-MISSING` marks any signature we could not verify.
 */

/** The movement/atmosphere dialect for one ending scene. */
export type EndingSceneKind =
  | 'voices' // a raised voice over a dark floor
  | 'clock' // the wait at 3:13
  | 'waltz' // a single swaying light
  | 'candle' // a quiet flame
  | 'light' // a faint ascent
  | 'painting' // a matte canvas
  | 'beads' // a slow rosary
  | 'page' // a blank page
  | 'letter' // a folded note
  | 'cat' // a blink in the dark
  | 'feather' // a falling feather
  | 'hands' // many hands
  | 'pause' // a held breath
  | 'people' // a crowd
  | 'word' // a single word reaching
  | 'steps' // one step at a time
  | 'cycle' // a bud, a bird
  | 'prayer' // she prays
  | 'unspecified'

export interface ArticleEndingDefinition {
  endingId: string
  articleId: string
  /** the ceremonial label printed with the signature ('the voice', 'the wait', …) */
  signatureLabel: string
  signatureAsset?: string
  sceneKind: EndingSceneKind
  palette: { background: string; primary: string; secondary?: string }
  motion: { revealMs: number; settleMs: number; loop: boolean }
  reducedMotionLabel: string
}

/**
 * Palette mapped from the canonical Verlyse tokens: wine, wine-deep, gold, ivory.
 * Each ending gets a specific accent so the atmosphere differs per story.
 */
const P = {
  wine: { background: '#2E0913', primary: '#B89146' },
  night: { background: '#1C1C1C', primary: '#B89146' },
  paper: { background: '#3B0D17', primary: '#F8F6F2' },
  ember: { background: '#2E0913', primary: '#E8D9A8' },
} as const

/** label + sceneKind per verified signature, keyed by article id. */
const SIGNATURE_MAP: Record<string, { label: string; kind: EndingSceneKind }> = {
  'their-voices-matter': { label: 'the voice', kind: 'voices' },
  '3-13': { label: 'the wait', kind: 'clock' },
  'the-empty-waltz': { label: 'one, two, three', kind: 'waltz' },
  'the-arts-deserve-respect': { label: 'the candle', kind: 'candle' },
  'hope-becomes-mythology': { label: 'the light', kind: 'light' },
  'a-students-worth': { label: 'the painting', kind: 'painting' },
  'tasbih-e-fatima': { label: 'the beads', kind: 'beads' },
  'intellect-lost-to-code': { label: 'the blank page', kind: 'page' },
  'forgive-me-mother': { label: 'the letter', kind: 'letter' },
  'water-cat': { label: 'the cat', kind: 'cat' },
  'if-hope-were-a-feather': { label: 'hope', kind: 'feather' },
  'the-horrors-of-child-sexual-abuse': { label: "never the child's fault", kind: 'hands' },
  khageena: { label: 'the pause', kind: 'pause' },
  'behind-every-headline': { label: 'the people', kind: 'people' },
  jaldi: { label: 'the word that reaches', kind: 'word' },
  failure: { label: 'one step at a time', kind: 'steps' },
  'my-last-breath': { label: 'the cycle', kind: 'cycle' },
  'the-garden-beyond-my-tower': { label: 'she prays', kind: 'prayer' },
}

function endingFor(article: Article): ArticleEndingDefinition {
  const sig = SIGNATURE_MAP[article.id] ?? { label: 'SOURCE-MISSING', kind: 'unspecified' as EndingSceneKind }
  // a warm/figure-feel palette keyed off the story, still within the Verlyse tokens.
  const palette = article.world === 'night' ? P.night : article.world === 'paper' ? P.paper : P.ember
  return {
    endingId: `ending-${article.id}`,
    articleId: article.id,
    signatureLabel: sig.label,
    sceneKind: sig.kind,
    palette: { background: palette.background, primary: palette.primary, secondary: P.wine.primary },
    motion: { revealMs: 1400, settleMs: 2600, loop: !article.closing?.meta },
    reducedMotionLabel: sig.label,
  }
}

export function getEnding(articleId: string): ArticleEndingDefinition {
  const a = ARTICLES.find((x) => x.id === articleId)
  if (!a) {
    return {
      endingId: `ending-${articleId}`,
      articleId,
      signatureLabel: 'SOURCE-MISSING',
      sceneKind: 'unspecified',
      palette: P.paper,
      motion: { revealMs: 1400, settleMs: 2600, loop: false },
      reducedMotionLabel: 'SOURCE-MISSING',
    }
  }
  return endingFor(a)
}

/** Static accessor so the registry can be consumed by non-React utilities. */
export function getEndingStatic(article: Article): ArticleEndingDefinition {
  return endingFor(article)
}
