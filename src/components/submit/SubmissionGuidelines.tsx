import { clsx } from 'clsx'

interface SubmissionGuidelinesProps {
  className?: string
}

/**
 * SubmissionGuidelines — Editorial Standards & Submission Criteria
 */
export function SubmissionGuidelines({ className = '' }: SubmissionGuidelinesProps) {
  const guidelines = [
    { title: 'Original & Unpublished', desc: 'We consider original, authentic works in English or accompanied by authorized English translation.' },
    { title: 'Word & Stanza Limits', desc: 'Prose & Essays: 500 – 3,500 words. Poetry: 1 – 3 poems per submission.' },
    { title: 'Editorial Review', desc: 'All submissions are reviewed by our editorial board. Expect a thoughtful response within 2–4 weeks.' },
  ]

  return (
    <aside className={clsx('border border-white/10 bg-[#160309] p-6 md:p-8', className)}>
      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold">
        Editorial Guidance
      </span>
      <h2 className="mt-2 font-serif text-2xl font-light text-ivory">
        Submission Standards
      </h2>

      <div className="mt-6 space-y-4">
        {guidelines.map((g) => (
          <div key={g.title} className="border-t border-white/10 pt-3">
            <h3 className="font-mono text-xs text-gold uppercase tracking-wider">
              {g.title}
            </h3>
            <p className="mt-1 font-serif text-xs italic text-white/70 leading-relaxed">
              {g.desc}
            </p>
          </div>
        ))}
      </div>
    </aside>
  )
}
