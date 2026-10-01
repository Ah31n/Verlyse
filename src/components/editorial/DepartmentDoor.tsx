import { clsx } from 'clsx'
import type { Category } from '../../data/content'

interface DepartmentDoorProps {
  category: Category
  index: number
  isActive?: boolean
  isFocused?: boolean
  onClick?: () => void
  className?: string
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

/**
 * DepartmentDoor — Arched Category Gateway Primitive
 *
 * Distinct visual & behavioral role:
 * - Arched cathedral aperture referencing Penpot P27
 * - Subtle localized spotlight on active/focused door
 * - Clean state transition between active ivory sheet and quiet wine wall
 * - Preserves keyboard focus and deep-link routing
 */
export function DepartmentDoor({
  category,
  index,
  isActive = false,
  isFocused = false,
  onClick,
  className = '',
}: DepartmentDoorProps) {
  const isPlate = isActive
  const roman = ROMAN_NUMERALS[index] ?? String(index + 1)

  return (
    <button
      type="button"
      string="spotlight"
      string-lerp="0.2"
      string-id={`category-door-${category.slug}`}
      onClick={onClick}
      aria-pressed={isActive}
      className={clsx(
        'group relative flex w-full flex-col items-center px-3 pb-3 pt-6 text-center outline-none transition-all duration-700 active:scale-[0.98]',
        isPlate
          ? 'z-[2] min-h-[clamp(11rem,24vh,14rem)] bg-[#F8F6F2] shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:-translate-y-2 md:min-h-[clamp(18rem,42vh,25rem)] md:max-w-[200px] md:scale-[1.03]'
          : 'max-w-[160px] cursor-pointer hover:-translate-y-1',
        className
      )}
    >
      {/* The arch border */}
      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute inset-0 rounded-t-full border transition-colors duration-500',
          isPlate
            ? 'border-[#B89146]'
            : isFocused
            ? 'border-gold/80 bg-gold/[0.06]'
            : 'border-white/20 group-hover:border-gold/60'
        )}
        style={isPlate ? undefined : { backgroundColor: `${category.accent}12` }}
      />

      {/* The plate inner hairline */}
      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute inset-1.5 rounded-t-full border transition-colors duration-500',
          isPlate ? 'border-[#D9B978]/60' : 'border-transparent group-hover:border-gold/20'
        )}
      />

      {/* The recess arch */}
      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute inset-x-[16%] top-[8%] bottom-[4%] rounded-t-full border transition-colors duration-500',
          isPlate ? 'border-[#B89146]/30' : 'border-white/10 group-hover:border-gold/30'
        )}
      />

      {/* Wing Roman Numeral */}
      <span
        className={clsx(
          'relative font-mono text-[9px] uppercase tracking-[0.3em]',
          isPlate ? 'text-[#7C6338] font-semibold' : 'text-gold'
        )}
      >
        Wing {roman}
      </span>

      {/* Motif glyph */}
      <span
        aria-hidden="true"
        className="relative mt-2 text-xl leading-none transition-transform duration-500 group-hover:scale-110"
        style={{ color: isPlate ? '#7C6338' : category.accent }}
      >
        {category.motif}
      </span>

      {/* Category Name */}
      <span
        className={clsx(
          'relative mt-3 font-serif font-light leading-[1.05] transition-colors duration-500',
          isPlate ? 'italic text-[#1E0B12] text-xl md:text-2xl font-normal' : 'text-ivory group-hover:text-gold text-lg md:text-xl'
        )}
      >
        {category.name}
      </span>

      {/* Count label */}
      <span
        className={clsx(
          'relative mt-2 font-mono text-[8px] uppercase tracking-[0.28em]',
          isPlate ? 'text-[#2A0F18]/70 font-medium' : 'text-white/55'
        )}
      >
        {category.count} folio{category.count === 1 ? '' : 's'}
      </span>

      {isActive && (
        <span className="relative mt-auto pt-3 font-mono text-[8px] uppercase tracking-[0.28em] text-[#7C6338] inline-flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-[#7C6338]" />
          Active Wing ↓
        </span>
      )}
    </button>
  )
}
