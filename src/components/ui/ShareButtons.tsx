import { useState, type ReactNode } from 'react'

/**
 * PASS ALONG — sharing as the magazine would: a stamped note rather than a
 * row of platform icons. Three gestures (X · Instagram · copy) set as small
 * type with the ✦ mark between them, like the colophon of an issue.
 */

function StampBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="group inline-flex items-center gap-2 border-b border-gold/40 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-ivory/75 transition-colors duration-500 hover:border-gold hover:text-gold max-[767px]:py-2"
    >
      <span aria-hidden="true" className="text-gold transition-transform duration-500 group-hover:-translate-y-0.5">{children}</span>
      {label}
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
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <StampBtn label="On X" onClick={() => share('x')}>
        <span aria-hidden="true">✕</span>
      </StampBtn>
      <i aria-hidden="true" className="text-[0.6em] not-italic text-gold">✦</i>
      <StampBtn label="On Instagram" onClick={() => share('ig')}>
        <span aria-hidden="true">◉</span>
      </StampBtn>
      <i aria-hidden="true" className="text-[0.6em] not-italic text-gold">✦</i>
      <StampBtn label={copied ? 'Copied' : 'Copy the link'} onClick={copy}>
        <span aria-hidden="true">{copied ? '✓' : '☍'}</span>
      </StampBtn>
    </div>
  )
}
