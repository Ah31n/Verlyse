import { clsx } from 'clsx'

export function RoleBadge({
  role,
  className = '',
}: {
  role: string
  className?: string
}) {
  const norm = role.toLowerCase()

  // Distinct tint per discipline
  const colorClass = norm.includes('poet')
    ? 'text-[#E8D9A8] border-[#B89146]/40 bg-[#B89146]/10'
    : norm.includes('paint') || norm.includes('art')
    ? 'text-[#E8A2A2] border-[#E8A2A2]/40 bg-[#E8A2A2]/10'
    : norm.includes('calligraph')
    ? 'text-[#D9B978] border-[#D9B978]/40 bg-[#D9B978]/10'
    : norm.includes('essay') || norm.includes('writer')
    ? 'text-[#F8F6F2] border-white/20 bg-white/5'
    : norm.includes('editor') || norm.includes('director')
    ? 'text-gold border-gold bg-gold/15'
    : norm.includes('ambassador')
    ? 'text-[#D9B978] border-[#D9B978]/30 bg-[#D9B978]/10'
    : 'text-white/70 border-white/10 bg-white/5'

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 border font-mono text-[9px] uppercase tracking-[0.22em] rounded-none select-none',
        colorClass,
        className
      )}
    >
      {role}
    </span>
  )
}
