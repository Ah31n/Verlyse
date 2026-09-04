import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BRAND, MENU_LINKS, NAV_LINKS } from '../../data/content'

/* ---------- Search + menu control (global via context-free events) ---------- */
export function openSearch() {
  window.dispatchEvent(new CustomEvent('verlyse:search'))
}

const SearchIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px] fill-none stroke-current [stroke-width:1.4] [stroke-linecap:round] [stroke-linejoin:round]">
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l5 5" />
  </svg>
)

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', menuOpen)
    document.body.classList.toggle('no-scroll', menuOpen)
  }, [menuOpen])

  // Focus management: move focus into the menu when it opens, restore on close,
  // and allow Escape to dismiss it — keyboard-first navigation.
  const burgerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (menuOpen) {
      const first = document.querySelector<HTMLAnchorElement>('#site-menu a')
      first?.focus()
    } else {
      burgerRef.current?.focus()
    }
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[1100] border-b transition-all duration-500 ${
          scrolled && !menuOpen
            ? 'border-white/10 bg-[#25070F]'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className={`mx-auto flex max-w-page items-center justify-between gap-4 px-[clamp(1.75rem,5.5vw,4.75rem)] transition-all duration-500 max-[479px]:gap-3 max-[479px]:px-5 lg:gap-4 lg:px-4 xl:gap-3 xl:px-6 2xl:gap-6 2xl:px-[clamp(1.75rem,5.5vw,4.75rem)] ${scrolled ? 'h-[68px]' : 'h-[86px]'}`}>
          <Link to="/" className="flex shrink-0 items-center gap-3 text-ivory no-underline max-[479px]:gap-2" aria-label="Verlyse Media — home">
            <svg viewBox="0 0 40 40" aria-hidden="true" className="h-[30px] w-[30px] text-gold transition-transform duration-700 ease-out hover:rotate-90">
              <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M12.5 14.5 L20 27 L27.5 14.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-serif text-2xl leading-none">
              Verlyse <em className="italic text-gold">Media</em>
            </span>
          </Link>

          {/* Full navigation row appears only where the whole row fits cleanly
              (≥1200px). Below that, the burger menu takes over — a proper
              responsive breakpoint, never overlapping/wrapped labels. */}
          <nav aria-label="Primary" className="hidden shrink-0 items-center min-[1200px]:flex min-[1200px]:gap-x-3 min-[1200px]:text-[11px] min-[1200px]:tracking-[0.17em] xl:gap-x-3 xl:text-xs xl:tracking-[0.2em] 2xl:gap-x-6">
            {NAV_LINKS.map((l, i) => {
              // segment-aware matching: /article/:id highlights Articles,
              // /creator/:id highlights Featured Creators, top routes exact.
              const seg = location.pathname.split('/')[1] ?? ''
              const target = l.to === '/' ? '' : l.to.split('/')[1]
              const isActive = l.to === '/'
                ? location.pathname === '/'
                : seg === target || seg + 's' === target
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative inline-flex items-center whitespace-nowrap pb-1 font-sans font-medium uppercase leading-none no-underline transition-colors duration-300 ${
                    isActive ? 'text-ivory' : 'text-ivory/80 hover:text-ivory'
                  }`}
                >
                  {/* folio index — the nav reads like an archival instrument */}
                  <span
                    aria-hidden="true"
                    className={`mr-1.5 font-mono text-[9px] tracking-normal transition-colors duration-300 ${
                      isActive ? 'text-gold' : 'text-gold/50 group-hover:text-gold'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {l.label}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-0 h-px w-full origin-left bg-gold transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-3 xl:gap-2 2xl:gap-4">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('verlyse:saved'))}
              aria-label="Saved stories"
              title="Saved stories"
              className="relative grid h-10 w-10 place-items-center border border-gold/40 text-ivory transition-all duration-400 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-charcoal max-[479px]:hidden lg:hidden xl:grid"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px] fill-none stroke-current [stroke-width:1.4]"><path d="M6 3.5h12v17L12 16.8 6 20.5z" /></svg>
            </button>
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search articles (Ctrl K)"
              title="Search (Ctrl K)"
              className="grid h-10 w-10 place-items-center border border-gold/40 text-ivory transition-all duration-400 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-charcoal max-[479px]:hidden"
            >
              {SearchIcon}
            </button>
            <Link
              to="/submit"
              className="btn btn-ghost hidden min-w-[150px] justify-center whitespace-nowrap !px-6 !py-3.5 md:inline-flex xl:min-w-[170px] 2xl:!px-12"
            >
              Send your work
            </Link>
            <button
              ref={burgerRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="relative h-12 w-12 min-[1200px]:hidden"
            >
              <span className={`absolute left-2 right-2 top-[19px] h-px bg-ivory transition-transform duration-500 ease-out ${menuOpen ? 'translate-y-[2.5px] rotate-45' : ''}`} />
              <span className={`absolute bottom-[19px] left-2 right-2 h-px bg-ivory transition-transform duration-500 ease-out ${menuOpen ? '-translate-y-[2.5px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Fullscreen menu ---------- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ y: '-102%' }}
            animate={{ y: 0 }}
            exit={{ y: '-102%' }}
            transition={{ duration: 0.85, ease: [0.65, 0.05, 0.36, 1] }}
            className="fixed inset-0 z-[1050] flex flex-col justify-center overflow-y-auto bg-gradient-to-b from-wine-deep via-[#2A0811] to-charcoal px-[clamp(1.75rem,5.5vw,4.75rem)] py-24"
          >
            <p aria-hidden="true" className="pointer-events-none fixed bottom-[-3rem] left-1/2 -translate-x-1/2 select-none font-serif font-semibold text-[clamp(9rem,42vw,15rem)] leading-none text-transparent [-webkit-text-stroke:1px_rgba(248,246,242,0.06)]">
              Verlyse
            </p>
            <nav className="relative z-10 mx-auto flex w-full max-w-[860px] flex-col" aria-label="Site index">
              {MENU_LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ y: '120%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, ease: [0.65, 0.05, 0.36, 1], delay: 0.1 + i * 0.07 }}
                >
                  <Link
                    to={l.to}
                    className="group flex items-baseline gap-6 py-2 font-serif text-[clamp(2.5rem,9.5vw,4.6rem)] font-light leading-[1.22] text-ivory no-underline transition-colors duration-300 hover:text-gold"
                  >
                    <span className="font-mono text-xs tracking-[0.2em] text-gold">{String(i + 1).padStart(2, '0')}</span>
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="relative z-10 mx-auto mt-12 flex w-full max-w-[860px] flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-7">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">{BRAND.tagline}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                  <a href={BRAND.instagram} rel="noopener noreferrer" target="_blank" className="text-gold no-underline">{BRAND.handle}</a>
                </p>
              </div>
              {/* the tools live here on phones — search and saved stories
                  stay reachable on small screens (the header keeps only
                  logo + menu below 480px) */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); openSearch() }}
                  className="border border-gold/40 px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.28em] text-ivory/80 transition-colors duration-300 hover:border-gold hover:text-gold"
                >
                  Search the archive
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('verlyse:saved')) }}
                  className="border border-gold/40 px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.28em] text-ivory/80 transition-colors duration-300 hover:border-gold hover:text-gold"
                >
                  Saved stories
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
