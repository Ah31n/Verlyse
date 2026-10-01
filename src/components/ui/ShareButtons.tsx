import { useState, type ReactNode } from 'react'
import { clsx } from 'clsx'

/**
 * ArchivalBookplateShare — pass along as a library plate / marginalia colophon.
 * Materiality: Cotton rag stamp notation, 1px gold boundary, and tactile copy confirmation.
 */
function BookplateButton({
  label,
  onClick,
  children,
  active = false,
}: {
  label: string
  onClick: () => void
  children: ReactNode
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={clsx(
        'group inline-flex items-center gap-2 border border-gold/30 bg-[#25070F]/50 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.24em] transition-all duration-300',
        active
          ? 'border-gold bg-gold text-[#1E0B12] font-semibold'
          : 'text-ivory/80 hover:border-gold hover:text-gold hover:bg-gold/10'
      )}
    >
      <span aria-hidden="true" className={clsx('transition-transform duration-300 group-hover:-translate-y-0.5', active ? 'text-[#1E0B12]' : 'text-gold')}>
        {children}
      </span>
      <span>{label}</span>
    </button>
  )
}

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const url = () => window.location.href
  const text = `${title} — Verlyse Media`

  const share = (kind: 'x' | 'ig') => {
    const u = url()
    const t = encodeURIComponent(text)
    const targets = {
      x: `https://twitter.com/intent/tweet?text=${t}&url=${encodeURIComponent(u)}`,
      ig: `https://www.instagram.com/verlyse.media/?utm_source=share`,
    }
    window.open(targets[kind], '_blank', 'noopener')
  }

  const copy = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: text, url: url() })
        return
      }
      await navigator.clipboard.writeText(url())
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url()
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="my-6 inline-flex flex-wrap items-center gap-3 border-y border-white/10 py-3" aria-label="Pass along this folio">
      <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/40 mr-1">
        Colophon Dispatch
      </span>
      <BookplateButton label="Dispatch on X" onClick={() => share('x')}>
        <span aria-hidden="true">✕</span>
      </BookplateButton>
      <BookplateButton label="Instagram" onClick={() => share('ig')}>
        <span aria-hidden="true">◉</span>
      </BookplateButton>
      <BookplateButton label={copied ? 'Copied to Ledger' : 'Copy Citation'} onClick={copy} active={copied}>
        <span aria-hidden="true">{copied ? '✓' : '☍'}</span>
      </BookplateButton>
    </div>
  )
}
