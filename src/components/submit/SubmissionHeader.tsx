import { clsx } from 'clsx'

interface SubmissionHeaderProps {
  className?: string
}

/**
 * SubmissionHeader — The Editorial Desk Masthead
 */
export function SubmissionHeader({ className = '' }: SubmissionHeaderProps) {
  return (
    <header className={clsx('border-b border-gold/30 pb-8 pt-6', className)}>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold">
          The Editorial Desk
        </span>
      </div>
      <h1 className="mt-3 font-serif text-4xl md:text-6xl font-light text-ivory tracking-tight">
        Send Your Manuscript
      </h1>
      <p className="mt-2 font-serif text-base md:text-lg italic text-white/70 max-w-2xl">
        Every publication begins as an unread manuscript. We welcome fiction, poetry, critical essays, journalism, and visual arts from both emerging and established voices.
      </p>
    </header>
  )
}
