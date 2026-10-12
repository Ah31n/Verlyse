import type { Article } from '../content'

// Vite serves these paths in development; they are intentionally not imports,
// so the unpublished originals are not copied or emitted by a production build.
const slide01 = '/src/data/drafts/assets/DeUZFPTCjPU-1.webp'
const slide02 = '/src/data/drafts/assets/DeUZFPTCjPU-2.webp'
const slide03 = '/src/data/drafts/assets/DeUZFPTCjPU-3.webp'
const slide04 = '/src/data/drafts/assets/DeUZFPTCjPU-4.webp'
const slide05 = '/src/data/drafts/assets/DeUZFPTCjPU-5.webp'

/**
 * A single, explicitly unpublished source-sidecar for the development preview.
 * It is deliberately separate from the public article registry and must only
 * be loaded from a development-gated dynamic import.
 */
export const quietGriefDraft: Article = {
  publicationStatus: 'draft',
  id: 'the-quiet-grief',
  title: 'The Quiet Grief',
  authorId: 'verlyse-media',
  category: 'Art',
  excerpt: 'Somewhere along the way, we stopped reaching for the things that once made us feel alive.',
  readingTime: '—',
  date: '2026-10-10',
  cover: slide01,
  slides: [slide01, slide02, slide03, slide04, slide05],
  slideDimensions: [
    { width: 603, height: 619 },
    { width: 1080, height: 1108 },
    { width: 1200, height: 1231 },
    { width: 1080, height: 1108 },
    { width: 585, height: 600 },
  ],
  slideAlts: [
    'A painted pair of pink ballet flats on an ochre ground; the pale banner reads “Once it was the thing i ran towards”.',
    'A painted figure holding a camera toward a bright light; the pale banner reads “Then, somewhere along the way, the joy became an obligation”.',
    'Black eyeglasses rest on stacked books against a sage ground; the pale banner reads “Until the things i loved became, the things I no longer had time for”.',
    'Painted cosmetics, perfume and jewelry on a cream ground; the pale banner reads “And So, i became a stranger to the very thing that once made me feel alive”.',
    'Pink flip-phone and point-and-shoot cameras; the pale banner reads “Nobody talks about grieving a version of yourself that you had to leave behind”.',
  ],
  sourceSlideShortCodes: [
    'DeUZAdGKvqt',
    'DeUZAc0K-DS',
    'DeUZAgrKhxG',
    'DeUZAnkqU5G',
    'DeUZArjqUA8',
  ],
  tags: ['verlysemedia', 'TheQuietGrief', 'LostPassions', 'ArtAndWords'],
  originalCaption: [
    'Somewhere along the way, we stopped reaching for the things that once made us feel alive. ',
    '',
    'Not because we stopped loving them, but because life got louder, time grew scarce, and the dreams we once held so close slowly became memories we revisited instead of realities we lived.',
    '',
    'Perhaps the saddest part of growing up is watching a passion become a stranger to us.',
    '',
    'The colours never faded. We just stopped reaching for them.',
    '',
    '— Verlyse Media',
    '',
    '#verlysemedia #TheQuietGrief #LostPassions #ArtAndWords CreativeExpression',
  ].join('\n'),
  sourceUrl: 'https://www.instagram.com/p/DeUZFPTCjPU/',
  sourceTimestamp: '2026-10-10T15:20:30.000Z',
  body: [],
  likes: null,
  comments: null,
  shortCode: 'DeUZFPTCjPU',
  voices: [],
  vibe: 'gallery',
  world: 'gallery',
  heroMode: 'gallery',
  gallery: true,
}
