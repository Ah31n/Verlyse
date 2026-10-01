import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { LEDGER } from '../../data/content'

export function IndexLedger({
  className = '',
}: {
  className?: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const items = [
    { label: 'Published Folios', value: LEDGER.features, suffix: '' },
    { label: 'Contributing Voices', value: LEDGER.creators, suffix: '' },
    { label: 'Appreciations', value: LEDGER.appreciations, suffix: '+' },
    { label: 'Departments', value: LEDGER.departments, suffix: '' },
  ]

  return (
    <div className={clsx('grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-b border-white/10 py-8', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex flex-col border-l border-gold/30 pl-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/50">
            {item.label}
          </span>
          <span className="mt-2 font-mono text-2xl md:text-3xl font-light text-gold tnum">
            {mounted ? item.value.toLocaleString() : item.value}
            <span className="text-sm text-gold/60">{item.suffix}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
