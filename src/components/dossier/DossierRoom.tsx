import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ARTICLES, AUTHORS, authorPhoto, type Author } from '../../data/content'
import { AuthorPhoto } from '../ui/AuthorFrame'
import { worksOf } from '../ui/WriterProfile'

/** The folio number of an article, from the authoritative registry (1-based). */
function folioOf(articleId: string): string {
  const i = ARTICLES.findIndex((a) => a.id === articleId)
  return i >= 0 ? String(i + 1).padStart(2, '0') : '—'
}

/**
 * THE DOSSIER — the Penpot Phase-25 composition for /creator/:id.
 *
 * A contributor record inside the Verlyse institution, in three planes:
 *
 *   BACK   — a deep wine room: warm upper wash, brass lamp glow, darker
 *            floor, faint brass wall rules, and the contributor's ghost
 *            monogram far behind the dossier.
 *   MID    — the standing ivory dossier sheet: record header, the name as a
 *            printed editorial object, role/handle, biography, archival
 *            metadata, and the other folios in the archive.
 *   FRONT  — two physical plates overlapping the sheet: the portrait plate
 *            (real image when the registry provides one, monogram otherwise)
 *            and the featured-folio plate (OPEN FOLIO →).
 *
 * Everything derives from the registry — this works for every /creator/:id.
 * Reduced motion collapses all drift to a quiet static composition. No WebGL,
 * no canvas, no new dependencies.
 */
export default function DossierRoom({ author }: { author: Author }) {
  const reduce = useReducedMotion() === true

  const recordIndex = AUTHORS.findIndex((a) => a.id === author.id)
  const record = recordIndex >= 0 ? String(recordIndex + 1).padStart(2, '0') : '—'
  const total = String(AUTHORS.length).padStart(2, '0')

  const works = worksOf(author.id) // newest first, from the registry
  /* the featured folio is the contributor's first-published work — the one the
     dossier leads with (Penpot board: №01 Their Voices Matter for Alina Javed). */
  const featured = works[works.length - 1]
  const also = works.slice(0, -1) // the rest of the archive behind this name
  const first = works[works.length - 1] // the first folio in the archive
  const initials = author.name.split(' ').map((n) => n[0]).join('')
  const portrait = author.portrait && !author.hideArticlePhoto ? author.profilePhoto ?? authorPhoto(author.id) : null

  /* restrained scroll drift — the room barely moves; none under reduced motion */
  const { scrollY } = useScroll()
  const backY = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 1200) * 0.05))
  const ghostY = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 1200) * 0.09))
  const markY = useTransform(scrollY, (v) => (reduce ? 0 : Math.min(v, 1200) * 0.03))

  const E = [0.22, 1, 0.36, 1] as const

  return (
    <div className="relative">
      {/* ============ BACK — the wine room (fixed, decorative only) ============ */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { y: backY }}
        className="pointer-events-none fixed inset-0 z-0"
      >
        {/* warm upper wine wash + brass lamp glow + dark floor */}
        <div className="absolute inset-0 bg-[radial-gradient(110%_70%_at_50%_-6%,rgba(92,18,36,0.32),transparent_58%),radial-gradient(85%_50%_at_50%_0%,rgba(184,145,70,0.06),transparent_60%),radial-gradient(95%_55%_at_50%_118%,rgba(22,4,9,0.62),transparent_64%),linear-gradient(180deg,#3B0D17_0%,#2A0F18_52%,#1A070E_100%)]" />
        {/* faint brass wall rules */}
        <div className="absolute inset-y-0 left-[clamp(1.75rem,5.5vw,4.75rem)] hidden w-px bg-gradient-to-b from-transparent via-[#D9B978]/16 to-transparent lg:block" />
        <div className="absolute inset-y-0 right-[clamp(1.75rem,5.5vw,4.75rem)] hidden w-px bg-gradient-to-b from-transparent via-[#D9B978]/16 to-transparent lg:block" />
        {/* the floor line */}
        <div className="absolute inset-x-0 top-[79%] hidden h-px bg-gradient-to-r from-transparent via-[#D9B978]/10 to-transparent lg:block" />
        {/* ghost monogram — the contributor's mark, far behind the dossier */}
        <motion.div
          style={reduce ? undefined : { y: ghostY }}
          className="absolute left-[clamp(-1rem,2vw,3rem)] top-[6%] hidden select-none lg:block"
        >
          <span className="block whitespace-nowrap font-serif text-[clamp(13rem,26vw,23rem)] font-semibold leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(184,145,70,0.10)]">
            {initials}
          </span>
        </motion.div>
        {/* vertical ledger — the record's shelf mark */}
        <motion.div
          style={reduce ? undefined : { y: markY }}
          className="absolute left-[clamp(1.75rem,5.5vw,4.75rem)] top-[46%] hidden lg:block"
        >
          <span className="block [writing-mode:vertical-rl] font-mono text-[10px] uppercase tracking-[0.34em] text-[#B89146]">
            The Dossier · Record № {record} / {total}
          </span>
        </motion.div>
      </motion.div>

      {/* ============ MID + FRONT — the dossier sheet and its plates ============ */}
      <div className="relative z-[2] mx-auto w-full max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)] pb-24 pt-24 lg:pt-32">
        {/* navigation — the return to the wall (top-left on desktop/tablet;
            the Penpot mobile board places RETURN at the end of the dossier) */}
        <div className="relative z-[3] hidden md:block">
          <Link
            to="/creators"
            className="group inline-flex items-center gap-3 border-b border-[#B89146]/50 pb-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[#D9B978] no-underline transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9B978]/70"
          >
            <span aria-hidden="true" className="transition-transform duration-500 group-hover:-translate-x-1">←</span>
            The Contributor Wall
          </Link>
        </div>

        {/* the dossier sheet — plates overlap its edges on desktop, flow in
            the Penpot mobile order below */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? undefined : { duration: 0.9, ease: E }}
          className="relative mx-auto mt-10 max-w-[1080px] lg:mt-16"
        >
          {/* the paper-edge sheet — a cream sheet behind, offset like a stack */}
          <div aria-hidden="true" className="absolute -bottom-1.5 -right-1.5 hidden h-full w-full border border-[#E7DCC8] bg-[#EFE8DD] lg:block" />

          <div className="relative border border-[#7C6338]/60 bg-[#F8F6F2] px-[clamp(1.25rem,3vw,2.5rem)] py-9 text-[#241D18] lg:py-12">
            {/* inner brass hairline — the plate is held inside this field */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-2 hidden border border-[#7C6338]/50 lg:block" />

            {/* record header */}
            <div className="relative flex flex-wrap items-end justify-between gap-2">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7C6338]">
                The Dossier
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8A8178]">
                Verlyse Media · Contributor Archive · Record {record} / {total}
              </p>
            </div>
            <div aria-hidden="true" className="mt-4 h-0.5 w-[180px] bg-[#B89146]" />

            {/* the name — a printed editorial object, not a website heading */}
            <h1 className="mt-8 font-serif text-[clamp(3.2rem,8.5vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.01em] text-[#241D18]">
              {author.name}
            </h1>
            <p className="mt-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#7C6338]">
              {author.handle} · {author.role}
            </p>

            {/* portrait plate — in flow after the handle on mobile, overlapping
                the sheet's left edge on desktop */}
            <div className="relative z-[3] mt-8 lg:absolute lg:left-[-9rem] lg:top-[40%] lg:mt-0 lg:w-[200px] lg:-translate-y-1/2">
              <div className="relative w-[150px] border border-[#7C6338]/70 bg-[#F8F6F2] lg:w-full">
                {/* brass registration frame */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-2 border border-[#D9B978]/80" />
                <div className="relative aspect-[3/4] overflow-hidden">
                  {portrait ? (
                    <AuthorPhoto
                      src={portrait}
                      alt={`${author.name} — photograph`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-[radial-gradient(80%_60%_at_50%_30%,rgba(184,145,70,0.12),transparent_65%)]">
                      <span className="font-serif text-[clamp(3.4rem,6vw,5rem)] font-light italic text-[#5C1224]">
                        {initials}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* biography + archival metadata */}
            <div className="relative mt-10 grid grid-cols-1 gap-8 lg:mt-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-12 lg:pl-[8rem] lg:pr-[12rem]">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C6338]">
                  Biography — Contributor record
                </p>
                <p className="mt-4 max-w-[64ch] font-sans text-[13px] leading-[1.75] text-[#241D18]/85 lg:text-[14px]">
                  {author.bio}
                </p>
                {author.philosophy && (
                  <p className="mt-5 max-w-[64ch] font-sans text-[13px] leading-[1.75] text-[#241D18]/70 lg:text-[14px]">
                    {author.philosophy}
                  </p>
                )}
              </div>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C6338]">
                  Archival metadata
                </p>
                <dl className="mt-4 space-y-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#241D18]/80">
                  <div className="flex justify-between gap-4 border-b border-[#3A332C]/30 pb-2">
                    <dt className="text-[#8A8178]">First folio</dt>
                    <dd>{first ? first.date.split('-').reverse().join('.') : '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#3A332C]/30 pb-2">
                    <dt className="text-[#8A8178]">Folios in archive</dt>
                    <dd>{String(works.length).padStart(2, '0')}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#3A332C]/30 pb-2">
                    <dt className="text-[#8A8178]">Portrait</dt>
                    <dd>{portrait ? 'on file' : 'the monogram'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#3A332C]/30 pb-2">
                    <dt className="text-[#8A8178]">Role</dt>
                    <dd className="max-w-[55%] text-right">{author.role}</dd>
                  </div>
                  <div className="flex justify-between gap-4 pb-2">
                    <dt className="text-[#8A8178]">Status</dt>
                    <dd>{author.confirmed ? 'Confirmed contributor' : 'Pending'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* featured folio plate — in flow after the metadata on mobile,
                overlapping the sheet's right edge on desktop */}
            {featured && (
              <div className="relative z-[3] mt-8 lg:absolute lg:right-[-11rem] lg:top-[46%] lg:mt-0 lg:w-[224px] lg:-translate-y-1/2">
                <div aria-hidden="true" className="absolute -bottom-1 -right-1 h-full w-full border border-[#E7DCC8] bg-[#EFE8DD] lg:hidden" />
                <div className="relative border border-[#7C6338]/70 bg-[#EFE8DD] px-5 py-5 text-[#241D18]">
                  <div aria-hidden="true" className="pointer-events-none absolute inset-1.5 border border-[#D9B978]/50" />
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C6338]">
                    Featured folio — № {folioOf(featured.id)}
                  </p>
                  <Link
                    to={`/article/${featured.id}`}
                    className="group mt-3 block no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B89146]/80"
                    aria-label={`Open folio ${folioOf(featured.id)} — ${featured.title}`}
                  >
                    <p className="font-serif text-[clamp(1.4rem,2.2vw,1.8rem)] font-semibold leading-[1.1] text-[#241D18] transition-colors group-hover:text-[#5C1224]">
                      “{featured.title}”
                    </p>
                    <div aria-hidden="true" className="mt-3 h-0.5 w-[60px] bg-[#B89146]" />
                    <p className="mt-3 font-mono text-[10px] font-medium uppercase tracking-[0.1em] leading-[1.8] text-[#241D18]/85">
                      {featured.category}
                      <br />
                      {featured.date.split('-').reverse().join('.')} · {featured.readingTime}
                      <br />
                      by {author.name.toUpperCase()}
                    </p>
                    <p className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5C1224] transition-all group-hover:gap-3">
                      Open folio <span aria-hidden="true">→</span>
                    </p>
                  </Link>
                </div>
              </div>
            )}

            {/* the other folios — the rest of the archive behind this name */}
            <div className="relative mt-10 lg:mt-12 lg:pl-[8rem]">
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#7C6338]">
                {also.length > 0
                  ? `Also in the archive — ${also.map((w) => `№ ${folioOf(w.id)} · ${w.title} · ${w.category} · ${w.readingTime}`).join('   ·   ')}`
                  : works.length === 1
                    ? `In the archive — № ${folioOf(works[0].id)} · ${works[0].category}`
                    : 'The archive holds no folios for this name yet.'}
              </p>
            </div>

            {/* RETURN — the mobile board closes the dossier with the return to the wall */}
            <div className="relative mt-8 border-t border-[#3A332C]/30 pt-5 md:hidden">
              <Link
                to="/creators"
                className="group inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#7C6338] no-underline transition-colors hover:text-[#5C1224] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B89146]/80"
              >
                <span aria-hidden="true" className="transition-transform duration-500 group-hover:-translate-x-1">←</span>
                The Contributor Wall
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
