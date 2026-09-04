import { Link, useParams } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import DossierRoom from '../components/dossier/DossierRoom'
import WriterProfile from '../components/ui/WriterProfile'
import { getAuthor } from '../data/content'

/**
 * THE DOSSIER — /creator/:id
 * The Penpot Phase-25 composition: a wine room holding a contributor's dossier
 * (DossierRoom), with the full record — philosophy, quote, note, works, and the
 * stories beside theirs — continuing below the cover sheet.
 */
export default function WriterProfilePage() {
  const { authorId } = useParams<{ authorId: string }>()
  const author = authorId ? getAuthor(authorId) : undefined

  useSeo({
    title: author ? `${author.name} — Writer` : 'Writer not found',
    description: author
      ? `${author.name} (${author.handle}) — a writer on Verlyse Media. ${author.favoriteQuote ?? author.bio}`
      : 'This writer has not been featured yet.',
    path: author ? `/creator/${author.id}` : '/',
  })

  if (!author) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center text-center">
        <div>
          <p className="font-serif text-4xl font-light text-ivory">The writer isn’t here yet</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.24em] text-white/65">
            <Link to="/creators" className="text-gold no-underline">Back to the wall of names →</Link>
          </p>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* the dossier cover — the Penpot composition */}
      <DossierRoom author={author} />

      {/* the full record — the rest of the dossier, below the cover sheet */}
      <section className="relative border-t border-white/10 py-[clamp(5rem,12vh,9rem)]">
        <div className="relative z-[2] mx-auto max-w-page px-[clamp(1.75rem,5.5vw,4.75rem)]">
          <WriterProfile author={author} />
        </div>
      </section>
    </>
  )
}
