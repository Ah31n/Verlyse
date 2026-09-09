import { useEffect, useState } from 'react'
import { isSaved, toggleSaved } from '../layout/SavedDrawer'

/**
 * The save mark — one bookmark kept across the magazine.
 *
 * Small enough to sit on a plate corner, honest about its state
 * (aria-pressed + a word, never colour alone), and synchronised across
 * every instance through the drawer's `verlyse:saved-updated` event, so
 * a story saved on the shelf shows as saved in the feed, the article,
 * and the drawer at once.
 */
export default function SaveButton({
  id,
  title,
  category,
  author,
  compact = false,
  className = '',
}: {
  id: string
  title: string
  category: string
  author?: string
  /** icon-only on the smallest plates; the label stays in the accessible name */
  compact?: boolean
  className?: string
}) {
  const [on, setOn] = useState(() => isSaved(id))
  useEffect(() => { setOn(isSaved(id)) }, [id])
  useEffect(() => {
    const sync = () => setOn(isSaved(id))
    window.addEventListener('verlyse:saved-updated', sync)
    return () => window.removeEventListener('verlyse:saved-updated', sync)
  }, [id])

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove “${title}” from saved stories` : `Save “${title}” for later`}
      title={on ? 'Saved — open the drawer to read it' : 'Save for later'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setOn(toggleSaved({ id, title, category, author }))
      }}
      className={`inline-flex items-center gap-2 border font-mono text-[9px] uppercase tracking-[0.24em] transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
        on
          ? 'border-gold bg-gold text-charcoal'
          : 'border-gold/45 bg-[#1C0509]/55 text-ivory/85 hover:border-gold hover:text-gold'
      } ${compact ? 'h-8 w-8 justify-center !px-0' : 'px-3 py-1.5'} ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current [stroke-width:1.5]">
        <path d="M6 3.5h12v17L12 16.8 6 20.5z" fill={on ? 'currentColor' : 'none'} />
      </svg>
      {!compact && <span>{on ? 'Saved' : 'Save'}</span>}
    </button>
  )
}
