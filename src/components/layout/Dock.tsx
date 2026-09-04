import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { DOCK_LINKS } from '../../data/content'

/** Mobile bottom dock — thumb-friendly, hides when the menu is open. */
export default function Dock() {
  const [path, setPath] = useState('/')
  const location = useLocation()
  useEffect(() => setPath(location.pathname), [location.pathname])

  const active = (to: string) =>
    to === '/' ? path === '/' : path.startsWith(to)

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-[1030] hidden h-[62px] border-t border-white/10 bg-[#25070F] shadow-[0_-18px_50px_rgba(0,0,0,0.28)] transition-transform duration-500 [padding-bottom:env(safe-area-inset-bottom)] max-lg:flex"
    >
      {DOCK_LINKS.map((l, i) => (
        <Link
          key={l.to}
          to={l.to}
          aria-current={active(l.to) ? 'page' : undefined}
          className={`relative grid min-w-0 flex-1 place-items-center font-mono text-[10px] font-medium uppercase tracking-[0.28em] no-underline transition-colors duration-300 ${
            active(l.to) ? 'text-ivory' : 'text-white/65'
          } ${i > 0 ? 'border-l border-white/10' : ''} ${l.hideTiny ? 'max-[479px]:hidden' : ''}`}
        >
          {active(l.to) && <span aria-hidden="true" className="absolute top-0 left-1/2 h-0.5 w-9 -translate-x-1/2 bg-gold" />}
          <span aria-hidden="true" className={`mr-1.5 text-[8px] leading-none transition-colors duration-300 max-[639px]:hidden ${active(l.to) ? 'text-ivory' : 'text-gold'}`}>✦</span>
          <span className="whitespace-nowrap max-[639px]:text-[9px] max-[639px]:tracking-[0.12em]">{l.label}</span>
        </Link>
      ))}
    </nav>
  )
}
