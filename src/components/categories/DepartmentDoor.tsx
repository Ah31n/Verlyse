import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

interface DepartmentDoorProps {
  name: string
  slug: string
  count: number
  description: string
  leadWorkTitle?: string
  className?: string
}

/**
 * DepartmentDoor — Arched Cathedral Gateway into a Department
 */
export function DepartmentDoor({
  name,
  slug,
  count,
  description,
  leadWorkTitle,
  className = '',
}: DepartmentDoorProps) {
  return (
    <Link
      to={`/categories/${slug}`}
      string="spotlight"
      string-id={`department-door-${slug}`}
      className={clsx(
        'group relative flex flex-col justify-between border border-gold/30 bg-[#160309] p-8 transition-all duration-700 hover:border-gold hover:bg-[#220610] shadow-xl',
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between border-b border-gold/20 pb-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold">
            Wing № {slug.toUpperCase()}
          </span>
          <span className="font-mono text-[9px] text-white/50">
            {count} Folio{count === 1 ? '' : 's'}
          </span>
        </div>

        <h2 className="mt-6 font-serif text-3xl font-light text-ivory group-hover:text-gold transition-colors">
          {name}
        </h2>

        <p className="mt-3 font-serif text-sm italic leading-relaxed text-white/70">
          {description}
        </p>

        {leadWorkTitle && (
          <div className="mt-6 border-t border-white/10 pt-3">
            <span className="block font-mono text-[8px] uppercase tracking-widest text-gold/70">
              Lead Feature:
            </span>
            <span className="mt-0.5 block truncate font-serif text-sm italic text-ivory/90">
              "{leadWorkTitle}"
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-gold">
        <span>Enter Wing</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
      </div>
    </Link>
  )
}
