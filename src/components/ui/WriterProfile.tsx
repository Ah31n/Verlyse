import { Link } from 'react-router-dom'
import { ARTICLES, getAuthor, type Author , authorPhoto } from '../../data/content'
import { AuthorFrame, AuthorPhoto } from './AuthorFrame'
import Reveal from './Reveal'
import { Signature } from './ArticleClosing'
import { MetaRow } from './primitives'

/** The writer's own note — the first note found across their features. */
export function writerNoteOf(authorId: string): string | undefined {
  for (const a of ARTICLES) {
    if (a.authorId !== authorId) continue
    if (a.note) return a.note.replace(/^“|”$/g, '')
    if (a.closing?.paragraphs?.length) return a.closing.paragraphs.join(' ')
  }
  return undefined
}

/** The writer's published works, newest first. */
export function worksOf(authorId: string) {
  return ARTICLES.filter((a) => a.authorId === authorId).sort((a, b) => b.date.localeCompare(a.date))
}

export function socialOf(author: Author): string {
  return `https://instagram.com/${author.handle.replace('@', '')}`
}

/**
 * THE WRITER PROFILE — the human behind the story.
 * A two-column editorial feature: the monogram portrait and signature on the
 * left (no photograph of the writers exists in the dataset — the monogram
 * stands in, honestly), and on the right the philosophy, the favorite quote,
 * the handwritten note, the published works, and the stories that sit nearby.
 */
export default function WriterProfile({ author }: { author: Author }) {
  const works = worksOf(author.id)
  const note = writerNoteOf(author.id)
  const others = ARTICLES.filter((a) => a.authorId !== author.id && a.category === works[0]?.category).slice(0, 3)

  return (
    <div className="relative">
      {/* ruled paper behind the whole profile */}
      <div
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 gap-[clamp(3rem,7vw,7rem)] lg:grid-cols-[0.85fr_1.15fr]">
        {/* ——— the portrait & signature ——— */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <figure className="relative mx-auto max-w-[300px] lg:mx-0">
              <div aria-hidden="true" className="absolute -inset-4 translate-x-5 translate-y-5 border border-gold/30" />
              {author.portrait && !author.hideArticlePhoto ? (
                <AuthorFrame variant="matte" rotate={-0.6} caption={author.name}>
                  <AuthorPhoto src={author.profilePhoto ?? authorPhoto(author.id)} alt={`${author.name} — photograph`} className="h-auto w-full" />
                </AuthorFrame>
              ) : (
                <div className="relative grid aspect-[3/4] place-items-center overflow-hidden border border-gold/25 bg-[radial-gradient(80%_60%_at_50%_30%,rgba(184,145,70,0.1),transparent_65%)]">
                  {/* the monogram — the writer's mark, when no photograph exists */}
                  <span aria-hidden="true" className="absolute inset-5 border border-gold/40" />
                  <span className="font-serif text-[clamp(4.5rem,9vw,7rem)] font-light italic text-gold">
                    {author.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
              )}
              <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="fig-cap text-white/50">{author.portrait && !author.hideArticlePhoto ? 'Portrait — from the feature' : 'Portrait — the monogram'}</span>
                <span className="fig-cap text-gold">✦ the writer</span>
              </figcaption>
            </figure>
          </Reveal>

          {/* the signature, drawn in ink */}
          <Reveal delay={0.15} className="mt-10">
            <div className="border-t border-white/10 pt-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.30em] text-white/60">Signed —</p>
              <div className="mt-4">
                <Signature name={author.name} />
              </div>
              <div className="mt-6 space-y-2">
                <p className="font-serif text-xl text-ivory">{author.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">{author.handle} · {author.role}</p>
                <a
                  href={socialOf(author)}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-block border-b border-gold/60 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-gold no-underline transition-colors hover:text-ivory max-[767px]:py-2"
                >
                  {author.handle} on Instagram ↗
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ——— the writer's page ——— */}
        <div>
          {/* philosophy */}
          <Reveal>
            <p className="kicker">How they write</p>
            <p className="mt-5 max-w-[56ch] font-serif text-[clamp(1.3rem,2vw,1.6rem)] font-light leading-[1.7] text-ivory/88 drop-cap">
              {author.philosophy ?? author.bio}
            </p>
          </Reveal>

          {/* favorite quote — their own words */}
          {author.favoriteQuote && (
            <Reveal className="mt-12">
              <div className="relative border-y border-gold/25 py-10">
                <span aria-hidden="true" className="absolute -top-5 left-0 flex items-center gap-3">
                  <span className="h-px w-10 bg-gold/50" />
                  <span className="font-serif text-2xl leading-none text-gold">“</span>
                </span>
                <p className="pull-quote mx-auto max-w-[30ch] text-[clamp(1.5rem,2.6vw,2.2rem)] leading-[1.4] text-ivory">
                  {author.favoriteQuote}
                </p>
                <span aria-hidden="true" className="absolute -bottom-5 right-0 flex items-center gap-3">
                  <span className="font-serif text-2xl leading-none text-gold">”</span>
                  <span className="h-px w-10 bg-gold/50" />
                </span>
              </div>
            </Reveal>
          )}

          {/* the handwritten note — the final page of a printed book */}
          <Reveal className="mt-12">
            <div className="relative border border-gold/25 bg-[#17060B] px-7 py-10 md:px-10">
              <span aria-hidden="true" className="absolute -left-2 -top-2 h-4 w-4 border-l border-t border-gold" />
              <span aria-hidden="true" className="absolute -right-2 -top-2 h-4 w-4 border-r border-t border-gold" />
              <span aria-hidden="true" className="absolute -bottom-2 -left-2 h-4 w-4 border-b border-l border-gold" />
              <span aria-hidden="true" className="absolute -bottom-2 -right-2 h-4 w-4 border-b border-r border-gold" />
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">
                {note ? 'A note from the writer' : 'In their own words'}
              </p>
              <p className="mt-5 font-serif text-[clamp(1.15rem,1.8vw,1.45rem)] font-light italic leading-[1.8] text-ivory/90">
                “{note ?? author.favoriteQuote}”
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.30em] text-white/55">
                  {note ? 'from their featured work' : 'from their writing'}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.30em] text-gold">the writer’s note</span>
              </div>
            </div>
          </Reveal>

          {/* published works */}
          <Reveal className="mt-14">
            <p className="kicker">Published works</p>
            <div className="mt-7 space-y-0 border-t border-white/10">
              {works.map((a) => (
                <Link
                  key={a.id}
                  to={`/article/${a.id}`}
                  className="group flex items-center gap-6 border-b border-white/10 py-5 no-underline"
                >
                  <div className="img-frame relative h-20 w-16 shrink-0 overflow-hidden">
                    <img src={a.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.1]" />
                  </div>
                  <div className="min-w-0">
                    <MetaRow category={a.category} readingTime={a.readingTime} />
                    <p className="mt-1.5 font-serif text-xl leading-snug text-ivory transition-colors duration-500 group-hover:italic group-hover:text-[#E8D9A8]">
                      “{a.title}”
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.30em] text-white/60">
                      {a.date.split('-').reverse().join('.')} · {a.likes} appreciations
                    </p>
                  </div>
                  <span aria-hidden="true" className="ml-auto shrink-0 font-serif text-xl text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">→</span>
                </Link>
              ))}
            </div>
          </Reveal>

          {/* related stories — the room beside theirs */}
          {others.length > 0 && (
            <Reveal className="mt-14">
              <p className="kicker">Stories beside theirs</p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {others.map((a) => (
                  <Link key={a.id} to={`/article/${a.id}`} className="group block no-underline">
                    <div className="img-frame relative aspect-[4/5] overflow-hidden border border-white/10">
                      <img src={a.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.08]" />
                    </div>
                    <p className="mt-2.5 font-serif text-base leading-snug text-ivory/90 transition-colors group-hover:text-[#E8D9A8]">“{a.title}”</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.30em] text-white/60">{getAuthor(a.authorId)?.name}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  )
}
