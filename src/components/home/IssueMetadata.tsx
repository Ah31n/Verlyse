import { clsx } from 'clsx'

interface IssueMetadataProps {
  accession?: string
  date?: string
  totalFolios?: number
  className?: string
}

/**
 * IssueMetadata — Curatorial Archival Registration Line
 */
export function IssueMetadata({
  accession = '№ 01',
  date = 'Autumn MMXXVI',
  totalFolios = 19,
  className = '',
}: IssueMetadataProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-gold/90',
        className
      )}
    >
      <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse" />
      <span>Lead Accession {accession}</span>
      <span className="text-white/20">|</span>
      <span>{date}</span>
      <span className="text-white/20">|</span>
      <span>Registry {totalFolios} Folios</span>
    </div>
  )
}
