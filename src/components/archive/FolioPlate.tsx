// VerlyseWorld — the editorial folio plate.
// Matte ivory card with a brass hairline, ghost folio numeral, serif title,
// mono metadata. The unit of the archive, reused by /articles, /categories,
// /creators and /ambassadors. Always a semantic <a> to the canonical article.
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Article } from '../../data/content'
import { getAuthor } from '../../data/content'
import type { PlateStyle } from '../../lib/archive/geometry'

const min = (rt: string) => rt.replace(' min read', ' MIN').replace(' min', ' MIN').toUpperCase()

interface Props {
  article: Article
  /** the plate's position in the canonical registry (1-based folio №) */
  folio: number
  total: number
  focused: boolean
  style: PlateStyle
  reduced: boolean
  onFocusChange: (i: number) => void
  /** attach the underlying <a> so the shelf can move real DOM focus */
  linkRef?: (el: HTMLAnchorElement | null) => void
}

export default function FolioPlate({
  article, folio, total, focused, style, reduced, onFocusChange, linkRef,
}: Props) {
  const author = getAuthor(article.authorId)?.name ?? article.authorId
  const f = String(folio).padStart(2, '0')
  const isNewest = folio === total

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        transform: style.transform,
        opacity: style.opacity,
        zIndex: style.zIndex,
        pointerEvents: style.pointerEvents,
        transformStyle: 'preserve-3d',
        transition: reduced
          ? 'transform 1ms linear, opacity 200ms linear'
          : 'transform 800ms cubic-bezier(0.22,1,0.36,1), opacity 500ms ease',
      }}
    >
      <Link
        ref={linkRef}
        to={`/article/${article.id}`}
        tabIndex={focused ? 0 : -1}
        onFocus={() => onFocusChange(folio - 1)}
        aria-current={focused ? 'true' : undefined}
        aria-label={`Folio ${f}: ${article.title} by ${author}. ${focused ? 'Press enter to pull.' : ''}`}
        className="group relative block h-[300px] w-[212px] rounded-[3px] border border-[#7C6338] bg-[#F8F6F2] p-5 text-left shadow-[0_24px_50px_rgba(0,0,0,0.55)] outline-none transition-[border-color,box-shadow] duration-500 focus-visible:shadow-[0_0_0_2px_#161412,0_0_0_4px_#D9B978,0_24px_50px_rgba(0,0,0,0.6)] hover:border-[#B89146]"
      >
        {/* ghost folio numeral */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-6 -right-2 select-none font-serif text-[104px] font-semibold leading-none text-[#161412] opacity-[0.06]"
        >
          {f}
        </span>

        {/* top row — № + newest */}
        <span className="absolute left-5 right-5 top-4 flex items-baseline justify-between">
          <span className="font-mono text-[11px] font-medium tracking-wide text-[#7C6338]">№{f}</span>
          {isNewest && (
            <span className="rounded-full bg-[#B89146] px-2 py-0.5 font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-[#1E0B12]">
              Newest
            </span>
          )}
        </span>

        {/* title */}
        <span className="absolute left-5 right-5 top-[52px] block font-serif text-[21px] font-semibold leading-[1.1] text-[#241D18]">
          {article.title}
        </span>

        {/* brass hairline */}
        <span aria-hidden className={`absolute left-5 right-5 top-[132px] h-px ${focused ? 'bg-[#B89146]' : 'bg-[#B89146]/45'}`} />

        {/* metadata — category · author · reading time */}
        <span className="absolute bottom-5 left-5 right-5">
          <span className="block truncate font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[#B89146]">
            {article.category}
          </span>
          <span className="mt-1 block truncate font-serif text-[15px] text-[#5C1224]">{author}</span>
          <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-[0.14em] text-[#8A8178]">
            {min(article.readingTime)}
          </span>
        </span>

        {/* focused pull affordance */}
        {focused && (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#B89146] to-transparent"
          />
        )}
      </Link>
    </motion.div>
  )
}
