import { lazy, Suspense, useEffect } from 'react'
import { Link, Routes, Route, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Layout from './components/layout/Layout'
import ReadingRoom from './components/reading/ReadingRoom'
import { ARTICLES } from './data/content'

/* Route-level code splitting — each page loads in its own chunk, so the
   first paint ships only the cover, the chrome, and the shared editorial
   system. The magazine opens before the rest of the issue arrives. */
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Articles = lazy(() => import('./pages/Articles'))
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'))
const Categories = lazy(() => import('./pages/Categories'))
const Community = lazy(() => import('./pages/Community'))
const Submit = lazy(() => import('./pages/Submit'))
const Ambassadors = lazy(() => import('./pages/Ambassadors'))
const Creators = lazy(() => import('./pages/Creators'))
const Contact = lazy(() => import('./pages/Contact'))
const WriterProfilePage = lazy(() => import('./pages/WriterProfilePage'))
/* Phase 19 — The Keeping Room: full-screen spatial archive, mounted outside
   the publication chrome; reading still hands off to /article/:id. */
const RoomPage = lazy(() => import('./pages/Room'))

/** Route-aware transition label — the "folio" the reader is moving toward,
 *  so every navigation reads like moving through the publication. */
function thresholdLabel(pathname: string): string {
  if (pathname.startsWith('/article/')) {
    const id = pathname.split('/article/')[1]
    const i = ARTICLES.findIndex((a) => a.id === id)
    const folio = i >= 0 ? String(i + 1).padStart(2, '0') : '—'
    return `Folio ${folio} · Reading`
  }
  if (pathname.startsWith('/creator/')) return 'A contributor dossier'
  switch (pathname) {
    case '/': return 'The archive'
    case '/articles': return 'Nineteen folios'
    case '/categories': return 'The index'
    case '/creators': return 'The contributors'
    case '/ambassadors': return 'The people'
    case '/community': return 'The commons'
    case '/about': return 'The colophon'
    case '/submit': return 'Send a voice'
    case '/contact': return 'The desk'
    default: return 'The archive'
  }
}

/** Has the app already painted its first route? The preloader owns the very
 *  first entrance, so the threshold veil only appears on navigation. */
let seenFirstRoute = false

/** Archival threshold — the global page transition. A wine veil closes, a brass
 *  thread draws across with the destination's folio label, then the page settles
 *  like a plate. Reduced-motion collapses everything to near-instant. */
function PageTransition({ children, label }: { children: ReactNode; label: string }) {
  const reduced = useReducedMotion() === true
  const veil = !reduced && seenFirstRoute
  seenFirstRoute = true
  const t = reduced ? 0 : 0.85
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {veil && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[1150] bg-[#2A0F18]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: t, delay: 0.08, ease: [0.65, 0.05, 0.36, 1] }}
        >
          <motion.span
            className="absolute left-1/2 top-1/2 h-px w-[min(560px,72vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#D9B978] to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 1, 1, 0] }}
            transition={{ duration: t, times: [0, 0.25, 0.75, 1], ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0.5 }}
          />
          <motion.span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-9 font-mono text-[10px] uppercase tracking-[0.34em] text-[#D9B978]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: t, times: [0, 0.3, 0.7, 1] }}
          >
            {label}
          </motion.span>
        </motion.div>
      )}
      {children}
    </motion.div>
  )
}

/** Reset scroll to top on every navigation (before the new page paints). */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const location = useLocation()
  const threshold = thresholdLabel(location.pathname)

  const isRoom = location.pathname.startsWith('/room')

  return (
    <>
      <ScrollToTop />
      {isRoom ? (
        <Suspense fallback={<div className="min-h-screen bg-charcoal" aria-hidden="true" />}>
          <Routes location={location}>
            <Route path="/room" element={<RoomPage />} />
          </Routes>
        </Suspense>
      ) : (
      <Layout>
      <Suspense fallback={<div className="min-h-[80vh] bg-wine-deep" aria-hidden="true" />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition label={threshold}><Home /></PageTransition>} />
          <Route path="/about" element={<PageTransition label={threshold}><About /></PageTransition>} />
          <Route path="/articles" element={<PageTransition label={threshold}><Articles /></PageTransition>} />
          <Route path="/article/:id" element={<PageTransition label={threshold}><ReadingRoom><ArticleDetail /></ReadingRoom></PageTransition>} />
          <Route path="/categories" element={<PageTransition label={threshold}><Categories /></PageTransition>} />
          <Route path="/categories/:slug" element={<PageTransition label={threshold}><Categories /></PageTransition>} />
          <Route path="/community" element={<PageTransition label={threshold}><Community /></PageTransition>} />
          <Route path="/submit" element={<PageTransition label={threshold}><Submit /></PageTransition>} />
          <Route path="/ambassadors" element={<PageTransition label={threshold}><Ambassadors /></PageTransition>} />
          <Route path="/creators" element={<PageTransition label={threshold}><Creators /></PageTransition>} />
          <Route path="/contact" element={<PageTransition label={threshold}><Contact /></PageTransition>} />
          <Route path="/creator/:authorId" element={<PageTransition label={threshold}><WriterProfilePage /></PageTransition>} />
          <Route path="*" element={<PageTransition label={threshold}><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      </Suspense>
      </Layout>
      )}
    </>
  )
}

function NotFound() {
  useEffect(() => {
    document.title = 'Page not found — Verlyse Media'
  }, [])
  return (
    <section className="flex min-h-[70vh] items-center justify-center text-center">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">A page that wasn’t written</p>
        <h1 className="mt-6 font-serif text-[clamp(2.4rem,5vw,4rem)] font-light leading-[1.05] text-ivory">
          This page is still <em className="italic text-gold">waiting for its feature</em>
        </h1>
        <p className="mx-auto mt-6 max-w-[40ch] font-serif text-lg font-light italic leading-[1.7] text-white/65">
          Every page in this magazine began as an empty one. Yours could be next — or you could return to the room.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <Link to="/" className="btn btn-gold">Return to the magazine</Link>
          <Link to="/submit" className="border-b border-gold/60 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-gold no-underline transition-colors hover:text-ivory">
            Send your voice →
          </Link>
        </div>
      </div>
    </section>
  )
}
