import { clsx } from 'clsx'

interface ArchiveLoadingShellProps {
  className?: string
}

/**
 * ArchiveLoadingShell — Designed Paper Archival Loading Surface
 */
export function ArchiveLoadingShell({ className = '' }: ArchiveLoadingShellProps) {
  return (
    <div
      aria-label="Loading archive..."
      className={clsx('my-12 animate-pulse space-y-8', className)}
    >
      {/* Header skeleton */}
      <div className="h-20 w-3/4 rounded bg-white/5 border border-white/10" />

      {/* Lead skeleton */}
      <div className="h-96 w-full rounded bg-white/5 border border-white/10" />

      {/* Matrix grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-80 rounded bg-white/5 border border-white/10" />
        <div className="h-80 rounded bg-white/5 border border-white/10" />
        <div className="h-80 rounded bg-white/5 border border-white/10" />
      </div>
    </div>
  )
}
